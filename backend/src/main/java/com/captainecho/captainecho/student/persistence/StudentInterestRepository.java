package com.captainecho.captainecho.student.persistence;

import com.captainecho.captainecho.student.domain.StudentInterest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentInterestRepository extends JpaRepository<StudentInterest, Integer> {
}
