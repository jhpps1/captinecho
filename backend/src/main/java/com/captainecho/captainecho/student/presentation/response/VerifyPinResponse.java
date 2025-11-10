package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.student.application.result.VerifyPinResult;

public record VerifyPinResponse(
        boolean success
) {
    public static VerifyPinResponse from(VerifyPinResult result) {
        return new VerifyPinResponse(result.success());
    }
}
