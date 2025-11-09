package com.captainecho.captainecho.student.application.result;

public record UpdateProfileImageResult(
        boolean success,
        String imageUrl
) {
}
