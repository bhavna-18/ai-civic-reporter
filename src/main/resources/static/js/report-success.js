/* =========================================
   AI CIVIC REPORTER
   REPORT SUCCESS
========================================= */


/* =========================================
   GENERATE COMPLAINT ID
========================================= */

function generateComplaintId() {

    const year =
        new Date().getFullYear();

    const number =
        Math.floor(
            1000 + Math.random() * 9000
        );

    return "CIVIC-" + year + "-" + number;

}


/* =========================================
   LOAD SUCCESS PAGE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        let complaintId =
            sessionStorage.getItem(
                "complaintId"
            );


        if (!complaintId) {

            complaintId =
                generateComplaintId();

            sessionStorage.setItem(
                "complaintId",
                complaintId
            );

        }


        document.getElementById(
            "complaintId"
        ).textContent =
            complaintId;


        /* Load issue category */

        const category =
            sessionStorage.getItem(
                "issueCategory"
            );


        if (category) {

            document.getElementById(
                "successIssue"
            ).textContent =
                category;

        }

    }
);


/* =========================================
   COPY COMPLAINT ID
========================================= */

function copyComplaintId() {

    const id =
        document.getElementById(
            "complaintId"
        ).textContent;


    navigator.clipboard.writeText(id)
        .then(function () {

            alert(
                "✓ Complaint ID copied: " + id
            );

        })
        .catch(function () {

            alert(
                "Complaint ID: " + id
            );

        });

}


/* =========================================
   TRACK REPORT
========================================= */

function trackReport() {

    window.location.href =
        "/track-report";

}