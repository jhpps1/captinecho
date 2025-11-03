package com.captainecho.captainecho.protector.presentation.dto;

import com.captainecho.captainecho.protector.application.result.VerifyPinResult;

public record VerifyPinResponse(
        Boolean isValid
) {
    public static VerifyPinResponse from(VerifyPinResult result) {
        return new VerifyPinResponse(result.isValid());
    }
}
