package com.captainecho.captainecho.protector.presentation.response;

import com.captainecho.captainecho.protector.application.result.StudentDto;

import java.util.List;

public record StudentResponse(
        Integer studentId,
        String name,
        String gender,
        String birth,
        String profileImage,
        String grade,
        Integer level,
        Integer coin,
        List<InterestResponse> interests
) {
    public static StudentResponse from(StudentDto dto) {
        List<InterestResponse> interests = dto.interests().stream()
                .map(InterestResponse::from)
                .toList();

        return new StudentResponse(
                dto.studentId(),
                dto.name(),
                dto.gender(),
                dto.birth(),
                dto.profileImage(),
                dto.grade(),
                dto.level(),
                dto.coin(),
                interests
        );
    }

    public record InterestResponse(
            Integer interestId,
            String interestName
    ) {
        public static InterestResponse from(StudentDto.InterestDto dto) {
            return new InterestResponse(
                    dto.interestId(),
                    dto.interestName()
            );
        }
    }
}
