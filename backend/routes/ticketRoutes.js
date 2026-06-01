const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const dataPath = path.join(
    __dirname,
    "../data/tickets.json"
);

// Get All Tickets
router.get("/", (req, res) => {

    const tickets =
        JSON.parse(
            fs.readFileSync(dataPath)
        );

    res.json(tickets);

});

// Get Single Ticket
router.get("/:id", (req, res) => {

    const tickets =
        JSON.parse(
            fs.readFileSync(dataPath)
        );

    const ticket =
        tickets.find(
            t => t.id == req.params.id
        );

    if (!ticket) {

        return res.status(404).json({
            message: "Ticket not found"
        });

    }

    res.json(ticket);

});

// Create Ticket
router.post("/", (req, res) => {

    const tickets =
        JSON.parse(
            fs.readFileSync(dataPath)
        );

    const newTicket = {

        id: Date.now(),

        status: "Open",

        sla: "Within SLA",

        priority: req.body.priority,

        subject: req.body.subject,

        category: req.body.category,

        raisedBy: req.body.raisedBy,

        description: req.body.description || "",

        createdAt:
            new Date()
            .toISOString()
            .slice(0, 10)

    };

    tickets.push(newTicket);

    fs.writeFileSync(
        dataPath,
        JSON.stringify(
            tickets,
            null,
            2
        )
    );

    res.status(201).json({
        message:
            "Ticket Created Successfully",
        ticket: newTicket
    });

});
// Update Ticket
router.patch("/:id", (req, res) => {
    const tickets = JSON.parse(
        fs.readFileSync(dataPath)
    );

    const index = tickets.findIndex(
        (t) => t.id == req.params.id
    );

    if (index === -1) {
        return res.status(404).json({
            message: "Ticket not found"
        });
    }

    tickets[index] = {
        ...tickets[index],
        ...req.body,
        id: tickets[index].id
    };

    fs.writeFileSync(
        dataPath,
        JSON.stringify(tickets, null, 2)
    );

    res.json({
        message: "Ticket updated successfully",
        ticket: tickets[index]
    });
});

// Delete Ticket
router.delete("/:id", (req, res) => {

    const tickets =
        JSON.parse(
            fs.readFileSync(dataPath)
        );

    const updatedTickets =
        tickets.filter(
            ticket =>
            ticket.id != req.params.id
        );

    fs.writeFileSync(
        dataPath,
        JSON.stringify(
            updatedTickets,
            null,
            2
        )
    );

    res.json({
        message:
        "Ticket Deleted Successfully"
    });

});
module.exports = router;