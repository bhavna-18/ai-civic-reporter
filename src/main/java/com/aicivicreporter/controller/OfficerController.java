package com.aicivicreporter.controller;

import com.aicivicreporter.model.Officer;
import com.aicivicreporter.repository.OfficerRepository;
import com.aicivicreporter.repository.ComplaintRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/officers")
public class OfficerController {

    private final OfficerRepository officerRepository;
    private final ComplaintRepository complaintRepository;

    public OfficerController(
            OfficerRepository officerRepository,
            ComplaintRepository complaintRepository) {

        this.officerRepository = officerRepository;
        this.complaintRepository = complaintRepository;
    }

    // Get all officers
    @GetMapping
    public ResponseEntity<List<Officer>> getAllOfficers() {
        return ResponseEntity.ok(
                officerRepository.findAll()
        );
    }

    // Get officer by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getOfficer(
            @PathVariable Long id) {

        Optional<Officer> officer =
                officerRepository.findById(id);

        if (officer.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(officer.get());
    }

    // Get officers by department
    @GetMapping("/department/{departmentName}")
    public ResponseEntity<List<Officer>> getByDepartment(
            @PathVariable String departmentName) {

        return ResponseEntity.ok(
                officerRepository
                        .findByDepartmentIgnoreCase(departmentName)
        );
    }

    // Add officer
    @PostMapping
    public ResponseEntity<?> addOfficer(
            @RequestBody Officer officer) {

        try {

            if (officer.getStatus() == null ||
                    officer.getStatus().trim().isEmpty()) {

                officer.setStatus("Active");
            }

            if (officer.getEmployeeId() == null ||
                    officer.getEmployeeId().trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body("Employee ID is required");
            }

            if (officer.getName() == null ||
                    officer.getName().trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body("Officer name is required");
            }

            if (officer.getDepartment() == null ||
                    officer.getDepartment().trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body("Department is required");
            }

            if (officerRepository
                    .findByEmployeeId(officer.getEmployeeId())
                    .isPresent()) {

                return ResponseEntity.badRequest()
                        .body("Employee ID already exists");
            }

            if (officer.getEmail() != null &&
                    officerRepository
                            .findByEmail(officer.getEmail())
                            .isPresent()) {

                return ResponseEntity.badRequest()
                        .body("Email already exists");
            }

            Officer savedOfficer =
                    officerRepository.save(officer);

            return ResponseEntity.ok(savedOfficer);

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body("Failed to add officer: "
                            + e.getMessage());
        }
    }

    // Update officer
    @PutMapping("/{id}")
    public ResponseEntity<?> updateOfficer(
            @PathVariable Long id,
            @RequestBody Officer updatedOfficer) {

        try {

            Optional<Officer> optionalOfficer =
                    officerRepository.findById(id);

            if (optionalOfficer.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Officer officer =
                    optionalOfficer.get();

            officer.setEmployeeId(
                    updatedOfficer.getEmployeeId()
            );

            officer.setName(
                    updatedOfficer.getName()
            );

            officer.setEmail(
                    updatedOfficer.getEmail()
            );

            officer.setPhone(
                    updatedOfficer.getPhone()
            );

            officer.setDepartment(
                    updatedOfficer.getDepartment()
            );

            officer.setStatus(
                    updatedOfficer.getStatus()
            );

            Officer savedOfficer =
                    officerRepository.save(officer);

            return ResponseEntity.ok(savedOfficer);

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body("Failed to update officer: "
                            + e.getMessage());
        }
    }

    // Delete officer
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOfficer(
            @PathVariable Long id) {

        if (!officerRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        officerRepository.deleteById(id);

        return ResponseEntity.ok(
                "Officer deleted successfully"
        );
    }

    // Officer statistics
    @GetMapping("/{id}/statistics")
    public ResponseEntity<?> getOfficerStatistics(
            @PathVariable Long id) {

        Optional<Officer> optionalOfficer =
                officerRepository.findById(id);

        if (optionalOfficer.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Officer officer =
                optionalOfficer.get();

        var complaints =
                complaintRepository
                        .findByAssignedOfficerIgnoreCase(
                                officer.getName()
                        );

        long total = complaints.size();
        long pending = 0;
        long resolved = 0;

        for (var complaint : complaints) {

            if (complaint.getStatus() == null) {
                continue;
            }

            String status =
                    complaint.getStatus()
                            .trim()
                            .toLowerCase();

            if (status.equals("pending") ||
                    status.equals("verified") ||
                    status.equals("assigned") ||
                    status.equals("in progress")) {

                pending++;
            }

            if (status.equals("resolved") ||
                    status.equals("closed")) {

                resolved++;
            }
        }

        Map<String, Object> statistics =
                new LinkedHashMap<>();

        statistics.put("officerId", officer.getId());
        statistics.put("employeeId",
                officer.getEmployeeId());
        statistics.put("officerName",
                officer.getName());
        statistics.put("department",
                officer.getDepartment());
        statistics.put("status",
                officer.getStatus());
        statistics.put("totalComplaints",
                total);
        statistics.put("pendingComplaints",
                pending);
        statistics.put("resolvedComplaints",
                resolved);

        return ResponseEntity.ok(statistics);
    }
}