package com.captainecho.captainecho.dashboard.application;

import com.captainecho.captainecho.dashboard.application.result.CurriculumResult;
import com.captainecho.captainecho.dashboard.application.result.DailyLearningTimeDto;
import com.captainecho.captainecho.dashboard.application.result.DiscussionResult;
import com.captainecho.captainecho.dashboard.application.result.LearningTimeResult;
import com.captainecho.captainecho.dashboard.application.result.WeeklyLearningTimeDto;
import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.StudentErrorCode;
import com.captainecho.captainecho.session.persistence.LearningSessionRepository;
import com.captainecho.captainecho.stats.domain.WeeklyPersonalReport;
import com.captainecho.captainecho.stats.persistence.WeeklyPersonalReportRepository;
import com.captainecho.captainecho.student.persistence.StudentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class DashboardService {

    private final StudentRepository studentRepository;
    private final WeeklyPersonalReportRepository weeklyPersonalReportRepository;
    private final LearningSessionRepository learningSessionRepository;

    /**
     * 금주 커리큘럼 조회
     */
    @Transactional(readOnly = true)
    public CurriculumResult getCurriculum(Long protectorId, Integer studentId) {
        // 1. 학생 접근 권한 확인
        verifyStudentAccess(protectorId, studentId);

        // 2. 가장 최근 주간 리포트 조회
        WeeklyPersonalReport report = weeklyPersonalReportRepository
                .findTopByStudent_StudentIdOrderByCreatedAtDesc(studentId)
                .orElse(null);

        // 3. curriculum 반환 (없으면 빈 문자열)
        String curriculum = (report != null) ? report.getCurriculum() : "";
        return CurriculumResult.from(curriculum);
    }

    /**
     * 금주 협의 로그 조회
     */
    @Transactional(readOnly = true)
    public DiscussionResult getDiscussion(Long protectorId, Integer studentId) {
        // 1. 학생 접근 권한 확인
        verifyStudentAccess(protectorId, studentId);

        // 2. 가장 최근 주간 리포트 조회
        WeeklyPersonalReport report = weeklyPersonalReportRepository
                .findTopByStudent_StudentIdOrderByCreatedAtDesc(studentId)
                .orElse(null);

        // 3. discussion_log 반환 (없으면 빈 문자열)
        String discussion = (report != null) ? report.getDiscussionLog() : "";
        return DiscussionResult.from(discussion);
    }

    /**
     * 학습 시간 조회 (금주 vs 지난주)
     */
    @Transactional(readOnly = true)
    public LearningTimeResult getLearningTime(Long protectorId, Integer studentId) {
        // 1. 학생 접근 권한 확인
        verifyStudentAccess(protectorId, studentId);

        // 2. 이번 주 범위 계산 (월요일 00:00 ~ 일요일 23:59)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thisWeekStart = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                .withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime thisWeekEnd = now.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY))
                .withHour(23).withMinute(59).withSecond(59).withNano(999999999);

        // 3. 지난 주 범위 계산
        LocalDateTime lastWeekStart = thisWeekStart.minusWeeks(1);
        LocalDateTime lastWeekEnd = thisWeekEnd.minusWeeks(1);

        // 4. 이번 주 학습 시간 조회
        WeeklyLearningTimeDto thisWeekLearningTime = getWeeklyLearningTime(
                studentId, thisWeekStart, thisWeekEnd
        );

        // 5. 지난 주 학습 시간 조회
        WeeklyLearningTimeDto lastWeekLearningTime = getWeeklyLearningTime(
                studentId, lastWeekStart, lastWeekEnd
        );

        return new LearningTimeResult(thisWeekLearningTime, lastWeekLearningTime);
    }

    /**
     * 특정 기간의 주간 학습 시간 조회 (요일별 분해)
     */
    private WeeklyLearningTimeDto getWeeklyLearningTime(
            Integer studentId,
            LocalDateTime startDate,
            LocalDateTime endDate
    ) {
        // 1. 요일별 학습 시간 집계 (PostgreSQL EXTRACT(DOW) 사용)
        List<Object[]> dailyData = learningSessionRepository
                .findDailyLearningMinutesByStudentAndDateRange(studentId, startDate, endDate);

        // 2. PostgreSQL DOW를 Java DayOfWeek로 매핑
        // PostgreSQL: 0=일요일, 1=월요일, 2=화요일, ..., 6=토요일
        Map<Integer, Integer> dowToMinutes = new HashMap<>();
        for (Object[] row : dailyData) {
            Integer dow = ((Number) row[0]).intValue();  // PostgreSQL DOW
            Double minutes = ((Number) row[1]).doubleValue();
            dowToMinutes.put(dow, minutes.intValue());
        }

        // 3. 요일별 DTO 생성 (월요일부터 일요일 순서)
        List<DailyLearningTimeDto> dailyList = new ArrayList<>();
        dailyList.add(new DailyLearningTimeDto("MONDAY", dowToMinutes.getOrDefault(1, 0)));
        dailyList.add(new DailyLearningTimeDto("TUESDAY", dowToMinutes.getOrDefault(2, 0)));
        dailyList.add(new DailyLearningTimeDto("WEDNESDAY", dowToMinutes.getOrDefault(3, 0)));
        dailyList.add(new DailyLearningTimeDto("THURSDAY", dowToMinutes.getOrDefault(4, 0)));
        dailyList.add(new DailyLearningTimeDto("FRIDAY", dowToMinutes.getOrDefault(5, 0)));
        dailyList.add(new DailyLearningTimeDto("SATURDAY", dowToMinutes.getOrDefault(6, 0)));
        dailyList.add(new DailyLearningTimeDto("SUNDAY", dowToMinutes.getOrDefault(0, 0)));

        // 4. 총 학습 시간 계산
        Integer totalMinutes = dailyList.stream()
                .mapToInt(DailyLearningTimeDto::learningMinutes)
                .sum();

        return new WeeklyLearningTimeDto(totalMinutes, dailyList);
    }

    /**
     * 학생 접근 권한 확인 (보호자가 해당 학생의 담당자인지 확인)
     */
    private void verifyStudentAccess(Long protectorId, Integer studentId) {
        // 학생 존재 여부 확인
        if (!studentRepository.existsById(studentId)) {
            throw new EchoException(StudentErrorCode.STUDENT_NOT_FOUND);
        }

        // 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(studentId, protectorId)) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }
    }
}
