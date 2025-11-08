package com.captainecho.captainecho.diagnosis.persistence;

import com.captainecho.captainecho.diagnosis.domain.InitialDiagnosisResult;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InitialDiagnosisResultRepository extends JpaRepository<InitialDiagnosisResult, Integer> {
}
