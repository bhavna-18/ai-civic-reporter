/* =========================================
   ALL COMPLAINTS - DATABASE VERSION
========================================= */

let allComplaints = [];


/* =========================================
   PAGE LOAD
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    loadComplaints();

    setupFilterEvents();

});


/* =========================================
   LOAD COMPLAINTS FROM SPRING BOOT API
========================================= */

async function loadComplaints() {

    const tableBody =
        document.querySelector("#complaintsTable tbody");

    if (!tableBody) {
        return;
    }


    // Loading message
    tableBody.innerHTML = `
        <tr>
            <td colspan="7"
                style="text-align:center; padding:30px;">
                ⏳ Loading complaints...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch("/api/complaints");


        if (!response.ok) {

            throw new Error(
                "Failed to load complaints"
            );
        }


        allComplaints =
            await response.json();


        console.log(
            "Complaints loaded:",
            allComplaints
        );


        displayComplaints(
            allComplaints
        );


    } catch (error) {

        console.error(
            "Error loading complaints:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="7"
                    style="text-align:center; padding:30px;">

                    ❌ Unable to load complaints.

                    <br><br>

                    Please make sure Spring Boot
                    and MySQL are running.

                </td>
            </tr>
        `;


        const resultCount =
            document.getElementById(
                "resultCount"
            );


        if (resultCount) {

            resultCount.textContent =
                "Unable to load complaints";
        }
    }
}


/* =========================================
   DISPLAY COMPLAINTS
========================================= */

function displayComplaints(
    complaints
) {

    const tableBody =
        document.querySelector(
            "#complaintsTable tbody"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    if (
        !complaints ||
        complaints.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7"
                    style="text-align:center; padding:30px;">

                    📭 No complaints found.

                </td>
            </tr>
        `;


        const resultCount =
            document.getElementById(
                "resultCount"
            );


        if (resultCount) {

            resultCount.textContent =
                "Showing 0 complaints";
        }


        updateSummary([]);


        return;
    }


    complaints.forEach(
        complaint => {

            const row =
                document.createElement("tr");


            /* =================================
               NORMALIZE VALUES
            ================================= */

            const category =
                String(
                    complaint.category ||
                    "Other"
                )
                .toLowerCase()
                .trim();


            const status =
                normalizeStatus(
                    complaint.status
                );


            const priority =
                String(
                    complaint.assignedPriority ||
                    complaint.priority ||
                    "Medium"
                )
                .toLowerCase()
                .trim();


            /* =================================
               CATEGORY DISPLAY
            ================================= */

            let categoryIcon = "📌";

            let categoryName =
                complaint.category ||
                "Other";


            if (
                category.includes("pothole")
            ) {

                categoryIcon = "🛣️";

                categoryName =
                    "Pothole";

            } else if (
                category.includes("garbage")
            ) {

                categoryIcon = "🗑️";

                categoryName =
                    "Garbage";

            } else if (
                category.includes("water")
            ) {

                categoryIcon = "💧";

                categoryName =
                    "Water";

            } else if (
                category.includes("streetlight") ||
                category.includes("street light")
            ) {

                categoryIcon = "💡";

                categoryName =
                    "Streetlight";
            }


            /* =================================
               STATUS DISPLAY
            ================================= */

            const statusInfo =
                getStatusInfo(status);


            /* =================================
               PRIORITY DISPLAY
            ================================= */

            const priorityInfo =
                getPriorityInfo(priority);


            /* =================================
               AI VERIFICATION
            ================================= */

            let aiVerification = `
                <span class="status review">
                    Review
                </span>
            `;


            if (
                complaint.aiConfidence !== null &&
                complaint.aiConfidence !== undefined
            ) {

                const confidence =
                    Number(
                        complaint.aiConfidence
                    );


                aiVerification = `
                    <span class="status verified">
                        ✓ Verified
                    </span>
                `;
            }


            /* =================================
               FILTER DATA
            ================================= */

            row.dataset.category =
                getCategoryFilterValue(
                    category
                );


            row.dataset.status =
                getStatusFilterValue(
                    status
                );


            row.dataset.priority =
                priorityInfo.className;


            /* =================================
               TABLE ROW
            ================================= */

            const complaintId =
                complaint.complaintId ||
                "";


            row.innerHTML = `

                <td>
                    <strong>
                        ${escapeHtml(
                            complaintId ||
                            "N/A"
                        )}
                    </strong>
                </td>


                <td>
                    ${categoryIcon}
                    ${escapeHtml(
                        categoryName
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        complaint.location ||
                        "Location not available"
                    )}
                </td>


                <td>
                    ${aiVerification}
                </td>


                <td>
                    <span class="all-priority ${priorityInfo.className}">
                        ${priorityInfo.text}
                    </span>
                </td>


                <td>
                    <span class="status ${statusInfo.className}">
                        ${statusInfo.text}
                    </span>
                </td>


                <td>

                    <button
                        class="view-btn"
                        onclick="viewComplaint('${escapeAttribute(
                            complaintId
                        )}')"
                    >
                        👁 View
                    </button>

                </td>

            `;


            tableBody.appendChild(
                row
            );
        }
    );


    updateSummary(
        complaints
    );


    filterComplaints();
}


/* =========================================
   NORMALIZE STATUS
========================================= */

function normalizeStatus(status) {

    if (!status) {
        return "pending";
    }


    return String(status)
        .toLowerCase()
        .trim()
        .replace(/_/g, " ");
}


/* =========================================
   STATUS INFORMATION
========================================= */

function getStatusInfo(status) {

    switch (status) {

        case "verified":

            return {
                className: "verified",
                text: "Verified"
            };


        case "assigned":

            return {
                className: "assigned",
                text: "Assigned"
            };


        case "in progress":
        case "progress":

            return {
                className: "progress",
                text: "In Progress"
            };


        case "resolved":

            return {
                className: "resolved",
                text: "Resolved"
            };


        case "closed":

            return {
                className: "resolved",
                text: "Closed"
            };


        case "rejected":

            return {
                className: "rejected",
                text: "Rejected"
            };


        case "duplicate":

            return {
                className: "duplicate",
                text: "Duplicate"
            };


        default:

            return {
                className: "pending",
                text: "Pending"
            };
    }
}


/* =========================================
   PRIORITY INFORMATION
========================================= */

function getPriorityInfo(priority) {

    switch (priority) {

        case "critical":

            return {
                className: "critical",
                text: "Critical"
            };


        case "high":

            return {
                className: "high",
                text: "High"
            };


        case "low":

            return {
                className: "low",
                text: "Low"
            };


        default:

            return {
                className: "medium",
                text: "Medium"
            };
    }
}


/* =========================================
   CATEGORY FILTER VALUE
========================================= */

function getCategoryFilterValue(
    category
) {

    if (
        category.includes("pothole")
    ) {

        return "pothole";
    }


    if (
        category.includes("garbage")
    ) {

        return "garbage";
    }


    if (
        category.includes("water")
    ) {

        return "water";
    }


    if (
        category.includes("streetlight") ||
        category.includes("street light")
    ) {

        return "streetlight";
    }


    return "other";
}


/* =========================================
   STATUS FILTER VALUE
========================================= */

function getStatusFilterValue(
    status
) {

    if (
        status === "in progress" ||
        status === "progress"
    ) {

        return "progress";
    }


    if (
        status === "resolved" ||
        status === "closed"
    ) {

        return "resolved";
    }


    if (
        status === "verified"
    ) {

        return "verified";
    }


    if (
        status === "assigned"
    ) {

        return "assigned";
    }


    if (
        status === "rejected"
    ) {

        return "rejected";
    }


    if (
        status === "duplicate"
    ) {

        return "duplicate";
    }


    return "pending";
}


/* =========================================
   SEARCH + FILTER
========================================= */

function filterComplaints() {

    const searchInput =
        document.getElementById(
            "complaintSearch"
        );


    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const priorityFilter =
        document.getElementById(
            "priorityFilter"
        );


    if (
        !searchInput ||
        !categoryFilter ||
        !statusFilter ||
        !priorityFilter
    ) {

        return;
    }


    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const category =
        categoryFilter.value;


    const status =
        statusFilter.value;


    const priority =
        priorityFilter.value;


    const rows =
        document.querySelectorAll(
            "#complaintsTable tbody tr"
        );


    let visibleCount = 0;


    rows.forEach(
        row => {

            // Ignore loading/no-result rows
            if (
                !row.dataset.category
            ) {

                return;
            }


            const text =
                row.textContent
                    .toLowerCase();


            const rowCategory =
                row.dataset.category;


            const rowStatus =
                row.dataset.status;


            const rowPriority =
                row.dataset.priority;


            const searchMatch =
                text.includes(search);


            const categoryMatch =
                category === "all" ||
                rowCategory === category;


            const statusMatch =
                status === "all" ||
                rowStatus === status;


            const priorityMatch =
                priority === "all" ||
                rowPriority === priority;


            if (
                searchMatch &&
                categoryMatch &&
                statusMatch &&
                priorityMatch
            ) {

                row.style.display = "";

                visibleCount++;

            } else {

                row.style.display = "none";
            }
        }
    );


    const resultCount =
        document.getElementById(
            "resultCount"
        );


    if (resultCount) {

        resultCount.textContent =
            `Showing ${visibleCount} complaints`;
    }
}


/* =========================================
   FILTER EVENTS
========================================= */

function setupFilterEvents() {

    document
        .getElementById(
            "complaintSearch"
        )
        ?.addEventListener(
            "input",
            filterComplaints
        );


    document
        .getElementById(
            "categoryFilter"
        )
        ?.addEventListener(
            "change",
            filterComplaints
        );


    document
        .getElementById(
            "statusFilter"
        )
        ?.addEventListener(
            "change",
            filterComplaints
        );


    document
        .getElementById(
            "priorityFilter"
        )
        ?.addEventListener(
            "change",
            filterComplaints
        );
}


/* =========================================
   VIEW COMPLAINT
========================================= */

function viewComplaint(id) {

    if (
        !id ||
        id === "N/A"
    ) {

        alert(
            "❌ Complaint ID not found."
        );

        return;
    }


    console.log(
        "Opening complaint:",
        id
    );


    // Main ID used by report-details.js
    sessionStorage.setItem(
        "complaintId",
        id
    );


    // Keep selected ID
    sessionStorage.setItem(
        "selectedComplaintId",
        id
    );


    // Remove old object
    sessionStorage.removeItem(
        "selectedComplaint"
    );


    // Open dynamic details page
    window.location.href =
        "/report-details";
}


/* =========================================
   REFRESH
========================================= */

function refreshComplaints() {

    const searchInput =
        document.getElementById(
            "complaintSearch"
        );


    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const priorityFilter =
        document.getElementById(
            "priorityFilter"
        );


    if (searchInput) {

        searchInput.value = "";
    }


    if (categoryFilter) {

        categoryFilter.value = "all";
    }


    if (statusFilter) {

        statusFilter.value = "all";
    }


    if (priorityFilter) {

        priorityFilter.value = "all";
    }


    loadComplaints();
}


/* =========================================
   ADMIN SUMMARY
========================================= */

function updateSummary(
    complaints
) {

    const statBoxes =
        document.querySelectorAll(
            ".complaint-mini-stats strong"
        );


    if (!statBoxes.length) {
        return;
    }


    let pending = 0;

    let progress = 0;

    let resolved = 0;


    complaints.forEach(
        complaint => {

            const status =
                normalizeStatus(
                    complaint.status
                );


            if (
                status === "pending"
            ) {

                pending++;

            } else if (
                status === "progress" ||
                status === "in progress"
            ) {

                progress++;

            } else if (
                status === "resolved" ||
                status === "closed"
            ) {

                resolved++;
            }
        }
    );


    // TOTAL
    if (statBoxes[0]) {

        statBoxes[0].textContent =
            complaints.length;
    }


    // PENDING
    if (statBoxes[1]) {

        statBoxes[1].textContent =
            pending;
    }


    // IN PROGRESS
    if (statBoxes[2]) {

        statBoxes[2].textContent =
            progress;
    }


    // RESOLVED
    if (statBoxes[3]) {

        statBoxes[3].textContent =
            resolved;
    }
}


/* =========================================
   HTML SAFETY
========================================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================
   ATTRIBUTE SAFETY
========================================= */

function escapeAttribute(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)

        .replace(
            /\\/g,
            "\\\\"
        )

        .replace(
            /'/g,
            "\\'"
        );
}