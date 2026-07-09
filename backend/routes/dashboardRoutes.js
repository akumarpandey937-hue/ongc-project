const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// GET stats endpoint
router.get("/stats", async (req, res) => {
    try {
        const [totalRows] = await pool.query("SELECT COUNT(*) as count FROM issues");
        const [resolvedRows] = await pool.query("SELECT COUNT(*) as count FROM issues WHERE status = 'Resolved'");
        const [unresolvedRows] = await pool.query("SELECT COUNT(*) as count FROM issues WHERE status = 'Unresolved'");

        res.json({
            totalTickets: totalRows[0].count,
            resolvedTickets: resolvedRows[0].count,
            unresolvedTickets: unresolvedRows[0].count,
            slaBreached: 0 // SLA column was removed to simplify schema as per UI requirements
        });
    } catch (err) {
        console.error("Dashboard stats query error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
