package com.aicivicreporter.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "complaint_id", unique = true, nullable = false)
    private String complaintId;

    @Column(nullable = false)
    private String category;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String location;

    // Original uploaded file name
    private String evidenceFileName;

    // URL/path of uploaded evidence
    private String evidenceFileUrl;

    private Double aiConfidence;

    private String duplicateCheck;

    private String priority;

    private String riskLevel;

    private String aiSummary;

    private String status;

    private LocalDateTime createdAt;

    private String assignedDepartment;

    private String assignedOfficer;

    private String deadline;

    private String assignedPriority;

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    public Complaint() {
    }

    // ==========================================
    // PRE-PERSIST
    // ==========================================

    @PrePersist
    public void onCreate() {

        createdAt = LocalDateTime.now();

        if (status == null) {
            status = "Pending";
        }
    }

    // ==========================================
    // GET ID
    // ==========================================

    public Long getId() {
        return id;
    }

    // ==========================================
    // COMPLAINT ID
    // ==========================================

    public String getComplaintId() {
        return complaintId;
    }

    public void setComplaintId(String complaintId) {
        this.complaintId = complaintId;
    }

    // ==========================================
    // CATEGORY
    // ==========================================

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    // ==========================================
    // DESCRIPTION
    // ==========================================

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    // ==========================================
    // LOCATION
    // ==========================================

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    // ==========================================
    // EVIDENCE FILE NAME
    // ==========================================

    public String getEvidenceFileName() {
        return evidenceFileName;
    }

    public void setEvidenceFileName(String evidenceFileName) {
        this.evidenceFileName = evidenceFileName;
    }

    // ==========================================
    // EVIDENCE FILE URL
    // ==========================================

    public String getEvidenceFileUrl() {
        return evidenceFileUrl;
    }

    public void setEvidenceFileUrl(String evidenceFileUrl) {
        this.evidenceFileUrl = evidenceFileUrl;
    }

    // ==========================================
    // AI CONFIDENCE
    // ==========================================

    public Double getAiConfidence() {
        return aiConfidence;
    }

    public void setAiConfidence(Double aiConfidence) {
        this.aiConfidence = aiConfidence;
    }

    // ==========================================
    // DUPLICATE CHECK
    // ==========================================

    public String getDuplicateCheck() {
        return duplicateCheck;
    }

    public void setDuplicateCheck(String duplicateCheck) {
        this.duplicateCheck = duplicateCheck;
    }

    // ==========================================
    // PRIORITY
    // ==========================================

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    // ==========================================
    // RISK LEVEL
    // ==========================================

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    // ==========================================
    // AI SUMMARY
    // ==========================================

    public String getAiSummary() {
        return aiSummary;
    }

    public void setAiSummary(String aiSummary) {
        this.aiSummary = aiSummary;
    }

    // ==========================================
    // STATUS
    // ==========================================

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // ==========================================
    // ASSIGNED DEPARTMENT
    // ==========================================

    public String getAssignedDepartment() {
        return assignedDepartment;
    }

    public void setAssignedDepartment(String assignedDepartment) {
        this.assignedDepartment = assignedDepartment;
    }

    // ==========================================
    // ASSIGNED OFFICER
    // ==========================================

    public String getAssignedOfficer() {
        return assignedOfficer;
    }

    public void setAssignedOfficer(String assignedOfficer) {
        this.assignedOfficer = assignedOfficer;
    }

    // ==========================================
    // DEADLINE
    // ==========================================

    public String getDeadline() {
        return deadline;
    }

    public void setDeadline(String deadline) {
        this.deadline = deadline;
    }

    // ==========================================
    // ASSIGNED PRIORITY
    // ==========================================

    public String getAssignedPriority() {
        return assignedPriority;
    }

    public void setAssignedPriority(String assignedPriority) {
        this.assignedPriority = assignedPriority;
    }

    // ==========================================
    // CREATED AT
    // ==========================================

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}