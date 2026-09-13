let currentComplaint = null;
let departments = [];
let officers = [];
let complaints = [];


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    loadDepartments();
    loadComplaint();
    loadRecentAssignments();

    const departmentSelect =
        document.getElementById("department");

    if (departmentSelect) {
        departmentSelect.addEventListener(
            "change",
            loadOfficersForDepartment
        );
    }

    const assignmentForm =
        document.getElementById("assignmentForm");

    if (assignmentForm) {
        assignmentForm.addEventListener(
            "submit",
            handleAssignment
        );
    }
});


// ==========================================
// LOAD DEPARTMENTS FROM DATABASE
// ==========================================

async function loadDepartments() {

    try {

        const response =
            await fetch("/api/departments");

        if (!response.ok) {
            throw new Error("Failed to load departments");
        }

        departments =
            await response.json();

        const departmentSelect =
            document.getElementById("department");

        if (!departmentSelect) return;

        departmentSelect.innerHTML =
            `<option value="">
                Select Department
            </option>`;


        departments
            .filter(department =>
                String(department.status || "Active")
                    .toLowerCase() !== "inactive"
            )
            .forEach(department => {

                const option =
                    document.createElement("option");

                option.value =
                    department.name;

                option.textContent =
                    department.name;

                departmentSelect.appendChild(
                    option
                );
            });


    } catch (error) {

        console.error(
            "Department loading error:",
            error
        );

        const select =
            document.getElementById("department");

        if (select) {

            select.innerHTML =
                `<option value="">
                    Failed to load departments
                </option>`;
        }
    }
}


// ==========================================
// LOAD OFFICERS BASED ON DEPARTMENT
// ==========================================

async function loadOfficersForDepartment() {

    const departmentSelect =
        document.getElementById("department");

    const officerSelect =
        document.getElementById("officer");


    if (!departmentSelect ||
        !officerSelect) {
        return;
    }


    const department =
        departmentSelect.value;


    officerSelect.innerHTML =
        `<option value="">
            Loading officers...
        </option>`;


    if (!department) {

        officerSelect.innerHTML =
            `<option value="">
                Select Officer
            </option>`;

        return;
    }


    try {

        const response =
            await fetch(
                `/api/officers/department/${encodeURIComponent(department)}`
            );


        if (!response.ok) {
            throw new Error(
                "Failed to load officers"
            );
        }


        officers =
            await response.json();


        // Only active officers
        const activeOfficers =
            officers.filter(officer =>
                String(officer.status || "")
                    .toLowerCase() === "active"
            );


        officerSelect.innerHTML =
            `<option value="">
                Select Officer
            </option>`;


        if (activeOfficers.length === 0) {

            officerSelect.innerHTML =
                `<option value="">
                    No active officers available
                </option>`;

            return;
        }


        activeOfficers.forEach(officer => {

            const option =
                document.createElement("option");

            option.value =
                officer.name;

            option.textContent =
                `${officer.name} (${officer.employeeId})`;

            officerSelect.appendChild(
                option
            );
        });


    } catch (error) {

        console.error(
            "Officer loading error:",
            error
        );

        officerSelect.innerHTML =
            `<option value="">
                Failed to load officers
            </option>`;
    }
}


// ==========================================
// LOAD SELECTED COMPLAINT
// ==========================================

async function loadComplaint() {

    const complaintId =
        sessionStorage.getItem(
            "selectedComplaintId"
        ) ||
        sessionStorage.getItem(
            "complaintId"
        );


    if (!complaintId) {

        document.getElementById(
            "loadingMessage"
        ).textContent =
            "No complaint selected.";

        return;
    }


    try {

        const response =
            await fetch(
                `/api/complaints/${encodeURIComponent(complaintId)}`
            );


        if (!response.ok) {
            throw new Error(
                "Complaint not found"
            );
        }


        currentComplaint =
            await response.json();


        displayComplaint(
            currentComplaint
        );


        document.getElementById(
            "loadingMessage"
        ).style.display =
            "none";


    } catch (error) {

        console.error(
            "Complaint loading error:",
            error
        );

        document.getElementById(
            "loadingMessage"
        ).textContent =
            "Unable to load complaint.";
    }
}


// ==========================================
// DISPLAY COMPLAINT DETAILS
// ==========================================

function displayComplaint(complaint) {

    const complaintId =
        document.getElementById(
            "complaintId"
        );

    const complaintStatus =
        document.getElementById(
            "complaintStatus"
        );

    const complaintCategory =
        document.getElementById(
            "complaintCategory"
        );

    const complaintLocation =
        document.getElementById(
            "complaintLocation"
        );

    const complaintPriority =
        document.getElementById(
            "complaintPriority"
        );

    const complaintConfidence =
        document.getElementById(
            "complaintConfidence"
        );

    const complaintDescription =
        document.getElementById(
            "complaintDescription"
        );

    const descriptionCard =
        document.getElementById(
            "complaintDescriptionCard"
        );


    if (complaintId) {

        complaintId.textContent =
            complaint.complaintId || "-";
    }


    if (complaintStatus) {

        complaintStatus.textContent =
            complaint.status || "Pending";
    }


    if (complaintCategory) {

        complaintCategory.textContent =
            complaint.category || "-";
    }


    if (complaintLocation) {

        complaintLocation.textContent =
            complaint.location || "-";
    }


    if (complaintPriority) {

        complaintPriority.textContent =
            complaint.priority ||
            complaint.assignedPriority ||
            "HIGH";
    }


    if (complaintConfidence) {

        if (complaint.aiConfidence !== null &&
            complaint.aiConfidence !== undefined) {

            complaintConfidence.textContent =
                complaint.aiConfidence + "%";

        } else {

            complaintConfidence.textContent =
                "94%";
        }
    }


    if (complaintDescription &&
        descriptionCard) {

        if (complaint.description &&
            complaint.description.trim() !== "") {

            complaintDescription.textContent =
                complaint.description;

            descriptionCard.style.display =
                "block";

        } else {

            descriptionCard.style.display =
                "none";
        }
    }


    // If already assigned
    if (complaint.assignedDepartment) {

        const departmentSelect =
            document.getElementById(
                "department"
            );


        if (departmentSelect) {

            departmentSelect.value =
                complaint.assignedDepartment;


            loadOfficersForDepartment()
                .then(() => {

                    const officerSelect =
                        document.getElementById(
                            "officer"
                        );


                    if (
                        officerSelect &&
                        complaint.assignedOfficer
                    ) {

                        officerSelect.value =
                            complaint.assignedOfficer;
                    }

                });
        }
    }
}


// ==========================================
// HANDLE FORM SUBMIT
// ==========================================

async function handleAssignment(event) {

    event.preventDefault();


    if (!currentComplaint) {

        alert(
            "Complaint information is not available."
        );

        return;
    }


    const department =
        document.getElementById(
            "department"
        ).value;


    const officer =
        document.getElementById(
            "officer"
        ).value;


    const deadline =
        document.getElementById(
            "deadline"
        ).value;


    const priority =
        document.getElementById(
            "assignPriority"
        ).value;


    const instructions =
        document.getElementById(
            "instructions"
        ).value.trim();


    if (!department) {

        alert(
            "Please select a department."
        );

        return;
    }


    if (!officer) {

        alert(
            "Please select a responsible officer."
        );

        return;
    }


    if (!deadline) {

        alert(
            "Please select expected resolution date."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `/api/complaints/${encodeURIComponent(
                    currentComplaint.complaintId
                )}/assign`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        assignedDepartment:
                            department,

                        assignedOfficer:
                            officer,

                        deadline:
                            deadline,

                        assignedPriority:
                            priority

                    })
                }
            );


        const result =
            await response.json()
                .catch(() => null);


        if (!response.ok) {

            throw new Error(
                result ||
                "Complaint assignment failed"
            );
        }


        // Store assignment information
        sessionStorage.setItem(
            "assignedComplaintId",
            currentComplaint.complaintId
        );


        sessionStorage.setItem(
            "assignedOfficer",
            officer
        );


        sessionStorage.setItem(
            "assignedDepartment",
            department
        );


        showAssignmentSuccess(
            department,
            officer,
            deadline,
            priority
        );


        loadRecentAssignments();


    } catch (error) {

        console.error(
            "Assignment error:",
            error
        );

        alert(
            "Failed to assign complaint: " +
            error.message
        );
    }
}


// ==========================================
// SUCCESS MESSAGE
// ==========================================

function showAssignmentSuccess(
    department,
    officer,
    deadline,
    priority
) {

    const preview =
        document.getElementById(
            "assignmentPreview"
        );

    const message =
        document.getElementById(
            "assignmentMessage"
        );


    if (preview) {

        preview.style.display =
            "flex";
    }


    if (message) {

        message.innerHTML = `
            Complaint
            <strong>
                ${escapeHtml(
                    currentComplaint.complaintId
                )}
            </strong>
            has been assigned to
            <strong>
                ${escapeHtml(officer)}
            </strong>
            from
            <strong>
                ${escapeHtml(department)}
            </strong>.
            <br>
            Priority:
            <strong>
                ${escapeHtml(priority)}
            </strong>
            |
            Deadline:
            <strong>
                ${escapeHtml(deadline)}
            </strong>
        `;
    }


    // Disable submit after successful assignment
    const submitButton =
        document.querySelector(
            ".assign-submit"
        );

    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.textContent =
            "✓ Assigned Successfully";
    }
}


// ==========================================
// RECENT ASSIGNMENTS
// ==========================================

async function loadRecentAssignments() {

    const container =
        document.getElementById(
            "recentAssignments"
        );


    if (!container) return;


    try {

        const response =
            await fetch("/api/complaints");


        if (!response.ok) {
            throw new Error(
                "Failed to load complaints"
            );
        }


        complaints =
            await response.json();


        const assignedComplaints =
            complaints
                .filter(complaint =>
                    complaint.assignedOfficer &&
                    complaint.assignedOfficer.trim() !== ""
                )
                .sort(
                    (a, b) =>
                        new Date(
                            b.createdAt || 0
                        ) -
                        new Date(
                            a.createdAt || 0
                        )
                )
                .slice(0, 5);


        if (assignedComplaints.length === 0) {

            container.innerHTML = `
                <p style="
                    text-align:center;
                    padding:20px;
                    color:#777;
                ">
                    No assignments found yet.
                </p>
            `;

            return;
        }


        container.innerHTML = "";


        assignedComplaints.forEach(
            complaint => {

                const item =
                    document.createElement("div");


                item.style.cssText = `
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    gap:15px;
                    padding:15px;
                    margin-bottom:10px;
                    background:#f8fafc;
                    border-radius:10px;
                    border:1px solid #e5e7eb;
                `;


                item.innerHTML = `

                    <div>

                        <strong>
                            ${escapeHtml(
                                complaint.complaintId
                            )}
                        </strong>

                        <div style="
                            margin-top:5px;
                            color:#64748b;
                            font-size:13px;
                        ">

                            ${escapeHtml(
                                complaint.category || "-"
                            )}

                            •

                            ${escapeHtml(
                                complaint.assignedDepartment || "-"
                            )}

                        </div>

                    </div>


                    <div style="
                        text-align:right;
                    ">

                        <strong>
                            ${escapeHtml(
                                complaint.assignedOfficer
                            )}
                        </strong>

                        <div style="
                            margin-top:5px;
                            color:#64748b;
                            font-size:12px;
                        ">

                            ${escapeHtml(
                                complaint.status || "-"
                            )}

                        </div>

                    </div>
                `;


                container.appendChild(item);
            }
        );


    } catch (error) {

        console.error(
            "Recent assignments error:",
            error
        );

        container.innerHTML = `
            <p style="
                text-align:center;
                padding:20px;
                color:#dc2626;
            ">
                Unable to load recent assignments.
            </p>
        `;
    }
}


// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}