package com.captainecho.captainecho.diagnosis.persistence;

import com.captainecho.captainecho.diagnosis.domain.InitialDiagnosisProblem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InitialDiagnosisProblemRepository extends JpaRepository<InitialDiagnosisProblem, Integer> {
}
