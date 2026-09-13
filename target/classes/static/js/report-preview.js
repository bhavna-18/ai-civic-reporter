/* =========================================
   REPORT PREVIEW
   Actual AI Verification Connected
   MySQL Connected + Evidence Connected
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {
        loadReportData();
    }
);


/* =========================================
   LOAD DATA
========================================= */

function loadReportData() {

    const category =
        sessionStorage.getItem("issueCategory");

    const description =
        sessionStorage.getItem("issueDescription");

    const location =
        sessionStorage.getItem("issueLocation");

    const evidence =
        sessionStorage.getItem("evidenceFileName");

    const evidenceUrl =
        sessionStorage.getItem("evidenceFileUrl");


    /* =========================================
       GET ACTUAL AI VERIFICATION RESULT
    ========================================= */

    let aiResult = null;

    const storedAIResult =
        sessionStorage.getItem("aiVerificationResult");

    if (storedAIResult) {

        try {

            aiResult =
                JSON.parse(storedAIResult);

        } catch (error) {

            console.error(
                "Unable to read AI verification result:",
                error
            );
        }
    }


    /* =========================================
       DISPLAY BASIC REPORT DATA
    ========================================= */

    const previewCategory =
        document.getElementById(
            "previewCategory"
        );

    if (previewCategory) {

        previewCategory.textContent =
            category || "Not provided";
    }


    const previewDescription =
        document.getElementById(
            "previewDescription"
        );

    if (previewDescription) {

        previewDescription.textContent =
            description || "Not provided";
    }


    const previewLocation =
        document.getElementById(
            "previewLocation"
        );

    if (previewLocation) {

        previewLocation.textContent =
            location || "Not provided";
    }


    const previewEvidence =
        document.getElementById(
            "previewEvidence"
        );

    if (previewEvidence) {

        previewEvidence.textContent =
            evidence || "No evidence";
    }


    /* =========================================
       TEMPORARY REPORT ID
    ========================================= */

    const reportId =
        document.getElementById(
            "reportId"
        );

    if (reportId) {

        reportId.textContent =
            "CIVIC-PENDING";
    }


    /* =========================================
       STORE ACTUAL AI RESULT
    ========================================= */

    if (aiResult) {

        console.log(
            "Actual AI Verification Result:",
            aiResult
        );


        /* AI CATEGORY */

        if (aiResult.category) {

            sessionStorage.setItem(
                "aiCategory",
                aiResult.category
            );
        }


        /* AI CONFIDENCE */

        if (
            aiResult.confidence !== undefined &&
            aiResult.confidence !== null
        ) {

            sessionStorage.setItem(
                "aiConfidence",
                aiResult.confidence
            );
        }


        /* AI RISK LEVEL */

        if (aiResult.riskLevel) {

            sessionStorage.setItem(
                "riskLevel",
                aiResult.riskLevel
            );
        }


        /* AI PRIORITY */

        if (aiResult.priority) {

            sessionStorage.setItem(
                "aiPriority",
                aiResult.priority
            );
        }


        /* AI SUMMARY */

        if (aiResult.summary) {

            sessionStorage.setItem(
                "aiSummary",
                aiResult.summary
            );
        }


        /* DETECTED ISSUE */

        if (aiResult.detectedIssue) {

            sessionStorage.setItem(
                "detectedIssue",
                aiResult.detectedIssue
            );
        }


        /* DETECTED ENVIRONMENT */

        if (aiResult.environment) {

            sessionStorage.setItem(
                "detectedEnvironment",
                aiResult.environment
            );
        }


        /* GENUINE RESULT */

        if (aiResult.genuine !== undefined) {

            sessionStorage.setItem(
                "aiGenuine",
                aiResult.genuine
            );
        }
    }


    console.log(
        "Evidence File:",
        evidence
    );

    console.log(
        "Evidence URL:",
        evidenceUrl
    );
}


/* =========================================
   SUBMIT REPORT
========================================= */

async function submitReport() {

    const checkbox =
        document.getElementById(
            "confirmReport"
        );


    /* =========================================
       CONFIRMATION
    ========================================= */

    if (
        !checkbox ||
        !checkbox.checked
    ) {

        alert(
            "⚠️ Please confirm that the information is correct."
        );

        return;
    }


    /* =========================================
       GET REPORT DATA
    ========================================= */

    const category =
        sessionStorage.getItem(
            "issueCategory"
        );

    const description =
        sessionStorage.getItem(
            "issueDescription"
        );

    const location =
        sessionStorage.getItem(
            "issueLocation"
        );

    const evidence =
        sessionStorage.getItem(
            "evidenceFileName"
        );

    const evidenceUrl =
        sessionStorage.getItem(
            "evidenceFileUrl"
        );


    /* =========================================
       GET ACTUAL AI RESULT
    ========================================= */

    let aiResult = null;

    const storedAIResult =
        sessionStorage.getItem(
            "aiVerificationResult"
        );


    if (storedAIResult) {

        try {

            aiResult =
                JSON.parse(
                    storedAIResult
                );

        } catch (error) {

            console.error(
                "AI result parsing error:",
                error
            );
        }
    }


    /* =========================================
       VALIDATION
    ========================================= */

    if (
        !category ||
        !description ||
        !location
    ) {

        alert(
            "⚠️ Some complaint information is missing."
        );

        return;
    }


    /* =========================================
       AI VERIFICATION CHECK
    ========================================= */

    if (!aiResult) {

        alert(
            "⚠️ AI verification result is not available.\n\n" +
            "Please go back and complete AI Verification first."
        );

        return;
    }


    /* =========================================
       ACTUAL AI VALUES
    ========================================= */

    const aiConfidence =
        aiResult.confidence !== undefined &&
        aiResult.confidence !== null
            ? Number(aiResult.confidence)
            : null;


    const aiPriority =
        aiResult.priority ||
        "Medium";


    const aiRiskLevel =
        aiResult.riskLevel ||
        "Low";


    const aiSummary =
        aiResult.summary ||
        "AI analysis completed.";


    /* =========================================
       AI DETECTED CATEGORY
    ========================================= */

    const finalCategory =
        aiResult.category ||
        category;


    /* =========================================
       GENUINE / DUPLICATE INFORMATION
       
       Current AI checks whether the image
       contains a genuine civic issue.

       Actual database duplicate detection
       will be handled separately.
    ========================================= */

    let duplicateCheck =
        "Not Checked";


    if (aiResult.genuine === true) {

        duplicateCheck =
            "No Duplicate";
    }


    if (aiResult.genuine === false) {

        duplicateCheck =
            "Needs Review";
    }


    /* =========================================
       COMPLAINT OBJECT
    ========================================= */

    const complaint = {

        /* AI DETECTED CATEGORY */

        category:
            finalCategory,


        /* CITIZEN DESCRIPTION */

        description:
            description,


        /* LOCATION */

        location:
            location,


        /* EVIDENCE */

        evidenceFileName:
            evidence || null,

        evidenceFileUrl:
            evidenceUrl || null,


        /* ACTUAL AI CONFIDENCE */

        aiConfidence:
            aiConfidence,


        /* AI DUPLICATE / GENUINE STATUS */

        duplicateCheck:
            duplicateCheck,


        /* ACTUAL AI PRIORITY */

        priority:
            aiPriority,


        /* ACTUAL AI RISK LEVEL */

        riskLevel:
            aiRiskLevel,


        /* ACTUAL AI SUMMARY */

        aiSummary:
            aiSummary,


        /* INITIAL STATUS */

        status:
            "Pending"
    };


    /* =========================================
       CONSOLE DEBUG
    ========================================= */

    console.log(
        "================================="
    );

    console.log(
        "ACTUAL AI RESULT"
    );

    console.log(
        aiResult
    );

    console.log(
        "AI CATEGORY:",
        finalCategory
    );

    console.log(
        "AI CONFIDENCE:",
        aiConfidence
    );

    console.log(
        "AI RISK LEVEL:",
        aiRiskLevel
    );

    console.log(
        "AI PRIORITY:",
        aiPriority
    );

    console.log(
        "AI SUMMARY:",
        aiSummary
    );

    console.log(
        "COMPLAINT BEING SUBMITTED"
    );

    console.log(
        complaint
    );

    console.log(
        "================================="
    );


    /* =========================================
       SUBMIT BUTTON
    ========================================= */

    const submitButton =
        document.querySelector(
            ".next-btn"
        );


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.innerHTML =
            "Submitting... ⏳";
    }


    /* =========================================
       SEND TO SPRING BOOT
    ========================================= */

    try {

        const response =
            await fetch(
                "/api/complaints",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            complaint
                        )
                }
            );


        /* =========================================
           ERROR CHECK
        ========================================= */

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Server response:",
                errorText
            );

            throw new Error(
                errorText ||
                "Server error"
            );
        }


        /* =========================================
           SAVED COMPLAINT
        ========================================= */

        const savedComplaint =
            await response.json();


        console.log(
            "Saved complaint:",
            savedComplaint
        );


        /* =========================================
           REAL COMPLAINT ID
        ========================================= */

        const complaintId =
            savedComplaint.complaintId;


        /* =========================================
           SAVE FOR OTHER PAGES
        ========================================= */

        sessionStorage.setItem(
            "complaintId",
            complaintId
        );

        sessionStorage.setItem(
            "selectedComplaint",
            complaintId
        );

        sessionStorage.setItem(
            "selectedComplaintId",
            complaintId
        );

        sessionStorage.setItem(
            "reportSubmitted",
            "true"
        );

        sessionStorage.setItem(
            "complaintStatus",
            savedComplaint.status ||
            "Pending"
        );


        /* =========================================
           SUCCESS
        ========================================= */

        alert(
            "✅ Complaint submitted successfully!\n\n" +
            "Complaint ID: " +
            complaintId
        );


        /* =========================================
           GO TO SUCCESS PAGE
        ========================================= */

        window.location.href =
            "/report-success";


    } catch (error) {

        console.error(
            "Complaint submission error:",
            error
        );


        alert(
            "❌ Complaint could not be submitted.\n\n" +
            error.message
        );


        /* =========================================
           ENABLE BUTTON AGAIN
        ========================================= */

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.innerHTML =
                "Submit Complaint <span>✓</span>";
        }
    }
}