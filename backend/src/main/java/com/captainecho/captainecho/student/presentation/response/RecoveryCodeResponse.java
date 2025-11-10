package com.captainecho.captainecho.student.presentation.response;

public record RecoveryCodeResponse(
        Boolean success
) {
    public static RecoveryCodeResponse of(Boolean success) {
        return new RecoveryCodeResponse(success);
    }
}
