let quill;

document.addEventListener("DOMContentLoaded", () => {
    const editorEl = document.getElementById("editor");
    if (editorEl && typeof Quill !== "undefined") {
        quill = new Quill("#editor", {
            theme: "snow",
            modules: {
                toolbar: [
                    ["bold", "italic", "underline"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link"]
                ]
            }
        });
    }

    const cancelBtn = document.querySelector(".cancel-btn");
    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            const role = localStorage.getItem("role") || "admin";
            if (role === "admin") {
                window.location.href = "dashboard.html";
            } else {
                window.location.href = "user-dashboard.html";
            }
        });
    }
});

async function submitTicket() {
    const subject = document.getElementById("ticketSubject")?.value.trim();
    const category = document.getElementById("ticketCategory")?.value;
    const priority = document.getElementById("ticketPriority")?.value;
    const raisedBy =
        localStorage.getItem("username") || "admin";
    const description = quill
        ? quill.root.innerHTML
        : "";

    if (!subject) {
        alert("Please enter an issue subject.");
        return;
    }

    if (!category || category === "") {
        alert("Please select a category.");
        return;
    }

    try {
        const result = await createTicket({
            subject,
            category,
            priority: priority || "Medium",
            raisedBy,
            description
        });

        alert(result.message || "Ticket submitted successfully.");
        const role = localStorage.getItem("role") || "admin";
        if (role === "admin") {
            window.location.href = "dashboard.html";
        } else {
            window.location.href = "user-dashboard.html";
        }
    } catch (error) {
        console.error(error);
        alert(
            error.message ||
            "Failed to submit ticket. Make sure the backend is running."
        );
    }
}

async function submitSolution() {
    const title = document.getElementById("solutionTitle")?.value.trim();
    const category = document.getElementById("solutionCategory")?.value;
    const preview = quill
        ? quill.getText().trim()
        : document.getElementById("solutionPreview")?.value.trim();

    if (!title || !category) {
        alert("Please fill in title and category.");
        return;
    }

    try {
        const result = await createSolution({
            title,
            category,
            preview: preview || "No preview provided.",
            author: localStorage.getItem("username") || "Admin"
        });

        alert(result.message || "Solution added successfully.");
        window.location.href = "index.html";
    } catch (error) {
        console.error(error);
        alert(error.message || "Failed to add solution.");
    }
}
