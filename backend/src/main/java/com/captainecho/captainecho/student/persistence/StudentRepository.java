package com.captainecho.captainecho.student.persistence;

import com.captainecho.captainecho.student.domain.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Integer> {

    /**
     * 특정 보호자의 학생 목록 조회
     */
    List<Student> findByProtector_ProtectorId(Long protectorId);

    /**
     * 특정 학생이 특정 보호자에게 속하는지 확인
     */
    @Query("""
            SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END
            FROM Student s
            WHERE s.studentId = :studentId
              AND s.protector.protectorId = :protectorId
            """)
    boolean existsByStudentIdAndProtectorId(
            @Param("studentId") Integer studentId,
            @Param("protectorId") Long protectorId
    );

    /**
     * 학생 ID와 보호자 ID로 학생 조회
     */
    @Query("""
            SELECT s
            FROM Student s
            WHERE s.studentId = :studentId
              AND s.protector.protectorId = :protectorId
            """)
    Optional<Student> findByStudentIdAndProtectorId(
            @Param("studentId") Integer studentId,
            @Param("protectorId") Long protectorId
    );
}
