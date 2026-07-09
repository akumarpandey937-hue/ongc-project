const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "ongc_super_secret_key_2026";

// POST login endpoint
router.post("/login", async (req, res) => {
    const { cpfId, username, password } = req.body;
    const loginCredential = (cpfId || username || "").trim();

    if (!loginCredential || !password) {
        return res.status(400).json({ message: "CPF ID and password are required." });
    }

    try {
        const [rows] = await pool.query("SELECT * FROM users WHERE cpfId = ?", [loginCredential]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: "Invalid CPF ID or password" });
        }

        if (user.status === "inactive") {
            return res.status(403).json({ message: "Your account is inactive. Please contact the administrator." });
        }

        const isMatch = bcrypt.compareSync(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid CPF ID or password" });
        }

        // Generate JWT
        const token = jwt.sign(
            { username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({
            message: "Login successful",
            token,
            username: user.username,
            role: user.role,
            cpfId: user.cpfId || "",
            name: user.name || "",
            mobileNo: user.mobileNo || ""
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// GET profile endpoint (protected)
const authMiddleware = require("../middleware/auth");
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT username, role, cpfId, name, mobileNo FROM users WHERE username = ?",
            [req.user.username]
        );
        const user = rows[0];
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (err) {
        console.error("Profile fetch error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// adminOnly middleware helper
function adminOnly(req, res, next) {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({ message: "Access denied. Admin role required." });
    }
}

// GET all users (Admin only)
router.get("/users", authMiddleware, adminOnly, async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT username, role, cpfId, name, mobileNo, status FROM users");
        res.json(rows);
    } catch (err) {
        console.error("Fetch users error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// POST create user (Admin only)
router.post("/users", authMiddleware, adminOnly, async (req, res) => {
    const { username, password, role, name, cpfId, mobileNo } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: "Username, password, and role are required." });
    }

    try {
        const [existsRows] = await pool.query("SELECT username FROM users WHERE username = ?", [username.trim()]);
        if (existsRows.length > 0) {
            return res.status(400).json({ message: "Username already exists." });
        }

        const passwordHash = bcrypt.hashSync(password, 10);
        await pool.query(
            "INSERT INTO users (username, passwordHash, role, cpfId, name, mobileNo, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [username.trim(), passwordHash, role, cpfId || "", name || "", mobileNo || "", "active"]
        );

        res.status(201).json({ message: "User created successfully", user: { username: username.trim(), role } });
    } catch (err) {
        console.error("Create user error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// PATCH update user (Admin only)
router.patch("/users/:username", authMiddleware, adminOnly, async (req, res) => {
    const targetUsername = req.params.username;
    const { username, role, status, name, cpfId, mobileNo, password } = req.body;

    try {
        const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [targetUsername]);
        const user = rows[0];

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.username.toLowerCase() === req.user.username.toLowerCase() && status === "inactive") {
            return res.status(400).json({ message: "You cannot deactivate your own admin account." });
        }

        let updatedUsername = user.username;
        if (username !== undefined && username.trim().toLowerCase() !== targetUsername.toLowerCase()) {
            const [existsRows] = await pool.query("SELECT username FROM users WHERE username = ?", [username.trim()]);
            if (existsRows.length > 0) {
                return res.status(400).json({ message: "The new username already exists." });
            }
            updatedUsername = username.trim();
        }

        const updatedRole = role !== undefined ? role : user.role;
        const updatedStatus = status !== undefined ? status : user.status;
        const updatedName = name !== undefined ? name : user.name;
        const updatedCpfId = cpfId !== undefined ? cpfId : user.cpfId;
        const updatedMobileNo = mobileNo !== undefined ? mobileNo : user.mobileNo;

        let passwordHash = user.passwordHash;
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ message: "Password must be at least 6 characters." });
            }
            passwordHash = bcrypt.hashSync(password, 10);
        }

        await pool.query(
            "UPDATE users SET username = ?, role = ?, status = ?, name = ?, cpfId = ?, mobileNo = ?, passwordHash = ? WHERE username = ?",
            [updatedUsername, updatedRole, updatedStatus, updatedName, updatedCpfId, updatedMobileNo, passwordHash, targetUsername]
        );

        res.json({ message: "User updated successfully" });
    } catch (err) {
        console.error("Update user error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// DELETE user (Admin only)
router.delete("/users/:username", authMiddleware, adminOnly, async (req, res) => {
    const targetUsername = req.params.username;

    if (targetUsername.toLowerCase() === req.user.username.toLowerCase()) {
        return res.status(400).json({ message: "You cannot delete your own admin account." });
    }

    const conn = await pool.getConnection();
    try {
        const [userExists] = await conn.query("SELECT username FROM users WHERE username = ?", [targetUsername]);
        if (userExists.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        await conn.beginTransaction();

        // 1. Delete solutions authored by this user
        await conn.query("DELETE FROM solutions WHERE author = ?", [targetUsername]);

        // 2. Delete issues raised by this user
        await conn.query("DELETE FROM issues WHERE raisedBy = ?", [targetUsername]);

        // 3. Delete user account
        await conn.query("DELETE FROM users WHERE username = ?", [targetUsername]);

        await conn.commit();
        res.json({ message: "User deleted successfully." });
    } catch (err) {
        try {
            await conn.rollback();
        } catch (rollbackErr) {
            // Ignore rollback error if transaction has not started
        }
        console.error("Delete user error:", err);
        res.status(500).json({ message: "Internal server error." });
    } finally {
        conn.release();
    }
});

module.exports = router;
