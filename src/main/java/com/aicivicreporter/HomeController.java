package com.aicivicreporter;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    // ==============================
    // HOME
    // ==============================

    @GetMapping("/")
    public String home() {
        return "index";
    }

    // ==============================
    // CITIZEN MODULE
    // ==============================

    @GetMapping("/citizen-dashboard")
    public String citizenDashboard() {
        return "citizen-dashboard";
    }

    @GetMapping("/register")
    public String register() {
        return "register";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/report")
    public String report() {
        return "report";
    }

    @GetMapping("/category")
    public String category() {
        return "category";
    }

    @GetMapping("/location")
    public String location() {
        return "location";
    }

    @GetMapping("/evidence")
    public String evidence() {
        return "evidence";
    }

    @GetMapping("/ai-verification")
    public String aiVerification() {
        return "ai-verification";
    }

    @GetMapping("/report-preview")
    public String reportPreview() {
        return "report-preview";
    }

    @GetMapping("/report-success")
    public String reportSuccess() {
        return "report-success";
    }

    @GetMapping("/my-reports")
    public String myReports() {
        return "my-reports";
    }

    @GetMapping("/track-report")
    public String trackReport() {
        return "report-tracking";
    }

    @GetMapping("/report-details")
    public String reportDetails() {
        return "report-details";
    }

    // ==============================
    // CIVIC INTELLIGENCE
    // ==============================

    @GetMapping("/civic-map")
    public String civicMap() {
        return "civic-map";
    }

    @GetMapping("/nearby-problems")
    public String nearbyProblems() {
        return "nearby-problems";
    }

    @GetMapping("/issue-details")
    public String issueDetails() {
        return "issue-details";
    }

    @GetMapping("/duplicate-detection")
    public String duplicateDetection() {
        return "duplicate-detection";
    }

    @GetMapping("/priority-score")
    public String priorityScore() {
        return "priority-score";
    }

    @GetMapping("/area-analysis")
    public String areaAnalysis() {
        return "area-analysis";
    }

    @GetMapping("/heatmap")
    public String heatmap() {
        return "heatmap";
    }

    // ==============================
    // ADMIN MODULE
    // ==============================

    @GetMapping("/admin-dashboard")
    public String adminDashboard() {
        return "admin-dashboard";
    }

    @GetMapping("/all-complaints")
    public String allComplaints() {
        return "all-complaints";
    }

    @GetMapping("/complaint-verification")
    public String complaintVerification() {
        return "complaint-verification";
    }

    @GetMapping("/assign-complaint")
    public String assignComplaint() {
        return "assign-complaint";
    }

    @GetMapping("/department-management")
    public String departmentManagement() {
        return "department-management";
    }

    @GetMapping("/status-management")
    public String statusManagement() {
        return "status-management";
    }

    @GetMapping("/resolution-verification")
    public String resolutionVerification() {
        return "resolution-verification";
    }

    @GetMapping("/citizen-feedback")
    public String citizenFeedback() {
        return "citizen-feedback";
    }

    // ==============================
    // ANALYTICS
    // ==============================

    @GetMapping("/analytics")
    public String analytics() {
        return "analytics";
    }

    @GetMapping("/department-performance")
    public String departmentPerformance() {
        return "department-performance";
    }

    @GetMapping("/resolution-time")
    public String resolutionTime() {
        return "resolution-time";
    }

    // ==============================
    // EXTRA
    // ==============================

    @GetMapping("/notifications")
    public String notifications() {
        return "notifications";
    }

    @GetMapping("/civic-awareness")
    public String civicAwareness() {
        return "civic-awareness";
    }

    @GetMapping("/help")
    public String help() {
        return "help";
    }

    @GetMapping("/user-login")
    public String userLogin() {
        return "user-login";
    }

    @GetMapping("/admin-login")
    public String adminLogin() {
        return "admin-login";
    }

    @GetMapping("/officer-management")
    public String officerManagement() {
        return "officer-management";
    }

    @GetMapping("/support")
    public String support() {
        return "support";
    }
}