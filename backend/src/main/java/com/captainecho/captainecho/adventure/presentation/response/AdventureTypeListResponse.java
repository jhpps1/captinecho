package com.captainecho.captainecho.adventure.presentation.response;

import com.captainecho.captainecho.adventure.application.result.AdventureTypeListResult;

import java.util.List;

public record AdventureTypeListResponse(
        List<AdventureTypeResponse> adventures
) {
    public static AdventureTypeListResponse from(AdventureTypeListResult result) {
        List<AdventureTypeResponse> adventures = result.adventures().stream()
                .map(AdventureTypeResponse::from)
                .toList();
        return new AdventureTypeListResponse(adventures);
    }
}
