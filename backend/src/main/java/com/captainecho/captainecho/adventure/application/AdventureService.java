package com.captainecho.captainecho.adventure.application;

import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.StudentErrorCode;
import com.captainecho.captainecho.session.domain.LearningSession;
import com.captainecho.captainecho.session.persistence.LearningSessionRepository;
import com.captainecho.captainecho.student.application.command.EndAdventureCommand;
import com.captainecho.captainecho.student.application.command.StartAdventureCommand;
import com.captainecho.captainecho.student.application.result.EndAdventureResult;
import com.captainecho.captainecho.student.application.result.StartAdventureResult;
import com.captainecho.captainecho.student.domain.Student;
import com.captainecho.captainecho.student.persistence.StudentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class AdventureService {

    private final StudentRepository studentRepository;
    private final LearningSessionRepository learningSessionRepository;

    @Transactional
    public StartAdventureResult startAdventure(StartAdventureCommand command) {
        // 1. 학생 존재 여부 확인
        Student student = studentRepository.findById(command.studentId())
                .orElseThrow(() -> new EchoException(StudentErrorCode.STUDENT_NOT_FOUND));

        // 2. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 3. 이미 진행 중인 세션이 있는지 확인
        if (learningSessionRepository.findLatestOngoingSessionByStudentId(command.studentId()).isPresent()) {
            throw new EchoException(StudentErrorCode.SESSION_ALREADY_IN_PROGRESS);
        }

        // 4. LearningSession 생성 및 저장 (startTime만 설정, endTime은 null)
        LearningSession session = LearningSession.builder()
                .student(student)
                .studyType(command.studyType())
                .startTime(LocalDateTime.now())
                .endTime(null)
                .build();

        LearningSession savedSession = learningSessionRepository.save(session);

        return StartAdventureResult.from(savedSession.getSessionId());
    }

    @Transactional
    public EndAdventureResult endAdventure(EndAdventureCommand command) {
        // 1. 학생 존재 여부 확인
        if (!studentRepository.existsById(command.studentId())) {
            throw new EchoException(StudentErrorCode.STUDENT_NOT_FOUND);
        }

        // 2. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 3. 가장 최근 진행 중인 세션 조회 (endTime이 null인 것)
        LearningSession session = learningSessionRepository.findLatestOngoingSessionByStudentId(command.studentId())
                .orElseThrow(() -> new EchoException(StudentErrorCode.NO_ONGOING_SESSION));

        // 4. endTime 업데이트
        session.updateEndTime(LocalDateTime.now());

        return EndAdventureResult.from(true);
    }
}
