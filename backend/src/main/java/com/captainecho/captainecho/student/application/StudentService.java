package com.captainecho.captainecho.student.application;

import com.captainecho.captainecho.adventure.persistence.DayProblemRepository;
import com.captainecho.captainecho.common.domain.PhonemeFeature;
import com.captainecho.captainecho.common.persistence.PhonemeFeatureRepository;
import com.captainecho.captainecho.common.storage.FileStorageService;
import com.captainecho.captainecho.config.FileStorageProperties;

import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.ProtectorErrorCode;
import com.captainecho.captainecho.exception.code.StudentErrorCode;
import com.captainecho.captainecho.interest.domain.SubInterest;
import com.captainecho.captainecho.interest.persistence.SubInterestRepository;
import com.captainecho.captainecho.protector.domain.Protector;
import com.captainecho.captainecho.protector.persistence.ProtectorRepository;
import com.captainecho.captainecho.stats.domain.JamoStat;
import com.captainecho.captainecho.stats.domain.WeeklyJamoStat;
import com.captainecho.captainecho.stats.domain.WeeklyPersonalReport;
import com.captainecho.captainecho.stats.persistence.JamoStatRepository;
import com.captainecho.captainecho.stats.persistence.WeeklyJamoStatRepository;
import com.captainecho.captainecho.stats.persistence.WeeklyPersonalReportRepository;
import com.captainecho.captainecho.student.application.command.AddStudentInterestCommand;
import com.captainecho.captainecho.student.application.command.DeleteStudentCommand;
import com.captainecho.captainecho.student.application.command.DeleteStudentInterestCommand;
import com.captainecho.captainecho.student.application.command.GetDailyCompletedCountCommand;
import com.captainecho.captainecho.student.application.command.GetDailyGoalCountCommand;
import com.captainecho.captainecho.student.application.command.GetDailyStreakCommand;
import com.captainecho.captainecho.student.application.command.GetImproveAccuracyCommand;
import com.captainecho.captainecho.student.application.command.GetStudentInterestCommand;
import com.captainecho.captainecho.student.application.command.GetTotalJamoStatCommand;
import com.captainecho.captainecho.student.application.command.GetWeeklyJamoStatCommand;
import com.captainecho.captainecho.student.application.command.GetBestImproveJamoCommand;
import com.captainecho.captainecho.student.application.command.GetWorstImproveJamoCommand;
import com.captainecho.captainecho.student.application.command.RegisterStudentCommand;
import com.captainecho.captainecho.student.application.event.FileDeleteEvent;

import com.captainecho.captainecho.student.application.command.GetWeeklyGoalPercentCommand;
import com.captainecho.captainecho.student.application.command.UpdateProfileImageCommand;
import com.captainecho.captainecho.student.application.command.UpdatePinCommand;
import com.captainecho.captainecho.student.application.command.UpdateStudentCommand;
import com.captainecho.captainecho.student.application.command.VerifyPinCommand;
import com.captainecho.captainecho.student.application.result.AddStudentInterestResult;
import com.captainecho.captainecho.student.application.result.DeleteStudentInterestResult;
import com.captainecho.captainecho.student.application.result.GetDailyCompletedCountResult;
import com.captainecho.captainecho.student.application.result.GetDailyGoalCountResult;
import com.captainecho.captainecho.student.application.result.GetDailyStreakResult;
import com.captainecho.captainecho.student.application.result.GetImproveAccuracyResult;
import com.captainecho.captainecho.student.application.result.GetStudentInterestResult;
import com.captainecho.captainecho.student.application.result.GetTotalJamoStatResult;
import com.captainecho.captainecho.student.application.result.GetWeeklyJamoStatResult;
import com.captainecho.captainecho.student.application.result.GetBestImproveJamoResult;
import com.captainecho.captainecho.student.application.result.GetWorstImproveJamoResult;
import com.captainecho.captainecho.student.application.result.RegisterStudentResult;
import com.captainecho.captainecho.student.application.result.UpdateProfileImageResult;
import com.captainecho.captainecho.student.application.result.UpdatePinResult;
import com.captainecho.captainecho.student.application.result.UpdateStudentResult;
import com.captainecho.captainecho.student.application.result.VerifyPinResult;
import com.captainecho.captainecho.student.domain.Student;
import com.captainecho.captainecho.student.domain.StudentInterest;
import com.captainecho.captainecho.student.persistence.StudentInterestRepository;
import com.captainecho.captainecho.student.application.result.GetWeeklyGoalPercentResult;
import com.captainecho.captainecho.student.persistence.StudentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
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
    private final WeeklyJamoStatRepository weeklyJamoStatRepository;
    private final WeeklyPersonalReportRepository weeklyPersonalReportRepository;
    private final FileStorageProperties fileStorageProperties;
    private final ApplicationEventPublisher eventPublisher;
    private final FileStorageService fileStorageService;

    @Transactional
    public RegisterStudentResult registerStudent(RegisterStudentCommand command) {
        // 1. Protector 존재 확인
        Protector protector = protectorRepository.findById(command.protectorId())
                .orElseThrow(() -> new EchoException(ProtectorErrorCode.PROTECTOR_NOT_FOUND));

        // 2. 탈퇴한 회원인지 확인
        if (protector.getIsDeleted()) {
            throw new EchoException(ProtectorErrorCode.ALREADY_DELETED);
        }

        // 3. 현재 등록된 학생 수 확인 (삭제되지 않은 학생만)
        List<Student> currentStudents = studentRepository.findActiveStudentsByProtectorId(command.protectorId());
        if (currentStudents.size() >= protector.getMaxStudentCount()) {
            throw new EchoException(StudentErrorCode.MAX_STUDENT_COUNT_EXCEEDED);
        }

        // 4. Long interestId를 Short로 변환 (관심사가 있는 경우에만)
        List<Short> shortInterestIds = command.interestIds().stream()
                .map(id -> {
                    if (id > Short.MAX_VALUE || id < Short.MIN_VALUE) {
                        throw new EchoException(StudentErrorCode.INVALID_SUB_INTEREST);
                    }
                    return id.shortValue();
                })
                .collect(Collectors.toList());

        // 5. SubInterest 유효성 검증 (관심사가 있는 경우에만)
        List<SubInterest> subInterests = List.of();
        if (!shortInterestIds.isEmpty()) {
            subInterests = subInterestRepository.findAllById(shortInterestIds);
            if (subInterests.size() != shortInterestIds.size()) {

                throw new EchoException(StudentErrorCode.INVALID_SUB_INTEREST);
            }
        }

        // 6. Student 엔티티 생성 및 저장 (level=null for initial diagnosis, coin=0, studentPin=0000은 엔티티 기본값)
        Student student = Student.builder()
                .protector(protector)
                .name(command.studentName())
                .gender(command.gender())
                .birth(command.birth())
                .grade(command.grade())
                .level(null)  // null로 설정하여 초기진단 필요 표시
                .build();

        Student savedStudent = studentRepository.save(student);

        // 7. StudentInterest 엔티티들 생성 및 저장
        List<StudentInterest> studentInterests = subInterests.stream()
                .map(subInterest -> StudentInterest.builder()
                        .student(savedStudent)
                        .subInterest(subInterest)
                        .build())
                .toList();

        studentInterestRepository.saveAll(studentInterests);

        // 8. phoneme_feature 테이블의 모든 자모로 JamoStat 초기화
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

        // 9. 결과 반환
        return new RegisterStudentResult(true);
    }

    @Transactional(readOnly = true)
    public GetDailyGoalCountResult getDailyGoalCount(GetDailyGoalCountCommand command) {
        // 1. 학생 존재 여부 및 삭제 여부 확인
        getActiveStudent(command.studentId());

        // 2. 보호자 탈퇴 여부 확인
        Protector protector = protectorRepository.findById(command.protectorId())
                .orElseThrow(() -> new EchoException(ProtectorErrorCode.PROTECTOR_NOT_FOUND));
        if (protector.getIsDeleted()) {
            throw new EchoException(ProtectorErrorCode.ALREADY_DELETED);
        }

        // 3. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 4. 오늘 할당된 문제 개수 조회
        Integer todayGoalCount = dayProblemRepository.countByStudent_StudentIdAndAssignedDate(
                command.studentId(),
                LocalDate.now()
        );

        return GetDailyGoalCountResult.from(todayGoalCount);
    }

    @Transactional(readOnly = true)
    public GetDailyCompletedCountResult getDailyCompletedCount(GetDailyCompletedCountCommand command) {
        // 1. 학생 존재 여부 및 삭제 여부 확인
        getActiveStudent(command.studentId());

        // 2. 보호자 탈퇴 여부 확인
        Protector protector = protectorRepository.findById(command.protectorId())
                .orElseThrow(() -> new EchoException(ProtectorErrorCode.PROTECTOR_NOT_FOUND));
        if (protector.getIsDeleted()) {
            throw new EchoException(ProtectorErrorCode.ALREADY_DELETED);
        }

        // 3. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 4. 오늘 완료한 문제 개수 조회 (isCompleted = true)
        Integer completedCount = dayProblemRepository.countByStudent_StudentIdAndAssignedDateAndIsCompleted(
                command.studentId(),
                LocalDate.now(),
                true
        );

        return GetDailyCompletedCountResult.from(completedCount);
    }

    @Transactional(readOnly = true)
    public GetWeeklyGoalPercentResult getWeeklyGoalPercent(GetWeeklyGoalPercentCommand command) {
        // 1. 학생 존재 여부 및 삭제 여부 확인
        getActiveStudent(command.studentId());

        // 2. 보호자 탈퇴 여부 확인
        Protector protector = protectorRepository.findById(command.protectorId())
                .orElseThrow(() -> new EchoException(ProtectorErrorCode.PROTECTOR_NOT_FOUND));
        if (protector.getIsDeleted()) {
            throw new EchoException(ProtectorErrorCode.ALREADY_DELETED);
        }

        // 3. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 4. 이번 주 범위 계산 (월요일 ~ 일요일)
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

        return GetWeeklyGoalPercentResult.from(percent, totalCount, completedCount);
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

    /**
     * 학생 정보를 수정합니다.
     *
     * @param command 학생 정보 수정 명령 (protectorId, studentId, studentName, gender, birth, grade)
     * @return 수정 결과 (success)
     * @throws EchoException 학생을 찾을 수 없거나, 접근 권한이 없는 경우
     */
    @Transactional
    public UpdateStudentResult updateStudent(UpdateStudentCommand command) {
        // 1. 학생 존재 여부 확인
        Student student = studentRepository.findById(command.studentId())
                .orElseThrow(() -> new EchoException(StudentErrorCode.STUDENT_NOT_FOUND));

        // 2. 보호자-학생 관계 확인 (접근 권한)
        if (!student.getProtector().getProtectorId().equals(command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 3. 학생 정보 업데이트
        student.updateStudentInfo(
                command.studentName(),
                command.gender(),
                command.birth(),
                command.grade()
        );

        return new UpdateStudentResult(true);
    }

    @Transactional(readOnly = true)
    public GetStudentInterestResult getStudentInterests(GetStudentInterestCommand command) {
        // 1. 학생 존재 여부 및 삭제 여부 확인
        getActiveStudent(command.studentId());

        // 2. 보호자 탈퇴 여부 확인
        Protector protector = protectorRepository.findById(command.protectorId())
                .orElseThrow(() -> new EchoException(ProtectorErrorCode.PROTECTOR_NOT_FOUND));
        if (protector.getIsDeleted()) {
            throw new EchoException(ProtectorErrorCode.ALREADY_DELETED);
        }

        // 3. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 4. 학생의 관심사 목록 조회
        List<StudentInterest> studentInterests = studentInterestRepository.findByStudent_StudentId(command.studentId());

        // 5. Result 객체로 변환
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
        // 1. 학생 존재 여부 및 삭제 여부 확인
        Student student = getActiveStudent(command.studentId());

        // 2. 보호자 탈퇴 여부 확인
        Protector protector = protectorRepository.findById(command.protectorId())
                .orElseThrow(() -> new EchoException(ProtectorErrorCode.PROTECTOR_NOT_FOUND));
        if (protector.getIsDeleted()) {
            throw new EchoException(ProtectorErrorCode.ALREADY_DELETED);
        }

        // 3. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 4. 기존 관심사 조회
        List<StudentInterest> existingInterests = studentInterestRepository.findByStudent_StudentId(command.studentId());
        Set<Short> existingSubInterestIds = existingInterests.stream()
                .map(si -> si.getSubInterest().getSubInterestId())
                .collect(Collectors.toSet());

        // 5. 중복 체크
        for (Short subInterestId : command.subInterestIds()) {
            if (existingSubInterestIds.contains(subInterestId)) {
                throw new EchoException(StudentErrorCode.DUPLICATE_INTEREST);
            }
        }

        // 6. 최대 개수 체크 (기존 + 신규 <= 5)
        int totalCount = existingInterests.size() + command.subInterestIds().size();
        if (totalCount > 5) {
            throw new EchoException(StudentErrorCode.INTEREST_LIMIT_EXCEEDED);
        }

        // 7. SubInterest 유효성 검증
        List<SubInterest> subInterests = subInterestRepository.findAllById(command.subInterestIds());
        if (subInterests.size() != command.subInterestIds().size()) {
            throw new EchoException(StudentErrorCode.INVALID_SUB_INTEREST);
        }

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
        // 1. 학생 존재 여부 및 삭제 여부 확인
        getActiveStudent(command.studentId());

        // 2. 보호자 탈퇴 여부 확인
        Protector protector = protectorRepository.findById(command.protectorId())
                .orElseThrow(() -> new EchoException(ProtectorErrorCode.PROTECTOR_NOT_FOUND));
        if (protector.getIsDeleted()) {
            throw new EchoException(ProtectorErrorCode.ALREADY_DELETED);
        }

        // 3. 보호자-학생 관계 확인 (접근 권한)
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 4. StudentInterest 존재 확인
        StudentInterest studentInterest = studentInterestRepository.findById(command.studentInterestId())
                .orElseThrow(() -> new EchoException(StudentErrorCode.STUDENT_INTEREST_NOT_FOUND));

        // 5. StudentInterest가 실제로 해당 학생의 것인지 확인
        if (!studentInterest.getStudent().getStudentId().equals(command.studentId())) {
            throw new EchoException(StudentErrorCode.STUDENT_INTEREST_NOT_FOUND);
        }

        // 6. StudentInterest 삭제 (hard delete)
        studentInterestRepository.delete(studentInterest);

        // 7. 성공 결과 반환
        return new DeleteStudentInterestResult(true);
    }

    @Transactional(readOnly = true)
    public GetWeeklyJamoStatResult getWeeklyJamoStat(GetWeeklyJamoStatCommand command) {
        // 1. 학생 존재 여부 및 삭제 여부 확인
        getActiveStudent(command.studentId());

        // 2. 보호자 탈퇴 여부 확인
        Protector protector = protectorRepository.findById(command.protectorId())
                .orElseThrow(() -> new EchoException(ProtectorErrorCode.PROTECTOR_NOT_FOUND));
        if (protector.getIsDeleted()) {
            throw new EchoException(ProtectorErrorCode.ALREADY_DELETED);
        }

        // 3. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 4. 학생의 가장 최근 주간 자모 통계 조회 (지난주 데이터)
        List<WeeklyJamoStat> weeklyJamoStats = weeklyJamoStatRepository.findLatestWeeklyStatsByStudentId(command.studentId());

        log.info("WeeklyJamoStat 조회 결과 - Student ID: {}, 조회된 데이터 개수: {}", command.studentId(), weeklyJamoStats.size());

        // 데이터 샘플 로그 (첫 3개)
        weeklyJamoStats.stream().limit(3).forEach(stat ->
            log.info("Sample - Jamo: {}, Accuracy: {}, TotalAttempts: {}",
                stat.getJamo(), stat.getWeeklyAccuracyRate(), stat.getTotalAttempts())
        );

        // 5. AccuracyRate 리스트로 변환 (이미 자모 순서대로 정렬됨)
        List<GetWeeklyJamoStatResult.AccuracyRate> accuracyRates = weeklyJamoStats.stream()
                .map(stat -> new GetWeeklyJamoStatResult.AccuracyRate(
                        stat.getJamo(),
                        stat.getWeeklyAccuracyRate().intValue(),
                        stat.getTotalAttempts().intValue()
                ))
                .collect(Collectors.toList());

        log.info("지난주 학습 분석 조회 완료 - Student ID: {}, 자모 개수: {}", command.studentId(), accuracyRates.size());

        return GetWeeklyJamoStatResult.of(accuracyRates);
    }

    /**
     * 전체 학습 분석 조회 (모든 주차 합산)
     */
    @Transactional(readOnly = true)
    public GetTotalJamoStatResult getTotalJamoStat(GetTotalJamoStatCommand command) {
        log.info("전체 학습 분석 조회 시작 - Student ID: {}", command.studentId());

        // 1. 학생 존재 여부 및 삭제 여부 확인
        getActiveStudent(command.studentId());

        // 2. 보호자 탈퇴 여부 확인
        Protector protector = protectorRepository.findById(command.protectorId())
                .orElseThrow(() -> new EchoException(ProtectorErrorCode.PROTECTOR_NOT_FOUND));
        if (protector.getIsDeleted()) {
            throw new EchoException(ProtectorErrorCode.ALREADY_DELETED);
        }

        // 3. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 4. 해당 학생의 모든 주차 자모 통계 조회
        List<WeeklyJamoStat> allWeeklyStats = weeklyJamoStatRepository.findAllWeeklyStatsByStudentId(command.studentId());

        if (allWeeklyStats.isEmpty()) {
            log.info("전체 학습 분석 데이터 없음 - Student ID: {}", command.studentId());
            return GetTotalJamoStatResult.of(List.of());
        }

        // 5. 자모별로 그룹핑하여 합산
        Map<String, List<WeeklyJamoStat>> statsByJamo = allWeeklyStats.stream()
                .collect(Collectors.groupingBy(WeeklyJamoStat::getJamo));

        // 6. 각 자모별로 총 시도 횟수와 평균 정확도 계산
        List<GetTotalJamoStatResult.AccuracyRate> accuracyRates = statsByJamo.entrySet().stream()
                .map(entry -> {
                    String jamo = entry.getKey();
                    List<WeeklyJamoStat> stats = entry.getValue();

                    // 총 시도 횟수
                    int totalCount = stats.stream()
                            .mapToInt(stat -> stat.getTotalAttempts().intValue())
                            .sum();

                    // 총 실패 횟수
                    int totalFails = stats.stream()
                            .mapToInt(stat -> stat.getFailCount().intValue())
                            .sum();

                    // 평균 정확도 = ((총 시도 - 총 실패) / 총 시도) * 100
                    int averageAccuracy = totalCount > 0 ? (int) Math.round((totalCount - totalFails) * 100.0 / totalCount) : 0;

                    return new GetTotalJamoStatResult.AccuracyRate(jamo, averageAccuracy, totalCount);
                })
                .sorted(Comparator.comparing(GetTotalJamoStatResult.AccuracyRate::jamo))
                .collect(Collectors.toList());

        log.info("전체 학습 분석 조회 완료 - Student ID: {}, 자모 개수: {}", command.studentId(), accuracyRates.size());

        return GetTotalJamoStatResult.of(accuracyRates);
    }

    /**
     * 지지난주 대비 지난주 전체 정확도 개선율 조회
     */
    @Transactional(readOnly = true)
    public GetImproveAccuracyResult getImproveAccuracy(GetImproveAccuracyCommand command) {
        log.info("정확도 개선율 조회 시작 - Student ID: {}", command.studentId());

        // 1. 학생 존재 여부 및 삭제 여부 확인
        getActiveStudent(command.studentId());

        // 2. 보호자 탈퇴 여부 확인
        Protector protector = protectorRepository.findById(command.protectorId())
                .orElseThrow(() -> new EchoException(ProtectorErrorCode.PROTECTOR_NOT_FOUND));
        if (protector.getIsDeleted()) {
            throw new EchoException(ProtectorErrorCode.ALREADY_DELETED);
        }

        // 3. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 4. 최근 2개의 리포트 조회 (최신순: [지난주, 지지난주])
        List<WeeklyPersonalReport> recentReports = weeklyPersonalReportRepository
                .findTop2ByStudent_StudentIdOrderByCreatedAtDesc(command.studentId());

        // 5. 데이터가 2개 미만이면 null 반환
        if (recentReports.size() < 2) {
            log.info("정확도 개선율 조회 불가 - Student ID: {}, 리포트 개수: {}",
                    command.studentId(), recentReports.size());
            return GetImproveAccuracyResult.of(null, null, null);
        }

        WeeklyPersonalReport lastWeekReport = recentReports.get(0);  // 지난주
        WeeklyPersonalReport twoWeeksAgoReport = recentReports.get(1);  // 지지난주

        // 6. 지지난주까지의 누적 통계 계산 (첫 리포트 ~ 지지난주 리포트)
        List<WeeklyJamoStat> twoWeeksAgoStats = weeklyJamoStatRepository
                .findAll()
                .stream()
                .filter(stat -> stat.getStudent().getStudentId().equals(command.studentId()))
                .filter(stat -> stat.getWeeklyPersonalReport().getReportId() <= twoWeeksAgoReport.getReportId())
                .toList();

        Integer twoWeeksAgoAccuracy = calculateAccuracy(twoWeeksAgoStats);

        // 7. 지난주 단독 통계 계산 (지난주 리포트만)
        List<WeeklyJamoStat> lastWeekOnlyStats = weeklyJamoStatRepository
                .findAllByWeeklyPersonalReport_ReportId(lastWeekReport.getReportId());

        // 8. 지난주 누적 정확도 계산
        int lastWeekTotalAttempts = calculateTotalAttempts(twoWeeksAgoStats) + calculateTotalAttempts(lastWeekOnlyStats);
        int lastWeekTotalFails = calculateTotalFails(twoWeeksAgoStats) + calculateTotalFails(lastWeekOnlyStats);
        Integer lastWeekAccuracy = lastWeekTotalAttempts > 0
                ? (int) Math.round((lastWeekTotalAttempts - lastWeekTotalFails) * 100.0 / lastWeekTotalAttempts)
                : null;

        // 9. 개선율 계산
        Integer improveRate = (twoWeeksAgoAccuracy != null && lastWeekAccuracy != null)
                ? lastWeekAccuracy - twoWeeksAgoAccuracy
                : null;

        log.info("정확도 개선율 조회 완료 - Student ID: {}, 지지난주: {}%, 지난주: {}%, 개선율: {}%",
                command.studentId(), twoWeeksAgoAccuracy, lastWeekAccuracy, improveRate);

        return GetImproveAccuracyResult.of(twoWeeksAgoAccuracy, lastWeekAccuracy, improveRate);
    }

    /**
     * 통계 리스트로부터 정확도 계산
     */
    private Integer calculateAccuracy(List<WeeklyJamoStat> stats) {
        if (stats.isEmpty()) {
            return null;
        }
        int totalAttempts = calculateTotalAttempts(stats);
        int totalFails = calculateTotalFails(stats);
        return totalAttempts > 0 ? (int) Math.round((totalAttempts - totalFails) * 100.0 / totalAttempts) : null;
    }

    /**
     * 통계 리스트로부터 총 시도 횟수 계산
     */
    private int calculateTotalAttempts(List<WeeklyJamoStat> stats) {
        return stats.stream()
                .mapToInt(stat -> stat.getTotalAttempts().intValue())
                .sum();
    }

    /**
     * 통계 리스트로부터 총 실패 횟수 계산
     */
    private int calculateTotalFails(List<WeeklyJamoStat> stats) {
        return stats.stream()
                .mapToInt(stat -> stat.getFailCount().intValue())
                .sum();
    }

    /**
     * 가장 개선율이 높은 자모 Top 2 조회 (주차별 비교)
     */
    @Transactional(readOnly = true)
    public GetBestImproveJamoResult getBestImproveJamo(GetBestImproveJamoCommand command) {
        log.info("개선율 높은 자모 Top 2 조회 시작 - Student ID: {}", command.studentId());

        // 1. 학생 존재 여부 및 삭제 여부 확인
        getActiveStudent(command.studentId());

        // 2. 보호자 탈퇴 여부 확인
        Protector protector = protectorRepository.findById(command.protectorId())
                .orElseThrow(() -> new EchoException(ProtectorErrorCode.PROTECTOR_NOT_FOUND));
        if (protector.getIsDeleted()) {
            throw new EchoException(ProtectorErrorCode.ALREADY_DELETED);
        }

        // 3. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 4. 최근 2개의 리포트 조회 (최신순: [지난주, 지지난주])
        List<WeeklyPersonalReport> recentReports = weeklyPersonalReportRepository
                .findTop2ByStudent_StudentIdOrderByCreatedAtDesc(command.studentId());

        // 5. 데이터가 2개 미만이면 null 반환
        if (recentReports.size() < 2) {
            log.info("개선율 높은 자모 조회 불가 - Student ID: {}, 리포트 개수: {}",
                    command.studentId(), recentReports.size());
            return GetBestImproveJamoResult.of(null);
        }

        WeeklyPersonalReport lastWeekReport = recentReports.get(0);  // 지난주
        WeeklyPersonalReport twoWeeksAgoReport = recentReports.get(1);  // 지지난주

        // 6. 지지난주 리포트의 자모별 통계 조회
        List<WeeklyJamoStat> twoWeeksAgoStats = weeklyJamoStatRepository
                .findAllByWeeklyPersonalReport_ReportId(twoWeeksAgoReport.getReportId());

        // 7. 지난주 리포트의 자모별 통계 조회
        List<WeeklyJamoStat> lastWeekStats = weeklyJamoStatRepository
                .findAllByWeeklyPersonalReport_ReportId(lastWeekReport.getReportId());

        // 8. 자모별로 그룹핑
        Map<String, WeeklyJamoStat> twoWeeksAgoMap = twoWeeksAgoStats.stream()
                .collect(Collectors.toMap(WeeklyJamoStat::getJamo, stat -> stat));
        Map<String, WeeklyJamoStat> lastWeekMap = lastWeekStats.stream()
                .collect(Collectors.toMap(WeeklyJamoStat::getJamo, stat -> stat));

        // 9. 모든 자모에 대해 개선율 계산
        List<GetBestImproveJamoResult.BestJamo> jamoList = new java.util.ArrayList<>();

        // 모든 자모 수집 (양쪽 주차에 있는 모든 자모)
        Set<String> allJamos = new java.util.HashSet<>();
        allJamos.addAll(twoWeeksAgoMap.keySet());
        allJamos.addAll(lastWeekMap.keySet());

        for (String jamo : allJamos) {
            WeeklyJamoStat twoWeeksAgoStat = twoWeeksAgoMap.get(jamo);
            WeeklyJamoStat lastWeekStat = lastWeekMap.get(jamo);

            // 양쪽 주차에 모두 데이터가 있는 경우만 계산
            if (twoWeeksAgoStat != null && lastWeekStat != null) {
                // weekly_accuracy_rate 컬럼에서 직접 가져오기
                Integer twoWeeksAgoAccuracy = twoWeeksAgoStat.getWeeklyAccuracyRate().intValue();
                Integer lastWeekAccuracy = lastWeekStat.getWeeklyAccuracyRate().intValue();
                Integer improveRate = lastWeekAccuracy - twoWeeksAgoAccuracy;

                jamoList.add(new GetBestImproveJamoResult.BestJamo(
                        jamo, twoWeeksAgoAccuracy, lastWeekAccuracy, improveRate
                ));
            }
        }

        // 10. 개선율 내림차순 정렬 후 상위 2개만 반환 (동점일 경우 자모 이름 순)
        List<GetBestImproveJamoResult.BestJamo> top2 = jamoList.stream()
                .sorted(Comparator.comparing(GetBestImproveJamoResult.BestJamo::improveRate).reversed()
                        .thenComparing(GetBestImproveJamoResult.BestJamo::jamo))
                .limit(2)
                .toList();

        log.info("개선율 높은 자모 Top 2 조회 완료 - Student ID: {}, 조회된 개수: {}", command.studentId(), top2.size());

        return GetBestImproveJamoResult.of(top2.isEmpty() ? null : top2);
    }

    /**
     * 단일 자모의 정확도 계산
     */
    private Integer calculateJamoAccuracy(WeeklyJamoStat stat) {
        int totalAttempts = stat.getTotalAttempts().intValue();
        int failCount = stat.getFailCount().intValue();
        return totalAttempts > 0 ? (int) Math.round((totalAttempts - failCount) * 100.0 / totalAttempts) : null;
    }

    /**
     * 정확도가 가장 낮은 자모 Top 2 조회 (지난주 정확도 기준)
     */
    @Transactional(readOnly = true)
    public GetWorstImproveJamoResult getWorstImproveJamo(GetWorstImproveJamoCommand command) {
        log.info("정확도 낮은 자모 Top 2 조회 시작 - Student ID: {}", command.studentId());

        // 1. 학생 존재 여부 및 삭제 여부 확인
        getActiveStudent(command.studentId());

        // 2. 보호자 탈퇴 여부 확인
        Protector protector = protectorRepository.findById(command.protectorId())
                .orElseThrow(() -> new EchoException(ProtectorErrorCode.PROTECTOR_NOT_FOUND));
        if (protector.getIsDeleted()) {
            throw new EchoException(ProtectorErrorCode.ALREADY_DELETED);
        }

        // 3. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 4. 최근 2개의 리포트 조회 (최신순: [지난주, 지지난주])
        List<WeeklyPersonalReport> recentReports = weeklyPersonalReportRepository
                .findTop2ByStudent_StudentIdOrderByCreatedAtDesc(command.studentId());

        // 5. 데이터가 2개 미만이면 null 반환
        if (recentReports.size() < 2) {
            log.info("정확도 낮은 자모 조회 불가 - Student ID: {}, 리포트 개수: {}",
                    command.studentId(), recentReports.size());
            return GetWorstImproveJamoResult.of(null);
        }

        WeeklyPersonalReport lastWeekReport = recentReports.get(0);  // 지난주
        WeeklyPersonalReport twoWeeksAgoReport = recentReports.get(1);  // 지지난주

        // 6. 지지난주 리포트의 자모별 통계 조회
        List<WeeklyJamoStat> twoWeeksAgoStats = weeklyJamoStatRepository
                .findAllByWeeklyPersonalReport_ReportId(twoWeeksAgoReport.getReportId());

        // 7. 지난주 리포트의 자모별 통계 조회
        List<WeeklyJamoStat> lastWeekStats = weeklyJamoStatRepository
                .findAllByWeeklyPersonalReport_ReportId(lastWeekReport.getReportId());

        // 8. 자모별로 그룹핑
        Map<String, WeeklyJamoStat> twoWeeksAgoMap = twoWeeksAgoStats.stream()
                .collect(Collectors.toMap(WeeklyJamoStat::getJamo, stat -> stat));
        Map<String, WeeklyJamoStat> lastWeekMap = lastWeekStats.stream()
                .collect(Collectors.toMap(WeeklyJamoStat::getJamo, stat -> stat));

        // 9. 모든 자모에 대해 정확도 및 개선율 계산
        List<GetWorstImproveJamoResult.WorstJamo> jamoList = new java.util.ArrayList<>();

        // 모든 자모 수집 (양쪽 주차에 있는 모든 자모)
        Set<String> allJamos = new java.util.HashSet<>();
        allJamos.addAll(twoWeeksAgoMap.keySet());
        allJamos.addAll(lastWeekMap.keySet());

        for (String jamo : allJamos) {
            WeeklyJamoStat twoWeeksAgoStat = twoWeeksAgoMap.get(jamo);
            WeeklyJamoStat lastWeekStat = lastWeekMap.get(jamo);

            // 양쪽 주차에 모두 데이터가 있는 경우만 계산
            if (twoWeeksAgoStat != null && lastWeekStat != null) {
                // weekly_accuracy_rate 컬럼에서 직접 가져오기
                Integer twoWeeksAgoAccuracy = twoWeeksAgoStat.getWeeklyAccuracyRate().intValue();
                Integer lastWeekAccuracy = lastWeekStat.getWeeklyAccuracyRate().intValue();
                Integer improveRate = lastWeekAccuracy - twoWeeksAgoAccuracy;

                jamoList.add(new GetWorstImproveJamoResult.WorstJamo(
                        jamo, twoWeeksAgoAccuracy, lastWeekAccuracy, improveRate
                ));
            }
        }

        // 10. 지난주 정확도 오름차순 정렬 후 하위 2개 반환 (동점일 경우 자모 이름 순)
        List<GetWorstImproveJamoResult.WorstJamo> bottom2 = jamoList.stream()
                .sorted(Comparator.comparing(GetWorstImproveJamoResult.WorstJamo::lastWeek)
                        .thenComparing(GetWorstImproveJamoResult.WorstJamo::jamo))
                .limit(2)
                .toList();

        log.info("정확도 낮은 자모 Top 2 조회 완료 - Student ID: {}, 조회된 개수: {}", command.studentId(), bottom2.size());

        return GetWorstImproveJamoResult.of(bottom2.isEmpty() ? null : bottom2);
    }

    /**
     * 프로필 이미지를 수정합니다 (PATCH용)
     * 트랜잭션 실패 시 기존 이미지 유지를 보장합니다.
     *
     * @param command 프로필 이미지 업데이트 명령 (protectorId, studentId, file)
     * @return 업데이트 결과 (success, imageUrl)
     * @throws EchoException 학생을 찾을 수 없거나, 접근 권한이 없거나, 파일이 유효하지 않은 경우
     */
    @Transactional
    public UpdateProfileImageResult updateProfileImage(UpdateProfileImageCommand command) {
        // 1. 학생 조회 및 권한 확인
        Student student = studentRepository.findById(command.studentId())
                .orElseThrow(() -> new EchoException(StudentErrorCode.STUDENT_NOT_FOUND));

        if (!student.getProtector().getProtectorId().equals(command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 2. 기존 프로필 이미지 경로 보관 (삭제하지 않음!)
        String oldImagePath = student.getProfileImage();

        // 3. 새 이미지 저장 (실패 시 예외 발생 → 자동 롤백)
        String profilePath = fileStorageProperties.getUpload().getProfileImages().getPath();
        String storedFilePath = fileStorageService.store(command.file(), profilePath);

        // 4. 학생 엔티티 업데이트 (트랜잭션 내)
        student.updateProfileImage(storedFilePath);
        studentRepository.save(student);

        // 5. 트랜잭션 커밋 후 기존 파일 삭제 이벤트 발행
        if (oldImagePath != null && !oldImagePath.isEmpty()) {
            eventPublisher.publishEvent(new FileDeleteEvent(oldImagePath));
        }

        // 6. URL 생성 및 결과 반환
        String imageUrl = fileStorageService.getFileUrl(storedFilePath);
        return new UpdateProfileImageResult(true, imageUrl);
    }
    /**
     * 프로필 이미지를 최초 등록합니다 (POST용)
     * 이미 프로필 이미지가 있으면 예외를 발생시킵니다.
     *
     * @param command 프로필 이미지 등록 명령 (protectorId, studentId, file)
     * @return 등록 결과 (success, imageUrl)
     * @throws EchoException 이미 프로필 이미지가 있거나, 학생을 찾을 수 없거나, 접근 권한이 없는 경우
     */
    @Transactional
    public UpdateProfileImageResult registerProfileImage(UpdateProfileImageCommand command) {
        // 1. 학생 조회 및 권한 확인
        Student student = studentRepository.findById(command.studentId())
                .orElseThrow(() -> new EchoException(StudentErrorCode.STUDENT_NOT_FOUND));

        if (!student.getProtector().getProtectorId().equals(command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 2. 이미 프로필 이미지가 있으면 예외 발생
        if (student.getProfileImage() != null && !student.getProfileImage().isEmpty()) {
            throw new EchoException(StudentErrorCode.PROFILE_IMAGE_ALREADY_EXISTS);
        }

        // 3. 새 이미지 저장
        String profilePath = fileStorageProperties.getUpload().getProfileImages().getPath();
        String storedFilePath = fileStorageService.store(command.file(), profilePath);

        // 4. 학생 엔티티 업데이트
        student.updateProfileImage(storedFilePath);
        studentRepository.save(student);

        // 5. URL 생성 및 결과 반환
        String imageUrl = fileStorageService.getFileUrl(storedFilePath);
        return new UpdateProfileImageResult(true, imageUrl);
    }

    /**
     * 학생 PIN을 검증합니다.
     *
     * @param command PIN 검증 명령 (studentId, pin)
     * @return 검증 결과 (success)
     * @throws EchoException 학생을 찾을 수 없거나, PIN이 일치하지 않는 경우
     */
    @Transactional(readOnly = true)
    public VerifyPinResult verifyPin(VerifyPinCommand command) {
        // 1. Student 조회
        Student student = studentRepository.findById(command.studentId())
                .orElseThrow(() -> new EchoException(StudentErrorCode.STUDENT_NOT_FOUND));

        // 2. PIN 등록 여부 확인
        String storedPin = student.getStudentPin();

        if (storedPin == null || storedPin.isEmpty()) {
            throw new EchoException(StudentErrorCode.PIN_NOT_FOUND);
        }

        // 3. PIN 검증 (평문 비교)
        boolean isValid = command.pin().equals(storedPin);

        // 4. PIN 불일치 시 예외 발생
        if (!isValid) {
            throw new EchoException(StudentErrorCode.PIN_NOT_MATCH);
        }

        return new VerifyPinResult(true);
    }

    /**
     * 학생 PIN을 수정합니다.
     *
     * @param command PIN 수정 명령 (studentId, currentPin, newPin)
     * @return 수정 결과 (success)
     * @throws EchoException 학생을 찾을 수 없거나, 현재 PIN이 일치하지 않는 경우
     */
    @Transactional
    public UpdatePinResult updatePin(UpdatePinCommand command) {
        // 1. Student 조회
        Student student = studentRepository.findById(command.studentId())
                .orElseThrow(() -> new EchoException(StudentErrorCode.STUDENT_NOT_FOUND));

        // 2. PIN 등록 여부 확인
        String storedPin = student.getStudentPin();

        if (storedPin == null || storedPin.isEmpty()) {
            throw new EchoException(StudentErrorCode.PIN_NOT_FOUND);
        }

        // 3. 현재 PIN 검증 (평문 비교)
        if (!command.currentPin().equals(storedPin)) {
            throw new EchoException(StudentErrorCode.PIN_NOT_MATCH);
        }

        // 4. 새 PIN 업데이트 (평문)
        student.updateStudentPin(command.newPin());

        return new UpdatePinResult(true);
    }

    /**
     * 일일 연속 학습 기록 조회
     *
     * @param command 일일 연속 학습 기록 조회 명령 (protectorId, studentId)
     * @return 이번 주 월~금 학습 여부 및 현재 연속 학습일 수
     * @throws EchoException 학생을 찾을 수 없거나, 접근 권한이 없는 경우
     */
    @Transactional(readOnly = true)
    public GetDailyStreakResult getDailyStreak(GetDailyStreakCommand command) {
        // 1. 학생 존재 여부 및 삭제 여부 확인
        getActiveStudent(command.studentId());

        // 2. 보호자 탈퇴 여부 확인
        Protector protector = protectorRepository.findById(command.protectorId())
                .orElseThrow(() -> new EchoException(ProtectorErrorCode.PROTECTOR_NOT_FOUND));
        if (protector.getIsDeleted()) {
            throw new EchoException(ProtectorErrorCode.ALREADY_DELETED);
        }

        // 3. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 4. 이번 주 월요일 ~ 금요일 날짜 계산 (KST 기준)
        LocalDate today = LocalDate.now();
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        // 5. 월~금 각 날짜의 학습 여부 확인
        List<Boolean> weeklyAttendance = new ArrayList<>();
        for (int i = 0; i < 5; i++) {  // 월~금 5일
            LocalDate targetDate = monday.plusDays(i);

            // 해당 날짜에 할당된 전체 문제 수
            Integer totalCount = dayProblemRepository.countByStudent_StudentIdAndAssignedDate(
                    command.studentId(),
                    targetDate
            );

            // 해당 날짜에 완료된 문제 수
            Integer completedCount = dayProblemRepository.countByStudent_StudentIdAndAssignedDateAndIsCompleted(
                    command.studentId(),
                    targetDate,
                    true
            );

            log.info("Daily Streak - Student: {}, Date: {}, Total: {}, Completed: {}",
                    command.studentId(), targetDate, totalCount, completedCount);

            // 할당된 문제가 있고, 모든 문제를 완료했으면 학습 완료
            boolean isDayCompleted = totalCount > 0 && totalCount.equals(completedCount);
            weeklyAttendance.add(isDayCompleted);
        }

        // 6. 현재 연속 학습일 수 계산 (오늘부터 거슬러 올라가며 확인)
        Integer currentStreak = calculateCurrentStreak(command.studentId(), today);

        log.info("일일 연속 학습 기록 조회 완료 - Student ID: {}, Weekly Attendance: {}, Current Streak: {}",
                command.studentId(), weeklyAttendance, currentStreak);

        return GetDailyStreakResult.of(weeklyAttendance, currentStreak);
    }

    /**
     * 학생 조회 및 삭제 여부 확인
     *
     * @param studentId 학생 ID
     * @return 활성화된 학생 엔티티
     * @throws EchoException 학생을 찾을 수 없거나 삭제된 경우
     */
    private Student getActiveStudent(Integer studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new EchoException(StudentErrorCode.STUDENT_NOT_FOUND));
        if (student.getDeletedAt() != null) {
            throw new EchoException(StudentErrorCode.STUDENT_DELETED);
        }
        return student;
    }

    /**
     * 현재 연속 학습일 수 계산 (주말 제외)
     *
     * @param studentId 학생 ID
     * @param startDate 시작 날짜 (보통 오늘)
     * @return 연속 학습일 수
     */
    private Integer calculateCurrentStreak(Integer studentId, LocalDate startDate) {
        int streak = 0;
        LocalDate currentDate = startDate;

        // 오늘부터 거슬러 올라가며 연속 학습일 계산
        while (true) {
            // 주말(토, 일)은 건너뛰기
            DayOfWeek dayOfWeek = currentDate.getDayOfWeek();
            if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
                currentDate = currentDate.minusDays(1);
                continue;
            }

            // 해당 날짜에 할당된 전체 문제 수
            Integer totalCount = dayProblemRepository.countByStudent_StudentIdAndAssignedDate(
                    studentId,
                    currentDate
            );

            // 해당 날짜에 완료된 문제 수
            Integer completedCount = dayProblemRepository.countByStudent_StudentIdAndAssignedDateAndIsCompleted(
                    studentId,
                    currentDate,
                    true
            );

            log.info("Current Streak Calculation - Date: {}, Total: {}, Completed: {}",
                    currentDate, totalCount, completedCount);

            // 할당된 문제가 있고, 모든 문제를 완료했으면 연속 학습
            boolean isDayCompleted = totalCount > 0 && totalCount.equals(completedCount);

            if (isDayCompleted) {
                streak++;
                currentDate = currentDate.minusDays(1);
            } else {
                // 학습하지 않은 날이면 중단
                break;
            }
        }

        return streak;
    }

}
