document.addEventListener("DOMContentLoaded", () => {
    loadStatusesFromDatabase();
});


// ======================================================
// LOAD COMPLAINTS FROM DATABASE
// ======================================================

async function loadStatusesFromDatabase() {

    const tableBody = document.getElementById("statusTableBody");

    if (!tableBody) {
        console.error("statusTableBody not found");
        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td colspan="100%" style="text-align:center; padding:30px;">
                Loading complaints...
            </td>
        </tr>
    `;

    try {

        const response = await fetch("/api/complaints");

        if (!response.ok) {
            throw new Error("Could not load complaints");
        }

        const complaints = await response.json();

        tableBody.innerHTML = "";

        // ==================================================
        // NO COMPLAINTS
        // ==================================================

        if (!complaints || complaints.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="100%" style="text-align:center; padding:40px;">
                        <div style="font-size:40px; margin-bottom:10px;">
                            📋
                        </div>

                        <strong>No complaints found</strong>

                        <div style="margin-top:8px; color:#777;">
                            Complaints submitted by citizens will appear here.
                        </div>
                    </td>
                </tr>
            `;

            updateVisibleCount(0);
            return;
        }


        // ==================================================
        // CREATE DATABASE ROWS
        // ==================================================

        complaints.forEach(complaint => {

            const row = document.createElement("tr");

            const complaintId =
                complaint.complaintId || "-";

            const category =
                complaint.category || "-";

            // assignedPriority is used after assignment
            const priority =
                complaint.assignedPriority ||
                complaint.priority ||
                "-";

            const status =
                normalizeStatus(
                    complaint.status
                );

            const statusClass =
                getStatusClass(status);


            row.innerHTML = `

                <td>
                    <span class="complaint-id">
                        ${escapeHtml(complaintId)}
                    </span>
                </td>


                <td>
                    ${escapeHtml(category)}
                </td>


                <td>
                    <span class="priority-text">
                        ${escapeHtml(priority)}
                    </span>
                </td>


                <td>
                    <span class="status-pill ${statusClass}">
                        ${escapeHtml(status)}
                    </span>
                </td>


                <td>

                    <select
                        class="status-select"
                        onchange="changeStatus(this, '${escapeAttribute(complaintId)}')">

                        <option value="Pending"
                            ${status === "Pending" ? "selected" : ""}>
                            Pending
                        </option>

                        <option value="Verified"
                            ${status === "Verified" ? "selected" : ""}>
                            Verified
                        </option>

                        <option value="Assigned"
                            ${status === "Assigned" ? "selected" : ""}>
                            Assigned
                        </option>

                        <option value="In Progress"
                            ${status === "In Progress" ? "selected" : ""}>
                            In Progress
                        </option>

                        <option value="Resolved"
                            ${status === "Resolved" ? "selected" : ""}>
                            Resolved
                        </option>

                        <option value="Closed"
                            ${status === "Closed" ? "selected" : ""}>
                            Closed
                        </option>

                        <option value="Rejected"
                            ${status === "Rejected" ? "selected" : ""}>
                            Rejected
                        </option>

                        <option value="Duplicate"
                            ${status === "Duplicate" ? "selected" : ""}>
                            Duplicate
                        </option>

                    </select>

                </td>
            `;


            tableBody.appendChild(row);

        });


        updateVisibleCount(complaints.length);

        console.log(
            "Status Management - Database complaints:",
            complaints
        );


        // Apply current search/filter
        filterStatusTable();

    }
    catch (error) {

        console.error(
            "Error loading complaints:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="100%" style="text-align:center; padding:40px;">

                    <div style="font-size:40px; margin-bottom:10px;">
                        ⚠️
                    </div>

                    <strong>
                        Failed to load complaints
                    </strong>

                    <div style="margin-top:8px; color:#777;">
                        Please check whether the Spring Boot server is running.
                    </div>

                    <button
                        onclick="loadStatusesFromDatabase()"
                        style="margin-top:15px; padding:8px 18px; cursor:pointer;">
                        Retry
                    </button>

                </td>
            </tr>
        `;

        updateVisibleCount(0);
    }
}



// ======================================================
// NORMALIZE STATUS
// ======================================================

function normalizeStatus(status) {

    if (!status) {
        return "Pending";
    }

    const value =
        String(status)
            .trim()
            .toLowerCase();


    switch (value) {

        case "pending":
            return "Pending";

        case "verified":
        case "genuine":
            return "Verified";

        case "assigned":
            return "Assigned";

        case "in progress":
        case "progress":
        case "in_progress":
            return "In Progress";

        case "resolved":
            return "Resolved";

        case "closed":
            return "Closed";

        case "rejected":
            return "Rejected";

        case "duplicate":
            return "Duplicate";

        default:
            return status;
    }
}



// ======================================================
// STATUS CSS CLASS
// ======================================================

function getStatusClass(status) {

    switch (normalizeStatus(status)) {

        case "Pending":
            return "pending";

        case "Verified":
            return "verified";

        case "Assigned":
            return "assigned";

        case "In Progress":
            return "progress";

        case "Resolved":
            return "resolved";

        case "Closed":
            return "closed";

        case "Rejected":
            return "rejected";

        case "Duplicate":
            return "duplicate";

        default:
            return "pending";
    }
}



// ======================================================
// UPDATE STATUS IN DATABASE
// ======================================================

async function changeStatus(selectElement, complaintId) {

    const newStatus =
        selectElement.value;


    if (!complaintId || complaintId === "-") {

        alert(
            "Invalid complaint ID."
        );

        await loadStatusesFromDatabase();

        return;
    }


    const confirmed =
        confirm(
            `Are you sure you want to change ${complaintId} status to "${newStatus}"?`
        );


    // ==================================================
    // USER CANCELLED
    // ==================================================

    if (!confirmed) {

        await loadStatusesFromDatabase();

        return;
    }


    try {

        selectElement.disabled = true;


        const response =
            await fetch(
                `/api/complaints/${encodeURIComponent(complaintId)}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );


        if (!response.ok) {

            let errorMessage =
                "Status update failed.";

            try {

                const errorText =
                    await response.text();

                if (errorText) {
                    errorMessage =
                        errorText;
                }

            }
            catch (e) {
                console.error(e);
            }


            throw new Error(
                errorMessage
            );
        }


        const updatedComplaint =
            await response.json();


        console.log(
            "Status updated:",
            updatedComplaint
        );


        // ==================================================
        // KEEP SELECTED COMPLAINT IN SYNC
        // ==================================================

        const savedComplaintId =
            sessionStorage.getItem(
                "complaintId"
            );


        if (
            savedComplaintId === complaintId
        ) {

            sessionStorage.setItem(
                "complaintStatus",
                newStatus
            );

        }


        // ==================================================
        // SUCCESS
        // ==================================================

        alert(
            `Status updated successfully!\n\n${complaintId} → ${newStatus}`
        );


        // Reload fresh database data
        await loadStatusesFromDatabase();

    }
    catch (error) {

        console.error(
            "Status update error:",
            error
        );


        alert(
            "Could not update status.\n\n" +
            "Please check the complaint and try again."
        );


        await loadStatusesFromDatabase();

    }
}



// ======================================================
// SEARCH + STATUS FILTER
// ======================================================

function filterStatusTable() {

    const searchInput =
        document.getElementById(
            "statusSearch"
        );


    const filter =
        document.getElementById(
            "statusFilter"
        );


    const tableBody =
        document.getElementById(
            "statusTableBody"
        );


    if (!tableBody) {
        return;
    }


    const searchText =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const statusFilter =
        filter
            ? filter.value
            : "all";


    const rows =
        tableBody.querySelectorAll(
            "tr"
        );


    let visibleCount = 0;


    rows.forEach(row => {

        // Ignore special loading/empty rows
        const select =
            row.querySelector(
                "select"
            );


        if (!select) {

            if (
                searchText === "" &&
                statusFilter === "all"
            ) {

                row.style.display = "";

            }
            else {

                row.style.display = "none";

            }

            return;
        }


        const text =
            row.innerText
                .toLowerCase();


        const selectedStatus =
            normalizeStatus(
                select.value
            );


        const matchesSearch =
            text.includes(
                searchText
            );


        const matchesStatus =
            statusFilter === "all" ||
            normalizeStatus(statusFilter) ===
                selectedStatus;


        if (
            matchesSearch &&
            matchesStatus
        ) {

            row.style.display = "";

            visibleCount++;

        }
        else {

            row.style.display = "none";

        }

    });


    updateVisibleCount(
        visibleCount
    );
}



// ======================================================
// VISIBLE COUNT
// ======================================================

function updateVisibleCount(count) {

    const countElement =
        document.getElementById(
            "visibleCount"
        );


    if (countElement) {

        countElement.textContent =
            count;

    }
}



// ======================================================
// REFRESH
// ======================================================

function refreshStatuses() {

    loadStatusesFromDatabase();

}



// ======================================================
// HTML ESCAPE
// ======================================================

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}



// ======================================================
// ATTRIBUTE ESCAPE
// ======================================================

function escapeAttribute(value) {

    if (value === null || value === undefined) {
        return "";
    }


    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}