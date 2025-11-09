package com.captainecho.captainecho.student.application.command;

import org.springframework.web.multipart.MultipartFile;

public record UpdateProfileImageCommand(
        Integer protectorId,
        Integer studentId,
        MultipartFile file
) {
}
