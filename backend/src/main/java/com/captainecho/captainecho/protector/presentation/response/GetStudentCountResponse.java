package com.captainecho.captainecho.protector.presentation.response;

import com.captainecho.captainecho.protector.application.result.GetStudentCountResult;

public record GetStudentCountResponse(
        Integer totalCount,
        Integer remainCount
) {
    public static GetStudentCountResponse from(GetStudentCountResult result) {
        return new GetStudentCountResponse(result.totalCount(), result.remainCount());
    }
}
