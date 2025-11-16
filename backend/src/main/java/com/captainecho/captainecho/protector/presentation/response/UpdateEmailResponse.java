package com.captainecho.captainecho.protector.presentation.response;

import com.captainecho.captainecho.protector.application.result.UpdateEmailResult;

public record UpdateEmailResponse(
        Boolean success
) {
    public static UpdateEmailResponse from(UpdateEmailResult result) {
        return new UpdateEmailResponse(result.success());
    }
}
