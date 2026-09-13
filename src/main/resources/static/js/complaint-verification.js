// =====================================================
// AI CIVIC REPORTER
// COMPLAINT VERIFICATION
// DATABASE INTEGRATION
// =====================================================

let complaints = [];
let selectedComplaint = null;


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    loadComplaints();

    const search =
        document.getElementById("verificationSearch");

    const status =
        document.getElementById("verificationStatus");

    if (search) {
        search.addEventListener("input", applyFilters);
    }

    if (status) {
        status.addEventListener("change", applyFilters);
    }

});


// =====================================================
// LOAD COMPLAINTS FROM DATABASE
// =====================================================

async function loadComplaints() {

    try {

        const response =
            await fetch("/api/complaints");

        if (!response.ok) {
            throw new Error("Could not load complaints");
        }

        complaints = await response.json();

        updateStatistics();

        applyFilters();

        /*
         * First preference:
         * Previously selected complaint
         */
        const savedId =
            sessionStorage.getItem("complaintId");

        let firstComplaint = null;

        if (savedId) {

            firstComplaint =
                complaints.find(
                    c => c.complaintId === savedId
                );
        }

        /*
         * Otherwise select latest complaint
         */
        if (!firstComplaint && complaints.length > 0) {

            firstComplaint =
                complaints[complaints.length - 1];
        }

        if (firstComplaint) {

            selectComplaint(
                firstComplaint.complaintId
            );

        } else {

            clearReviewCard();

        }

    } catch (error) {

        console.error(
            "Complaint loading error:",
            error
        );

        const queue =
            document.querySelector(".queue-list");

        if (queue) {

            queue.innerHTML = `
                <div class="verification-error">
                    ❌ Could not load complaints from database.
                    <br>
                    Please make sure Spring Boot and MySQL are running.
                </div>
            `;

        }

    }

}


// =====================================================
// UPDATE STATISTICS
// =====================================================

function updateStatistics() {

    const aiAnalyzed =
        complaints.length;


    const genuine =
        complaints.filter(c => {

            const status =
                normalizeStatus(c.status);

            const duplicate =
                normalizeDuplicate(c.duplicateCheck);

            return (
                status === "verified" ||
                duplicate === "no duplicate"
            );

        }).length;


    const duplicates =
        complaints.filter(c => {

            const status =
                normalizeStatus(c.status);

            const duplicate =
                normalizeDuplicate(c.duplicateCheck);

            return (
                status === "duplicate" ||
                duplicate === "duplicate"
            );

        }).length;


    const needReview =
        complaints.filter(c => {

            const status =
                normalizeStatus(c.status);

            return (
                status === "pending" ||
                status === "needs review"
            );

        }).length;


    setText(
        "aiAnalyzedCount",
        aiAnalyzed
    );

    setText(
        "genuineCount",
        genuine
    );

    setText(
        "duplicateCount",
        duplicates
    );

    setText(
        "reviewCount",
        needReview
    );

}


// =====================================================
// DISPLAY VERIFICATION QUEUE
// =====================================================

function displayQueue(data) {

    const queue =
        document.querySelector(".queue-list");

    const queueCount =
        document.getElementById("queueCount");


    if (!queue) return;


    const pending =
        complaints.filter(c =>
            normalizeStatus(c.status) === "pending"
        );


    if (queueCount) {

        queueCount.textContent =
            pending.length +
            " Pending Review";

    }


    if (data.length === 0) {

        queue.innerHTML = `
            <div class="verification-empty">

                <div style="font-size:40px;">
                    📭
                </div>

                <strong>
                    No complaints found
                </strong>

                <p>
                    No complaints match the selected filter.
                </p>

            </div>
        `;

        return;

    }


    queue.innerHTML =
        data.map(complaint => {

            const category =
                complaint.category || "Other";


            const location =
                complaint.location ||
                "Location not available";


            const confidence =
                complaint.aiConfidence != null
                    ? Number(complaint.aiConfidence)
                    : 0;


            const verificationType =
                getVerificationType(complaint);


            const icon =
                getCategoryIcon(category);


            return `

                <div
                    class="queue-item"
                    data-status="${verificationType}"
                >

                    <div class="queue-icon">
                        ${icon}
                    </div>


                    <div class="queue-info">

                        <strong>
                            ${escapeHtml(
                                complaint.complaintId || "N/A"
                            )}
                        </strong>

                        <span>
                            ${escapeHtml(category)}
                            •
                            ${escapeHtml(
                                shortenLocation(location)
                            )}
                        </span>

                    </div>


                    <span
                        class="queue-ai ${verificationType}"
                    >

                        ${Math.round(confidence)}%
                        ${getVerificationLabel(
                            verificationType
                        )}

                    </span>


                    <button
                        type="button"
                        onclick="selectComplaint('${escapeAttribute(
                            complaint.complaintId
                        )}')"
                    >
                        Review
                    </button>

                </div>

            `;

        }).join("");

}


// =====================================================
// SELECT COMPLAINT
// =====================================================

function selectComplaint(complaintId) {

    selectedComplaint =
        complaints.find(
            c => c.complaintId === complaintId
        );


    if (!selectedComplaint) {

        console.error(
            "Complaint not found:",
            complaintId
        );

        return;

    }


    sessionStorage.setItem(
        "complaintId",
        selectedComplaint.complaintId
    );


    sessionStorage.setItem(
        "selectedComplaintId",
        selectedComplaint.complaintId
    );


    sessionStorage.setItem(
        "selectedComplaint",
        JSON.stringify(selectedComplaint)
    );


    updateReviewCard(
        selectedComplaint
    );

}


// =====================================================
// UPDATE REVIEW CARD
// =====================================================

function updateReviewCard(complaint) {

    if (!complaint) return;


    // -------------------------------------------------
    // COMPLAINT ID
    // -------------------------------------------------

    setText(
        "verificationComplaintId",
        complaint.complaintId || "N/A"
    );


    // -------------------------------------------------
    // EVIDENCE
    // -------------------------------------------------

    const evidenceContainer =
        document.getElementById(
            "evidenceContainer"
        );


    const evidenceFileName =
        document.getElementById(
            "evidenceFileName"
        );


    const evidenceLocation =
        document.getElementById(
            "evidenceLocation"
        );


    if (evidenceFileName) {

        evidenceFileName.textContent =
            complaint.evidenceFileName ||
            "No evidence file";

    }


    if (evidenceLocation) {

        evidenceLocation.textContent =
            complaint.location ||
            "Location not available";

    }


    if (evidenceContainer) {

        renderEvidence(
            complaint,
            evidenceContainer
        );

    }


    // -------------------------------------------------
    // AI CONFIDENCE
    // -------------------------------------------------

    const confidence =
        complaint.aiConfidence != null
            ? Number(complaint.aiConfidence)
            : 0;


    setText(
        "aiConfidence",
        Math.round(confidence) + "%"
    );


    // -------------------------------------------------
    // AI SUMMARY
    // -------------------------------------------------

    setText(
        "aiSummary",
        complaint.aiSummary ||
        "AI analysis information is not available."
    );


    // -------------------------------------------------
    // CATEGORY
    // -------------------------------------------------

    const category =
        complaint.category ||
        "Other";


    setText(
        "verificationCategory",
        getCategoryIcon(category) +
        " " +
        category
    );


    setText(
        "detectedCategory",
        getCategoryIcon(category) +
        " " +
        category
    );


    setText(
        "detectedIssue",
        "🔎 " +
        getCategoryLabel(category)
    );


    // -------------------------------------------------
    // PRIORITY
    // -------------------------------------------------

    const priority =
        complaint.assignedPriority ||
        complaint.priority ||
        "MEDIUM";


    setText(
        "verificationPriority",
        "🔥 " +
        priority
    );


    // -------------------------------------------------
    // DUPLICATE CHECK
    // -------------------------------------------------

    const duplicateValue =
        complaint.duplicateCheck ||
        "Not Checked";


    const duplicateElement =
        document.getElementById(
            "verificationDuplicate"
        );


    if (duplicateElement) {

        const duplicate =
            normalizeDuplicate(
                duplicateValue
            );


        if (duplicate === "duplicate") {

            duplicateElement.textContent =
                "⚠ Duplicate Found";

        } else if (
            duplicate === "no duplicate"
        ) {

            duplicateElement.textContent =
                "✓ No Duplicate";

        } else {

            duplicateElement.textContent =
                "⏳ Not Checked";

        }

    }


    // -------------------------------------------------
    // STATUS
    // -------------------------------------------------

    setText(
        "verificationStatusValue",
        complaint.status ||
        "Pending"
    );


    // -------------------------------------------------
    // DESCRIPTION
    // -------------------------------------------------

    setText(
        "citizenDescription",
        complaint.description ||
        "No description available."
    );


    // -------------------------------------------------
    // BADGE
    // -------------------------------------------------

    updateVerificationBadge(
        complaint
    );


    // -------------------------------------------------
    // ACTION BUTTONS
    // -------------------------------------------------

    updateActionButtons(
        complaint
    );

}


// =====================================================
// RENDER EVIDENCE
// =====================================================

function renderEvidence(
    complaint,
    container
) {

    const fileUrl =
        complaint.evidenceFileUrl;


    if (!fileUrl) {

        container.innerHTML = `

            <div class="evidence-placeholder">

                📷

                <span>
                    No evidence uploaded
                </span>

            </div>

        `;

        return;

    }


    const fileName =
        complaint.evidenceFileName ||
        "";


    const lowerName =
        fileName.toLowerCase();


    const isVideo =
        lowerName.endsWith(".mp4") ||
        lowerName.endsWith(".webm") ||
        lowerName.endsWith(".mov");


    if (isVideo) {

        container.innerHTML = `

            <video
                controls
                preload="metadata"
            >

                <source
                    src="${escapeAttribute(fileUrl)}"
                >

                Your browser does not support video playback.

            </video>

        `;

    } else {

        container.innerHTML = `

            <img
                src="${escapeAttribute(fileUrl)}"
                alt="Complaint Evidence"
                onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;evidence-placeholder&quot;>📷<span>Evidence could not be displayed</span></div>';"
            >

        `;

    }

}


// =====================================================
// VERIFICATION BADGE
// =====================================================

function updateVerificationBadge(
    complaint
) {

    const badge =
        document.getElementById(
            "verificationBadge"
        );


    if (!badge) return;


    const status =
        normalizeStatus(
            complaint.status
        );


    if (status === "verified") {

        badge.textContent =
            "✓ Verified";

    } else if (
        status === "duplicate"
    ) {

        badge.textContent =
            "🔁 Duplicate";

    } else if (
        status === "rejected"
    ) {

        badge.textContent =
            "✕ Rejected";

    } else {

        badge.textContent =
            "⏳ Pending Review";

    }

}


// =====================================================
// ACTION BUTTON STATE
// =====================================================

function updateActionButtons(
    complaint
) {

    const approve =
        document.getElementById(
            "approveButton"
        );

    const duplicate =
        document.getElementById(
            "duplicateButton"
        );

    const reject =
        document.getElementById(
            "rejectButton"
        );


    const status =
        normalizeStatus(
            complaint.status
        );


    const alreadyProcessed =
        status === "verified" ||
        status === "duplicate" ||
        status === "rejected";


    [
        approve,
        duplicate,
        reject
    ].forEach(button => {

        if (!button) return;

        if (alreadyProcessed) {

            button.classList.add(
                "action-disabled"
            );

        } else {

            button.classList.remove(
                "action-disabled"
            );

        }

    });

}


// =====================================================
// APPROVE COMPLAINT
// =====================================================

async function approveComplaint() {

    if (!selectedComplaint) {

        alert(
            "Please select a complaint first."
        );

        return;

    }


    const complaintId =
        selectedComplaint.complaintId;


    const confirmApprove =
        confirm(
            "Approve complaint " +
            complaintId +
            "?"
        );


    if (!confirmApprove) return;


    try {

        const response =
            await fetch(
                "/api/complaints/" +
                encodeURIComponent(
                    complaintId
                ) +
                "/verify",
                {
                    method: "PUT"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Verification failed"
            );

        }


        const updated =
            await response.json();


        updateLocalComplaint(
            updated
        );


        updateStatistics();

        applyFilters();

        updateReviewCard(
            updated
        );


        sessionStorage.setItem(
            "approvedComplaint",
            complaintId
        );


        alert(
            "✅ Complaint Approved!\n\n" +
            complaintId +
            " has been verified successfully."
        );


        /*
         * Continue to assignment page
         */

        window.location.href =
            "/assign-complaint";


    } catch (error) {

        console.error(
            "Approve error:",
            error
        );

        alert(
            "❌ Could not approve complaint."
        );

    }

}


// =====================================================
// MARK DUPLICATE
// =====================================================

async function markDuplicate() {

    if (!selectedComplaint) {

        alert(
            "Please select a complaint first."
        );

        return;

    }


    const complaintId =
        selectedComplaint.complaintId;


    const confirmDuplicate =
        confirm(
            "Mark " +
            complaintId +
            " as duplicate?"
        );


    if (!confirmDuplicate) return;


    try {

        const response =
            await fetch(
                "/api/complaints/" +
                encodeURIComponent(
                    complaintId
                ) +
                "/duplicate",
                {
                    method: "PUT"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Duplicate update failed"
            );

        }


        const updated =
            await response.json();


        updateLocalComplaint(
            updated
        );


        updateStatistics();

        applyFilters();

        updateReviewCard(
            updated
        );


        alert(
            "🔁 Complaint marked as Duplicate."
        );


    } catch (error) {

        console.error(
            "Duplicate error:",
            error
        );

        alert(
            "❌ Could not mark complaint as duplicate."
        );

    }

}


// =====================================================
// REJECT COMPLAINT
// =====================================================

async function rejectComplaint() {

    if (!selectedComplaint) {

        alert(
            "Please select a complaint first."
        );

        return;

    }


    const complaintId =
        selectedComplaint.complaintId;


    const confirmReject =
        confirm(
            "Reject complaint " +
            complaintId +
            "?"
        );


    if (!confirmReject) return;


    try {

        const response =
            await fetch(
                "/api/complaints/" +
                encodeURIComponent(
                    complaintId
                ) +
                "/reject",
                {
                    method: "PUT"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Reject failed"
            );

        }


        const updated =
            await response.json();


        updateLocalComplaint(
            updated
        );


        updateStatistics();

        applyFilters();

        updateReviewCard(
            updated
        );


        alert(
            "✕ Complaint has been rejected."
        );


    } catch (error) {

        console.error(
            "Reject error:",
            error
        );

        alert(
            "❌ Could not reject complaint."
        );

    }

}


// =====================================================
// LOCAL DATA UPDATE
// =====================================================

function updateLocalComplaint(
    updated
) {

    const index =
        complaints.findIndex(
            c =>
                c.complaintId ===
                updated.complaintId
        );


    if (index !== -1) {

        complaints[index] =
            updated;

    }


    selectedComplaint =
        updated;


    sessionStorage.setItem(
        "selectedComplaint",
        JSON.stringify(updated)
    );


    sessionStorage.setItem(
        "complaintId",
        updated.complaintId
    );

}


// =====================================================
// SEARCH + FILTER
// =====================================================

function applyFilters() {

    const searchInput =
        document.getElementById(
            "verificationSearch"
        );


    const statusSelect =
        document.getElementById(
            "verificationStatus"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const filter =
        statusSelect
            ? statusSelect.value
            : "all";


    const filtered =
        complaints.filter(
            complaint => {

                const id =
                    (
                        complaint.complaintId ||
                        ""
                    ).toLowerCase();


                const category =
                    (
                        complaint.category ||
                        ""
                    ).toLowerCase();


                const description =
                    (
                        complaint.description ||
                        ""
                    ).toLowerCase();


                const matchesSearch =
                    !search ||
                    id.includes(search) ||
                    category.includes(search) ||
                    description.includes(search);


                const type =
                    getVerificationType(
                        complaint
                    );


                const matchesStatus =
                    filter === "all" ||
                    type === filter;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    displayQueue(
        filtered
    );

}


// =====================================================
// VERIFICATION TYPE
// =====================================================

function getVerificationType(
    complaint
) {

    const status =
        normalizeStatus(
            complaint.status
        );


    const duplicate =
        normalizeDuplicate(
            complaint.duplicateCheck
        );


    if (
        status === "duplicate" ||
        duplicate === "duplicate"
    ) {

        return "duplicate";

    }


    if (
        status === "verified" ||
        duplicate === "no duplicate"
    ) {

        return "genuine";

    }


    if (
        complaint.aiConfidence != null &&
        Number(complaint.aiConfidence) < 80
    ) {

        return "review";

    }


    /*
     * Pending complaints with no AI score
     * should remain in review.
     */

    if (
        status === "pending" ||
        status === ""
    ) {

        return "review";

    }


    return "genuine";

}


// =====================================================
// NORMALIZE STATUS
// =====================================================

function normalizeStatus(
    status
) {

    return (
        status || ""
    )
        .toString()
        .trim()
        .toLowerCase();

}


// =====================================================
// NORMALIZE DUPLICATE
// =====================================================

function normalizeDuplicate(
    value
) {

    return (
        value || ""
    )
        .toString()
        .trim()
        .toLowerCase();

}


// =====================================================
// VERIFICATION LABEL
// =====================================================

function getVerificationLabel(
    type
) {

    if (type === "duplicate") {
        return "Duplicate";
    }

    if (type === "review") {
        return "Review";
    }

    return "Genuine";

}


// =====================================================
// CATEGORY LABEL
// =====================================================

function getCategoryLabel(
    category
) {

    const value =
        (
            category || ""
        ).toLowerCase();


    if (value.includes("pothole")) {
        return "Road Pothole";
    }

    if (value.includes("garbage")) {
        return "Waste Issue";
    }

    if (value.includes("water")) {
        return "Water Issue";
    }

    if (value.includes("street")) {
        return "Street Light";
    }

    if (value.includes("drain")) {
        return "Drainage Issue";
    }

    return "Civic Issue";

}


// =====================================================
// CAPITALIZE
// =====================================================

function capitalize(
    value
) {

    if (!value) return "";

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}


// =====================================================
// SHORTEN LOCATION
// =====================================================

function shortenLocation(
    location
) {

    if (!location) {

        return "Location not available";

    }


    if (location.length > 35) {

        return (
            location.substring(0, 35) +
            "..."
        );

    }


    return location;

}


// =====================================================
// CATEGORY ICON
// =====================================================

function getCategoryIcon(
    category
) {

    const value =
        (
            category || ""
        ).toLowerCase();


    if (value.includes("pothole")) {
        return "🛣️";
    }


    if (value.includes("garbage")) {
        return "🗑️";
    }


    if (value.includes("water")) {
        return "💧";
    }


    if (
        value.includes("street") ||
        value.includes("light")
    ) {

        return "💡";

    }


    if (value.includes("drain")) {
        return "🌊";
    }


    return "⚠️";

}


// =====================================================
// CLEAR REVIEW CARD
// =====================================================

function clearReviewCard() {

    setText(
        "verificationComplaintId",
        "--"
    );

    setText(
        "aiConfidence",
        "0%"
    );

    setText(
        "aiSummary",
        "No complaint selected."
    );

    setText(
        "verificationCategory",
        "--"
    );

    setText(
        "verificationPriority",
        "--"
    );

    setText(
        "verificationDuplicate",
        "--"
    );

    setText(
        "verificationStatusValue",
        "--"
    );

    setText(
        "citizenDescription",
        "No complaint selected."
    );

    setText(
        "evidenceFileName",
        "No evidence"
    );

    setText(
        "evidenceLocation",
        "--"
    );


    const evidenceContainer =
        document.getElementById(
            "evidenceContainer"
        );


    if (evidenceContainer) {

        evidenceContainer.innerHTML = `

            <div class="evidence-placeholder">

                📷

                <span>
                    Select a complaint to view evidence
                </span>

            </div>

        `;

    }

}


// =====================================================
// SAFE TEXT SETTER
// =====================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(
    value
) {

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


// =====================================================
// ESCAPE ATTRIBUTE
// =====================================================

function escapeAttribute(
    value
) {

    return String(
        value || ""
    )
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

}


// =====================================================
// REFRESH
// =====================================================

function refreshVerification() {

    loadComplaints();

}