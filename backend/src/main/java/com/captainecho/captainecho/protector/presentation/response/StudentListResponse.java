package com.captainecho.captainecho.protector.presentation.response;

import com.captainecho.captainecho.protector.application.result.StudentListResult;

import java.util.List;

public record StudentListResponse(
        List<StudentResponse> students
) {
    public static StudentListResponse from(StudentListResult result) {
        List<StudentResponse> students = result.students().stream()
                .map(StudentResponse::from)
                .toList();
        return new StudentListResponse(students);
    }
}
