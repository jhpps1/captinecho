package com.captainecho.captainecho.protector.presentation.response;

public record RecoveryCodeResponse(
        Boolean success
) {
    public static RecoveryCodeResponse of(Boolean success) {
        return new RecoveryCodeResponse(success);
    }
}
