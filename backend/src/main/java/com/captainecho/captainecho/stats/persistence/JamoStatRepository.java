package com.captainecho.captainecho.stats.persistence;

import com.captainecho.captainecho.stats.domain.JamoStat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JamoStatRepository extends JpaRepository<JamoStat, Integer> {
    /**
     * 특정 학생의 특정 자모 통계 조회
     */
    Optional<JamoStat> findByStudent_StudentIdAndJamo(Integer studentId, String jamo);
}
