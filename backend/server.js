require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const dashboardRoutes = require("./routes/dashboardRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const solutionRoutes = require("./routes/solutionRoutes");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve static frontend files from parent public directory
app.use(express.static(path.join(__dirname, "../public")));

// Public Auth Routes
app.use("/api/auth", authRoutes);

// Protected API Routes
app.use("/api/dashboard", authMiddleware, dashboardRoutes);
app.use("/api/tickets", authMiddleware, ticketRoutes);
app.use("/api/solutions", solutionRoutes);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});
// Nodemon trigger restart comment