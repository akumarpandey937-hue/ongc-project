const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Restrict all solutions routes to authenticated admin users
router.use(authMiddleware);
router.use((req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({ message: "Access denied. Admin role required." });
    }
});

// Get All Solutions
router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM solutions ORDER BY id DESC");
        res.json(rows);
    } catch (err) {
        console.error("Fetch solutions error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get Single Solution
router.get("/:id", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM solutions WHERE id = ?", [req.params.id]);
        const solution = rows[0];

        if (!solution) {
            return res.status(404).json({ message: "Solution not found" });
        }

        res.json(solution);
    } catch (err) {
        console.error("Fetch solution details error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Create Solution
router.post("/", async (req, res) => {
    const { category, title, preview, author } = req.body;

    try {
        const [result] = await pool.query(
            "INSERT INTO solutions (category, title, preview, author, date) VALUES (?, ?, ?, ?, ?)",
            [
                category || "General",
                title || "Untitled",
                preview || "",
                author || req.user.username || "Admin",
                new Date().toISOString().slice(0, 10)
            ]
        );

        const newSolution = {
            id: result.insertId,
            category: category || "General",
            title: title || "Untitled",
            preview: preview || "",
            author: author || req.user.username || "Admin",
            date: new Date().toISOString().slice(0, 10)
        };

        res.status(201).json({
            message: "Solution added successfully",
            solution: newSolution
        });
    } catch (err) {
        console.error("Create solution error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete Solution
router.delete("/:id", async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM solutions WHERE id = ?", [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Solution not found" });
        }

        res.json({ message: "Solution deleted successfully" });
    } catch (err) {
        console.error("Delete solution error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Update Solution
router.patch("/:id", async (req, res) => {
    const { category, title, preview } = req.body;

    try {
        const [rows] = await pool.query("SELECT * FROM solutions WHERE id = ?", [req.params.id]);
        const solution = rows[0];

        if (!solution) {
            return res.status(404).json({ message: "Solution not found" });
        }

        const updatedCategory = category !== undefined ? category : solution.category;
        const updatedTitle = title !== undefined ? title : solution.title;
        const updatedPreview = preview !== undefined ? preview : solution.preview;

        await pool.query(
            "UPDATE solutions SET category = ?, title = ?, preview = ? WHERE id = ?",
            [updatedCategory, updatedTitle, updatedPreview, req.params.id]
        );

        res.json({
            message: "Solution updated successfully",
            solution: {
                id: solution.id,
                category: updatedCategory,
                title: updatedTitle,
                preview: updatedPreview,
                author: solution.author,
                date: solution.date
            }
        });
    } catch (err) {
        console.error("Update solution error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
