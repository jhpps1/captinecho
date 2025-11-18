package com.captainecho.captainecho.adventure.presentation;

import com.captainecho.captainecho.adventure.application.AdventureService;
import com.captainecho.captainecho.adventure.application.AdventureTypeService;
import com.captainecho.captainecho.adventure.application.result.AdventureTypeListResult;
import com.captainecho.captainecho.adventure.presentation.response.AdventureTypeListResponse;
import com.captainecho.captainecho.auth.domain.ProtectorPrincipal;
import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.CommonErrorCode;
import com.captainecho.captainecho.student.application.command.EndAdventureCommand;
import com.captainecho.captainecho.student.application.command.GetAdventureProblemsCommand;
import com.captainecho.captainecho.student.application.command.GetSupplementaryProblemsCommand;
import com.captainecho.captainecho.student.application.command.StartAdventureCommand;
import com.captainecho.captainecho.student.application.result.EndAdventureResult;
import com.captainecho.captainecho.student.application.result.GetAdventureProblemsResult;
import com.captainecho.captainecho.student.application.result.GetSupplementaryProblemsResult;
import com.captainecho.captainecho.student.application.result.StartAdventureResult;
import com.captainecho.captainecho.student.presentation.request.StartAdventureRequest;
import com.captainecho.captainecho.student.presentation.response.EndAdventureResponse;
import com.captainecho.captainecho.student.presentation.response.GetAdventureProblemsResponse;
import com.captainecho.captainecho.student.presentation.response.GetSupplementaryProblemsResponse;
import com.captainecho.captainecho.student.presentation.response.StartAdventureResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
@Tag(name = "Adventure", description = "탐험 관련 API")
public class AdventureController {

    private final AdventureTypeService adventureTypeService;
    private final AdventureService adventureService;

    @GetMapping("/adventure/type")
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
    public ResponseEntity<StartAdventureResponse> startAdventure(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable Integer studentId,
            @Valid @RequestBody StartAdventureRequest request
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

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
    public ResponseEntity<EndAdventureResponse> endAdventure(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable Integer studentId
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        EndAdventureCommand command = new EndAdventureCommand(studentId, protectorId);
        EndAdventureResult result = adventureService.endAdventure(command);
        EndAdventureResponse response = EndAdventureResponse.from(result);

        return ResponseEntity.ok(response);
    }

    /**
     * 일일 탐험 문제 조회
     * GET /api/student/{student-id}/adventure/problem
     */
    @GetMapping("/student/{studentId}/adventure/problem")
    public ResponseEntity<GetAdventureProblemsResponse> getAdventureProblems(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable Integer studentId
    ) {
        log.info(">>> 모험 문제 조회 API 시작: studentId={}", studentId);

        if (principal == null) {
            log.error("인증되지 않은 요청: studentId={}", studentId);
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();
        log.debug("보호자 인증 성공: protectorId={}, studentId={}", protectorId, studentId);

        GetAdventureProblemsCommand command = new GetAdventureProblemsCommand(studentId, protectorId);
        GetAdventureProblemsResult result = adventureService.getAdventureProblems(command);
        GetAdventureProblemsResponse response = GetAdventureProblemsResponse.from(result);

        log.info("<<< 모험 문제 조회 API 완료: studentId={}, problemCount={}",
                 studentId, response.problems() != null ? response.problems().size() : 0);
        return ResponseEntity.ok(response);
    }

    /**
     * 추가 학습 문제 조회 (탐험 타입별 랜덤 10문제)
     * GET /api/student/{student-id}/adventure/problem/supple
     */
    @GetMapping("/student/{studentId}/adventure/problem/supple")
    public ResponseEntity<GetSupplementaryProblemsResponse> getSupplementaryProblems(
            @AuthenticationPrincipal ProtectorPrincipal principal,
            @PathVariable Integer studentId,
            @RequestParam Integer adventureTypeId
    ) {
        if (principal == null) {
            throw new EchoException(CommonErrorCode.UNAUTHORIZED);
        }

        Integer protectorId = principal.getProtectorId();

        GetSupplementaryProblemsCommand command = new GetSupplementaryProblemsCommand(
                studentId,
                protectorId,
                adventureTypeId
        );
        GetSupplementaryProblemsResult result = adventureService.getSupplementaryProblems(command);
        GetSupplementaryProblemsResponse response = GetSupplementaryProblemsResponse.from(result);

        return ResponseEntity.ok(response);
    }
}
