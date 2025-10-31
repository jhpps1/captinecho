package com.captainecho.captainecho.auth.application.command;

public record LoginCommand(
        String idToken,
        String provider
) {
}
