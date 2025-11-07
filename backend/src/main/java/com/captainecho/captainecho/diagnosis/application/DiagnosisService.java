package com.captainecho.captainecho.diagnosis.application;

import com.captainecho.captainecho.diagnosis.application.command.EndInitialDiagnosisCommand;
import com.captainecho.captainecho.diagnosis.application.command.StartInitialDiagnosisCommand;
import com.captainecho.captainecho.diagnosis.application.result.EndInitialDiagnosisResult;
import com.captainecho.captainecho.diagnosis.application.result.StartInitialDiagnosisResult;
import com.captainecho.captainecho.diagnosis.domain.DiagnosisSession;
import com.captainecho.captainecho.diagnosis.persistence.DiagnosisSessionRepository;
import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.DiagnosisErrorCode;
import com.captainecho.captainecho.exception.code.StudentErrorCode;
import com.captainecho.captainecho.student.domain.Student;
import com.captainecho.captainecho.student.persistence.StudentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class DiagnosisService {

    private final StudentRepository studentRepository;
    private final DiagnosisSessionRepository diagnosisSessionRepository;

    @Transactional
    public StartInitialDiagnosisResult startInitialDiagnosis(StartInitialDiagnosisCommand command) {
        // 1. 학생 존재 여부 확인
        Student student = studentRepository.findById(command.studentId())
                .orElseThrow(() -> new EchoException(StudentErrorCode.STUDENT_NOT_FOUND));

        // 2. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 3. 이미 진행 중인 진단 세션이 있는지 확인
        if (diagnosisSessionRepository.existsByStudentStudentIdAndEndTimeIsNull(command.studentId())) {
            throw new EchoException(DiagnosisErrorCode.DIAGNOSIS_SESSION_ALREADY_IN_PROGRESS);
        }

        // 4. DiagnosisSession 생성 및 저장 (startTime만 설정, endTime은 null)
        DiagnosisSession session = DiagnosisSession.builder()
                .student(student)
                .startTime(LocalDateTime.now())
                .endTime(null)
                .build();

        DiagnosisSession savedSession = diagnosisSessionRepository.save(session);

        return new StartInitialDiagnosisResult(savedSession.getStudentId());
    }

    @Transactional
    public EndInitialDiagnosisResult endInitialDiagnosis(EndInitialDiagnosisCommand command) {
        // 1. 학생 존재 여부 확인
        Student student = studentRepository.findById(command.studentId())
                .orElseThrow(() -> new EchoException(StudentErrorCode.STUDENT_NOT_FOUND));

        // 2. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 3. 진행 중인 진단 세션 조회
        DiagnosisSession session = diagnosisSessionRepository.findByStudentStudentIdAndEndTimeIsNull(command.studentId())
                .orElseThrow(() -> new EchoException(DiagnosisErrorCode.DIAGNOSIS_SESSION_NOT_FOUND));

        // 4. 진단 세션 종료
        session.completeSession();

        return new EndInitialDiagnosisResult(
                session.getStudentId(),
                session.getStartTime(),
                session.getEndTime()
        );
    }
}
