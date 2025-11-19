package com.captainecho.captainecho.student.presentation;

import com.captainecho.captainecho.auth.domain.ProtectorPrincipal;
import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.CommonErrorCode;
import com.captainecho.captainecho.student.application.StudentService;
import com.captainecho.captainecho.student.application.command.AddStudentInterestCommand;
import com.captainecho.captainecho.student.application.command.DeleteStudentCommand;
import com.captainecho.captainecho.student.application.command.DeleteStudentInterestCommand;
import com.captainecho.captainecho.student.application.command.GetDailyAccuracyCommand;
import com.captainecho.captainecho.student.application.command.GetDailyStreakCommand;
import com.captainecho.captainecho.student.application.command.GetImproveAccuracyCommand;
import com.captainecho.captainecho.student.application.command.GetWeeklyAccuracyCommand;
import com.captainecho.captainecho.student.application.command.GetStudentInterestCommand;
import com.captainecho.captainecho.student.application.command.GetCurrentJamoStatCommand;
import com.captainecho.captainecho.student.application.command.GetTotalJamoStatCommand;
import com.captainecho.captainecho.student.application.command.GetWeeklyJamoStatCommand;
import com.captainecho.captainecho.student.application.command.GetBestImproveJamoCommand;
import com.captainecho.captainecho.student.application.command.GetWorstImproveJamoCommand;
import com.captainecho.captainecho.student.application.command.UpdateProfileImageCommand;
import com.captainecho.captainecho.student.application.command.UpdatePinCommand;
import com.captainecho.captainecho.student.application.command.UpdateStudentCommand;
import com.captainecho.captainecho.student.application.command.VerifyPinCommand;
import com.captainecho.captainecho.student.application.result.AddStudentInterestResult;
import com.captainecho.captainecho.student.application.result.DeleteStudentInterestResult;
import com.captainecho.captainecho.student.application.result.GetDailyAccuracyResult;
import com.captainecho.captainecho.student.application.result.GetDailyStreakResult;
import com.captainecho.captainecho.student.application.result.GetImproveAccuracyResult;
import com.captainecho.captainecho.student.application.result.GetWeeklyAccuracyResult;
import com.captainecho.captainecho.student.application.result.GetStudentInterestResult;
import com.captainecho.captainecho.student.application.result.GetCurrentJamoStatResult;
import com.captainecho.captainecho.student.application.result.GetTotalJamoStatResult;
import com.captainecho.captainecho.student.application.result.GetWeeklyJamoStatResult;
import com.captainecho.captainecho.student.application.result.GetBestImproveJamoResult;
import com.captainecho.captainecho.student.application.result.GetWorstImproveJamoResult;
import com.captainecho.captainecho.student.application.result.RegisterStudentResult;
import com.captainecho.captainecho.student.application.result.UpdateProfileImageResult;
import com.captainecho.captainecho.student.application.result.UpdatePinResult;
import com.captainecho.captainecho.student.application.result.UpdateStudentResult;
import com.captainecho.captainecho.student.application.result.VerifyPinResult;
import com.captainecho.captainecho.student.presentation.request.AddStudentInterestRequest;
import com.captainecho.captainecho.student.presentation.request.RegisterStudentRequest;
import com.captainecho.captainecho.student.presentation.request.UpdatePinRequest;
import com.captainecho.captainecho.student.presentation.request.UpdateStudentRequest;
import com.captainecho.captainecho.student.presentation.request.VerifyPinRequest;
import com.captainecho.captainecho.student.presentation.request.VerifyRecoveryCodeRequest;
import com.captainecho.captainecho.student.presentation.response.AccuracyResponse;
import com.captainecho.captainecho.student.presentation.response.AddStudentInterestResponse;
import com.captainecho.captainecho.student.presentation.response.DailyStreakResponse;
import com.captainecho.captainecho.student.presentation.response.DeleteStudentInterestResponse;
import com.captainecho.captainecho.student.presentation.response.GetStudentInterestResponse;
import com.captainecho.captainecho.student.presentation.response.GetWeeklyJamoStatResponse;
import com.captainecho.captainecho.student.presentation.response.ImproveAccuracyResponse;
import com.captainecho.captainecho.student.presentation.response.CurrentJamoStatResponse;
import com.captainecho.captainecho.student.presentation.response.RecoveryCodeResponse;
import com.captainecho.captainecho.student.presentation.response.TotalJamoStatResponse;
import com.captainecho.captainecho.student.presentation.response.BestImproveJamoResponse;
import com.captainecho.captainecho.student.presentation.response.WorstImproveJamoResponse;
import com.captainecho.captainecho.student.presentation.response.RegisterStudentResponse;
import com.captainecho.captainecho.student.presentation.response.UpdatePinResponse;
import com.captainecho.captainecho.student.presentation.response.UpdateProfileImageResponse;
import com.captainecho.captainecho.student.presentation.response.UpdateStudentResponse;
import com.captainecho.captainecho.student.presentation.response.VerifyPinResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

        Integer protectorId = principal.getProtectorId();

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

        Integer protectorId = principal.getProtectorId();

        DeleteStudentCommand command = new DeleteStudentCommand(protectorId, studentId);
        studentService.deleteStudent(command);

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PatchMapping("/{student-id}")
    @Operation(summary = "학생 정보 수정", description = "보호자가 자신의 학생 정보를 수정합니다 (이름, 성별, 생년월일, 학년)")
    public ResponseEntity<UpdateStudentResponse> updateStudent(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable("student-id") Integer studentId,
            @Valid @RequestBody UpdateStudentRequest request
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        UpdateStudentCommand command = request.toCommand(protectorId, studentId);
        UpdateStudentResult result = studentService.updateStudent(command);

        UpdateStudentResponse response = UpdateStudentResponse.from(result);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{studentId}/interests")
    public ResponseEntity<GetStudentInterestResponse> getStudentInterests(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable Integer studentId
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        GetStudentInterestCommand command = new GetStudentInterestCommand(studentId, protectorId);
        GetStudentInterestResult result = studentService.getStudentInterests(command);

        GetStudentInterestResponse response = GetStudentInterestResponse.from(result);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{studentId}/interests")
    public ResponseEntity<AddStudentInterestResponse> addStudentInterest(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable Integer studentId,
            @Valid @RequestBody AddStudentInterestRequest request
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        AddStudentInterestCommand command = request.toCommand(studentId, protectorId);
        AddStudentInterestResult result = studentService.addStudentInterest(command);

        AddStudentInterestResponse response = AddStudentInterestResponse.from(result);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{studentId}/interests/{interestId}")
    public ResponseEntity<DeleteStudentInterestResponse> deleteStudentInterest(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable Integer studentId,
            @PathVariable Integer interestId
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        DeleteStudentInterestCommand command = new DeleteStudentInterestCommand(studentId, interestId, protectorId);
        DeleteStudentInterestResult result = studentService.deleteStudentInterest(command);

        DeleteStudentInterestResponse response = DeleteStudentInterestResponse.from(result);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{studentId}/dashboard/weekly/jamo/stat")
    @Operation(summary = "지난주 학습 분석 조회", description = "특정 아동의 지난주 학습 분석(자모별 정답률)을 조회합니다")
    public ResponseEntity<GetWeeklyJamoStatResponse> getWeeklyJamoStat(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable Integer studentId
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        GetWeeklyJamoStatCommand command = new GetWeeklyJamoStatCommand(studentId, protectorId);
        GetWeeklyJamoStatResult result = studentService.getWeeklyJamoStat(command);

        GetWeeklyJamoStatResponse response = GetWeeklyJamoStatResponse.from(result);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{studentId}/dashboard/total/jamo/stat")
    public ResponseEntity<TotalJamoStatResponse> getTotalJamoStat(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable Integer studentId
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        GetTotalJamoStatCommand command = new GetTotalJamoStatCommand(protectorId, studentId);
        GetTotalJamoStatResult result = studentService.getTotalJamoStat(command);

        TotalJamoStatResponse response = TotalJamoStatResponse.from(result);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{studentId}/dashboard/current/jamo/stat")
    @Operation(summary = "이번 주 학습 분석 조회", description = "특정 아동의 이번 주 학습 분석(자모별 정답률)을 조회합니다 (jamo_stat 실시간 데이터)")
    public ResponseEntity<CurrentJamoStatResponse> getCurrentJamoStat(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable Integer studentId
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        GetCurrentJamoStatCommand command = new GetCurrentJamoStatCommand(protectorId, studentId);
        GetCurrentJamoStatResult result = studentService.getCurrentJamoStat(command);

        CurrentJamoStatResponse response = CurrentJamoStatResponse.from(result);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{studentId}/dashboard/improve/accuracy")
    public ResponseEntity<ImproveAccuracyResponse> getImproveAccuracy(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable Integer studentId
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        GetImproveAccuracyCommand command = new GetImproveAccuracyCommand(protectorId, studentId);
        GetImproveAccuracyResult result = studentService.getImproveAccuracy(command);

        ImproveAccuracyResponse response = ImproveAccuracyResponse.from(result);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{studentId}/dashboard/accuracy/today")
    @Operation(summary = "금일 평균 정확도 조회", description = "학습한 자모(count > 0)의 평균 정확도를 조회합니다")
    public ResponseEntity<AccuracyResponse> getDailyAccuracy(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable Integer studentId
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        GetDailyAccuracyCommand command = new GetDailyAccuracyCommand(protectorId, studentId);
        GetDailyAccuracyResult result = studentService.getDailyAccuracy(command);

        AccuracyResponse response = AccuracyResponse.fromDaily(result);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{studentId}/dashboard/accuracy/week")
    @Operation(summary = "금주 평균 정확도 조회", description = "학습한 자모(count > 0)의 평균 정확도를 조회합니다")
    public ResponseEntity<AccuracyResponse> getWeeklyAccuracy(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable Integer studentId
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        GetWeeklyAccuracyCommand command = new GetWeeklyAccuracyCommand(protectorId, studentId);
        GetWeeklyAccuracyResult result = studentService.getWeeklyAccuracy(command);

        AccuracyResponse response = AccuracyResponse.fromWeekly(result);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{studentId}/dashboard/best/improve/jamo")
    public ResponseEntity<BestImproveJamoResponse> getBestImproveJamo(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable Integer studentId
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        GetBestImproveJamoCommand command = new GetBestImproveJamoCommand(protectorId, studentId);
        GetBestImproveJamoResult result = studentService.getBestImproveJamo(command);

        BestImproveJamoResponse response = BestImproveJamoResponse.from(result);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{studentId}/dashboard/worst/improve/jamo")
    public ResponseEntity<WorstImproveJamoResponse> getWorstImproveJamo(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable Integer studentId
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        GetWorstImproveJamoCommand command = new GetWorstImproveJamoCommand(protectorId, studentId);
        GetWorstImproveJamoResult result = studentService.getWorstImproveJamo(command);

        WorstImproveJamoResponse response = WorstImproveJamoResponse.from(result);

        return ResponseEntity.ok(response);
    }

    /**
     * 학생 프로필 이미지 등록/수정 API
     *
     * @param principal 인증된 보호자 정보
     * @param studentId 학생 ID
     * @param file 업로드할 프로필 이미지 파일
     * @return 업로드된 이미지 URL
     */
    @PatchMapping(value = "/{student-id}/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "학생 프로필 이미지 등록/수정",
            description = "학생의 프로필 이미지를 등록하거나 수정합니다. 기존 이미지가 있으면 교체되며, 없으면 새로 등록됩니다. 지원 형식: JPG, JPEG, PNG, WEBP (최대 5MB)"
    )
    public ResponseEntity<UpdateProfileImageResponse> updateProfileImage(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable("student-id") Integer studentId,
            @RequestParam("file") MultipartFile file
    ) {
        // 인증 확인
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        // Command 생성 및 서비스 호출
        UpdateProfileImageCommand command = new UpdateProfileImageCommand(protectorId, studentId, file);
        UpdateProfileImageResult result = studentService.updateProfileImage(command);

        // Response 생성 및 반환
        UpdateProfileImageResponse response = new UpdateProfileImageResponse(result.imageUrl());

        return ResponseEntity.ok(response);
    }

    /**
     * 학생 PIN 검증 API
     *
     * @param studentId 학생 ID
     * @param request PIN 검증 요청 (pin)
     * @return PIN 검증 결과
     */
    @PostMapping("/{student-id}/pin/verify")
    @Operation(
            summary = "학생 PIN 검증",
            description = "학생 대시보드 접근 시 PIN을 검증합니다"
    )
    public ResponseEntity<VerifyPinResponse> verifyPin(
            @PathVariable("student-id") Integer studentId,
            @Valid @RequestBody VerifyPinRequest request
    ) {
        VerifyPinCommand command = request.toCommand(studentId);
        VerifyPinResult result = studentService.verifyPin(command);

        VerifyPinResponse response = VerifyPinResponse.from(result);

        return ResponseEntity.ok(response);
    }

    /**
     * 학생 PIN 수정 API
     *
     * @param studentId 학생 ID
     * @param request PIN 수정 요청 (currentPin, newPin)
     * @return PIN 수정 결과
     */
    @PatchMapping("/{student-id}/pin")
    @Operation(
            summary = "학생 PIN 수정",
            description = "학생의 PIN을 수정합니다"
    )
    public ResponseEntity<UpdatePinResponse> updatePin(
            @PathVariable("student-id") Integer studentId,
            @Valid @RequestBody UpdatePinRequest request
    ) {
        UpdatePinCommand command = request.toCommand(studentId);
        UpdatePinResult result = studentService.updatePin(command);

        UpdatePinResponse response = UpdatePinResponse.from(result);

        return ResponseEntity.ok(response);
    }

    /**
     * 일일 연속 학습 기록 조회 API
     *
     * @param principal 인증된 보호자 정보
     * @param studentId 학생 ID
     * @return 이번 주 월~금 학습 여부 및 현재 연속 학습일 수
     */
    @GetMapping("/{student-id}/dashboard/daily-streak")
    @Operation(
            summary = "일일 연속 학습 기록 조회",
            description = "이번 주 월~금 학습 여부와 현재 연속 학습일 수를 조회합니다"
    )
    public ResponseEntity<DailyStreakResponse> getDailyStreak(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable("student-id") Integer studentId
    ) {
        // 인증 확인
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        // Command 생성 및 서비스 호출
        GetDailyStreakCommand command = new GetDailyStreakCommand(protectorId, studentId);
        GetDailyStreakResult result = studentService.getDailyStreak(command);

        // Response 생성 및 반환
        DailyStreakResponse response = DailyStreakResponse.from(result);

        return ResponseEntity.ok(response);
    }
}
