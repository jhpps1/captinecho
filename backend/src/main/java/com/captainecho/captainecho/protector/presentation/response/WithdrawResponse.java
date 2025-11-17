package com.captainecho.captainecho.protector.presentation.response;

import com.captainecho.captainecho.protector.application.result.WithdrawResult;

public record WithdrawResponse(
        Boolean success
) {
    public static WithdrawResponse from(WithdrawResult result) {
        return new WithdrawResponse(result.success());
    }
}
