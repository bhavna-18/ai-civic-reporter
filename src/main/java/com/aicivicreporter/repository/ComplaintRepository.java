package com.aicivicreporter.repository;

import com.aicivicreporter.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ComplaintRepository
        extends JpaRepository<Complaint, Long> {

    Optional<Complaint> findByComplaintId(String complaintId);

    List<Complaint> findByAssignedDepartment(
            String assignedDepartment
    );

    long countByAssignedDepartment(
            String assignedDepartment
    );

    long countByAssignedDepartmentAndStatus(
            String assignedDepartment,
            String status
    );
    List<Complaint> findByAssignedOfficerIgnoreCase(
        String assignedOfficer
    );
}