package com.aicivicreporter.repository;

import com.aicivicreporter.model.Officer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OfficerRepository extends JpaRepository<Officer, Long> {

    Optional<Officer> findByEmployeeId(String employeeId);

    Optional<Officer> findByEmail(String email);

    List<Officer> findByDepartmentIgnoreCase(String department);

    long countByDepartmentIgnoreCase(String department);

    long countByDepartmentIgnoreCaseAndStatusIgnoreCase(
            String department,
            String status
    );
}