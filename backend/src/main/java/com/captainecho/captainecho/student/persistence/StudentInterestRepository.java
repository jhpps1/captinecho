package com.captainecho.captainecho.student.persistence;

import com.captainecho.captainecho.student.domain.StudentInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StudentInterestRepository extends JpaRepository<StudentInterest, Integer> {
    void deleteByStudent_StudentId(Integer studentId);
    List<StudentInterest> findByStudent_StudentId(Integer studentId);

    /**
     * 여러 학생의 관심사를 SubInterest와 함께 한 번에 조회 (N+1 방지)
     */
    @Query("""
            SELECT si
            FROM StudentInterest si
            JOIN FETCH si.subInterest
            WHERE si.student.studentId IN :studentIds
            """)
    List<StudentInterest> findByStudentIdsWithSubInterest(@Param("studentIds") List<Integer> studentIds);
}
