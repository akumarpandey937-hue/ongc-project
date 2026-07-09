let quill;

document.addEventListener("DOMContentLoaded", () => {
    const editorEl = document.getElementById("editor");
    if (editorEl && typeof Quill !== "undefined") {
        quill = new Quill("#editor", {
            theme: "snow",
            placeholder: "Please describe the issue in detail...",
            modules: {
                toolbar: [
                    ["bold", "italic", "underline"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link"]
                ]
            }
        });
    }

    // Prefill form from query parameters if present (e.g. when resolving a ticket)
    const params = new URLSearchParams(window.location.search);
    const prefillSubject = params.get("subject");
    const prefillCategory = params.get("category");
    const prefillDescription = params.get("description");

    if (prefillSubject) {
        const titleInput = document.getElementById("solutionTitle");
        if (titleInput) titleInput.value = prefillSubject;
    }
    if (prefillCategory) {
        const catSelect = document.getElementById("solutionCategory");
        if (catSelect) {
            // Find option matching category text (case-insensitive)
            const opt = Array.from(catSelect.options).find(
                o => o.text.toUpperCase() === prefillCategory.toUpperCase()
            );
            if (opt) catSelect.value = opt.value;
        }
    }
    if (prefillDescription) {
        setTimeout(() => {
            if (quill) {
                quill.root.innerHTML = prefillDescription;
            } else {
                const prevTextarea = document.getElementById("solutionPreview");
                if (prevTextarea) prevTextarea.value = prefillDescription;
            }
        }, 100);
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

    const fileInput = document.getElementById("fileUpload");
    const file = fileInput ? fileInput.files[0] : null;
    let attachment = null;

    const submitBtn = document.querySelector(".submit-btn");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";
    }

    try {
        if (file) {
            attachment = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve({
                    name: file.name,
                    type: file.type,
                    data: reader.result.split(',')[1]
                });
                reader.onerror = error => reject(error);
                reader.readAsDataURL(file);
            });
        }

        const result = await createTicket({
            subject,
            category,
            raisedBy,
            description,
            attachment
        });

        alert(result.message || "Issue submitted successfully.");
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
            "Failed to submit issue. Make sure the backend is running."
        );
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Issue";
        }
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
