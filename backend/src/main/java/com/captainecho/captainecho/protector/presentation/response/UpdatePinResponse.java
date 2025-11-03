package com.captainecho.captainecho.protector.presentation.response;

import com.captainecho.captainecho.protector.application.result.UpdatePinResult;

public record UpdatePinResponse(
        Boolean success
) {
    public static UpdatePinResponse from(UpdatePinResult result) {
        return new UpdatePinResponse(result.success());
    }
}
