document.addEventListener("DOMContentLoaded", function () {

    console.log("Report Details JS started");


    // =========================================
    // ELEMENTS
    // =========================================

    const loadingDetails =
        document.getElementById("loadingDetails");

    const detailsContent =
        document.getElementById("detailsContent");

    const errorDetails =
        document.getElementById("errorDetails");

    const errorMessage =
        document.getElementById("errorMessage");


    // =========================================
    // GET COMPLAINT ID
    // =========================================

    let complaintId =
        sessionStorage.getItem("complaintId");


    /*
     * If complaint ID is not in sessionStorage,
     * try URL parameter.
     *
     * Example:
     * /report-details?complaintId=CIVIC-2026-4821
     */

    if (!complaintId) {

        const params =
            new URLSearchParams(window.location.search);

        complaintId =
            params.get("complaintId");
    }


    console.log(
        "Complaint ID:",
        complaintId
    );


    // =========================================
    // VALIDATE ID
    // =========================================

    if (!complaintId) {

        showError(
            "Complaint ID was not found. Please open the complaint from My Reports."
        );

        return;
    }


    // =========================================
    // LOAD COMPLAINT
    // =========================================

    loadComplaint(complaintId);


    // =========================================
    // LOAD FUNCTION
    // =========================================

    async function loadComplaint(id) {

        try {

            const response =
                await fetch(
                    `/api/complaints/${encodeURIComponent(id)}`
                );


            if (!response.ok) {

                throw new Error(
                    "Complaint not found."
                );
            }


            const complaint =
                await response.json();


            console.log(
                "Complaint data:",
                complaint
            );


            renderComplaint(
                complaint
            );


        } catch (error) {

            console.error(
                "Error loading complaint:",
                error
            );

            showError(
                "Unable to load complaint details. Please try again."
            );
        }
    }


    // =========================================
    // RENDER COMPLAINT
    // =========================================

    function renderComplaint(complaint) {


        // Hide loading

        loadingDetails.style.display =
            "none";


        // Show content

        detailsContent.classList.remove(
            "dynamic-hidden"
        );


        // =====================================
        // BASIC INFORMATION
        // =====================================

        const id =
            complaint.complaintId ||
            complaintId;


        const category =
            complaint.category ||
            "Not Available";


        const description =
            complaint.description ||
            "No description available.";


        const location =
            complaint.location ||
            "Location not available";


        const status =
            complaint.status ||
            "Pending";


        // =====================================
        // HEADER
        // =====================================

        setText(
            "headerComplaintId",
            id
        );


        setText(
            "complaintId",
            id
        );


        setText(
            "issueCategory",
            getCategoryIcon(category) +
            " " +
            category
        );


        setText(
            "issueDescription",
            description
        );


        setText(
            "issueLocation",
            "📍 " + location
        );


        // =====================================
        // STATUS
        // =====================================

        updateStatus(
            status
        );


        // =====================================
        // DATE
        // =====================================

        if (complaint.createdAt) {

            const date =
                new Date(
                    complaint.createdAt
                );

            setText(
                "reportedDate",
                formatDate(date)
            );
        }


        // =====================================
        // EVIDENCE
        // =====================================

        renderEvidence(
            complaint
        );


        // =====================================
        // AI INFORMATION
        // =====================================

        renderAIAnalysis(
            complaint
        );


        // =====================================
        // LOCATION
        // =====================================

        renderLocation(
            location
        );


        // =====================================
        // DEPARTMENT
        // =====================================

        renderDepartment(
            complaint
        );


        // =====================================
        // TIMELINE
        // =====================================

        renderTimeline(
            complaint
        );


        // =====================================
        // SAVE CURRENT COMPLAINT
        // =====================================

        sessionStorage.setItem(
            "complaintId",
            id
        );

        sessionStorage.setItem(
            "selectedComplaint",
            JSON.stringify(complaint)
        );

        sessionStorage.setItem(
            "complaintStatus",
            status
        );
    }


    // =========================================
    // EVIDENCE
    // =========================================

    function renderEvidence(complaint) {

        const container =
            document.getElementById(
                "evidenceContainer"
            );


        const fileNameElement =
            document.getElementById(
                "evidenceFileName"
            );


        const fileSizeElement =
            document.getElementById(
                "evidenceFileSize"
            );


        const fileUrl =
            complaint.evidenceFileUrl;


        const fileName =
            complaint.evidenceFileName;


        container.innerHTML = "";


        if (!fileUrl) {

            container.innerHTML = `

                <div class="no-evidence">

                    <div class="no-evidence-icon">
                        📷
                    </div>

                    <strong>
                        No evidence uploaded
                    </strong>

                    <p>
                        No image or video is available
                        for this complaint.
                    </p>

                </div>

            `;


            setText(
                "evidenceFileName",
                "📁 No evidence file"
            );


            setText(
                "evidenceFileSize",
                "--"
            );


            return;
        }


        // =====================================
        // DETECT FILE TYPE
        // =====================================

        const lowerUrl =
            fileUrl.toLowerCase();


        const isVideo =
            lowerUrl.endsWith(".mp4") ||
            lowerUrl.endsWith(".webm") ||
            lowerUrl.endsWith(".ogg");


        // =====================================
        // VIDEO
        // =====================================

        if (isVideo) {

            const video =
                document.createElement(
                    "video"
                );


            video.controls = true;

            video.preload = "metadata";

            video.src = fileUrl;


            container.appendChild(
                video
            );

        }

        // =====================================
        // IMAGE
        // =====================================

        else {

            const image =
                document.createElement(
                    "img"
                );


            image.src =
                fileUrl;


            image.alt =
                "Uploaded civic complaint evidence";


            image.onerror =
                function () {

                    container.innerHTML = `

                        <div class="no-evidence">

                            <div class="no-evidence-icon">
                                ⚠️
                            </div>

                            <strong>
                                Evidence could not be displayed
                            </strong>

                            <p>
                                The uploaded file may no longer be available.
                            </p>

                        </div>

                    `;
                };


            container.appendChild(
                image
            );
        }


        // =====================================
        // FILE INFO
        // =====================================

        setText(
            "evidenceFileName",
            "📁 " +
            (fileName || "Uploaded Evidence")
        );


        /*
         * File size is not currently stored
         * inside Complaint entity.
         *
         * Therefore we show available information.
         */

        setText(
            "evidenceFileSize",
            "Uploaded"
        );
    }


    // =========================================
    // AI ANALYSIS
    // =========================================

    function renderAIAnalysis(
        complaint
    ) {


        // Confidence

        if (
            complaint.aiConfidence !== null &&
            complaint.aiConfidence !== undefined
        ) {

            let confidence =
                Number(
                    complaint.aiConfidence
                );


            /*
             * Supports both:
             * 94
             * 0.94
             */

            if (
                confidence > 0 &&
                confidence <= 1
            ) {

                confidence =
                    confidence * 100;
            }


            setText(
                "aiConfidence",
                Math.round(confidence) +
                "%"
            );

        } else {

            setText(
                "aiConfidence",
                "--%"
            );
        }


        // Detected Issue

        setText(
            "detectedIssue",
            complaint.aiSummary ||
            complaint.category ||
            "Not Available"
        );


        // Verification

        let verification =
            "Pending";


        if (
            complaint.status ===
                "Verified" ||
            complaint.status ===
                "Assigned" ||
            complaint.status ===
                "In Progress" ||
            complaint.status ===
                "Resolved" ||
            complaint.status ===
                "Closed"
        ) {

            verification =
                "Genuine Report";
        }


        if (
            complaint.status ===
                "Rejected"
        ) {

            verification =
                "Rejected";
        }


        if (
            complaint.status ===
                "Duplicate"
        ) {

            verification =
                "Duplicate Report";
        }


        setText(
            "verificationResult",
            verification
        );


        // Duplicate

        setText(
            "duplicateCheck",
            complaint.duplicateCheck ||
            "Not Checked"
        );


        // Priority

        let priority =
            complaint.priority ||
            complaint.assignedPriority ||
            "Normal";


        setText(
            "priorityScore",
            priority
        );
    }


    // =========================================
    // LOCATION
    // =========================================

    function renderLocation(
        location
    ) {

        setText(
            "mapLocation",
            location
        );


        /*
         * Current Complaint entity stores
         * location as text.
         *
         * Latitude/Longitude are not separate
         * database fields yet.
         */

        setText(
            "latitude",
            "--"
        );


        setText(
            "longitude",
            "--"
        );
    }


    // =========================================
    // DEPARTMENT
    // =========================================

    function renderDepartment(
        complaint
    ) {

        const department =
            complaint.assignedDepartment;


        const officer =
            complaint.assignedOfficer;


        const deadline =
            complaint.deadline;


        setText(
            "assignedDepartment",
            department ||
            "Not Assigned"
        );


        setText(
            "assignedOfficer",
            officer ||
            "Not Assigned"
        );


        if (deadline) {

            setText(
                "assignedOn",
                formatSimpleDate(
                    deadline
                )
            );

        } else {

            setText(
                "assignedOn",
                "Not Available"
            );
        }
    }


    // =========================================
    // TIMELINE
    // =========================================

    function renderTimeline(
        complaint
    ) {

        const timeline =
            document.getElementById(
                "complaintTimeline"
            );


        const status =
            complaint.status ||
            "Pending";


        const steps = [

            {
                name:
                    "Complaint Submitted",

                description:
                    "Your civic complaint was successfully submitted.",

                status:
                    "submitted"
            },

            {
                name:
                    "AI Verification Completed",

                description:
                    "AI analysis and complaint verification process completed.",

                status:
                    "verified"
            },

            {
                name:
                    "Department Assigned",

                description:
                    "The complaint was assigned to the concerned department.",

                status:
                    "assigned"
            },

            {
                name:
                    "Work In Progress",

                description:
                    "Department has started working on the reported issue.",

                status:
                    "progress"
            },

            {
                name:
                    "Resolved",

                description:
                    "The complaint has been resolved and verified.",

                status:
                    "resolved"
            }

        ];


        const currentIndex =
            getStatusIndex(
                status
            );


        timeline.innerHTML = "";


        steps.forEach(
            function (step, index) {


                let cssClass = "";


                let icon = "○";


                if (
                    index <
                    currentIndex
                ) {

                    cssClass =
                        "completed";

                    icon =
                        "✓";

                }

                else if (
                    index ===
                    currentIndex
                ) {

                    cssClass =
                        "active";

                    icon =
                        "🔄";
                }


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    `timeline-item ${cssClass}`;


                item.innerHTML = `

                    <div class="timeline-dot">
                        ${icon}
                    </div>

                    <div class="timeline-content">

                        <strong>
                            ${step.name}
                        </strong>

                        <span>
                            ${index <= currentIndex
                                ? getTimelineDate(
                                    complaint.createdAt
                                )
                                : "Waiting for completion"
                            }
                        </span>

                        <p>
                            ${step.description}
                        </p>

                    </div>

                `;


                timeline.appendChild(
                    item
                );

            }
        );
    }


    // =========================================
    // STATUS INDEX
    // =========================================

    function getStatusIndex(
        status
    ) {

        const normalized =
            String(status)
                .toLowerCase();


        if (
            normalized ===
                "pending"
        ) {
            return 0;
        }


        if (
            normalized ===
                "verified"
        ) {
            return 1;
        }


        if (
            normalized ===
                "assigned"
        ) {
            return 2;
        }


        if (
            normalized ===
                "in progress" ||
            normalized ===
                "progress"
        ) {
            return 3;
        }


        if (
            normalized ===
                "resolved" ||
            normalized ===
                "closed"
        ) {
            return 4;
        }


        if (
            normalized ===
                "rejected" ||
            normalized ===
                "duplicate"
        ) {
            return 1;
        }


        return 0;
    }


    // =========================================
    // STATUS DISPLAY
    // =========================================

    function updateStatus(
        status
    ) {

        const element =
            document.getElementById(
                "headerStatus"
            );


        const normalized =
            String(status)
                .toLowerCase();


        let icon =
            "⏳";


        if (
            normalized ===
            "verified"
        ) {

            icon =
                "✓";

        } else if (
            normalized ===
            "assigned"
        ) {

            icon =
                "👤";

        } else if (
            normalized ===
            "in progress" ||
            normalized ===
            "progress"
        ) {

            icon =
                "🔄";

        } else if (
            normalized ===
            "resolved"
        ) {

            icon =
                "✅";

        } else if (
            normalized ===
            "closed"
        ) {

            icon =
                "🔒";

        } else if (
            normalized ===
            "rejected"
        ) {

            icon =
                "❌";

        } else if (
            normalized ===
            "duplicate"
        ) {

            icon =
                "🔗";
        }


        element.textContent =
            `${icon} ${status}`;


        element.className =
            "big-status";


        if (
            normalized ===
                "resolved" ||
            normalized ===
                "closed"
        ) {

            element.classList.add(
                "resolved"
            );

        } else if (
            normalized ===
                "rejected"
        ) {

            element.classList.add(
                "rejected"
            );

        } else if (
            normalized ===
                "in progress" ||
            normalized ===
                "progress"
        ) {

            element.classList.add(
                "progress"
            );

        } else {

            element.classList.add(
                "progress"
            );
        }
    }


    // =========================================
    // CATEGORY ICON
    // =========================================

    function getCategoryIcon(
        category
    ) {

        const value =
            String(category)
                .toLowerCase();


        if (
            value.includes("pothole") ||
            value.includes("road")
        ) {

            return "🛣️";
        }


        if (
            value.includes("garbage") ||
            value.includes("waste")
        ) {

            return "🗑️";
        }


        if (
            value.includes("water")
        ) {

            return "💧";
        }


        if (
            value.includes("light") ||
            value.includes("electric")
        ) {

            return "💡";
        }


        if (
            value.includes("drain")
        ) {

            return "🌊";
        }


        return "🚨";
    }


    // =========================================
    // DATE FORMAT
    // =========================================

    function formatDate(
        date
    ) {

        if (
            !date ||
            isNaN(date.getTime())
        ) {

            return "---";
        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }


    // =========================================
    // SIMPLE DATE
    // =========================================

    function formatSimpleDate(
        value
    ) {

        if (!value) {

            return "---";
        }


        const date =
            new Date(value);


        if (
            !isNaN(
                date.getTime()
            )
        ) {

            return formatDate(
                date
            );
        }


        return value;
    }


    // =========================================
    // TIMELINE DATE
    // =========================================

    function getTimelineDate(
        createdAt
    ) {

        if (!createdAt) {

            return "Completed";
        }


        const date =
            new Date(createdAt);


        if (
            isNaN(
                date.getTime()
            )
        ) {

            return "Completed";
        }


        return formatDate(
            date
        );
    }


    // =========================================
    // SET TEXT SAFELY
    // =========================================

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


    // =========================================
    // SHOW ERROR
    // =========================================

    function showError(
        message
    ) {

        loadingDetails.style.display =
            "none";


        detailsContent.classList.add(
            "dynamic-hidden"
        );


        errorDetails.classList.remove(
            "dynamic-hidden"
        );


        errorMessage.textContent =
            message;
    }

});