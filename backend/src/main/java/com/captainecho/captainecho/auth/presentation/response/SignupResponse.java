package com.captainecho.captainecho.auth.presentation.response;

import com.captainecho.captainecho.auth.application.result.SignupResult;

public record SignupResponse(
        boolean success
) {
    public static SignupResponse from(SignupResult result) {
        return new SignupResponse(result.success());
    }
}
