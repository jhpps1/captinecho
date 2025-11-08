package com.captainecho.captainecho.protector.presentation.response;

import com.captainecho.captainecho.protector.application.result.StudentDto;

public record StudentResponse(
        Integer studentId,
        String name,
        String gender,
        String birth,
        String profileImage,
        String grade,
        Integer level,
        Integer coin
) {
    public static StudentResponse from(StudentDto dto) {
        return new StudentResponse(
                dto.studentId(),
                dto.name(),
                dto.gender(),
                dto.birth(),
                dto.profileImage(),
                dto.grade(),
                dto.level(),
                dto.coin()
        );
    }
}
