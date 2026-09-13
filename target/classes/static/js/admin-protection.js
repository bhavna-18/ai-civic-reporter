(function () {
    const adminLoggedIn = sessionStorage.getItem("adminLoggedIn");

    if (adminLoggedIn !== "true") {
        window.location.href = "/admin-login";
    }
})();