/* =========================================================
   AI CIVIC REPORTER
   OFFICER MANAGEMENT
   ========================================================= */

let officers = [];
let departments = [];
let complaints = [];

document.addEventListener("DOMContentLoaded", function () {

    loadDepartments();
    loadOfficers();
    loadComplaints();

    const search = document.getElementById("officerSearch");
    const departmentFilter = document.getElementById("departmentFilter");
    const statusFilter = document.getElementById("statusFilter");
    const officerForm = document.getElementById("officerForm");

    if (search) {
        search.addEventListener("input", applyFilters);
    }

    if (departmentFilter) {
        departmentFilter.addEventListener("change", applyFilters);
    }

    if (statusFilter) {
        statusFilter.addEventListener("change", applyFilters);
    }

    if (officerForm) {
        officerForm.addEventListener("submit", saveOfficer);
    }

});


/* =========================================================
   LOAD DEPARTMENTS
   ========================================================= */

async function loadDepartments() {

    try {

        const response = await fetch("/api/departments");

        if (!response.ok) {
            throw new Error("Unable to load departments");
        }

        departments = await response.json();

        populateDepartmentFilters();

    } catch (error) {

        console.error("Department loading error:", error);

    }

}


function populateDepartmentFilters() {

    const filter =
        document.getElementById("departmentFilter");

    const modalSelect =
        document.getElementById("officerDepartment");


    /* Filter */

    if (filter) {

        filter.innerHTML =
            '<option value="ALL">All Departments</option>';

        departments.forEach(function (department) {

            const option =
                document.createElement("option");

            option.value = department.name;
            option.textContent = department.name;

            filter.appendChild(option);

        });

    }


    /* Modal department */

    if (modalSelect) {

        modalSelect.innerHTML =
            '<option value="">Select Department</option>';

        departments.forEach(function (department) {

            const option =
                document.createElement("option");

            option.value = department.name;
            option.textContent = department.name;

            modalSelect.appendChild(option);

        });

    }

}


/* =========================================================
   LOAD OFFICERS
   ========================================================= */

async function loadOfficers() {

    const grid =
        document.getElementById("officerGrid");

    try {

        if (grid) {
            grid.innerHTML =
                '<div class="empty-state">Loading officers...</div>';
        }

        const response =
            await fetch("/api/officers");

        if (!response.ok) {
            throw new Error("Unable to load officers");
        }

        officers = await response.json();

        updateStatistics();

        renderOfficers(officers);

    } catch (error) {

        console.error("Officer loading error:", error);

        if (grid) {

            grid.innerHTML = `
                <div class="empty-state">
                    <h3>Unable to load officers</h3>
                    <p>Please make sure the Spring Boot server and MySQL are running.</p>
                </div>
            `;

        }

    }

}


/* =========================================================
   LOAD COMPLAINTS
   ========================================================= */

async function loadComplaints() {

    try {

        const response =
            await fetch("/api/complaints");

        if (!response.ok) {
            throw new Error("Unable to load complaints");
        }

        complaints = await response.json();

        updateStatistics();

        renderOfficers(
            getFilteredOfficers()
        );

    } catch (error) {

        console.error("Complaint loading error:", error);

        complaints = [];

    }

}


/* =========================================================
   STATISTICS
   ========================================================= */

function updateStatistics() {

    const total =
        officers.length;

    const active =
        officers.filter(function (officer) {

            return normalizeStatus(officer.status)
                === "active";

        }).length;

    const inactive =
        officers.filter(function (officer) {

            return normalizeStatus(officer.status)
                === "inactive";

        }).length;


    let assigned = 0;

    complaints.forEach(function (complaint) {

        if (
            complaint.assignedOfficer &&
            String(complaint.assignedOfficer).trim() !== ""
        ) {
            assigned++;
        }

    });


    setText("totalOfficers", total);
    setText("activeOfficers", active);
    setText("inactiveOfficers", inactive);
    setText("assignedComplaints", assigned);

}


function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }

}


/* =========================================================
   RENDER OFFICERS
   ========================================================= */

function renderOfficers(list) {

    const grid =
        document.getElementById("officerGrid");

    if (!grid) return;


    if (!list || list.length === 0) {

        grid.innerHTML = `
            <div class="empty-state">
                <h3>No officers found</h3>
                <p>Add a new civic officer to get started.</p>
            </div>
        `;

        return;

    }


    grid.innerHTML = list.map(function (officer) {

        const officerComplaints =
            getOfficerComplaints(officer.name);

        const assigned =
            officerComplaints.length;

        const pending =
            officerComplaints.filter(function (complaint) {

                return [
                    "pending",
                    "verified",
                    "assigned"
                ].includes(
                    normalizeComplaintStatus(
                        complaint.status
                    )
                );

            }).length;

        const resolved =
            officerComplaints.filter(function (complaint) {

                return [
                    "resolved",
                    "closed"
                ].includes(
                    normalizeComplaintStatus(
                        complaint.status
                    )
                );

            }).length;


        const workload =
            assigned > 0
                ? Math.min(100, assigned * 10)
                : 0;


        const status =
            normalizeStatus(officer.status);

        const statusClass =
            status === "active"
                ? "active"
                : "inactive";


        const initial =
            officer.name
                ? officer.name.charAt(0).toUpperCase()
                : "O";


        return `

            <div class="officer-card">

                <div class="officer-card-top">

                    <div class="officer-avatar">
                        ${escapeHtml(initial)}
                    </div>

                    <div class="officer-basic-info">

                        <h3>
                            ${escapeHtml(officer.name || "Officer")}
                        </h3>

                        <span class="employee-id">
                            ${escapeHtml(
                                officer.employeeId || "N/A"
                            )}
                        </span>

                        <span class="status-badge ${statusClass}">
                            ${capitalize(status)}
                        </span>

                    </div>

                </div>


                <div class="officer-details">

                    <div>
                        <span>Department</span>
                        <strong>
                            ${escapeHtml(
                                officer.department || "Not Assigned"
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Email</span>
                        <strong>
                            ${escapeHtml(
                                officer.email || "N/A"
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Phone</span>
                        <strong>
                            ${escapeHtml(
                                officer.phone || "N/A"
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Assigned</span>
                        <strong>${assigned}</strong>
                    </div>

                    <div>
                        <span>Pending</span>
                        <strong>${pending}</strong>
                    </div>

                    <div>
                        <span>Resolved</span>
                        <strong>${resolved}</strong>
                    </div>

                </div>


                <div class="workload-section">

                    <div class="workload-label">
                        <span>Workload</span>
                        <span>${workload}%</span>
                    </div>

                    <div class="workload-bar">

                        <div
                            class="workload-fill"
                            style="width:${workload}%">
                        </div>

                    </div>

                </div>


                <div class="officer-card-actions">

                    <button
                        type="button"
                        class="edit-btn"
                        onclick="editOfficer(${officer.id})">

                        Edit

                    </button>


                    <button
                        type="button"
                        class="complaints-btn"
                        onclick="viewOfficerComplaints('${escapeJs(
                            officer.name || ""
                        )}')">

                        Complaints

                    </button>


                    <button
                        type="button"
                        class="delete-btn"
                        onclick="deleteOfficer(${officer.id})">

                        Delete

                    </button>

                </div>

            </div>

        `;

    }).join("");

}


/* =========================================================
   FILTERS
   ========================================================= */

function applyFilters() {

    renderOfficers(
        getFilteredOfficers()
    );

}


function getFilteredOfficers() {

    const search =
        (
            document.getElementById("officerSearch")
                ?.value || ""
        ).toLowerCase().trim();


    const department =
        document.getElementById("departmentFilter")
            ?.value || "ALL";


    const status =
        document.getElementById("statusFilter")
            ?.value || "ALL";


    return officers.filter(function (officer) {

        const matchesSearch =
            !search ||
            String(officer.name || "")
                .toLowerCase()
                .includes(search) ||
            String(officer.employeeId || "")
                .toLowerCase()
                .includes(search) ||
            String(officer.email || "")
                .toLowerCase()
                .includes(search);


        const matchesDepartment =
            department === "ALL" ||
            String(officer.department || "")
                .toLowerCase()
                === department.toLowerCase();


        const matchesStatus =
            status === "ALL" ||
            normalizeStatus(officer.status)
                === status.toLowerCase();


        return (
            matchesSearch &&
            matchesDepartment &&
            matchesStatus
        );

    });

}


/* =========================================================
   ADD OFFICER MODAL
   ========================================================= */

function openOfficerModal() {

    const modal =
        document.getElementById("officerModal");

    const form =
        document.getElementById("officerForm");

    const title =
        document.getElementById("modalTitle");

    const message =
        document.getElementById("formMessage");


    if (!modal || !form) return;


    form.reset();


    document.getElementById("officerId").value = "";


    if (title) {
        title.textContent = "Add Officer";
    }


    if (message) {
        message.textContent = "";
        message.className = "message";
    }


    const status =
        document.getElementById("officerStatus");

    if (status) {
        status.value = "Active";
    }


    modal.classList.add("show");

    modal.style.display = "flex";

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    setTimeout(function () {

        document
            .getElementById("employeeId")
            ?.focus();

    }, 100);

}


function closeOfficerModal() {

    const modal =
        document.getElementById("officerModal");

    if (!modal) return;


    modal.classList.remove("show");

    modal.style.display = "none";

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =========================================================
   EDIT OFFICER
   ========================================================= */

function editOfficer(id) {

    const officer =
        officers.find(function (item) {

            return Number(item.id) === Number(id);

        });


    if (!officer) {

        alert("Officer details not found.");

        return;

    }


    document.getElementById("officerId").value =
        officer.id || "";

    document.getElementById("employeeId").value =
        officer.employeeId || "";

    document.getElementById("officerName").value =
        officer.name || "";

    document.getElementById("officerEmail").value =
        officer.email || "";

    document.getElementById("officerPhone").value =
        officer.phone || "";

    document.getElementById("officerDepartment").value =
        officer.department || "";

    document.getElementById("officerStatus").value =
        officer.status || "Active";


    document.getElementById("modalTitle").textContent =
        "Edit Officer";


    const modal =
        document.getElementById("officerModal");

    modal.classList.add("show");

    modal.style.display = "flex";

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

}


/* =========================================================
   SAVE OFFICER
   ========================================================= */

async function saveOfficer(event) {

    event.preventDefault();


    const id =
        document.getElementById("officerId").value.trim();


    const employeeId =
        document.getElementById("employeeId").value.trim();

    const name =
        document.getElementById("officerName").value.trim();

    const email =
        document.getElementById("officerEmail").value.trim();

    const phone =
        document.getElementById("officerPhone").value.trim();

    const department =
        document.getElementById("officerDepartment").value;

    const status =
        document.getElementById("officerStatus").value;


    if (!employeeId || !name || !email || !department) {

        showFormMessage(
            "Please fill all required fields.",
            "error"
        );

        return;

    }


    const officerData = {

        employeeId: employeeId,

        name: name,

        email: email,

        phone: phone,

        department: department,

        status: status

    };


    const saveButton =
        document.querySelector(
            "#officerForm .save-btn"
        );


    try {

        if (saveButton) {

            saveButton.disabled = true;

            saveButton.textContent =
                id
                    ? "Updating..."
                    : "Saving...";

        }


        const url =
            id
                ? `/api/officers/${id}`
                : "/api/officers";


        const method =
            id
                ? "PUT"
                : "POST";


        const response =
            await fetch(url, {

                method: method,

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        officerData
                    )

            });


        const text =
            await response.text();


        if (!response.ok) {

            let errorMessage =
                "Unable to save officer.";

            try {

                const errorData =
                    JSON.parse(text);

                errorMessage =
                    errorData.message ||
                    errorData.error ||
                    errorMessage;

            } catch (e) {

                if (text) {
                    errorMessage = text;
                }

            }

            throw new Error(
                errorMessage
            );

        }


        showFormMessage(
            id
                ? "Officer updated successfully!"
                : "Officer added successfully!",
            "success"
        );


        /* Reload DB data */

        await loadOfficers();


        /* Close after successful save */

        setTimeout(function () {

            closeOfficerModal();

        }, 700);


    } catch (error) {

        console.error(
            "Save officer error:",
            error
        );

        showFormMessage(
            error.message ||
            "Something went wrong.",
            "error"
        );

    } finally {

        if (saveButton) {

            saveButton.disabled = false;

            saveButton.textContent =
                "Save Officer";

        }

    }

}


/* =========================================================
   DELETE OFFICER
   ========================================================= */

async function deleteOfficer(id) {

    const officer =
        officers.find(function (item) {

            return Number(item.id) === Number(id);

        });


    if (!officer) return;


    const confirmed =
        confirm(
            `Delete officer "${officer.name}"?`
        );


    if (!confirmed) return;


    try {

        const response =
            await fetch(
                `/api/officers/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            const text =
                await response.text();

            throw new Error(
                text ||
                "Unable to delete officer."
            );

        }


        alert(
            "Officer deleted successfully."
        );


        await loadOfficers();

    } catch (error) {

        console.error(
            "Delete officer error:",
            error
        );

        alert(
            error.message ||
            "Unable to delete officer."
        );

    }

}


/* =========================================================
   VIEW OFFICER COMPLAINTS
   ========================================================= */

function viewOfficerComplaints(name) {

    sessionStorage.setItem(
        "selectedOfficer",
        name
    );

    window.location.href =
        "/all-complaints?officer=" +
        encodeURIComponent(name);

}


/* =========================================================
   GET OFFICER COMPLAINTS
   ========================================================= */

function getOfficerComplaints(name) {

    if (!name) return [];

    return complaints.filter(
        function (complaint) {

            return String(
                complaint.assignedOfficer || ""
            )
            .trim()
            .toLowerCase()
            === String(name)
                .trim()
                .toLowerCase();

        }
    );

}


/* =========================================================
   HELPERS
   ========================================================= */

function normalizeStatus(status) {

    return String(
        status || ""
    )
    .trim()
    .toLowerCase();

}


function normalizeComplaintStatus(status) {

    return String(
        status || ""
    )
    .trim()
    .toLowerCase()
    .replace(/_/g, " ");

}


function capitalize(value) {

    if (!value) return "";

    return value.charAt(0).toUpperCase() +
        value.slice(1);

}


function showFormMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "formMessage"
        );

    if (!element) return;


    element.textContent = message;

    element.className =
        "message " + type;

}


function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeJs(value) {

    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r");

}


/* =========================================================
   MODAL OUTSIDE CLICK
   ========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const modal =
            document.getElementById(
                "officerModal"
            );

        if (!modal) return;


        if (
            event.target === modal
        ) {

            closeOfficerModal();

        }

    }
);


/* =========================================================
   ESCAPE KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeOfficerModal();

        }

    }
);