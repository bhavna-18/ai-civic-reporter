let currentComplaint = null;


// ======================================================
// SEARCH REPORT
// ======================================================

async function searchReport() {

    const input = document.getElementById("complaintSearch");

    if (!input) {
        console.error("Complaint search input not found.");
        return;
    }

    const complaintId = input.value.trim();

    if (!complaintId) {
        alert("Please enter Complaint ID.");
        return;
    }

    try {

        const response = await fetch(
            `/api/complaints/${encodeURIComponent(complaintId)}`
        );

        if (!response.ok) {

            alert("Complaint not found.\nPlease check the Complaint ID.");

            const result =
                document.getElementById("trackingResult");

            if (result) {
                result.style.display = "none";
            }

            return;
        }

        const complaint = await response.json();

        currentComplaint = complaint;

        // Save selected complaint
        sessionStorage.setItem(
            "complaintId",
            complaint.complaintId
        );

        sessionStorage.setItem(
            "selectedComplaintId",
            complaint.complaintId
        );

        displayComplaint(complaint);

    } catch (error) {

        console.error(
            "Error fetching complaint:",
            error
        );

        alert(
            "Unable to connect to the server.\n" +
            "Please make sure Spring Boot is running."
        );
    }
}


// ======================================================
// DISPLAY COMPLAINT
// ======================================================

function displayComplaint(complaint) {

    const result =
        document.getElementById("trackingResult");

    if (!result) {
        console.error("trackingResult not found.");
        return;
    }

    result.style.display = "block";


    // --------------------------------------------------
    // Complaint ID
    // --------------------------------------------------

    setText(
        "trackingId",
        complaint.complaintId || "-"
    );


    // --------------------------------------------------
    // Current Status
    // --------------------------------------------------

    updateStatus(
        complaint.status
    );


    // --------------------------------------------------
    // Category / Issue
    // --------------------------------------------------

    setText(
        "trackingIssue",
        complaint.category || "-"
    );


    // --------------------------------------------------
    // Priority
    // --------------------------------------------------

    const priorityElement =
        document.querySelector(
            ".tracking-summary-item:nth-child(2) strong"
        );

    if (priorityElement) {

        const priority =
            complaint.assignedPriority ||
            complaint.priority ||
            "Not Assigned";

        priorityElement.textContent =
            priority.toUpperCase();
    }


    // --------------------------------------------------
    // Department
    // --------------------------------------------------

    setText(
        "trackingDepartment",
        complaint.assignedDepartment ||
        "Not Assigned"
    );


    // --------------------------------------------------
    // Location
    // --------------------------------------------------

    const locationElement =
        document.querySelector(
            ".tracking-summary-item:nth-child(4) strong"
        );

    if (locationElement) {

        locationElement.textContent =
            complaint.location ||
            "Location not available";
    }


    // --------------------------------------------------
    // Timeline
    // --------------------------------------------------

    updateTimeline(
        complaint
    );


    // --------------------------------------------------
    // Resolution Estimate
    // --------------------------------------------------

    updateResolutionEstimate(
        complaint
    );
}


// ======================================================
// SET TEXT HELPER
// ======================================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


// ======================================================
// UPDATE STATUS
// ======================================================

function updateStatus(status) {

    const statusElement =
        document.getElementById("trackingStatus");

    if (!statusElement) {
        return;
    }


    const actualStatus =
        normalizeStatus(status);


    let displayStatus =
        "Pending";


    switch (actualStatus) {

        case "verified":
            displayStatus = "Verified";
            break;

        case "assigned":
            displayStatus = "Assigned";
            break;

        case "in progress":
            displayStatus = "In Progress";
            break;

        case "resolved":
            displayStatus = "Resolved";
            break;

        case "closed":
            displayStatus = "Closed";
            break;

        case "rejected":
            displayStatus = "Rejected";
            break;

        case "duplicate":
            displayStatus = "Duplicate";
            break;

        default:
            displayStatus = "Pending";
    }


    statusElement.textContent =
        "● " + displayStatus;


    // Reset classes
    statusElement.className =
        "status-pill";


    // Add CSS status class
    statusElement.classList.add(
        actualStatus.replace(/\s+/g, "-")
    );
}


// ======================================================
// NORMALIZE STATUS
// ======================================================

function normalizeStatus(status) {

    if (!status) {
        return "pending";
    }

    let value =
        String(status)
            .trim()
            .toLowerCase()
            .replace(/_/g, " ");


    // Handle different possible values

    if (
        value === "progress" ||
        value === "inprogress"
    ) {
        return "in progress";
    }


    if (value === "complete") {
        return "resolved";
    }


    return value;
}


// ======================================================
// UPDATE TIMELINE
// ======================================================

function updateTimeline(complaint) {

    const status =
        normalizeStatus(
            complaint.status
        );


    const steps =
        document.querySelectorAll(
            ".track-step"
        );


    steps.forEach(step => {

        step.classList.remove(
            "completed",
            "current"
        );


        const stepStatus =
            step.getAttribute(
                "data-tracking-status"
            );


        // ==================================================
        // SUBMITTED
        // ==================================================

        if (
            stepStatus === "pending"
        ) {

            step.classList.add(
                "completed"
            );

            updateStepLabel(
                step,
                "Completed"
            );

            updateStepIcon(
                step,
                "✓"
            );
        }


        // ==================================================
        // VERIFIED
        // ==================================================

        else if (
            stepStatus === "verified"
        ) {

            if (
                isAtLeast(
                    status,
                    "verified"
                )
            ) {

                step.classList.add(
                    "completed"
                );

                updateStepLabel(
                    step,
                    "Completed"
                );

                updateStepIcon(
                    step,
                    "✓"
                );

            } else {

                updateStepLabel(
                    step,
                    "Pending"
                );

                updateStepIcon(
                    step,
                    "2"
                );
            }
        }


        // ==================================================
        // ASSIGNED
        // ==================================================

        else if (
            stepStatus === "assigned"
        ) {

            if (
                isAtLeast(
                    status,
                    "assigned"
                )
            ) {

                step.classList.add(
                    "completed"
                );

                updateStepLabel(
                    step,
                    "Completed"
                );

                updateStepIcon(
                    step,
                    "✓"
                );

            } else {

                updateStepLabel(
                    step,
                    "Pending"
                );

                updateStepIcon(
                    step,
                    "3"
                );
            }
        }


        // ==================================================
        // IN PROGRESS
        // ==================================================

        else if (
            stepStatus === "progress"
        ) {

            if (
                status === "in progress"
            ) {

                step.classList.add(
                    "current"
                );

                updateStepLabel(
                    step,
                    "Current"
                );

                updateStepIcon(
                    step,
                    "●"
                );

            } else if (
                status === "resolved" ||
                status === "closed"
            ) {

                step.classList.add(
                    "completed"
                );

                updateStepLabel(
                    step,
                    "Completed"
                );

                updateStepIcon(
                    step,
                    "✓"
                );

            } else {

                updateStepLabel(
                    step,
                    "Pending"
                );

                updateStepIcon(
                    step,
                    "4"
                );
            }
        }


        // ==================================================
        // RESOLVED
        // ==================================================

        else if (
            stepStatus === "resolved"
        ) {

            if (
                status === "resolved" ||
                status === "closed"
            ) {

                step.classList.add(
                    "completed"
                );

                updateStepLabel(
                    step,
                    "Completed"
                );

                updateStepIcon(
                    step,
                    "✓"
                );

            } else {

                updateStepLabel(
                    step,
                    "Pending"
                );

                updateStepIcon(
                    step,
                    "5"
                );
            }
        }

    });


    // ==================================================
    // REJECTED / DUPLICATE
    // ==================================================

    if (
        status === "rejected" ||
        status === "duplicate"
    ) {

        updateSpecialStatus(
            status
        );
    }
}


// ======================================================
// STATUS ORDER
// ======================================================

function isAtLeast(
    currentStatus,
    requiredStatus
) {

    const order = {

        pending: 0,

        verified: 1,

        assigned: 2,

        "in progress": 3,

        resolved: 4,

        closed: 5
    };


    return (
        (order[currentStatus] ?? 0) >=
        (order[requiredStatus] ?? 0)
    );
}


// ======================================================
// UPDATE STEP LABEL
// ======================================================

function updateStepLabel(
    step,
    text
) {

    const label =
        step.querySelector(
            ".track-title span"
        );

    if (label) {

        label.textContent =
            text;
    }
}


// ======================================================
// UPDATE STEP ICON
// ======================================================

function updateStepIcon(
    step,
    icon
) {

    const iconElement =
        step.querySelector(
            ".track-icon"
        );

    if (iconElement) {

        iconElement.textContent =
            icon;
    }
}


// ======================================================
// REJECTED / DUPLICATE
// ======================================================

function updateSpecialStatus(
    status
) {

    const progressStep =
        document.querySelector(
            '.track-step[data-tracking-status="progress"]'
        );


    const resolutionStep =
        document.querySelector(
            '.track-step[data-tracking-status="resolved"]'
        );


    if (progressStep) {

        updateStepLabel(
            progressStep,
            status === "rejected"
                ? "Rejected"
                : "Marked Duplicate"
        );

        updateStepIcon(
            progressStep,
            "!"
        );
    }


    if (resolutionStep) {

        updateStepLabel(
            resolutionStep,
            "Closed"
        );

        updateStepIcon(
            resolutionStep,
            "×"
        );
    }
}


// ======================================================
// RESOLUTION ESTIMATE
// ======================================================

function updateResolutionEstimate(
    complaint
) {

    const estimate =
        document.querySelector(
            ".resolution-estimate p"
        );

    if (!estimate) {
        return;
    }


    const status =
        normalizeStatus(
            complaint.status
        );


    // Resolved
    if (
        status === "resolved" ||
        status === "closed"
    ) {

        estimate.innerHTML =
            "<b>Complaint has been resolved.</b>";

        return;
    }


    // Rejected
    if (
        status === "rejected"
    ) {

        estimate.innerHTML =
            "<b>Complaint has been rejected.</b>";

        return;
    }


    // Duplicate
    if (
        status === "duplicate"
    ) {

        estimate.innerHTML =
            "<b>Complaint was marked as duplicate.</b>";

        return;
    }


    // Deadline assigned by admin
    if (
        complaint.deadline
    ) {

        estimate.innerHTML =
            `Expected by <b>${escapeHtml(
                complaint.deadline
            )}</b>`;

        return;
    }


    // Default
    estimate.innerHTML =
        "Expected within <b>3–5 days</b>";
}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ======================================================
// AUTO LOAD SELECTED COMPLAINT
// ======================================================

async function autoLoadComplaint() {

    const input =
        document.getElementById(
            "complaintSearch"
        );

    const result =
        document.getElementById(
            "trackingResult"
        );


    if (!input || !result) {
        return;
    }


    // --------------------------------------------------
    // First preference:
    // selectedComplaintId
    // --------------------------------------------------

    const selectedId =
        sessionStorage.getItem(
            "selectedComplaintId"
        );


    if (selectedId) {

        input.value =
            selectedId;

        await searchReport();

        return;
    }


    // --------------------------------------------------
    // Second preference:
    // complaintId
    // --------------------------------------------------

    const complaintId =
        sessionStorage.getItem(
            "complaintId"
        );


    if (complaintId) {

        input.value =
            complaintId;

        await searchReport();

        return;
    }


    // --------------------------------------------------
    // Nothing selected
    // --------------------------------------------------

    result.style.display =
        "none";
}


// ======================================================
// ENTER KEY SEARCH
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const searchInput =
            document.getElementById(
                "complaintSearch"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "keypress",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        searchReport();
                    }
                }
            );
        }


        autoLoadComplaint();
    }
);