/* =========================================================
   AI CIVIC REPORTER
   MAIN SCRIPT
   ========================================================= */


/* =========================================================
   DYNAMIC CIVIC COUNTS
   ========================================================= */

let potholes = 124;
let garbage = 87;
let water = 56;
let lights = 43;


function updateCounts() {

    potholes += Math.floor(Math.random() * 3) - 1;
    garbage += Math.floor(Math.random() * 3) - 1;
    water += Math.floor(Math.random() * 2);
    lights += Math.floor(Math.random() * 3) - 1;

    potholes = Math.max(0, potholes);
    garbage = Math.max(0, garbage);
    water = Math.max(0, water);
    lights = Math.max(0, lights);


    const potholeElement =
        document.getElementById("potholeCount");

    const garbageElement =
        document.getElementById("garbageCount");

    const waterElement =
        document.getElementById("waterCount");

    const lightElement =
        document.getElementById("lightCount");

    const totalElement =
        document.getElementById("totalReports");


    if (potholeElement) {
        potholeElement.textContent = potholes;
    }

    if (garbageElement) {
        garbageElement.textContent = garbage;
    }

    if (waterElement) {
        waterElement.textContent = water;
    }

    if (lightElement) {
        lightElement.textContent = lights;
    }


    if (totalElement) {

        totalElement.textContent =
            potholes +
            garbage +
            water +
            lights;

    }
}


setInterval(updateCounts, 5000);


/* =========================================================
   REPORT ISSUE
   ========================================================= */

function reportIssue() {

    window.location.href = "/report";

}


/* =========================================================
   EXPLORE SYSTEM
   ========================================================= */

function exploreSystem() {

    const aboutSection =
        document.querySelector(".about");

    if (aboutSection) {

        aboutSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* =========================================================
   LOGIN POPUP
   ========================================================= */

function openLoginPopup() {

    const popup =
        document.getElementById("loginPopup");

    if (!popup) {
        return;
    }


    popup.classList.add("show");

    popup.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "login-popup-open"
    );

}


function closeLoginPopup() {

    const popup =
        document.getElementById("loginPopup");

    if (!popup) {
        return;
    }


    popup.classList.remove("show");

    popup.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "login-popup-open"
    );

}


/* =========================================================
   LOGIN POPUP - OUTSIDE CLICK
   ========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const popup =
            document.getElementById("loginPopup");

        if (!popup) {
            return;
        }


        if (
            event.target.classList.contains(
                "login-popup-overlay"
            )
        ) {

            closeLoginPopup();

        }

    }
);


/* =========================================================
   ESC KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeLoginPopup();

        }

    }
);


/* =========================================================
   ACTIVE NAVBAR
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const currentPath =
            window.location.pathname;

        const navLinks =
            document.querySelectorAll(
                ".nav-links .nav-link"
            );


        navLinks.forEach(
            function (link) {

                const href =
                    link.getAttribute("href");


                if (
                    href === currentPath ||
                    (
                        currentPath === "/" &&
                        href === "/"
                    )
                ) {

                    link.classList.add(
                        "active"
                    );

                } else {

                    link.classList.remove(
                        "active"
                    );

                }

            }
        );


        /* =====================================================
           MOBILE NAVBAR AUTO CLOSE
        ===================================================== */

        const mobileLinks =
            document.querySelectorAll(
                "#mainNavbar .nav-link"
            );

        const navbarCollapse =
            document.getElementById(
                "mainNavbar"
            );


        mobileLinks.forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        if (
                            window.innerWidth < 992 &&
                            navbarCollapse &&
                            navbarCollapse.classList.contains(
                                "show"
                            )
                        ) {

                            const bsCollapse =
                                bootstrap.Collapse
                                    .getInstance(
                                        navbarCollapse
                                    );

                            if (bsCollapse) {

                                bsCollapse.hide();

                            }

                        }

                    }
                );

            }
        );


        /* =====================================================
           BACK TO HOME BUTTON
        ===================================================== */

        const backToHome =
            document.getElementById(
                "backToHome"
            );


        if (backToHome) {

            window.addEventListener(
                "scroll",
                function () {

                    const scrollTop =
                        window.scrollY ||
                        document.documentElement.scrollTop ||
                        document.body.scrollTop ||
                        0;


                    if (scrollTop > 300) {

                        backToHome.classList.add(
                            "show"
                        );

                    } else {

                        backToHome.classList.remove(
                            "show"
                        );

                    }

                }
            );


            backToHome.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    const startPosition =
                        window.scrollY ||
                        document.documentElement.scrollTop ||
                        document.body.scrollTop ||
                        0;


                    if (startPosition <= 0) {
                        return;
                    }


                    const duration = 1200;

                    const startTime =
                        performance.now();


                    function scrollToTop(
                        currentTime
                    ) {

                        const elapsed =
                            currentTime -
                            startTime;


                        const progress =
                            Math.min(
                                elapsed / duration,
                                1
                            );


                        /* Smooth ease-out */

                        const ease =
                            1 -
                            Math.pow(
                                1 - progress,
                                3
                            );


                        const currentPosition =
                            startPosition *
                            (1 - ease);


                        window.scrollTo(
                            0,
                            currentPosition
                        );


                        if (progress < 1) {

                            requestAnimationFrame(
                                scrollToTop
                            );

                        } else {

                            window.scrollTo(
                                0,
                                0
                            );

                        }

                    }


                    requestAnimationFrame(
                        scrollToTop
                    );

                }
            );

        }

    }
);