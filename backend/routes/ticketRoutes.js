const express = require("express");
const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

const router = express.Router();

// Get All Tickets
router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM issues ORDER BY id DESC");
        res.json(rows);
    } catch (err) {
        console.error("Fetch tickets error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get Single Ticket
router.get("/:id", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM issues WHERE id = ?", [req.params.id]);
        const ticket = rows[0];

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        res.json(ticket);
    } catch (err) {
        console.error("Fetch ticket error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Create Ticket
router.post("/", async (req, res) => {
    let attachment = null;
    if (req.body.attachment && req.body.attachment.data) {
        try {
            const uploadDir = path.join(__dirname, "../../public/uploads");
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const safeName = `${Date.now()}-${req.body.attachment.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
            const filePath = path.join(uploadDir, safeName);
            fs.writeFileSync(filePath, Buffer.from(req.body.attachment.data, "base64"));
            attachment = {
                name: req.body.attachment.name,
                url: `/uploads/${safeName}`
            };
        } catch (err) {
            console.error("Failed to save attachment:", err);
        }
    }

    try {
        const status = "Unresolved";
        const subject = req.body.subject;
        const category = req.body.category;
        const raisedBy = req.body.raisedBy;
        const description = req.body.description || "";
        const createdAt = new Date().toISOString().slice(0, 10);

        const [result] = await pool.query(
            "INSERT INTO issues (status, subject, category, raisedBy, description, attachment, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                status,
                subject,
                category,
                raisedBy,
                description,
                attachment ? JSON.stringify(attachment) : null,
                createdAt
            ]
        );

        const newTicket = {
            id: result.insertId,
            status,
            subject,
            category,
            raisedBy,
            description,
            attachment,
            createdAt
        };

        res.status(201).json({
            message: "Ticket Created Successfully",
            ticket: newTicket
        });
    } catch (err) {
        console.error("Create ticket error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Update Ticket
router.patch("/:id", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM issues WHERE id = ?", [req.params.id]);
        const ticket = rows[0];

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        const prevStatus = ticket.status;
        const newStatus = req.body.status;
        let resolvedAt = ticket.resolvedAt || "-";
        let resolvedBy = ticket.resolvedBy || ticket.repliedBy || "-";

        if (newStatus === "Resolved") {
            if (prevStatus !== "Resolved") {
                resolvedAt = new Date().toISOString().slice(0, 10);
                resolvedBy = req.body.repliedBy || req.body.resolvedBy || "admin";
            } else if (req.body.repliedBy || req.body.resolvedBy) {
                resolvedBy = req.body.repliedBy || req.body.resolvedBy;
            }
        } else if (newStatus && newStatus !== "Resolved") {
            resolvedAt = "-";
            resolvedBy = "-";
        }

        const updatedStatus = newStatus !== undefined ? newStatus : ticket.status;
        const updatedReply = req.body.reply !== undefined ? req.body.reply : ticket.reply;
        const updatedRepliedBy = req.body.repliedBy !== undefined ? req.body.repliedBy : ticket.repliedBy;

        await pool.query(
            "UPDATE issues SET status = ?, reply = ?, repliedBy = ?, resolvedAt = ?, resolvedBy = ? WHERE id = ?",
            [
                updatedStatus,
                updatedReply,
                updatedRepliedBy,
                resolvedAt,
                resolvedBy,
                req.params.id
            ]
        );

        const [updatedRows] = await pool.query("SELECT * FROM issues WHERE id = ?", [req.params.id]);

        res.json({
            message: "Ticket updated successfully",
            ticket: updatedRows[0]
        });
    } catch (err) {
        console.error("Update ticket error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete Ticket
router.delete("/:id", async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM issues WHERE id = ?", [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        res.json({
            message: "Ticket Deleted Successfully"
        });
    } catch (err) {
        console.error("Delete ticket error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;