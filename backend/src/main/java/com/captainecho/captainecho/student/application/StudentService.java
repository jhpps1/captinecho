package com.captainecho.captainecho.student.application;

import com.captainecho.captainecho.adventure.persistence.DayProblemRepository;
import com.captainecho.captainecho.common.domain.PhonemeFeature;
import com.captainecho.captainecho.common.persistence.PhonemeFeatureRepository;
import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.ProtectorErrorCode;
import com.captainecho.captainecho.exception.code.StudentErrorCode;
import com.captainecho.captainecho.interest.domain.SubInterest;
import com.captainecho.captainecho.interest.persistence.SubInterestRepository;
import com.captainecho.captainecho.protector.domain.Protector;
import com.captainecho.captainecho.protector.persistence.ProtectorRepository;
import com.captainecho.captainecho.stats.domain.JamoStat;
import com.captainecho.captainecho.stats.persistence.JamoStatRepository;
import com.captainecho.captainecho.student.application.command.AddStudentInterestCommand;
import com.captainecho.captainecho.student.application.command.DeleteStudentCommand;
import com.captainecho.captainecho.student.application.command.DeleteStudentInterestCommand;
import com.captainecho.captainecho.student.application.command.GetDailyCompletedCountCommand;
import com.captainecho.captainecho.student.application.command.GetDailyGoalCountCommand;
import com.captainecho.captainecho.student.application.command.GetStudentInterestCommand;
import com.captainecho.captainecho.student.application.command.RegisterStudentCommand;
import com.captainecho.captainecho.student.application.command.GetWeeklyGoalPercentCommand;
import com.captainecho.captainecho.student.application.result.AddStudentInterestResult;
import com.captainecho.captainecho.student.application.result.DeleteStudentInterestResult;
import com.captainecho.captainecho.student.application.result.GetDailyCompletedCountResult;
import com.captainecho.captainecho.student.application.result.GetDailyGoalCountResult;
import com.captainecho.captainecho.student.application.result.GetStudentInterestResult;
import com.captainecho.captainecho.student.application.result.RegisterStudentResult;
import com.captainecho.captainecho.student.domain.Student;
import com.captainecho.captainecho.student.domain.StudentInterest;
import com.captainecho.captainecho.student.persistence.StudentInterestRepository;
import com.captainecho.captainecho.student.application.result.GetWeeklyGoalPercentResult;
import com.captainecho.captainecho.student.persistence.StudentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class StudentService {

    private final StudentRepository studentRepository;
    private final StudentInterestRepository studentInterestRepository;
    private final ProtectorRepository protectorRepository;
    private final SubInterestRepository subInterestRepository;
    private final DayProblemRepository dayProblemRepository;
    private final PhonemeFeatureRepository phonemeFeatureRepository;
    private final JamoStatRepository jamoStatRepository;

    @Transactional
    public RegisterStudentResult registerStudent(RegisterStudentCommand command) {
        // 1. Protector 존재 확인
        Protector protector = protectorRepository.findById(command.protectorId())
                .orElseThrow(() -> new EchoException(ProtectorErrorCode.PROTECTOR_NOT_FOUND));

        // 2. 현재 등록된 학생 수 확인 (삭제되지 않은 학생만)
        List<Student> currentStudents = studentRepository.findActiveStudentsByProtectorId(command.protectorId());
        if (currentStudents.size() >= protector.getMaxStudentCount()) {
            throw new EchoException(StudentErrorCode.MAX_STUDENT_COUNT_EXCEEDED);
        }

        // 3. Long interestId를 Short로 변환 (관심사가 있는 경우에만)
        List<Short> shortInterestIds = command.interestIds().stream()
                .map(id -> {
                    if (id > Short.MAX_VALUE || id < Short.MIN_VALUE) {
                        throw new EchoException(StudentErrorCode.INVALID_SUB_INTEREST);
                    }
                    return id.shortValue();
                })
                .collect(Collectors.toList());

        // 4. SubInterest 유효성 검증 (관심사가 있는 경우에만)
        List<SubInterest> subInterests = List.of();
        if (!shortInterestIds.isEmpty()) {
            subInterests = subInterestRepository.findAllById(shortInterestIds);
            if (subInterests.size() != shortInterestIds.size()) {

                throw new EchoException(StudentErrorCode.INVALID_SUB_INTEREST);
            }
        }

        // 5. Student 엔티티 생성 및 저장 (level=1, coin=0)
        Student student = Student.builder()
                .protector(protector)
                .name(command.studentName())
                .gender(command.gender())
                .birth(command.birth())
                .grade(command.grade())
                .level((short) 1)
                .build();

        Student savedStudent = studentRepository.save(student);

        // 6. StudentInterest 엔티티들 생성 및 저장
        List<StudentInterest> studentInterests = subInterests.stream()
                .map(subInterest -> StudentInterest.builder()
                        .student(savedStudent)
                        .subInterest(subInterest)
                        .build())
                .toList();

        studentInterestRepository.saveAll(studentInterests);

        // 7. phoneme_feature 테이블의 모든 자모로 JamoStat 초기화
        List<PhonemeFeature> allPhonemes = phonemeFeatureRepository.findAll();
        List<JamoStat> initialJamoStats = allPhonemes.stream()
                .map(phoneme -> JamoStat.builder()
                        .student(savedStudent)
                        .jamo(String.valueOf(phoneme.getPhoneme()))
                        .totalAttempts((short) 0)
                        .failCount((short) 0)
                        .weeklyFailRate(0.0)
                        .weeklyAccuracyRate(100.0)
                        .updatedAt(java.time.LocalDateTime.now())
                        .build())
                .toList();

        jamoStatRepository.saveAll(initialJamoStats);

        // 8. 결과 반환
        return new RegisterStudentResult(true);
    }

    @Transactional(readOnly = true)
    public GetDailyGoalCountResult getDailyGoalCount(GetDailyGoalCountCommand command) {
        // 1. 학생 존재 여부 확인
        if (!studentRepository.existsById(command.studentId())) {
            throw new EchoException(StudentErrorCode.STUDENT_NOT_FOUND);
        }

        // 2. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 3. 오늘 할당된 문제 개수 조회
        Integer todayGoalCount = dayProblemRepository.countByStudent_StudentIdAndAssignedDate(
                command.studentId(),
                LocalDate.now()
        );

        return GetDailyGoalCountResult.from(todayGoalCount);
    }

    @Transactional(readOnly = true)
    public GetDailyCompletedCountResult getDailyCompletedCount(GetDailyCompletedCountCommand command) {
        // 1. 학생 존재 여부 확인
        if (!studentRepository.existsById(command.studentId())) {
            throw new EchoException(StudentErrorCode.STUDENT_NOT_FOUND);
        }

        // 2. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 3. 오늘 완료한 문제 개수 조회 (isCompleted = true)
        Integer completedCount = dayProblemRepository.countByStudent_StudentIdAndAssignedDateAndIsCompleted(
                command.studentId(),
                LocalDate.now(),
                true
        );

        return GetDailyCompletedCountResult.from(completedCount);
    }

    @Transactional(readOnly = true)
    public GetWeeklyGoalPercentResult getWeeklyGoalPercent(GetWeeklyGoalPercentCommand command) {
        // 1. 학생 존재 여부 확인
        if (!studentRepository.existsById(command.studentId())) {
            throw new EchoException(StudentErrorCode.STUDENT_NOT_FOUND);
        }

        // 2. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 3. 이번 주 범위 계산 (월요일 ~ 일요일)
        LocalDate now = LocalDate.now();
        LocalDate weekStart = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = now.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        // 4. 이번 주 전체 할당된 문제 수
        Integer totalCount = dayProblemRepository.countByStudent_StudentIdAndAssignedDateBetween(
                command.studentId(),
                weekStart,
                weekEnd
        );

        // 5. 이번 주 완료한 문제 수
        Integer completedCount = dayProblemRepository.countByStudent_StudentIdAndAssignedDateBetweenAndIsCompleted(
                command.studentId(),
                weekStart,
                weekEnd,
                true
        );

        // 6. 퍼센트 계산 (0으로 나누기 방지)
        Integer percent = 0;
        if (totalCount > 0) {
            percent = Math.round((completedCount.floatValue() / totalCount.floatValue()) * 100);
        }

        return GetWeeklyGoalPercentResult.from(percent);
    }

    @Transactional
    public void deleteStudent(DeleteStudentCommand command) {
        // 1. 학생 존재 여부 확인
        Student student = studentRepository.findById(command.studentId())
                .orElseThrow(() -> new EchoException(StudentErrorCode.STUDENT_NOT_FOUND));

        // 2. 보호자-학생 관계 확인 (권한 검증)
        if (!student.getProtector().getProtectorId().equals(command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 3. 연관된 StudentInterest 먼저 삭제
        studentInterestRepository.deleteByStudent_StudentId(command.studentId());

        // 4. Student 엔티티 삭제
        studentRepository.delete(student);
    }

    @Transactional(readOnly = true)
    public GetStudentInterestResult getStudentInterests(GetStudentInterestCommand command) {
        // 1. 학생 존재 여부 확인
        if (!studentRepository.existsById(command.studentId())) {
            throw new EchoException(StudentErrorCode.STUDENT_NOT_FOUND);
        }

        // 2. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 3. 학생의 관심사 목록 조회
        List<StudentInterest> studentInterests = studentInterestRepository.findByStudent_StudentId(command.studentId());

        // 4. Result 객체로 변환
        List<GetStudentInterestResult.StudentInterestInfo> interestInfos = studentInterests.stream()
                .map(si -> new GetStudentInterestResult.StudentInterestInfo(
                        si.getSubInterest().getSubInterestId(),
                        si.getSubInterest().getSmallInterestName(),
                        si.getSubInterest().getMajorInterest().getMajorInterestId(),
                        si.getSubInterest().getMajorInterest().getMajorInterestName()
                ))
                .toList();

        return new GetStudentInterestResult(command.studentId(), interestInfos);
    }

    @Transactional
    public AddStudentInterestResult addStudentInterest(AddStudentInterestCommand command) {
        // 1. 학생 존재 여부 확인
        if (!studentRepository.existsById(command.studentId())) {
            throw new EchoException(StudentErrorCode.STUDENT_NOT_FOUND);
        }

        // 2. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 3. 기존 관심사 조회
        List<StudentInterest> existingInterests = studentInterestRepository.findByStudent_StudentId(command.studentId());
        Set<Short> existingSubInterestIds = existingInterests.stream()
                .map(si -> si.getSubInterest().getSubInterestId())
                .collect(Collectors.toSet());

        // 4. 중복 체크
        for (Short subInterestId : command.subInterestIds()) {
            if (existingSubInterestIds.contains(subInterestId)) {
                throw new EchoException(StudentErrorCode.DUPLICATE_INTEREST);
            }
        }

        // 5. 최대 개수 체크 (기존 + 신규 <= 5)
        int totalCount = existingInterests.size() + command.subInterestIds().size();
        if (totalCount > 5) {
            throw new EchoException(StudentErrorCode.INTEREST_LIMIT_EXCEEDED);
        }

        // 6. SubInterest 유효성 검증
        List<SubInterest> subInterests = subInterestRepository.findAllById(command.subInterestIds());
        if (subInterests.size() != command.subInterestIds().size()) {
            throw new EchoException(StudentErrorCode.INVALID_SUB_INTEREST);
        }

        // 7. Student 엔티티 조회
        Student student = studentRepository.findById(command.studentId())
                .orElseThrow(() -> new EchoException(StudentErrorCode.STUDENT_NOT_FOUND));

        // 8. 새 StudentInterest 엔티티들 생성 및 저장
        List<StudentInterest> newStudentInterests = subInterests.stream()
                .map(subInterest -> StudentInterest.builder()
                        .student(student)
                        .subInterest(subInterest)
                        .build())
                .toList();

        studentInterestRepository.saveAll(newStudentInterests);

        // 9. 성공 결과 반환
        return new AddStudentInterestResult(true);
    }

    @Transactional
    public DeleteStudentInterestResult deleteStudentInterest(DeleteStudentInterestCommand command) {
        // 1. 학생 존재 여부 확인
        if (!studentRepository.existsById(command.studentId())) {
            throw new EchoException(StudentErrorCode.STUDENT_NOT_FOUND);
        }

        // 2. 보호자-학생 관계 확인 (접근 권한)
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 3. StudentInterest 존재 확인
        StudentInterest studentInterest = studentInterestRepository.findById(command.studentInterestId())
                .orElseThrow(() -> new EchoException(StudentErrorCode.STUDENT_INTEREST_NOT_FOUND));

        // 4. StudentInterest가 실제로 해당 학생의 것인지 확인
        if (!studentInterest.getStudent().getStudentId().equals(command.studentId())) {
            throw new EchoException(StudentErrorCode.STUDENT_INTEREST_NOT_FOUND);
        }

        // 5. StudentInterest 삭제 (hard delete)
        studentInterestRepository.delete(studentInterest);

        // 6. 성공 결과 반환
        return new DeleteStudentInterestResult(true);
    }
}
