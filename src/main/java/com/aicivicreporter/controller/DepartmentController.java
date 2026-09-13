package com.aicivicreporter.controller;

import com.aicivicreporter.model.Department;
import com.aicivicreporter.repository.DepartmentRepository;
import com.aicivicreporter.repository.ComplaintRepository;
import com.aicivicreporter.repository.OfficerRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin
public class DepartmentController {

    private final DepartmentRepository departmentRepository;
    private final ComplaintRepository complaintRepository;
    private final OfficerRepository officerRepository;

    public DepartmentController(
            DepartmentRepository departmentRepository,
            ComplaintRepository complaintRepository,
            OfficerRepository officerRepository) {

        this.departmentRepository = departmentRepository;
        this.complaintRepository = complaintRepository;
        this.officerRepository = officerRepository;
    }

    // ==========================================
    // GET ALL DEPARTMENTS
    // ==========================================

    @GetMapping
    public ResponseEntity<List<Department>> getAllDepartments() {

        return ResponseEntity.ok(
                departmentRepository.findAll()
        );
    }

    // ==========================================
    // GET DEPARTMENT BY ID
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getDepartmentById(
            @PathVariable Long id) {

        Optional<Department> department =
                departmentRepository.findById(id);

        if (department.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                department.get()
        );
    }

    // ==========================================
    // GET DEPARTMENT BY NAME
    // ==========================================

    @GetMapping("/name/{name}")
    public ResponseEntity<?> getDepartmentByName(
            @PathVariable String name) {

        Optional<Department> department =
                departmentRepository.findByNameIgnoreCase(name);

        if (department.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                department.get()
        );
    }

    // ==========================================
    // DEPARTMENT STATISTICS
    // ==========================================

    @GetMapping("/stats/{departmentName}")
    public ResponseEntity<?> getDepartmentStats(
            @PathVariable String departmentName) {

        long totalComplaints =
                complaintRepository
                        .countByAssignedDepartment(departmentName);

        long pendingComplaints =
                complaintRepository
                        .countByAssignedDepartmentAndStatus(
                                departmentName,
                                "Pending"
                        );

        long resolvedComplaints =
                complaintRepository
                        .countByAssignedDepartmentAndStatus(
                                departmentName,
                                "Resolved"
                        );

        long activeOfficers =
                officerRepository
                        .countByDepartmentIgnoreCaseAndStatusIgnoreCase(
                                departmentName,
                                "Active"
                        );

        Map<String, Object> stats =
                new LinkedHashMap<>();

        stats.put(
                "department",
                departmentName
        );

        stats.put(
                "totalComplaints",
                totalComplaints
        );

        stats.put(
                "pendingComplaints",
                pendingComplaints
        );

        stats.put(
                "resolvedComplaints",
                resolvedComplaints
        );

        stats.put(
                "activeOfficers",
                activeOfficers
        );

        // Simple workload calculation
        String workload;

        if (totalComplaints == 0) {
            workload = "Low";
        } else if (totalComplaints <= 5) {
            workload = "Low";
        } else if (totalComplaints <= 15) {
            workload = "Medium";
        } else {
            workload = "High";
        }

        stats.put(
                "workload",
                workload
        );

        return ResponseEntity.ok(stats);
    }

    // ==========================================
    // ADD DEPARTMENT
    // ==========================================

    @PostMapping
    public ResponseEntity<?> addDepartment(
            @RequestBody Department department) {

        if (department.getName() == null ||
                department.getName().trim().isEmpty()) {

            return ResponseEntity.badRequest()
                    .body("Department name is required.");
        }

        Optional<Department> existing =
                departmentRepository
                        .findByNameIgnoreCase(
                                department.getName()
                        );

        if (existing.isPresent()) {

            return ResponseEntity.badRequest()
                    .body(
                        "Department already exists."
                    );
        }

        if (department.getStatus() == null ||
                department.getStatus().trim().isEmpty()) {

            department.setStatus("Active");
        }

        Department saved =
                departmentRepository.save(department);

        return ResponseEntity.ok(saved);
    }

    // ==========================================
    // UPDATE DEPARTMENT
    // ==========================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDepartment(
            @PathVariable Long id,
            @RequestBody Department updatedDepartment) {

        Optional<Department> optionalDepartment =
                departmentRepository.findById(id);

        if (optionalDepartment.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Department department =
                optionalDepartment.get();

        if (updatedDepartment.getName() != null &&
                !updatedDepartment.getName()
                        .trim()
                        .isEmpty()) {

            department.setName(
                    updatedDepartment.getName()
            );
        }

        if (updatedDepartment.getCategory() != null) {

            department.setCategory(
                    updatedDepartment.getCategory()
            );
        }

        if (updatedDepartment.getStatus() != null) {

            department.setStatus(
                    updatedDepartment.getStatus()
            );
        }

        Department saved =
                departmentRepository.save(department);

        return ResponseEntity.ok(saved);
    }

    // ==========================================
    // DELETE DEPARTMENT
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDepartment(
            @PathVariable Long id) {

        if (!departmentRepository.existsById(id)) {

            return ResponseEntity.notFound().build();
        }

        departmentRepository.deleteById(id);

        return ResponseEntity.ok(
                "Department deleted successfully."
        );
    }
}