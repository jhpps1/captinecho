package com.captainecho.captainecho.adventure.application.result;

import lombok.Builder;

@Builder
public record AdventureTypeDto(
        Integer adventureTypeId,
        String adventureName,
        String adventureInfo,
        String adventureInfoImage
) {
}
