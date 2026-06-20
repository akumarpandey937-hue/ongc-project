const express = require("express");
const fs = require("fs");
const path = require("path");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const dataPath = path.join(__dirname, "../data/solutions.json");

function loadSolutions() {
    return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

function saveSolutions(solutions) {
    fs.writeFileSync(
        dataPath,
        JSON.stringify(solutions, null, 2)
    );
}

router.get("/", (req, res) => {
    res.json(loadSolutions());
});

router.get("/:id", (req, res) => {
    const solutions = loadSolutions();
    const solution = solutions.find(
        (s) => s.id == req.params.id
    );

    if (!solution) {
        return res.status(404).json({
            message: "Solution not found"
        });
    }

    res.json(solution);
});

router.post("/", authMiddleware, (req, res) => {
    const solutions = loadSolutions();

    const nextId = solutions.length ? Math.max(...solutions.map(s => Number(s.id))) + 1 : 1;

    const newSolution = {
        id: nextId,
        category: req.body.category || "General",
        title: req.body.title || "Untitled",
        preview: req.body.preview || "",
        author: req.body.author || "Admin",
        date: new Date().toISOString().slice(0, 10)
    };

    solutions.push(newSolution);
    saveSolutions(solutions);

    res.status(201).json({
        message: "Solution added successfully",
        solution: newSolution
    });
});

router.delete("/:id", authMiddleware, (req, res) => {
    const solutions = loadSolutions();
    const updated = solutions.filter(
        (s) => s.id != req.params.id
    );

    if (updated.length === solutions.length) {
        return res.status(404).json({
            message: "Solution not found"
        });
    }

    saveSolutions(updated);

    res.json({
        message: "Solution deleted successfully"
    });
});

module.exports = router;
