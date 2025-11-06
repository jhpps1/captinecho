package com.captainecho.captainecho.dashboard.presentation;

import com.captainecho.captainecho.dashboard.application.DashboardService;
import com.captainecho.captainecho.dashboard.application.result.ProtectorGoalListResult;
import com.captainecho.captainecho.dashboard.presentation.response.ProtectorGoalListResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/student/dashboard/protector")
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class ProtectorDashboardController {

    private final DashboardService dashboardService;

    /**
     * 보호자 학습 목표 선택지 조회
     * GET /api/student/dashboard/protector/goal
     */
    @GetMapping("/goal")
    public ResponseEntity<ProtectorGoalListResponse> getProtectorGoals() {
        ProtectorGoalListResult result = dashboardService.getProtectorGoals();
        ProtectorGoalListResponse response = ProtectorGoalListResponse.from(result);
        return ResponseEntity.ok(response);
    }
}
