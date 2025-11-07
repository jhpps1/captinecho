package com.captainecho.captainecho.stats.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ProtectorGoal {
    FOCUS_ON_WEAKNESS("취약점 위주", "어려워하는 부분을 집중적으로 학습해요"),
    BUILD_CONFIDENCE("자신감 회복", "잘할 수 있는 문제로 성취감을 느껴요"),
    INCREASE_DIFFICULTY("난이도 상향", "한 단계 더 도전적인 학습을 진행해요");

    private final String title;
    private final String description;
}
