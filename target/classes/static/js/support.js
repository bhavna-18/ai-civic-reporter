/* =====================================================
   AI CIVIC REPORTER
   SUPPORT PAGE JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* =================================================
       MOBILE HAMBURGER MENU
    ================================================= */

    const mobileMenuBtn =
        document.getElementById("mobileMenuBtn");

    const navbar =
        document.querySelector(".navbar");

    const navLinks =
        document.querySelector(".nav-links");

    const loginBtn =
        document.querySelector(".login-btn");


    if (mobileMenuBtn && navbar) {

        mobileMenuBtn.addEventListener("click", function (event) {

            event.stopPropagation();

            navbar.classList.toggle("mobile-menu-open");

            const isOpen =
                navbar.classList.contains("mobile-menu-open");

            mobileMenuBtn.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

        });

    }


    /* Close mobile menu when a link is clicked */

    if (navLinks) {

        navLinks.querySelectorAll("a").forEach(function (link) {

            link.addEventListener("click", function () {

                if (navbar) {
                    navbar.classList.remove("mobile-menu-open");
                }

                if (mobileMenuBtn) {
                    mobileMenuBtn.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }

            });

        });

    }


    /* Close when Login is clicked */

    if (loginBtn) {

        loginBtn.addEventListener("click", function () {

            if (navbar) {
                navbar.classList.remove("mobile-menu-open");
            }

        });

    }


    /* Close menu when clicking outside */

    document.addEventListener("click", function (event) {

        if (
            navbar &&
            !navbar.contains(event.target)
        ) {

            navbar.classList.remove("mobile-menu-open");

            if (mobileMenuBtn) {

                mobileMenuBtn.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }

    });


    /* =================================================
       FAQ ACCORDION
    ================================================= */

    const faqItems =
        document.querySelectorAll(".faq-item");


    faqItems.forEach(function (item) {

        const question =
            item.querySelector(".faq-question");

        const answer =
            item.querySelector(".faq-answer");


        if (!question || !answer) {
            return;
        }


        question.addEventListener("click", function () {

            const isActive =
                item.classList.contains("active");


            /* Close all FAQ items */

            faqItems.forEach(function (otherItem) {

                otherItem.classList.remove("active");

                const otherAnswer =
                    otherItem.querySelector(".faq-answer");

                if (otherAnswer) {
                    otherAnswer.style.maxHeight = null;
                }

            });


            /* Open selected FAQ */

            if (!isActive) {

                item.classList.add("active");

                answer.style.maxHeight =
                    answer.scrollHeight + "px";

            }

        });

    });


    /* =================================================
       SUPPORT FORM
    ================================================= */

    const supportForm =
        document.getElementById("supportForm");


    if (supportForm) {

        supportForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const name =
                    document.getElementById(
                        "supportName"
                    ).value.trim();


                const email =
                    document.getElementById(
                        "supportEmail"
                    ).value.trim();


                const message =
                    document.getElementById(
                        "supportMessage"
                    ).value.trim();


                if (!name || !email || !message) {

                    alert(
                        "Please fill all support details."
                    );

                    return;

                }


                const request = {

                    name: name,

                    email: email,

                    message: message,

                    createdAt:
                        new Date().toISOString()

                };


                localStorage.setItem(
                    "supportRequest",
                    JSON.stringify(request)
                );


                alert(
                    "Support request submitted successfully!"
                );


                supportForm.reset();

                closeSupportModal();

            }
        );

    }

});


/* =====================================================
   OPEN SUPPORT MODAL
===================================================== */

function openSupportModal() {

    const modal =
        document.getElementById("supportModal");


    if (!modal) {
        return;
    }


    modal.classList.add("show");

    document.body.style.overflow = "hidden";

}


/* =====================================================
   CLOSE SUPPORT MODAL
===================================================== */

function closeSupportModal() {

    const modal =
        document.getElementById("supportModal");


    if (!modal) {
        return;
    }


    modal.classList.remove("show");

    document.body.style.overflow = "";

}


/* =====================================================
   CLICK OUTSIDE MODAL
===================================================== */

document.addEventListener(
    "click",
    function (event) {

        const modal =
            document.getElementById("supportModal");


        if (
            modal &&
            event.target === modal
        ) {

            closeSupportModal();

        }

    }
);


/* =====================================================
   ESC KEY
===================================================== */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeSupportModal();

        }

    }
);