package com.captainecho.captainecho.adventure.presentation.response;

import com.captainecho.captainecho.adventure.application.result.AdventureTypeDto;

public record AdventureTypeResponse(
        Integer adventureId,
        String adventureName,
        String adventureInfo,
        String imageUrl
) {
    public static AdventureTypeResponse from(AdventureTypeDto dto) {
        return new AdventureTypeResponse(
                dto.adventureTypeId(),
                dto.adventureName(),
                dto.adventureInfo(),
                dto.adventureInfoImage()
        );
    }
}
