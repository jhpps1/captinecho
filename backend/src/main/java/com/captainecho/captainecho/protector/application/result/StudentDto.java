package com.captainecho.captainecho.protector.application.result;

import lombok.Builder;

@Builder
public record StudentDto(
        Integer studentId,
        String name,
        String gender,
        String birth,
        String profileImage,
        String grade,
        Integer level,
        Integer coin
) {
}
