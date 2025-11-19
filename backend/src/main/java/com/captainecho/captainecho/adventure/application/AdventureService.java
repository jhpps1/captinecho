package com.captainecho.captainecho.adventure.application;

import com.captainecho.captainecho.adventure.domain.DayProblem;
import com.captainecho.captainecho.adventure.persistence.DayProblemRepository;
import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.StudentErrorCode;
import com.captainecho.captainecho.session.domain.LearningSession;
import com.captainecho.captainecho.session.persistence.LearningSessionRepository;
import com.captainecho.captainecho.student.application.command.EndAdventureCommand;
import com.captainecho.captainecho.student.application.command.GetAdventureProblemsCommand;
import com.captainecho.captainecho.student.application.command.GetSupplementaryProblemsCommand;
import com.captainecho.captainecho.student.application.command.StartAdventureCommand;
import com.captainecho.captainecho.student.application.result.EndAdventureResult;
import com.captainecho.captainecho.student.application.result.GetAdventureProblemsResult;
import com.captainecho.captainecho.student.application.result.GetSupplementaryProblemsResult;
import com.captainecho.captainecho.student.application.result.StartAdventureResult;
import com.captainecho.captainecho.student.domain.Student;
import com.captainecho.captainecho.student.persistence.StudentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class AdventureService {

    private final StudentRepository studentRepository;
    private final LearningSessionRepository learningSessionRepository;
    private final DayProblemRepository dayProblemRepository;

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

    @Transactional(readOnly = true)
    public GetAdventureProblemsResult getAdventureProblems(GetAdventureProblemsCommand command) {
        log.info("getAdventureProblems called - studentId: {}, protectorId: {}", command.studentId(), command.protectorId());

        // 1. 학생 존재 여부 확인
        if (!studentRepository.existsById(command.studentId())) {
            log.error("Student not found - studentId: {}", command.studentId());
            throw new EchoException(StudentErrorCode.STUDENT_NOT_FOUND);
        }

        // 2. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            log.error("Student access denied - studentId: {}, protectorId: {}", command.studentId(), command.protectorId());
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 3. 오늘 날짜의 미완료 문제 목록 조회 (isCompleted = false)
        LocalDate today = LocalDate.now();
        log.info("Fetching problems for date: {}", today);

        List<DayProblem> dayProblems = dayProblemRepository
                .findByStudent_StudentIdAndAssignedDateAndIsCompletedOrderBySeqNoAsc(
                        command.studentId(),
                        today,
                        false
                );

        log.info("Found {} problems", dayProblems.size());

        // 4. DayProblem -> ProblemInfo 변환
        List<GetAdventureProblemsResult.ProblemInfo> problemInfos = dayProblems.stream()
                .map(dp -> {
                    // Null-safe array to list conversion
                    List<String> problemPhonemes = dp.getProblemPhonemes() != null
                            ? Arrays.asList(dp.getProblemPhonemes())
                            : List.of();

                    List<String> choices = dp.getChoices() != null
                            ? Arrays.asList(dp.getChoices())
                            : null;

                    return new GetAdventureProblemsResult.ProblemInfo(
                            dp.getDayProblemId(),
                            dp.getStudent().getStudentId(),
                            dp.getSubInterest().getSubInterestId(),
                            dp.getAdventureType().getAdventureTypeId(),
                            dp.getAssignedDate(),
                            dp.getSeqNo(),
                            dp.getLevel(),
                            dp.getProblemText(),
//                            dp.getHint(),
                            dp.getImageUrl(),
                            dp.getSoundUrl(),
                            problemPhonemes,
                            dp.getBlankPosition(),
                            dp.getBlankPhoneme(),
                            choices,
                            dp.getCorrectAnswer(),
                            dp.getIsCompleted()
                    );
                })
                .toList();

        return GetAdventureProblemsResult.of(problemInfos, problemInfos.size());
    }

    @Transactional(readOnly = true)
    public GetSupplementaryProblemsResult getSupplementaryProblems(GetSupplementaryProblemsCommand command) {
        log.info("getSupplementaryProblems called - studentId: {}, protectorId: {}, adventureTypeId: {}",
                command.studentId(), command.protectorId(), command.adventureTypeId());

        // 1. 학생 존재 여부 및 레벨 조회
        Student student = studentRepository.findById(command.studentId())
                .orElseThrow(() -> new EchoException(StudentErrorCode.STUDENT_NOT_FOUND));

        // 2. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            log.error("Student access denied - studentId: {}, protectorId: {}", command.studentId(), command.protectorId());
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 3. 학생의 레벨 가져오기
        Short level = student.getLevel();
        log.info("Student level: {}", level);

        // 4. 탐험 타입과 레벨에 맞는 랜덤 문제 ID 10개 조회 (1개 쿼리)
        List<Integer> problemIds = dayProblemRepository.findRandomSupplementaryProblemIds(
                command.adventureTypeId(),
                level
        );

        if (problemIds.isEmpty()) {
            log.info("No supplementary problems found");
            return GetSupplementaryProblemsResult.of(List.of());
        }

        // 5. 문제 ID로 문제들을 연관 엔티티와 함께 조회 (1개 쿼리, Fetch Join으로 N+1 방지)
        List<DayProblem> dayProblems = dayProblemRepository.findByIdInWithAssociations(problemIds);

        log.info("Found {} supplementary problems", dayProblems.size());

        // 6. DayProblem -> ProblemInfo 변환
        List<GetSupplementaryProblemsResult.ProblemInfo> problemInfos = dayProblems.stream()
                .map(dp -> {
                    // Null-safe array to list conversion
                    List<String> problemPhonemes = dp.getProblemPhonemes() != null
                            ? Arrays.asList(dp.getProblemPhonemes())
                            : List.of();

                    List<String> choices = dp.getChoices() != null
                            ? Arrays.asList(dp.getChoices())
                            : null;

                    return new GetSupplementaryProblemsResult.ProblemInfo(
                            dp.getDayProblemId(),
                            dp.getStudent().getStudentId(),
                            dp.getSubInterest().getSubInterestId(),
                            dp.getAdventureType().getAdventureTypeId(),
                            dp.getAssignedDate(),
                            dp.getSeqNo(),
                            dp.getLevel(),
                            dp.getProblemText(),
//                            dp.getHint(),
                            dp.getImageUrl(),
                            dp.getSoundUrl(),
                            problemPhonemes,
                            dp.getBlankPosition(),
                            dp.getBlankPhoneme(),
                            choices,
                            dp.getCorrectAnswer(),
                            dp.getIsCompleted()
                    );
                })
                .toList();

        return GetSupplementaryProblemsResult.of(problemInfos);
    }
}
