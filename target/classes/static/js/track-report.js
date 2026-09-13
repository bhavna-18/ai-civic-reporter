/* =========================================
   AI CIVIC REPORTER
   TRACK REPORT
========================================= */


function trackComplaint() {

    const input =
        document.getElementById(
            "complaintSearch"
        );

    const complaintId =
        input.value.trim();


    if (complaintId === "") {

        alert(
            "Please enter a Complaint ID."
        );

        return;

    }


    document.getElementById(
        "trackingComplaintId"
    ).textContent =
        complaintId;


    sessionStorage.setItem(
        "complaintId",
        complaintId
    );


    console.log(
        "Tracking:",
        complaintId
    );

}


/* =========================================
   LOAD SAVED COMPLAINT
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const savedId =
            sessionStorage.getItem(
                "complaintId"
            );


        if (savedId) {

            document.getElementById(
                "complaintSearch"
            ).value =
                savedId;

            document.getElementById(
                "trackingComplaintId"
            ).textContent =
                savedId;

        }

    }
);