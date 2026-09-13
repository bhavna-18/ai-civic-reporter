let allReports = [];


/* =========================================
   PAGE LOAD
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    loadMyReports();

    setupFilters();

});


/* =========================================
   LOAD REPORTS FROM DATABASE
========================================= */

async function loadMyReports() {

    try {

        const response =
            await fetch("/api/complaints");


        if (!response.ok) {

            throw new Error(
                "Failed to load complaints"
            );

        }


        allReports =
            await response.json();


        console.log(
            "Reports loaded:",
            allReports
        );


        updateMyReportStats(
            allReports
        );


        renderReports(
            allReports
        );


    } catch (error) {

        console.error(
            "Error loading reports:",
            error
        );


        updateMyReportStats([]);


        showNoReports(
            "Unable to load reports from database."
        );

    }

}


/* =========================================
   UPDATE STATISTICS
========================================= */

function updateMyReportStats(reports) {

    let total =
        reports.length;

    let pending = 0;

    let progress = 0;

    let resolved = 0;


    reports.forEach(function (report) {

        const status =
            normalizeStatus(
                report.status
            );


        if (status === "pending") {

            pending++;

        }

        else if (status === "progress") {

            progress++;

        }

        else if (status === "resolved") {

            resolved++;

        }

    });


    const totalElement =
        document.getElementById(
            "myTotal"
        );


    const pendingElement =
        document.getElementById(
            "myPending"
        );


    const progressElement =
        document.getElementById(
            "myProgress"
        );


    const resolvedElement =
        document.getElementById(
            "myResolved"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (pendingElement) {

        pendingElement.textContent =
            pending;

    }


    if (progressElement) {

        progressElement.textContent =
            progress;

    }


    if (resolvedElement) {

        resolvedElement.textContent =
            resolved;

    }

}


/* =========================================
   RENDER REPORT TABLE
========================================= */

function renderReports(reports) {

    const tableBody =
        document.getElementById(
            "reportsTableBody"
        );


    if (!tableBody) {

        console.error(
            "reportsTableBody not found"
        );

        return;

    }


    tableBody.innerHTML = "";


    if (
        !reports ||
        reports.length === 0
    ) {

        showNoReports(
            "No reports found."
        );

        return;

    }


    hideNoReports();


    reports.forEach(function (report) {

        const row =
            document.createElement(
                "tr"
            );


        const status =
            normalizeStatus(
                report.status
            );


        const priority =
            report.assignedPriority ||
            report.priority ||
            "Not Assigned";


        const category =
            report.category ||
            "Other";


        const complaintId =
            report.complaintId ||
            "-";


        const location =
            report.location ||
            "Location not available";


        const createdDate =
            formatDate(
                report.createdAt
            );


        /* Store values for filtering */

        row.dataset.status =
            status;


        row.dataset.category =
            normalizeCategory(
                category
            );


        /* Create table row */

        row.innerHTML = `

            <td>

                <span class="complaint-id">

                    ${escapeHtml(
                        complaintId
                    )}

                </span>

            </td>


            <td>

                <strong>

                    ${escapeHtml(
                        category
                    )}

                </strong>

            </td>


            <td>

                <span
                    class="location-text"
                    title="${escapeHtml(
                        location
                    )}"
                >

                    ${escapeHtml(
                        location
                    )}

                </span>

            </td>


            <td>

                ${escapeHtml(
                    createdDate
                )}

            </td>


            <td>

                <span class="priority-text">

                    ${escapeHtml(
                        String(
                            priority
                        ).toUpperCase()
                    )}

                </span>

            </td>


            <td>

                <span
                    class="status-pill ${getStatusClass(
                        status
                    )}"
                >

                    ${getStatusText(
                        status
                    )}

                </span>

            </td>


            <td>

                <div class="action-buttons">


                    <button
                        type="button"
                        class="view-report-btn"
                        onclick="viewReport('${escapeJs(
                            complaintId
                        )}')"
                    >

                        View

                    </button>


                    <button
                        type="button"
                        class="track-report-btn"
                        onclick="trackReport('${escapeJs(
                            complaintId
                        )}')"
                    >

                        Track

                    </button>


                </div>

            </td>

        `;


        tableBody.appendChild(
            row
        );

    });


    updateResultCount(
        reports.length
    );


    /*
     * Apply currently selected filters
     */

    filterReports();

}


/* =========================================
   NORMALIZE STATUS
========================================= */

function normalizeStatus(status) {

    if (!status) {

        return "pending";

    }


    const value =
        String(status)
            .toLowerCase()
            .trim();


    if (

        value === "in progress" ||

        value === "in_progress" ||

        value === "progress"

    ) {

        return "progress";

    }


    return value;

}


/* =========================================
   STATUS TEXT
========================================= */

function getStatusText(status) {

    switch (status) {

        case "pending":

            return "⏳ Pending";


        case "verified":

            return "✓ Verified";


        case "assigned":

            return "👨‍💼 Assigned";


        case "progress":

            return "🔧 In Progress";


        case "resolved":

            return "✓ Resolved";


        case "closed":

            return "🔒 Closed";


        case "rejected":

            return "✕ Rejected";


        case "duplicate":

            return "⚠ Duplicate";


        default:

            return "⏳ Pending";

    }

}


/* =========================================
   STATUS CSS CLASS
========================================= */

function getStatusClass(status) {

    switch (status) {

        case "pending":

            return "pending-pill";


        case "verified":

            return "verified-pill";


        case "assigned":

            return "assigned-pill";


        case "progress":

            return "progress-pill";


        case "resolved":

            return "resolved-pill";


        case "closed":

            return "closed-pill";


        case "rejected":

            return "rejected-pill";


        case "duplicate":

            return "duplicate-pill";


        default:

            return "pending-pill";

    }

}


/* =========================================
   CATEGORY NORMALIZATION
========================================= */

function normalizeCategory(category) {

    if (!category) {

        return "other";

    }


    const value =
        String(category)
            .toLowerCase()
            .trim();


    if (

        value.includes("pothole") ||

        value.includes("pot hole")

    ) {

        return "pothole";

    }


    if (
        value.includes("garbage")
    ) {

        return "garbage";

    }


    if (

        value.includes("water") ||

        value.includes("leak")

    ) {

        return "water";

    }


    if (

        value.includes("streetlight") ||

        value.includes("street light") ||

        value.includes("light")

    ) {

        return "streetlight";

    }


    if (
        value.includes("drain")
    ) {

        return "drainage";

    }


    if (
        value.includes("road")
    ) {

        return "road";

    }


    return "other";

}


/* =========================================
   FILTER REPORTS
========================================= */

function filterReports() {

    const searchInput =
        document.getElementById(
            "reportSearch"
        );


    const categoryInput =
        document.getElementById(
            "categoryFilter"
        );


    const statusInput =
        document.getElementById(
            "statusFilter"
        );


    const rows =
        document.querySelectorAll(
            "#reportsTableBody tr"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const category =
        categoryInput
            ? categoryInput.value
            : "all";


    const status =
        statusInput
            ? statusInput.value
            : "all";


    let visibleCount = 0;


    rows.forEach(function (row) {

        const text =
            row.textContent
                .toLowerCase();


        const rowCategory =
            row.dataset.category ||
            "other";


        const rowStatus =
            row.dataset.status ||
            "pending";


        const matchesSearch =
            text.includes(
                search
            );


        const matchesCategory =
            category === "all" ||
            rowCategory === category;


        const matchesStatus =
            status === "all" ||
            rowStatus === status;


        if (

            matchesSearch &&

            matchesCategory &&

            matchesStatus

        ) {

            row.style.display =
                "";

            visibleCount++;

        }

        else {

            row.style.display =
                "none";

        }

    });


    updateResultCount(
        visibleCount
    );


    const noReports =
        document.getElementById(
            "noReports"
        );


    if (noReports) {

        noReports.style.display =
            visibleCount === 0
                ? "block"
                : "none";

    }

}


/* =========================================
   SETUP FILTER EVENTS
========================================= */

function setupFilters() {

    const search =
        document.getElementById(
            "reportSearch"
        );


    const category =
        document.getElementById(
            "categoryFilter"
        );


    const status =
        document.getElementById(
            "statusFilter"
        );


    if (search) {

        search.addEventListener(
            "input",
            filterReports
        );

    }


    if (category) {

        category.addEventListener(
            "change",
            filterReports
        );

    }


    if (status) {

        status.addEventListener(
            "change",
            filterReports
        );

    }

}


/* =========================================
   VIEW REPORT
========================================= */

function viewReport(id) {

    if (!id || id === "-") {

        alert(
            "Complaint ID not available."
        );

        return;

    }


    console.log(
        "Opening complaint details:",
        id
    );


    /*
     * IMPORTANT:
     * report-details.js uses complaintId
     */

    sessionStorage.setItem(
        "complaintId",
        id
    );


    /*
     * Keep selectedComplaintId
     * for compatibility with
     * other project pages.
     */

    sessionStorage.setItem(
        "selectedComplaintId",
        id
    );


    /*
     * Remove old complaint object
     * so report-details.js fetches
     * fresh data from MySQL.
     */

    sessionStorage.removeItem(
        "selectedComplaint"
    );


    /*
     * Open Report Details page
     */

    window.location.href =
        "/report-details";

}


/* =========================================
   TRACK REPORT
========================================= */

function trackReport(id) {

    if (!id || id === "-") {

        alert(
            "Complaint ID not available."
        );

        return;

    }


    console.log(
        "Opening complaint tracking:",
        id
    );


    sessionStorage.setItem(
        "complaintId",
        id
    );


    sessionStorage.setItem(
        "selectedComplaintId",
        id
    );


    window.location.href =
        "/track-report";

}


/* =========================================
   RESULT COUNT
========================================= */

function updateResultCount(count) {

    const resultCount =
        document.getElementById(
            "resultCount"
        );


    if (resultCount) {

        resultCount.textContent =
            "Showing " +
            count +
            " reports";

    }

}


/* =========================================
   SHOW NO REPORTS
========================================= */

function showNoReports(message) {

    const tableBody =
        document.getElementById(
            "reportsTableBody"
        );


    if (tableBody) {

        tableBody.innerHTML =
            "";

    }


    const noReports =
        document.getElementById(
            "noReports"
        );


    if (noReports) {

        noReports.style.display =
            "block";


        const paragraph =
            noReports.querySelector(
                "p"
            );


        if (paragraph) {

            paragraph.textContent =
                message;

        }

    }


    updateResultCount(0);

}


/* =========================================
   HIDE NO REPORTS
========================================= */

function hideNoReports() {

    const noReports =
        document.getElementById(
            "noReports"
        );


    if (noReports) {

        noReports.style.display =
            "none";

    }

}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(dateValue) {

    if (!dateValue) {

        return "-";

    }


    try {

        const date =
            new Date(
                dateValue
            );


        if (
            isNaN(
                date.getTime()
            )
        ) {

            return dateValue;

        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }

    catch (error) {

        return dateValue;

    }

}


/* =========================================
   HTML SECURITY
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
   JAVASCRIPT STRING SECURITY
========================================= */

function escapeJs(value) {

    return String(value)

        .replace(
            /\\/g,
            "\\\\"
        )

        .replace(
            /'/g,
            "\\'"
        )

        .replace(
            /"/g,
            '\\"'
        );

}