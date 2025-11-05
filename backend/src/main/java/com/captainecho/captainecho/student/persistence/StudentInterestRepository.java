package com.captainecho.captainecho.student.persistence;

import com.captainecho.captainecho.student.domain.StudentInterest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentInterestRepository extends JpaRepository<StudentInterest, Integer> {
    List<StudentInterest> findByStudent_StudentId(Integer studentId);
}
