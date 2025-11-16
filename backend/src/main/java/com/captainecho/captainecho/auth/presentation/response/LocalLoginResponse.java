package com.captainecho.captainecho.auth.presentation.response;

public record LocalLoginResponse(
        boolean success,
        String accessToken
) {
    public static LocalLoginResponse of(String accessToken) {
        return new LocalLoginResponse(true, accessToken);
    }
}
