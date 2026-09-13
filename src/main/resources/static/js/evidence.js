// ===============================
// AI CIVIC REPORTER - EVIDENCE JS
// ===============================

let selectedFile = null;

const uploadArea = document.getElementById("uploadArea");
const evidenceInput = document.getElementById("evidenceInput");
const previewSection = document.getElementById("previewSection");
const fileName = document.getElementById("fileName");
const imagePreview = document.getElementById("imagePreview");
const videoPreview = document.getElementById("videoPreview");
const continueBtn = document.getElementById("continueBtn");

// ===============================
// FILE INPUT
// ===============================

if (evidenceInput) {
    evidenceInput.addEventListener("change", function () {
        if (this.files && this.files.length > 0) {
            handleFile(this.files[0]);
        }
    });
}


// ===============================
// DRAG & DROP
// ===============================

if (uploadArea) {

    uploadArea.addEventListener("dragover", function (event) {
        event.preventDefault();
        uploadArea.classList.add("drag-over");
    });

    uploadArea.addEventListener("dragleave", function () {
        uploadArea.classList.remove("drag-over");
    });

    uploadArea.addEventListener("drop", function (event) {
        event.preventDefault();

        uploadArea.classList.remove("drag-over");

        const files = event.dataTransfer.files;

        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    });
}


// ===============================
// HANDLE FILE
// ===============================

function handleFile(file) {

    const maxSize = 20 * 1024 * 1024; // 20 MB

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "video/mp4"
    ];

    // File type validation
    if (!allowedTypes.includes(file.type)) {
        alert(
            "Invalid file type!\n\n" +
            "Allowed formats:\n" +
            "JPG, JPEG, PNG, WEBP and MP4"
        );

        resetEvidence();
        return;
    }

    // File size validation
    if (file.size > maxSize) {
        alert("File size must be less than 20 MB.");
        resetEvidence();
        return;
    }

    selectedFile = file;

    // Show filename
    if (fileName) {
        fileName.textContent = file.name;
    }

    // Show preview section
    if (previewSection) {
        previewSection.style.display = "block";
    }

    // Hide both previews first
    if (imagePreview) {
        imagePreview.style.display = "none";
        imagePreview.src = "";
    }

    if (videoPreview) {
        videoPreview.style.display = "none";
        videoPreview.src = "";
    }

    // ===============================
    // IMAGE PREVIEW
    // ===============================

    if (file.type.startsWith("image/")) {

        const reader = new FileReader();

        reader.onload = function (event) {

            if (imagePreview) {
                imagePreview.src = event.target.result;
                imagePreview.style.display = "block";
            }
        };

        reader.readAsDataURL(file);
    }

    // ===============================
    // VIDEO PREVIEW
    // ===============================

    else if (file.type === "video/mp4") {

        const videoURL = URL.createObjectURL(file);

        if (videoPreview) {
            videoPreview.src = videoURL;
            videoPreview.style.display = "block";
        }
    }

    // Enable Continue button
    if (continueBtn) {
        continueBtn.disabled = false;
        continueBtn.style.opacity = "1";
        continueBtn.style.cursor = "pointer";
    }
}


// ===============================
// REMOVE EVIDENCE
// ===============================

function removeEvidence() {

    selectedFile = null;

    resetEvidence();

    if (evidenceInput) {
        evidenceInput.value = "";
    }

    sessionStorage.removeItem("evidenceFileName");
    sessionStorage.removeItem("evidenceStoredFileName");
    sessionStorage.removeItem("evidenceFileUrl");
    sessionStorage.removeItem("evidenceFileType");
}


// ===============================
// RESET UI
// ===============================

function resetEvidence() {

    if (previewSection) {
        previewSection.style.display = "none";
    }

    if (fileName) {
        fileName.textContent = "";
    }

    if (imagePreview) {
        imagePreview.src = "";
        imagePreview.style.display = "none";
    }

    if (videoPreview) {
        videoPreview.src = "";
        videoPreview.style.display = "none";
    }

    if (continueBtn) {
        continueBtn.disabled = true;
        continueBtn.style.opacity = "0.6";
        continueBtn.style.cursor = "not-allowed";
    }
}


// ===============================
// CONTINUE TO AI VERIFICATION
// ===============================

async function continueToAI() {

    if (!selectedFile) {
        alert("Please select an evidence file first.");
        return;
    }

    // Disable button while uploading
    if (continueBtn) {
        continueBtn.disabled = true;
        continueBtn.textContent = "Uploading...";
    }

    try {

        // Create FormData
        const formData = new FormData();

        formData.append("file", selectedFile);

        // Send file to Spring Boot backend
        const response = await fetch("/api/evidence/upload", {
            method: "POST",
            body: formData
        });

        // Read response
        const contentType = response.headers.get("content-type") || "";

        let result;

        if (contentType.includes("application/json")) {
            result = await response.json();
        } else {
            result = await response.text();
        }

        // Upload failed
        if (!response.ok) {

            const message =
                typeof result === "string"
                    ? result
                    : (result.message || "Evidence upload failed.");

            throw new Error(message);
        }

        console.log("Evidence upload successful:", result);

        // ===============================
        // SAVE UPLOAD DETAILS
        // ===============================

        sessionStorage.setItem(
            "evidenceFileName",
            result.originalFileName || selectedFile.name
        );

        sessionStorage.setItem(
            "evidenceStoredFileName",
            result.storedFileName || ""
        );

        sessionStorage.setItem(
            "evidenceFileUrl",
            result.fileUrl || ""
        );

        sessionStorage.setItem(
            "evidenceFileType",
            result.fileType || selectedFile.type
        );

        // ===============================
        // GO TO AI VERIFICATION
        // ===============================

        window.location.href = "/ai-verification";

    } catch (error) {

        console.error("Evidence upload error:", error);

        alert(
            "Evidence upload failed!\n\n" +
            error.message
        );

        // Enable button again
        if (continueBtn) {
            continueBtn.disabled = false;
            continueBtn.textContent = "Continue";
        }
    }
}