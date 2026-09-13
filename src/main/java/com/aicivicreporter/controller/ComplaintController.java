package com.aicivicreporter.controller;

import com.aicivicreporter.model.Complaint;
import com.aicivicreporter.repository.ComplaintRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintRepository complaintRepository;

    public ComplaintController(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }


    // ================= CREATE COMPLAINT =================

    @PostMapping
    public ResponseEntity<?> createComplaint(
            @RequestBody Complaint complaint) {

        try {

            String complaintId =
                    "CIVIC-" +
                    UUID.randomUUID()
                            .toString()
                            .substring(0, 8)
                            .toUpperCase();

            complaint.setComplaintId(complaintId);


            // Default status

            if (complaint.getStatus() == null ||
                    complaint.getStatus().trim().isEmpty()) {

                complaint.setStatus("Pending");
            }


            // Default risk level

            if (complaint.getRiskLevel() == null ||
                    complaint.getRiskLevel().trim().isEmpty()) {

                complaint.setRiskLevel("Low");
            }


            // Default priority

            if (complaint.getPriority() == null ||
                    complaint.getPriority().trim().isEmpty()) {

                complaint.setPriority("Medium");
            }


            // Default duplicate check

            if (complaint.getDuplicateCheck() == null ||
                    complaint.getDuplicateCheck().trim().isEmpty()) {

                complaint.setDuplicateCheck("Not Checked");
            }


            Complaint saved =
                    complaintRepository.save(complaint);


            return ResponseEntity.ok(saved);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Complaint could not be saved: "
                                    + e.getMessage()
                    );
        }
    }


    // ================= GET ALL COMPLAINTS =================

    @GetMapping
    public ResponseEntity<?> getAllComplaints() {

        try {

            List<Complaint> complaints =
                    complaintRepository.findAll();

            return ResponseEntity.ok(complaints);

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Could not fetch complaints: "
                                    + e.getMessage()
                    );
        }
    }


    // ================= GET SINGLE COMPLAINT =================

    @GetMapping("/{complaintId}")
    public ResponseEntity<?> getComplaintById(
            @PathVariable String complaintId) {

        try {

            return complaintRepository
                    .findByComplaintId(complaintId)
                    .map(ResponseEntity::ok)
                    .orElseGet(() ->
                            ResponseEntity
                                    .notFound()
                                    .build()
                    );

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .build();
        }
    }


    // ================= APPROVE / VERIFY =================

    @PutMapping("/{complaintId}/verify")
    public ResponseEntity<?> verifyComplaint(
            @PathVariable String complaintId) {

        try {

            Complaint complaint =
                    complaintRepository
                            .findByComplaintId(complaintId)
                            .orElse(null);

            if (complaint == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }


            complaint.setStatus("Verified");

            complaint.setDuplicateCheck(
                    "No Duplicate"
            );


            Complaint updated =
                    complaintRepository.save(complaint);


            return ResponseEntity.ok(updated);

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Could not verify complaint: "
                                    + e.getMessage()
                    );
        }
    }


    // ================= MARK DUPLICATE =================

    @PutMapping("/{complaintId}/duplicate")
    public ResponseEntity<?> markDuplicate(
            @PathVariable String complaintId) {

        try {

            Complaint complaint =
                    complaintRepository
                            .findByComplaintId(complaintId)
                            .orElse(null);

            if (complaint == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }


            complaint.setStatus("Duplicate");

            complaint.setDuplicateCheck(
                    "Duplicate"
            );


            Complaint updated =
                    complaintRepository.save(complaint);


            return ResponseEntity.ok(updated);

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Could not mark duplicate: "
                                    + e.getMessage()
                    );
        }
    }


    // ================= REJECT COMPLAINT =================

    @PutMapping("/{complaintId}/reject")
    public ResponseEntity<?> rejectComplaint(
            @PathVariable String complaintId) {

        try {

            Complaint complaint =
                    complaintRepository
                            .findByComplaintId(complaintId)
                            .orElse(null);

            if (complaint == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }


            complaint.setStatus("Rejected");


            Complaint updated =
                    complaintRepository.save(complaint);


            return ResponseEntity.ok(updated);

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Could not reject complaint: "
                                    + e.getMessage()
                    );
        }
    }


    // ================= UPDATE COMPLAINT STATUS =================

    @PutMapping("/{complaintId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String complaintId,
            @RequestBody Complaint statusData) {

        try {

            Complaint complaint =
                    complaintRepository
                            .findByComplaintId(complaintId)
                            .orElse(null);

            if (complaint == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }


            if (statusData.getStatus() != null &&
                    !statusData.getStatus().trim().isEmpty()) {

                complaint.setStatus(
                        statusData.getStatus()
                );
            }


            Complaint updated =
                    complaintRepository.save(complaint);


            return ResponseEntity.ok(updated);

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Could not update status: "
                                    + e.getMessage()
                    );
        }
    }
}