/* =========================================
   REPORT ISSUE PAGE
========================================= */


let selectedCategory = "";


/* =========================================
   CATEGORY SELECTION
========================================= */

function selectCategory(button, category) {

    document
        .querySelectorAll(".category-option")
        .forEach(item => {

            item.classList.remove("selected");

        });


    button.classList.add("selected");

    selectedCategory = category;

    document.getElementById("selectedCategory").value =
        category;

}


/* =========================================
   DESCRIPTION CHARACTER COUNT
========================================= */

const description =
    document.getElementById("description");

const charCount =
    document.getElementById("charCount");


if (description) {

    description.addEventListener("input", function () {

        charCount.textContent =
            this.value.length;

    });

}


/* =========================================
   GET CURRENT LOCATION
========================================= */

function getLocation() {

    const locationText =
        document.getElementById("locationText");


    if (!navigator.geolocation) {

        locationText.textContent =
            "Geolocation is not supported.";

        return;

    }


    locationText.textContent =
        "Detecting your location...";


    navigator.geolocation.getCurrentPosition(

        function (position) {

            const latitude =
                position.coords.latitude.toFixed(6);

            const longitude =
                position.coords.longitude.toFixed(6);


            locationText.textContent =
                `Location detected: ${latitude}, ${longitude}`;

        },


        function () {

            locationText.textContent =
                "Unable to detect location.";

        }

    );

}


/* =========================================
   CONTINUE
========================================= */
function goToEvidence() {

    const descriptionValue =
        document.getElementById("description").value.trim();

    if (selectedCategory === "") {
        alert("⚠️ Please select an issue category.");
        return;
    }

    if (descriptionValue === "") {
        alert("📝 Please describe the problem.");
        return;
    }

    const locationText =
        document.getElementById("locationText").textContent;

    if (locationText === "Location not selected") {
        alert("📍 Please select your location.");
        return;
    }

    // Save data temporarily
    sessionStorage.setItem(
        "issueCategory",
        selectedCategory
    );

    sessionStorage.setItem(
        "issueDescription",
        descriptionValue
    );

    sessionStorage.setItem(
        "issueLocation",
        locationText
    );

    // Go to Evidence screen
    window.location.href = "/evidence";
}