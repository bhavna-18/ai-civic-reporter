/* =========================================
   CITIZEN DASHBOARD
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    loadDashboardData();

});


/* =========================================
   LOAD DASHBOARD DATA FROM DATABASE
========================================= */

async function loadDashboardData() {

    try {

        const response = await fetch("/api/complaints");

        if (!response.ok) {
            throw new Error("Could not load complaints");
        }

        const complaints = await response.json();

        updateDashboardCounts(complaints);

    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

        showZeroCounts();

    }

}


/* =========================================
   UPDATE DASHBOARD COUNTS
========================================= */

function updateDashboardCounts(complaints) {

    let total = complaints.length;

    let pending = 0;

    let progress = 0;

    let resolved = 0;


    complaints.forEach(function (complaint) {

        const status =
            complaint.status
                ? complaint.status.toLowerCase()
                : "";


        if (status === "pending") {

            pending++;

        }


        else if (
            status === "in progress" ||
            status === "in_progress" ||
            status === "progress"
        ) {

            progress++;

        }


        else if (status === "resolved") {

            resolved++;

        }

    });


    setDashboardValue(
        "dashboardTotal",
        total
    );


    setDashboardValue(
        "dashboardPending",
        pending
    );


    setDashboardValue(
        "dashboardProgress",
        progress
    );


    setDashboardValue(
        "dashboardResolved",
        resolved
    );

}


/* =========================================
   SET DASHBOARD VALUE
========================================= */

function setDashboardValue(
    elementId,
    value
) {

    const element =
        document.getElementById(elementId);


    if (element) {

        element.textContent = value;

    }

}


/* =========================================
   ZERO COUNTS
========================================= */

function showZeroCounts() {

    setDashboardValue(
        "dashboardTotal",
        0
    );

    setDashboardValue(
        "dashboardPending",
        0
    );

    setDashboardValue(
        "dashboardProgress",
        0
    );

    setDashboardValue(
        "dashboardResolved",
        0
    );

}