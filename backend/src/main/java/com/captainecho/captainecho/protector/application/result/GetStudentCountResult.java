package com.captainecho.captainecho.protector.application.result;

public record GetStudentCountResult(
        Integer totalCount,
        Integer remainCount
) {
    public static GetStudentCountResult of(Integer totalCount, Integer remainCount) {
        return new GetStudentCountResult(totalCount, remainCount);
    }
}
