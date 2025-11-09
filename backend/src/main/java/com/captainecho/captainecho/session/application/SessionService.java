package com.captainecho.captainecho.session.application;

import com.captainecho.captainecho.adventure.domain.DayProblem;
import com.captainecho.captainecho.adventure.persistence.DayProblemRepository;
import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.StudentErrorCode;
import com.captainecho.captainecho.session.domain.ErrorPattern;
import com.captainecho.captainecho.session.domain.LearningSession;
import com.captainecho.captainecho.session.domain.PhonemePosition;
import com.captainecho.captainecho.session.persistence.ErrorPatternRepository;
import com.captainecho.captainecho.session.persistence.LearningSessionRepository;
import com.captainecho.captainecho.stats.domain.JamoStat;
import com.captainecho.captainecho.stats.persistence.JamoStatRepository;
import com.captainecho.captainecho.student.application.command.RecordAnswerCommand;
import com.captainecho.captainecho.student.application.result.RecordAnswerResult;
import com.captainecho.captainecho.student.domain.Student;
import com.captainecho.captainecho.student.persistence.StudentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class SessionService {

    private final StudentRepository studentRepository;
    private final LearningSessionRepository learningSessionRepository;
    private final ErrorPatternRepository errorPatternRepository;
    private final JamoStatRepository jamoStatRepository;
    private final DayProblemRepository dayProblemRepository;

    @Transactional
    public RecordAnswerResult recordAnswer(RecordAnswerCommand command) {
        log.info("recordAnswer called - studentId: {}, isCorrect: {}, realJamo: {}",
                command.studentId(), command.isCorrect(), command.realJamo());

        // 1. 학생 존재 여부 확인
        Student student = studentRepository.findById(command.studentId())
                .orElseThrow(() -> new EchoException(StudentErrorCode.STUDENT_NOT_FOUND));

        // 2. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            log.error("Student access denied - studentId: {}, protectorId: {}",
                    command.studentId(), command.protectorId());
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 3. 진행 중인 학습 세션 조회
        LearningSession session = learningSessionRepository
                .findLatestOngoingSessionByStudentId(command.studentId())
                .orElseThrow(() -> new EchoException(StudentErrorCode.NO_ONGOING_SESSION));

        // 4. 오답인 경우 오류 패턴 저장
        if (!command.isCorrect() && command.realJamo() != null && command.confusionJamo() != null) {
            PhonemePosition position = command.phonemePosition() != null
                    ? PhonemePosition.valueOf(command.phonemePosition().toUpperCase())
                    : null;

            ErrorPattern errorPattern = ErrorPattern.builder()
                    .learningSession(session)
                    .realJamo(command.realJamo().charAt(0))
                    .confusionJamo(command.confusionJamo().charAt(0))
                    .phonemePosition(position)
                    .build();

            errorPatternRepository.save(errorPattern);
            log.info("Error pattern saved - realJamo: {}, confusionJamo: {}",
                    command.realJamo(), command.confusionJamo());
        }

        // 5. JamoStat 업데이트
        if (command.realJamo() != null && !command.realJamo().isEmpty()) {
            JamoStat jamoStat = jamoStatRepository
                    .findByStudent_StudentIdAndJamo(command.studentId(), command.realJamo())
                    .orElseGet(() -> {
                        // 없으면 새로 생성
                        JamoStat newStat = JamoStat.builder()
                                .student(student)
                                .jamo(command.realJamo())
                                .totalAttempts((short) 0)
                                .failCount((short) 0)
                                .weeklyFailRate(0.0)
                                .weeklyAccuracyRate(100.0)
                                .updatedAt(LocalDateTime.now())
                                .build();
                        return jamoStatRepository.save(newStat);
                    });

            // 정답/오답에 따라 통계 업데이트
            if (command.isCorrect()) {
                jamoStat.recordCorrectAnswer();
                log.info("Correct answer recorded for jamo: {}", command.realJamo());
            } else {
                jamoStat.recordIncorrectAnswer();
                log.info("Incorrect answer recorded for jamo: {}", command.realJamo());
            }

            // 변경사항 저장 (더티 체킹으로 자동 저장되지만 명시적으로 호출)
            jamoStatRepository.save(jamoStat);
        }

        // 6. DAILY 학습이면서 정답인 경우, 해당 문제를 완료 처리
        if ("DAILY".equalsIgnoreCase(command.studyType()) &&
            command.isCorrect() &&
            command.dayProblemId() != null) {

            DayProblem dayProblem = dayProblemRepository.findById(command.dayProblemId())
                    .orElseThrow(() -> new EchoException(StudentErrorCode.PROBLEM_NOT_FOUND));

            // 학생에게 할당된 문제인지 확인
            if (!dayProblem.getStudent().getStudentId().equals(command.studentId())) {
                log.error("DayProblem not assigned to student - dayProblemId: {}, studentId: {}",
                        command.dayProblemId(), command.studentId());
                throw new EchoException(StudentErrorCode.PROBLEM_NOT_ASSIGNED);
            }

            if (!dayProblem.getIsCompleted()) {
                dayProblem.complete();
                dayProblemRepository.save(dayProblem);
                log.info("DayProblem completed - dayProblemId: {}", command.dayProblemId());
            }
        }

        return RecordAnswerResult.from(true);
    }
}
