package com.captainecho.captainecho.student.presentation.response;

public record UpdateProfileImageResponse(
    String imageUrl
) {
    public static UpdateProfileImageResponse from(String imageUrl) {
        return new UpdateProfileImageResponse(imageUrl);
    }
}
