package com.captainecho.captainecho.adventure.application.result;

import java.util.List;

public record AdventureTypeListResult(
        List<AdventureTypeDto> adventures
) {
}
