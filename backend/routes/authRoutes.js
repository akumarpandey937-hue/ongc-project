const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();
const usersPath = path.join(__dirname, "../data/users.json");
const JWT_SECRET = "ongc_super_secret_key_2026";

function loadUsers() {
    try {
        return JSON.parse(fs.readFileSync(usersPath, "utf8"));
    } catch (err) {
        return [];
    }
}

router.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    const users = loadUsers();
    const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());

    if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid username or password" });
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
        role: user.role
    });
});

module.exports = router;
