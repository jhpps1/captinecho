package com.captainecho.captainecho.dashboard.presentation;

import com.captainecho.captainecho.auth.domain.ProtectorPrincipal;
import com.captainecho.captainecho.dashboard.application.DashboardService;
import com.captainecho.captainecho.dashboard.application.result.CurriculumResult;
import com.captainecho.captainecho.dashboard.application.result.DiscussionResult;
import com.captainecho.captainecho.dashboard.application.result.GetProtectorGoalResult;
import com.captainecho.captainecho.dashboard.application.result.LearningTimeResult;
import com.captainecho.captainecho.dashboard.presentation.response.CurriculumResponse;
import com.captainecho.captainecho.dashboard.presentation.response.DiscussionResponse;
import com.captainecho.captainecho.dashboard.presentation.response.GetProtectorGoalResponse;
import com.captainecho.captainecho.dashboard.presentation.response.LearningTimeResponse;
import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.CommonErrorCode;
import com.captainecho.captainecho.student.application.StudentService;
import com.captainecho.captainecho.student.application.command.GetDailyCompletedCountCommand;
import com.captainecho.captainecho.student.application.command.GetDailyGoalCountCommand;
import com.captainecho.captainecho.student.application.command.GetWeeklyGoalPercentCommand;
import com.captainecho.captainecho.student.application.command.SetProtectorGoalCommand;
import com.captainecho.captainecho.student.application.result.GetDailyCompletedCountResult;
import com.captainecho.captainecho.student.application.result.GetDailyGoalCountResult;
import com.captainecho.captainecho.student.application.result.GetWeeklyGoalPercentResult;
import com.captainecho.captainecho.student.application.result.SetProtectorGoalResult;
import com.captainecho.captainecho.student.presentation.request.SetProtectorGoalRequest;
import com.captainecho.captainecho.student.presentation.response.GetDailyCompletedCountResponse;
import com.captainecho.captainecho.student.presentation.response.GetDailyGoalCountResponse;
import com.captainecho.captainecho.student.presentation.response.GetWeeklyGoalPercentResponse;
import com.captainecho.captainecho.student.presentation.response.SetProtectorGoalResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/student/{studentId}/dashboard")
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class DashboardController {

    private final DashboardService dashboardService;
    private final StudentService studentService;

    /**
     * 금주 커리큘럼 조회
     * GET /api/student/{studentId}/dashboard/curriculum
     */
    @GetMapping("/curriculum")
    public ResponseEntity<CurriculumResponse> getCurriculum(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable("studentId") Integer studentId
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        CurriculumResult result = dashboardService.getCurriculum(protectorId, studentId);
        CurriculumResponse response = CurriculumResponse.from(result);

        return ResponseEntity.ok(response);
    }

    /**
     * 금주 협의 로그 조회
     * GET /api/student/{studentId}/dashboard/discussion
     */
    @GetMapping("/discussion")
    public ResponseEntity<DiscussionResponse> getDiscussion(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable("studentId") Integer studentId
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        DiscussionResult result = dashboardService.getDiscussion(protectorId, studentId);
        DiscussionResponse response = DiscussionResponse.from(result);

        return ResponseEntity.ok(response);
    }

    /**
     * 학습 시간 조회 (금주 vs 지난주)
     * GET /api/student/{studentId}/dashboard/learning-time
     */
    @GetMapping("/learning-time")
    public ResponseEntity<LearningTimeResponse> getLearningTime(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable("studentId") Integer studentId
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        LearningTimeResult result = dashboardService.getLearningTime(protectorId, studentId);
        LearningTimeResponse response = LearningTimeResponse.from(result);

        return ResponseEntity.ok(response);
    }

    /**
     * 오늘 목표 문제 수 조회
     * GET /api/student/{studentId}/dashboard/daily/plan
     */
    @GetMapping("/daily/plan")
    public ResponseEntity<GetDailyGoalCountResponse> getDailyGoalCount(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable("studentId") Integer studentId
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();
        GetDailyGoalCountCommand command = new GetDailyGoalCountCommand(studentId, protectorId);
        GetDailyGoalCountResult result = studentService.getDailyGoalCount(command);
        GetDailyGoalCountResponse response = GetDailyGoalCountResponse.from(result);

        return ResponseEntity.ok(response);
    }

    /**
     * 오늘 완료한 문제 수 조회
     * GET /api/student/{studentId}/dashboard/daily/count
     */
    @GetMapping("/daily/count")
    public ResponseEntity<GetDailyCompletedCountResponse> getDailyCompletedCount(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable("studentId") Integer studentId
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();
        GetDailyCompletedCountCommand command = new GetDailyCompletedCountCommand(studentId, protectorId);
        GetDailyCompletedCountResult result = studentService.getDailyCompletedCount(command);
        GetDailyCompletedCountResponse response = GetDailyCompletedCountResponse.from(result);

        return ResponseEntity.ok(response);
    }

    /**
     * 주간 목표 도달률 조회
     * GET /api/student/{studentId}/dashboard/weekly/plan
     */
    @GetMapping("/weekly/plan")
    public ResponseEntity<GetWeeklyGoalPercentResponse> getWeeklyGoalPercent(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable("studentId") Integer studentId
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();
        GetWeeklyGoalPercentCommand command = new GetWeeklyGoalPercentCommand(studentId, protectorId);
        GetWeeklyGoalPercentResult result = studentService.getWeeklyGoalPercent(command);
        GetWeeklyGoalPercentResponse response = GetWeeklyGoalPercentResponse.from(result);

        return ResponseEntity.ok(response);
    }

    /**
     * 금주 보호자 학습 목표 조회
     * GET /api/student/{studentId}/dashboard/goal
     */
    @GetMapping("/goal")
    public ResponseEntity<GetProtectorGoalResponse> getProtectorGoal(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable("studentId") Integer studentId
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();
        GetProtectorGoalResult result = dashboardService.getProtectorGoal(protectorId, studentId);
        GetProtectorGoalResponse response = GetProtectorGoalResponse.from(result);

        return ResponseEntity.ok(response);
    }

    /**
     * 보호자 학습 목표 설정
     * POST /api/student/{studentId}/dashboard/goal
     */
    @PostMapping("/goal")
    public ResponseEntity<SetProtectorGoalResponse> setProtectorGoal(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable("studentId") Integer studentId,
            @Valid @RequestBody SetProtectorGoalRequest request
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();
        SetProtectorGoalCommand command = request.toCommand(studentId, protectorId);
        SetProtectorGoalResult result = dashboardService.setProtectorGoal(command);
        SetProtectorGoalResponse response = SetProtectorGoalResponse.from(result);

        return ResponseEntity.ok(response);
    }
}
