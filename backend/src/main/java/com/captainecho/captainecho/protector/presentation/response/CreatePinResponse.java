package com.captainecho.captainecho.protector.presentation.response;

import com.captainecho.captainecho.protector.application.result.CreatePinResult;

public record CreatePinResponse(
        Boolean success
) {
    public static CreatePinResponse from(CreatePinResult result) {
        return new CreatePinResponse(result.success());
    }
}
