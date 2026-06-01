const express = require("express");
const cors = require("cors");

const dashboardRoutes =
require("./routes/dashboardRoutes");

const ticketRoutes =
require("./routes/ticketRoutes");

const solutionRoutes =
require("./routes/solutionRoutes");

const app = express();

app.use(cors());
app.use(express.json());

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
    res.send(
        "ONGC Support Portal API Running"
    );
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});