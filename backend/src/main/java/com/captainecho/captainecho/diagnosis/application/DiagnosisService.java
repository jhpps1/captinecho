package com.captainecho.captainecho.diagnosis.application;

import com.captainecho.captainecho.diagnosis.application.command.EndInitialDiagnosisCommand;
import com.captainecho.captainecho.diagnosis.application.command.StartInitialDiagnosisCommand;
import com.captainecho.captainecho.diagnosis.application.command.SubmitDiagnosisResultCommand;
import com.captainecho.captainecho.diagnosis.application.result.EndInitialDiagnosisResult;
import com.captainecho.captainecho.diagnosis.application.result.GetDiagnosisResultResult;
import com.captainecho.captainecho.diagnosis.application.result.GetInitialDiagnosisProblemsResult;
import com.captainecho.captainecho.diagnosis.application.result.InitialDiagnosisProblemDto;
import com.captainecho.captainecho.diagnosis.application.result.StartInitialDiagnosisResult;
import com.captainecho.captainecho.diagnosis.application.result.SubmitDiagnosisResultResult;
import com.captainecho.captainecho.diagnosis.domain.DiagnosisType;
import com.captainecho.captainecho.diagnosis.domain.DiagnosisSession;
import com.captainecho.captainecho.diagnosis.domain.InitialDiagnosisProblem;
import com.captainecho.captainecho.diagnosis.domain.InitialDiagnosisResult;
import com.captainecho.captainecho.diagnosis.persistence.DiagnosisSessionRepository;
import com.captainecho.captainecho.diagnosis.persistence.InitialDiagnosisProblemRepository;
import com.captainecho.captainecho.diagnosis.persistence.InitialDiagnosisResultRepository;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class DiagnosisService {

    private final StudentRepository studentRepository;
    private final DiagnosisSessionRepository diagnosisSessionRepository;
    private final InitialDiagnosisProblemRepository initialDiagnosisProblemRepository;
    private final InitialDiagnosisResultRepository initialDiagnosisResultRepository;

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

    @Transactional(readOnly = true)
    public GetInitialDiagnosisProblemsResult getInitialDiagnosisProblems(Integer studentId, Integer protectorId) {
        // 1. 학생 존재 여부 확인
        studentRepository.findById(studentId)
                .orElseThrow(() -> new EchoException(StudentErrorCode.STUDENT_NOT_FOUND));

        // 2. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(studentId, protectorId)) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 3. 모든 초기 진단 문제 조회
        List<InitialDiagnosisProblem> problems = initialDiagnosisProblemRepository.findAll();

        // 4. DTO로 변환
        List<InitialDiagnosisProblemDto> dtos = problems.stream()
                .map(problem -> InitialDiagnosisProblemDto.builder()
                        .initialDiagnosisProblemId(problem.getInitialDiagnosisProblemId())
                        .diagnosisType(problem.getDiagnosisType())
                        .problem(problem.getProblem())
                        .choices(problem.getChoices())
                        .problemImageUrl(problem.getProblemImageUrl())
                        .problemSoundUrl(problem.getProblemSoundUrl())
                        .correctAnswer(problem.getCorrectAnswer())
                        .build())
                .toList();

        return new GetInitialDiagnosisProblemsResult(dtos);
    }

    @Transactional
    public SubmitDiagnosisResultResult submitDiagnosisResult(SubmitDiagnosisResultCommand command) {
        // 1. 학생 존재 여부 확인
        Student student = studentRepository.findById(command.studentId())
                .orElseThrow(() -> new EchoException(StudentErrorCode.STUDENT_NOT_FOUND));

        // 2. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 3. 각 답변을 저장
        for (SubmitDiagnosisResultCommand.DiagnosisAnswer answer : command.results()) {
            // 3-1. 문제 존재 여부 확인
            InitialDiagnosisProblem problem = initialDiagnosisProblemRepository.findById(answer.questionId())
                    .orElseThrow(() -> new EchoException(DiagnosisErrorCode.DIAGNOSIS_PROBLEM_NOT_FOUND));

            // 3-2. 정답 여부 확인
            Boolean isCorrect = problem.getCorrectAnswer().equals(answer.answer());

            // 3-3. 결과 저장
            InitialDiagnosisResult result = InitialDiagnosisResult.builder()
                    .initialDiagnosisProblem(problem)
                    .student(student)
                    .studentAnswer(answer.answer())
                    .isCorrect(isCorrect)
                    .build();

            initialDiagnosisResultRepository.save(result);
        }

        return SubmitDiagnosisResultResult.from(true);
    }

    @Transactional(readOnly = true)
    public GetDiagnosisResultResult getDiagnosisResult(Integer studentId, Integer protectorId) {
        // 1. 학생 존재 여부 확인
        if (!studentRepository.existsById(studentId)) {
            throw new EchoException(StudentErrorCode.STUDENT_NOT_FOUND);
        }

        // 2. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(studentId, protectorId)) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 3. 학생의 모든 진단 결과 조회
        List<InitialDiagnosisResult> allResults = initialDiagnosisResultRepository
                .findAllByStudentIdWithProblem(studentId);

        if (allResults.isEmpty()) {
            throw new EchoException(DiagnosisErrorCode.DIAGNOSIS_SESSION_NOT_FOUND);
        }

        // 4. 전체 통계 계산
        int totalCount = allResults.size();
        int totalCorrectCount = (int) allResults.stream()
                .filter(InitialDiagnosisResult::getIsCorrect)
                .count();
        int totalScore = totalCount > 0 ? (totalCorrectCount * 100 / totalCount) : 0;

        // 5. 진단 타입별로 그룹화
        Map<DiagnosisType, List<InitialDiagnosisResult>> groupedByType = allResults.stream()
                .collect(Collectors.groupingBy(
                        result -> result.getInitialDiagnosisProblem().getDiagnosisType()
                ));

        // 6. 진단 타입별 결과 생성
        List<GetDiagnosisResultResult.DiagnosisTypeResult> diagnosisTypeResults = new ArrayList<>();

        for (Map.Entry<DiagnosisType, List<InitialDiagnosisResult>> entry : groupedByType.entrySet()) {
            DiagnosisType type = entry.getKey();
            List<InitialDiagnosisResult> typeResults = entry.getValue();

            int typeTotal = typeResults.size();
            int typeCorrect = (int) typeResults.stream()
                    .filter(InitialDiagnosisResult::getIsCorrect)
                    .count();
            int typeScore = typeTotal > 0 ? (typeCorrect * 100 / typeTotal) : 0;

            // 상세 결과 생성
            List<GetDiagnosisResultResult.DetailedResult> detailedResults = typeResults.stream()
                    .map(result -> new GetDiagnosisResultResult.DetailedResult(
                            result.getInitialDiagnosisResultId(),
                            result.getInitialDiagnosisProblem().getInitialDiagnosisProblemId(),
                            result.getInitialDiagnosisProblem().getDiagnosisType(),
                            result.getInitialDiagnosisProblem().getProblem(),
                            result.getStudentAnswer(),
                            result.getInitialDiagnosisProblem().getCorrectAnswer(),
                            result.getIsCorrect()
                    ))
                    .collect(Collectors.toList());

            diagnosisTypeResults.add(new GetDiagnosisResultResult.DiagnosisTypeResult(
                    type,
                    typeTotal,
                    typeCorrect,
                    typeScore,
                    detailedResults
            ));
        }

        return GetDiagnosisResultResult.of(
                studentId,
                totalScore,
                totalCount,
                totalCorrectCount,
                diagnosisTypeResults
        );
    }
}
