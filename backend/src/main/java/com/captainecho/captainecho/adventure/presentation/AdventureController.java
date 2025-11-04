package com.captainecho.captainecho.adventure.presentation;

import com.captainecho.captainecho.adventure.application.AdventureTypeService;
import com.captainecho.captainecho.adventure.application.result.AdventureTypeListResult;
import com.captainecho.captainecho.adventure.presentation.response.AdventureTypeListResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/adventure")
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
@Tag(name = "Adventure", description = "탐험 관련 API")
public class AdventureController {

    private final AdventureTypeService adventureTypeService;

    @GetMapping("/type")
    @Operation(summary = "탐험 타입 목록 조회", description = "모든 탐험 타입을 조회합니다.")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    public ResponseEntity<AdventureTypeListResponse> getAdventureTypes() {
        AdventureTypeListResult result = adventureTypeService.getAllAdventureTypes();
        AdventureTypeListResponse response = AdventureTypeListResponse.from(result);
        return ResponseEntity.ok(response);
    }
}
