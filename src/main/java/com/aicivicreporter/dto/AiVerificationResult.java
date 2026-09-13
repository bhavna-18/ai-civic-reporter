package com.aicivicreporter.dto;

public class AiVerificationResult {

    private String detectedIssue;
    private String category;
    private Double confidence;
    private String riskLevel;
    private String priority;
    private String environment;
    private String summary;
    private Boolean genuine;

    public AiVerificationResult() {
    }

    public String getDetectedIssue() {
        return detectedIssue;
    }

    public void setDetectedIssue(String detectedIssue) {
        this.detectedIssue = detectedIssue;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public Boolean getGenuine() {
        return genuine;
    }

    public void setGenuine(Boolean genuine) {
        this.genuine = genuine;
    }
}