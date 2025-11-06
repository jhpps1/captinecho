package com.captainecho.captainecho.student.presentation;

import com.captainecho.captainecho.auth.domain.ProtectorPrincipal;
import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.CommonErrorCode;
import com.captainecho.captainecho.student.application.StudentService;
import com.captainecho.captainecho.student.application.command.DeleteStudentCommand;
import com.captainecho.captainecho.student.application.result.RegisterStudentResult;
import com.captainecho.captainecho.student.presentation.request.RegisterStudentRequest;
import com.captainecho.captainecho.student.presentation.response.RegisterStudentResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

@Slf4j
@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
@Tag(name = "Student", description = "학생 관리 API")
public class StudentController {

    private final StudentService studentService;

    @PostMapping
    @Operation(summary = "학생 등록", description = "보호자가 새로운 학생을 등록합니다")
    public ResponseEntity<RegisterStudentResponse> registerStudent(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @Valid @RequestBody RegisterStudentRequest request
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Long protectorId = principal.getProtectorId();

        RegisterStudentResult result = studentService.registerStudent(request.toCommand(protectorId));

        RegisterStudentResponse response = new RegisterStudentResponse(result.success());

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{student-id}")
    @Operation(summary = "학생 삭제", description = "보호자가 자신의 학생을 삭제합니다")
    public ResponseEntity<Void> deleteStudent(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable("student-id") Integer studentId
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Long protectorId = principal.getProtectorId();

        DeleteStudentCommand command = new DeleteStudentCommand(protectorId, studentId);
        studentService.deleteStudent(command);

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
