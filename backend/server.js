const express = require("express");
const cors = require("cors");
const path = require("path");

const dashboardRoutes =
    require("./routes/dashboardRoutes");

const ticketRoutes =
    require("./routes/ticketRoutes");

const solutionRoutes =
    require("./routes/solutionRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Serve static frontend files from parent public directory
app.use(express.static(path.join(__dirname, "../public")));

app.use(
    "/api/dashboard",
    dashboardRoutes
);

app.use(
    "/api/tickets",
    ticketRoutes
);

app.use(
    "/api/solutions",
    solutionRoutes
);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/login.html"));
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});