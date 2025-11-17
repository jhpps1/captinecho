package com.captainecho.captainecho.protector.application.result;

public record WithdrawResult(
        Boolean success
) {
    public static WithdrawResult of(Boolean success) {
        return new WithdrawResult(success);
    }
}
