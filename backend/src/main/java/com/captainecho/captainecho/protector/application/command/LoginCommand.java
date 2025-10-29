package com.captainecho.captainecho.protector.application.command;

public record LoginCommand(
        String idToken,
        String provider
) {
}
