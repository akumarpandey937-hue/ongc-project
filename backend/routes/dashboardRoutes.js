const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const ticketsPath = path.join(__dirname, "../data/tickets.json");

function loadTickets() {
    return JSON.parse(fs.readFileSync(ticketsPath, "utf8"));
}

router.get("/stats", (req, res) => {
    const tickets = loadTickets();

    const openTickets = tickets.filter(
        (t) => t.status === "Open"
    ).length;

    const inProgressTickets = tickets.filter(
        (t) => t.status === "In Progress"
    ).length;

    const slaBreached = tickets.filter((t) => {
        const sla = (t.sla || "").toLowerCase();
        return sla.includes("breach") && !sla.includes("within");
    }).length;

    res.json({
        totalTickets: tickets.length,
        openTickets,
        inProgressTickets,
        slaBreached
    });
});

module.exports = router;
