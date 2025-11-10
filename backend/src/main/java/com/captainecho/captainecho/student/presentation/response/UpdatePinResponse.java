package com.captainecho.captainecho.student.presentation.response;

import com.captainecho.captainecho.student.application.result.UpdatePinResult;

public record UpdatePinResponse(
        Boolean success
) {
    public static UpdatePinResponse from(UpdatePinResult result) {
        return new UpdatePinResponse(result.success());
    }
}
