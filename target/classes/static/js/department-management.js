let departments = [];
let officers = [];
let complaints = [];

document.addEventListener("DOMContentLoaded", () => {
    loadDepartments();
    loadOfficers();
    loadComplaints();

    setupSearchAndFilter();
    setupModalOutsideClick();
});


// =====================================================
// LOAD DEPARTMENTS
// =====================================================

async function loadDepartments() {

    try {

        const response = await fetch("/api/departments");

        if (!response.ok) {
            throw new Error("Failed to load departments");
        }

        departments = await response.json();

        renderDepartments();
        updateOverallStatistics();

    } catch (error) {

        console.error("Department loading error:", error);

        const grid = document.getElementById("departmentGrid");

        if (grid) {
            grid.innerHTML = `
                <div class="empty-state">
                    <h3>Unable to load departments</h3>
                    <p>Please refresh the page and try again.</p>
                </div>
            `;
        }
    }
}


// =====================================================
// LOAD OFFICERS
// =====================================================

async function loadOfficers() {

    try {

        const response = await fetch("/api/officers");

        if (!response.ok) {
            throw new Error("Failed to load officers");
        }

        officers = await response.json();

        renderDepartments();
        updateOverallStatistics();

    } catch (error) {

        console.error("Officer loading error:", error);

        officers = [];

    }
}


// =====================================================
// LOAD COMPLAINTS
// =====================================================

async function loadComplaints() {

    try {

        const response = await fetch("/api/complaints");

        if (!response.ok) {
            throw new Error("Failed to load complaints");
        }

        complaints = await response.json();

        renderDepartments();
        updateOverallStatistics();

    } catch (error) {

        console.error("Complaint loading error:", error);

        complaints = [];

    }
}


// =====================================================
// RENDER DEPARTMENTS
// =====================================================

function renderDepartments() {

    const grid = document.getElementById("departmentGrid");

    if (!grid) return;

    if (!departments.length) {

        grid.innerHTML = `
            <div class="empty-state">
                <h3>No Departments Found</h3>
                <p>Add a department to get started.</p>
            </div>
        `;

        return;
    }

    const searchInput =
        document.getElementById("departmentSearch");

    const filter =
        document.getElementById("departmentFilter");

    const searchTerm =
        searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";

    const filterValue =
        filter
            ? filter.value.toLowerCase()
            : "all";


    const filteredDepartments =
        departments.filter(department => {

            const name =
                (department.name || "").toLowerCase();

            const category =
                (department.category || "").toLowerCase();

            const status =
                (department.status || "").toLowerCase();


            const matchesSearch =
                name.includes(searchTerm) ||
                category.includes(searchTerm);

            const matchesFilter =
                filterValue === "all" ||
                status === filterValue;

            return matchesSearch && matchesFilter;
        });


    if (!filteredDepartments.length) {

        grid.innerHTML = `
            <div class="empty-state">
                <h3>No Matching Departments</h3>
                <p>Try changing your search or filter.</p>
            </div>
        `;

        return;
    }


    grid.innerHTML =
        filteredDepartments
            .map(createDepartmentCard)
            .join("");


    loadDepartmentStatistics();
}


// =====================================================
// CREATE DEPARTMENT CARD
// =====================================================

function createDepartmentCard(department) {

    const departmentId = department.id;

    const name =
        department.name || "Unnamed Department";

    const category =
        department.category || "General";

    const status =
        department.status || "Active";


    const departmentOfficers =
        officers.filter(officer =>
            (officer.department || "")
                .toLowerCase() ===
            name.toLowerCase()
        );


    const departmentComplaints =
        complaints.filter(complaint =>
            (complaint.assignedDepartment || "")
                .toLowerCase() ===
            name.toLowerCase()
        );


    const activeOfficers =
        departmentOfficers.filter(officer =>
            (officer.status || "")
                .toLowerCase() === "active"
        ).length;


    const pendingComplaints =
        departmentComplaints.filter(complaint =>
            normalizeStatus(complaint.status) === "Pending"
        ).length;


    const resolvedComplaints =
        departmentComplaints.filter(complaint =>
            normalizeStatus(complaint.status) === "Resolved"
        ).length;


    const totalComplaints =
        departmentComplaints.length;


    const workload =
        calculateWorkload(totalComplaints);


    const workloadPercent =
        workload === "High"
            ? 100
            : workload === "Medium"
                ? 60
                : 30;


    return `
        <div class="department-card">

            <div class="department-card-header">

                <div class="department-icon">
                    ${getDepartmentIcon(name)}
                </div>

                <div class="department-status ${status.toLowerCase()}">
                    ${escapeHtml(status)}
                </div>

            </div>


            <div class="department-card-body">

                <h3>
                    ${escapeHtml(name)}
                </h3>

                <p class="department-category">
                    ${escapeHtml(category)}
                </p>


                <div class="department-stats">

                    <div class="stat-item">

                        <span class="stat-label">
                            Active Officers
                        </span>

                        <strong id="officers-${departmentId}">
                            ${activeOfficers}
                        </strong>

                    </div>


                    <div class="stat-item">

                        <span class="stat-label">
                            Pending
                        </span>

                        <strong id="pending-${departmentId}">
                            ${pendingComplaints}
                        </strong>

                    </div>


                    <div class="stat-item">

                        <span class="stat-label">
                            Resolved
                        </span>

                        <strong id="resolved-${departmentId}">
                            ${resolvedComplaints}
                        </strong>

                    </div>

                </div>


                <div class="workload-section">

                    <div class="workload-header">

                        <span>
                            Workload
                        </span>

                        <strong>
                            ${workload}
                        </strong>

                    </div>


                    <div class="workload-bar">

                        <div
                            id="workload-bar-${departmentId}"
                            class="workload-progress ${workload.toLowerCase()}"
                            style="width:${workloadPercent}%">
                        </div>

                    </div>

                </div>


                <div class="department-actions">

                    <button
                        class="btn btn-secondary"
                        onclick="editDepartment(${departmentId})">

                        Edit

                    </button>


                    <button
                        class="btn btn-primary"
                        onclick="viewOfficers('${escapeAttribute(name)}')">

                        View Officers

                    </button>

                </div>

            </div>

        </div>
    `;
}


// =====================================================
// DEPARTMENT STATISTICS FROM BACKEND
// =====================================================

async function loadDepartmentStatistics() {

    for (const department of departments) {

        try {

            const response =
                await fetch(
                    `/api/departments/stats/${encodeURIComponent(department.name)}`
                );


            if (!response.ok) {
                continue;
            }


            const stats =
                await response.json();


            updateDepartmentStatistics(
                department.id,
                stats
            );


        } catch (error) {

            console.error(
                "Statistics error:",
                department.name,
                error
            );

        }
    }
}


// =====================================================
// UPDATE DEPARTMENT STATISTICS
// =====================================================

function updateDepartmentStatistics(
    departmentId,
    stats
) {

    const officersElement =
        document.getElementById(
            `officers-${departmentId}`
        );

    const pendingElement =
        document.getElementById(
            `pending-${departmentId}`
        );

    const resolvedElement =
        document.getElementById(
            `resolved-${departmentId}`
        );

    const workloadBar =
        document.getElementById(
            `workload-bar-${departmentId}`
        );


    if (officersElement) {

        officersElement.textContent =
            stats.activeOfficers ?? 0;
    }


    if (pendingElement) {

        pendingElement.textContent =
            stats.pendingComplaints ?? 0;
    }


    if (resolvedElement) {

        resolvedElement.textContent =
            stats.resolvedComplaints ?? 0;
    }


    if (workloadBar) {

        const workload =
            stats.workload || "Low";


        const percentage =
            workload === "High"
                ? 100
                : workload === "Medium"
                    ? 60
                    : 30;


        workloadBar.style.width =
            percentage + "%";


        workloadBar.className =
            `workload-progress ${workload.toLowerCase()}`;
    }
}


// =====================================================
// OVERALL STATISTICS
// =====================================================

function updateOverallStatistics() {

    const departmentCount =
        document.getElementById("departmentCount");


    if (departmentCount) {

        departmentCount.textContent =
            departments.length;
    }


    const activeOfficerCount =
        officers.filter(officer =>
            (officer.status || "")
                .toLowerCase() === "active"
        ).length;


    const pendingCount =
        complaints.filter(complaint =>
            normalizeStatus(complaint.status) === "Pending"
        ).length;


    const highWorkloadDepartments =
        departments.filter(department => {

            const total =
                complaints.filter(complaint =>
                    (complaint.assignedDepartment || "")
                        .toLowerCase() ===
                    (department.name || "")
                        .toLowerCase()
                ).length;

            return total > 15;

        }).length;


    const statElements =
        document.querySelectorAll(
            ".stat-card"
        );


    /*
     * Update cards based on their position.
     * Existing HTML design is preserved.
     */

    if (statElements.length >= 4) {

        const values = [
            departments.length,
            activeOfficerCount,
            pendingCount,
            highWorkloadDepartments
        ];


        statElements.forEach(
            (card, index) => {

                const valueElement =
                    card.querySelector(
                        ".stat-value"
                    );


                if (valueElement &&
                    values[index] !== undefined) {

                    valueElement.textContent =
                        values[index];
                }
            }
        );
    }
}


// =====================================================
// ADD DEPARTMENT
// =====================================================

async function saveDepartment(event) {

    event.preventDefault();


    const name =
        document.getElementById(
            "newDepartmentName"
        ).value.trim();


    const category =
        document.getElementById(
            "newDepartmentCategory"
        ).value.trim();


    if (!name) {

        alert("Please enter department name.");

        return;
    }


    try {

        const response =
            await fetch("/api/departments", {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    name: name,
                    category: category,
                    status: "Active"

                })
            });


        if (!response.ok) {

            const message =
                await response.text();

            alert(message || "Failed to add department.");

            return;
        }


        alert(
            "Department added successfully!"
        );


        closeDepartmentModal();


        document
            .getElementById("departmentForm")
            .reset();


        await loadDepartments();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to add department."
        );
    }
}


// =====================================================
// EDIT DEPARTMENT
// =====================================================

async function editDepartment(id) {

    const department =
        departments.find(
            d => d.id === id
        );


    if (!department) {

        alert("Department not found.");

        return;
    }


    const newName =
        prompt(
            "Enter department name:",
            department.name
        );


    if (newName === null ||
        !newName.trim()) {

        return;
    }


    const newCategory =
        prompt(
            "Enter department category:",
            department.category || ""
        );


    try {

        const response =
            await fetch(
                `/api/departments/${id}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        name: newName.trim(),

                        category:
                            newCategory
                                ? newCategory.trim()
                                : department.category,

                        status:
                            department.status || "Active"

                    })
                }
            );


        if (!response.ok) {

            const message =
                await response.text();

            alert(
                message ||
                "Failed to update department."
            );

            return;
        }


        alert(
            "Department updated successfully!"
        );


        await loadDepartments();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to update department."
        );
    }
}


// =====================================================
// VIEW OFFICERS
// =====================================================

function viewOfficers(departmentName) {

    sessionStorage.setItem(
        "selectedDepartment",
        departmentName
    );


    window.location.href =
        "/officer-management";
}


// =====================================================
// SEARCH + FILTER
// =====================================================

function setupSearchAndFilter() {

    const search =
        document.getElementById(
            "departmentSearch"
        );


    const filter =
        document.getElementById(
            "departmentFilter"
        );


    if (search) {

        search.addEventListener(
            "input",
            renderDepartments
        );
    }


    if (filter) {

        filter.addEventListener(
            "change",
            renderDepartments
        );
    }
}


// =====================================================
// MODAL
// =====================================================

function openDepartmentModal() {

    const modal =
        document.getElementById(
            "departmentModal"
        );


    if (modal) {

        modal.style.display = "flex";
    }
}


function closeDepartmentModal() {

    const modal =
        document.getElementById(
            "departmentModal"
        );


    if (modal) {

        modal.style.display = "none";
    }
}


function setupModalOutsideClick() {

    const modal =
        document.getElementById(
            "departmentModal"
        );


    if (!modal) return;


    modal.addEventListener(
        "click",
        function(event) {

            if (event.target === modal) {

                closeDepartmentModal();
            }
        }
    );


    document.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Escape") {

                closeDepartmentModal();
            }
        }
    );
}


// =====================================================
// REFRESH
// =====================================================

function refreshDepartments() {

    loadDepartments();
    loadOfficers();
    loadComplaints();
}


// =====================================================
// HELPERS
// =====================================================

function normalizeStatus(status) {

    if (!status) return "Pending";


    const value =
        status.toLowerCase().trim();


    if (value === "in progress" ||
        value === "progress") {

        return "In Progress";
    }


    if (value === "pending") {

        return "Pending";
    }


    if (value === "resolved") {

        return "Resolved";
    }


    if (value === "assigned") {

        return "Assigned";
    }


    if (value === "verified") {

        return "Verified";
    }


    if (value === "closed") {

        return "Closed";
    }


    return status;
}


function calculateWorkload(total) {

    if (total === 0) {

        return "Low";
    }


    if (total <= 5) {

        return "Low";
    }


    if (total <= 15) {

        return "Medium";
    }


    return "High";
}


function getDepartmentIcon(name) {

    const value =
        name.toLowerCase();


    if (value.includes("road")) {

        return "🛣️";
    }


    if (value.includes("sanitation") ||
        value.includes("garbage")) {

        return "🗑️";
    }


    if (value.includes("water")) {

        return "💧";
    }


    if (value.includes("electrical") ||
        value.includes("light")) {

        return "💡";
    }


    if (value.includes("drain")) {

        return "🌊";
    }


    return "🏢";
}


function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {

    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}