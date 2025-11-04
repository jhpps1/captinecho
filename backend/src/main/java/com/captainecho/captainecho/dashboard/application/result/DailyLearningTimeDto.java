package com.captainecho.captainecho.dashboard.application.result;

public record DailyLearningTimeDto(
        String dayOfWeek,      // "MONDAY", "TUESDAY", ...
        Integer learningMinutes // 해당 요일 학습 시간 (분)
) {
}
