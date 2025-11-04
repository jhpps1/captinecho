package com.captainecho.captainecho.dashboard.application.result;

public record LearningTimeResult(
        WeeklyLearningTimeDto thisWeekLearningTime, // 금주 학습 시간 정보
        WeeklyLearningTimeDto lastWeekLearningTime  // 지난주 학습 시간 정보
) {
}
