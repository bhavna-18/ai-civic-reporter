let analysisStarted = false;

const progressBar = document.getElementById("aiProgress");
const progressPercent = document.getElementById("progressPercent");
const analysisTitle = document.getElementById("analysisTitle");
const analysisStatus = document.getElementById("analysisStatus");

function completeStep(stepNumber) {

    const step = document.getElementById("step" + stepNumber);

    if (!step) {
        return;
    }

    step.classList.add("completed");

    const icon = step.querySelector(".step-icon");

    if (icon) {
        icon.textContent = "✓";
    }
}


function setProgress(value) {

    if (progressBar) {
        progressBar.style.width = value + "%";
    }

    if (progressPercent) {
        progressPercent.textContent = value + "%";
    }
}

function getEvidenceFileName() {
    const evidenceUrl = sessionStorage.getItem("evidenceFileUrl");

    if (evidenceUrl) {
        try {
            return decodeURIComponent(
                evidenceUrl.substring(evidenceUrl.lastIndexOf("/") + 1)
            );
        } catch (e) {
            return evidenceUrl.substring(evidenceUrl.lastIndexOf("/") + 1);
        }
    }

    const storedFileName = sessionStorage.getItem("storedFileName");

    if (storedFileName) {
        return storedFileName;
    }

    const fileName = sessionStorage.getItem("evidenceFileName");

    if (fileName) {
        return fileName;
    }

    return null;
}

async function startAnalysis() {

    if (analysisStarted) {
        return;
    }

    analysisStarted = true;

    const fileName =
        getEvidenceFileName();

    if (!fileName) {

        showError(
            "Evidence image was not found. Please upload an image again."
        );

        return;
    }

    try {

        setProgress(10);

        if (analysisTitle) {
            analysisTitle.textContent =
                "AI Verification in Progress...";
        }

        if (analysisStatus) {
            analysisStatus.textContent =
                "Connecting to AI verification engine...";
        }

        completeStep(1);

        setProgress(25);

        if (analysisStatus) {
            analysisStatus.textContent =
                "Sending uploaded image to AI...";
        }

        const response =
            await fetch(
                "/api/ai-verification/analyze",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        fileName: fileName
                    })
                }
            );

        setProgress(55);

        if (analysisStatus) {
            analysisStatus.textContent =
                "AI is analyzing the civic issue...";
        }

        const responseText =
            await response.text();

        let data;

        try {

            data =
                JSON.parse(responseText);

        } catch (error) {

            throw new Error(
                responseText ||
                "Invalid response received from AI server."
            );
        }

        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                responseText ||
                "AI verification failed."
            );
        }

        if (!data.success || !data.result) {

            throw new Error(
                data.message ||
                "AI did not return a valid verification result."
            );
        }

        completeStep(2);

        setProgress(75);

        if (analysisStatus) {
            analysisStatus.textContent =
                "AI classification and risk analysis completed...";
        }

        const result =
            data.result;

        completeStep(3);

        setProgress(90);

        if (analysisStatus) {
            analysisStatus.textContent =
                "Preparing AI verification result...";
        }

        saveAIResult(result);

        completeStep(4);

        setProgress(100);

        if (analysisTitle) {
            analysisTitle.textContent =
                "AI Verification Complete ✓";
        }

        if (analysisStatus) {
            analysisStatus.textContent =
                "Your civic issue has been successfully analyzed by AI.";
        }

        showResult(result);

    } catch (error) {

        console.error(
            "AI Verification Error:",
            error
        );

        showError(
            error.message ||
            "AI verification failed. Please try again."
        );

    }
}


function saveAIResult(result) {

    sessionStorage.setItem(
        "aiVerificationResult",
        JSON.stringify(result)
    );

    if (result.detectedIssue) {

        sessionStorage.setItem(
            "detectedIssue",
            result.detectedIssue
        );
    }

    if (result.category) {

        sessionStorage.setItem(
            "aiCategory",
            result.category
        );
    }

    if (result.confidence !== undefined) {

        sessionStorage.setItem(
            "aiConfidence",
            result.confidence
        );
    }

    if (result.riskLevel) {

        sessionStorage.setItem(
            "riskLevel",
            result.riskLevel
        );
    }

    if (result.priority) {

        sessionStorage.setItem(
            "aiPriority",
            result.priority
        );
    }

    if (result.environment) {

        sessionStorage.setItem(
            "detectedEnvironment",
            result.environment
        );
    }

    if (result.summary) {

        sessionStorage.setItem(
            "aiSummary",
            result.summary
        );
    }

    if (result.genuine !== undefined) {

        sessionStorage.setItem(
            "aiGenuine",
            result.genuine
        );
    }
}


function showResult(result) {

    setTimeout(function () {

        const resultBox =
            document.getElementById("aiResult");

        if (resultBox) {
            resultBox.style.display = "block";
        }

        updateAIResultUI(result);

        const previewButton =
            document.getElementById("previewBtn");

        if (previewButton) {
            previewButton.style.display =
                "inline-flex";
        }

    }, 500);
}


function updateAIResultUI(result) {

    const confidence =
        document.getElementById("aiConfidence");

    const summary =
        document.getElementById("aiSummary");

    const detectedIssue =
        document.getElementById("detectedIssue");

    const detectedCategory =
        document.getElementById("detectedCategory");

    const detectedEnvironment =
        document.getElementById("detectedEnvironment");

    const verificationCategory =
        document.getElementById("verificationCategory");

    const verificationPriority =
        document.getElementById("verificationPriority");

    const verificationStatus =
        document.getElementById("verificationStatusValue");

    if (confidence && result.confidence !== undefined) {

        confidence.textContent =
            Number(result.confidence).toFixed(1) + "%";
    }

    if (summary && result.summary) {

        summary.textContent =
            result.summary;
    }

    if (detectedIssue && result.detectedIssue) {

        detectedIssue.textContent =
            result.detectedIssue;
    }

    if (detectedCategory && result.category) {

        detectedCategory.textContent =
            result.category;
    }

    if (detectedEnvironment && result.environment) {

        detectedEnvironment.textContent =
            result.environment;
    }

    if (verificationCategory && result.category) {

        verificationCategory.textContent =
            result.category;
    }

    if (verificationPriority && result.priority) {

        verificationPriority.textContent =
            result.priority;
    }

    if (verificationStatus) {

        if (result.genuine === true) {

            verificationStatus.textContent =
                "Genuine";

        } else {

            verificationStatus.textContent =
                "Needs Review";
        }
    }
}


function showError(message) {

    setProgress(0);

    if (analysisTitle) {

        analysisTitle.textContent =
            "AI Verification Failed";
    }

    if (analysisStatus) {

        analysisStatus.textContent =
            message;
    }

    const resultBox =
        document.getElementById("aiResult");

    if (resultBox) {

        resultBox.style.display =
            "none";
    }
}


function goToPreview() {

    window.location.href =
        "/report-preview";
}


document.addEventListener(
    "DOMContentLoaded",
    function () {

        setTimeout(
            startAnalysis,
            800
        );

    }
);