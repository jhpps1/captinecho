package com.captainecho.captainecho.dashboard.application.result;

import java.util.List;

public record WeeklyLearningTimeDto(
        Integer totalMinutes,               // 총 학습 시간 (분)
        List<DailyLearningTimeDto> daily   // 요일별 학습 시간 목록
) {
}
