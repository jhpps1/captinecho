package com.captainecho.captainecho.adventure.presentation;

import com.captainecho.captainecho.adventure.application.AdventureService;
import com.captainecho.captainecho.adventure.application.AdventureTypeService;
import com.captainecho.captainecho.adventure.application.result.AdventureTypeListResult;
import com.captainecho.captainecho.adventure.presentation.response.AdventureTypeListResponse;
import com.captainecho.captainecho.auth.domain.ProtectorPrincipal;
import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.CommonErrorCode;
import com.captainecho.captainecho.student.application.command.EndAdventureCommand;
import com.captainecho.captainecho.student.application.command.StartAdventureCommand;
import com.captainecho.captainecho.student.application.result.EndAdventureResult;
import com.captainecho.captainecho.student.application.result.StartAdventureResult;
import com.captainecho.captainecho.student.presentation.request.StartAdventureRequest;
import com.captainecho.captainecho.student.presentation.response.EndAdventureResponse;
import com.captainecho.captainecho.student.presentation.response.StartAdventureResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
@Tag(name = "Adventure", description = "탐험 관련 API")
public class AdventureController {

    private final AdventureTypeService adventureTypeService;
    private final AdventureService adventureService;

    @GetMapping("/adventure/type")
    @Operation(summary = "탐험 타입 목록 조회", description = "모든 탐험 타입을 조회합니다.")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    public ResponseEntity<AdventureTypeListResponse> getAdventureTypes() {
        AdventureTypeListResult result = adventureTypeService.getAllAdventureTypes();
        AdventureTypeListResponse response = AdventureTypeListResponse.from(result);
        return ResponseEntity.ok(response);
    }

    /**
     * 탐험 시작
     * POST /api/student/{student-id}/adventure/start
     */
    @PostMapping("/student/{studentId}/adventure/start")
    @Operation(summary = "탐험 시작", description = "학생의 탐험을 시작합니다.")
    public ResponseEntity<StartAdventureResponse> startAdventure(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable Integer studentId,
            @Valid @RequestBody StartAdventureRequest request
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Long protectorId = principal.getProtectorId();

        StartAdventureCommand command = request.toCommand(studentId, protectorId);
        StartAdventureResult result = adventureService.startAdventure(command);
        StartAdventureResponse response = StartAdventureResponse.from(result);

        return ResponseEntity.ok(response);
    }

    /**
     * 탐험 종료
     * POST /api/student/{student-id}/adventure/end
     */
    @PostMapping("/student/{studentId}/adventure/end")
    @Operation(summary = "탐험 종료", description = "학생의 진행 중인 탐험을 종료합니다.")
    public ResponseEntity<EndAdventureResponse> endAdventure(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable Integer studentId
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Long protectorId = principal.getProtectorId();

        EndAdventureCommand command = new EndAdventureCommand(studentId, protectorId);
        EndAdventureResult result = adventureService.endAdventure(command);
        EndAdventureResponse response = EndAdventureResponse.from(result);

        return ResponseEntity.ok(response);
    }
}
