package com.captainecho.captainecho.protector.application.result;

import lombok.Builder;

import java.util.List;

@Builder
public record StudentDto(
        Integer studentId,
        String name,
        String gender,
        String birth,
        String profileImage,
        String grade,
        Integer level,
        Integer coin,
        List<InterestDto> interests
) {
    @Builder
    public record InterestDto(
            Integer interestId,
            String interestName
    ) {
    }
}
