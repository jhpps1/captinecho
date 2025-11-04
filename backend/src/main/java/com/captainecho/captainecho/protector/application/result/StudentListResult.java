package com.captainecho.captainecho.protector.application.result;

import java.util.List;

public record StudentListResult(
        List<StudentDto> students
) {
}
