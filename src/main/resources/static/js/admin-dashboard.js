/* =========================================
   AI CIVIC REPORTER
   ADMIN DASHBOARD
   DATABASE CONNECTED
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    loadAdminDashboard();

});


/* =========================================
   LOAD COMPLAINTS
========================================= */

async function loadAdminDashboard() {

    try {

        const response =
            await fetch("/api/complaints");

        if (!response.ok) {

            throw new Error(
                "Unable to load complaints"
            );

        }

        const complaints =
            await response.json();


        updateAdminStatistics(
            complaints
        );

        updateRecentComplaints(
            complaints
        );

        updateComplaintOverview(
            complaints
        );


    } catch (error) {

        console.error(
            "Admin Dashboard Error:",
            error
        );

    }

}


/* =========================================
   ADMIN STATISTICS
========================================= */

function updateAdminStatistics(
    complaints
) {

    const total =
        complaints.length;


    const pending =
        complaints.filter(function (c) {

            return normalizeStatus(c.status)
                === "pending";

        }).length;


    const verification =
        complaints.filter(function (c) {

            return normalizeStatus(c.status)
                === "verified";

        }).length;


    const progress =
        complaints.filter(function (c) {

            return (
                normalizeStatus(c.status)
                === "in progress"
            );

        }).length;


    const resolved =
        complaints.filter(function (c) {

            return normalizeStatus(c.status)
                === "resolved";

        }).length;


    const priority =
        complaints.filter(function (c) {

            return (
                c.priority &&
                c.priority.toUpperCase()
                    === "HIGH"
            ) ||
            (
                c.assignedPriority &&
                c.assignedPriority.toUpperCase()
                    === "HIGH"
            );

        }).length;


    setNumber(
        "adminTotal",
        total
    );


    setNumber(
        "adminPending",
        pending
    );


    setNumber(
        "adminVerify",
        verification
    );


    setNumber(
        "adminProgress",
        progress
    );


    setNumber(
        "adminResolved",
        resolved
    );


    setNumber(
        "adminPriority",
        priority
    );

}


/* =========================================
   NUMBER ANIMATION
========================================= */

function setNumber(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (!element) return;


    element.textContent =
        Number(value).toLocaleString();

}


/* =========================================
   STATUS NORMALIZATION
========================================= */

function normalizeStatus(status) {

    if (!status) {

        return "";

    }


    return status
        .toString()
        .trim()
        .toLowerCase()
        .replace(/_/g, " ");

}


/* =========================================
   RECENT COMPLAINTS
========================================= */

function updateRecentComplaints(
    complaints
) {

    const table =
        document.querySelector(
            ".complaint-table"
        );


    if (!table) return;


    const sorted =
        [...complaints].sort(
            function (a, b) {

                return new Date(
                    b.createdAt || 0
                ) -
                new Date(
                    a.createdAt || 0
                );

            }
        );


    const recent =
        sorted.slice(0, 5);


    let html = `

        <div class="table-row table-header">

            <span>Complaint</span>

            <span>Category</span>

            <span>Location</span>

            <span>Status</span>

        </div>

    `;


    if (recent.length === 0) {

        html += `

            <div class="table-row">

                <span
                    style="
                        grid-column:1/-1;
                        text-align:center;
                        padding:25px;
                    ">

                    No complaints reported yet.

                </span>

            </div>

        `;

        table.innerHTML =
            html;

        return;

    }


    recent.forEach(
        function (complaint) {

            const category =
                formatCategory(
                    complaint.category
                );


            const icon =
                getCategoryIcon(
                    complaint.category
                );


            const status =
                complaint.status ||
                "Pending";


            const statusClass =
                getStatusClass(
                    status
                );


            const complaintId =
                complaint.complaintId ||
                "N/A";


            const location =
                complaint.location ||
                "Location not available";


            html += `

                <div
                    class="table-row"
                    onclick="openComplaint('${escapeJs(complaintId)}')"
                    style="cursor:pointer;"
                >

                    <div class="complaint-name">

                        <span>
                            ${icon}
                        </span>

                        <div>

                            <strong>
                                ${escapeHtml(category)}
                            </strong>

                            <small>
                                ${escapeHtml(complaintId)}
                            </small>

                        </div>

                    </div>


                    <span>
                        ${escapeHtml(category)}
                    </span>


                    <span>
                        ${escapeHtml(location)}
                    </span>


                    <span
                        class="status ${statusClass}"
                    >
                        ${escapeHtml(status)}
                    </span>

                </div>

            `;

        }
    );


    table.innerHTML =
        html;

}


/* =========================================
   CATEGORY
========================================= */

function formatCategory(
    category
) {

    if (!category) {

        return "Other";

    }


    const value =
        category
            .toString()
            .toLowerCase();


    if (value.includes("pothole"))
        return "Pothole";


    if (
        value.includes("garbage") ||
        value.includes("waste")
    )
        return "Garbage";


    if (
        value.includes("water") ||
        value.includes("leak")
    )
        return "Water";


    if (
        value.includes("light") ||
        value.includes("streetlight")
    )
        return "Street Light";


    if (value.includes("drain"))
        return "Drainage";


    if (value.includes("road"))
        return "Road";


    return category;

}


/* =========================================
   CATEGORY ICON
========================================= */

function getCategoryIcon(
    category
) {

    if (!category)
        return "📋";


    const value =
        category
            .toString()
            .toLowerCase();


    if (value.includes("pothole"))
        return "🕳️";


    if (
        value.includes("garbage") ||
        value.includes("waste")
    )
        return "🗑️";


    if (value.includes("water"))
        return "💧";


    if (value.includes("light"))
        return "💡";


    if (value.includes("drain"))
        return "🌊";


    if (value.includes("road"))
        return "🛣️";


    return "📋";

}


/* =========================================
   STATUS CLASS
========================================= */

function getStatusClass(
    status
) {

    const value =
        normalizeStatus(status);


    if (value === "resolved")
        return "resolved";


    if (value === "pending")
        return "pending";


    if (
        value === "in progress" ||
        value === "assigned"
    )
        return "progress";


    if (value === "verified")
        return "verified";


    if (
        value === "rejected" ||
        value === "duplicate"
    )
        return "pending";


    return "progress";

}


/* =========================================
   COMPLAINT OVERVIEW
========================================= */

function updateComplaintOverview(
    complaints
) {

    const total =
        complaints.length;


    const pending =
        complaints.filter(
            c =>
                normalizeStatus(c.status)
                === "pending"
        ).length;


    const verification =
        complaints.filter(
            c =>
                normalizeStatus(c.status)
                === "verified"
        ).length;


    const progress =
        complaints.filter(
            c =>
                normalizeStatus(c.status)
                === "in progress"
        ).length;


    const resolved =
        complaints.filter(
            c =>
                normalizeStatus(c.status)
                === "resolved"
        ).length;


    const overview =
        document.querySelector(
            ".overview-bars"
        );


    if (!overview) return;


    overview.innerHTML = `

        ${createOverviewItem(
            "Pending",
            pending,
            total
        )}

        ${createOverviewItem(
            "Under Verification",
            verification,
            total
        )}

        ${createOverviewItem(
            "In Progress",
            progress,
            total
        )}

        ${createOverviewItem(
            "Resolved",
            resolved,
            total
        )}

    `;

}


/* =========================================
   OVERVIEW ITEM
========================================= */

function createOverviewItem(
    label,
    value,
    total
) {

    const percentage =
        total === 0
            ? 0
            : Math.round(
                (value / total) * 100
            );


    return `

        <div class="overview-item">

            <div>

                <span>
                    ${label}
                </span>

                <strong>
                    ${value}
                </strong>

            </div>

            <div class="bar">

                <span
                    style="width:${percentage}%">
                </span>

            </div>

        </div>

    `;

}


/* =========================================
   OPEN COMPLAINT
========================================= */

function openComplaint(
    complaintId
) {

    sessionStorage.setItem(
        "selectedComplaintId",
        complaintId
    );


    sessionStorage.setItem(
        "selectedComplaint",
        complaintId
    );


    window.location.href =
        "/report-details";

}


/* =========================================
   HTML ESCAPE
========================================= */

function escapeHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
   JS ESCAPE
========================================= */

function escapeJs(
    value
) {

    if (!value) return "";


    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

}