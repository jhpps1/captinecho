package com.captainecho.captainecho.interest.presentation.request;

import com.captainecho.captainecho.interest.application.command.GetSubInterestsCommand;
import jakarta.validation.constraints.NotNull;

public record GetSubInterestsRequest(
        @NotNull(message = "관심사 대분류 ID는 필수입니다")
        Short majorInterestId
) {
    public GetSubInterestsCommand toCommand() {
        return new GetSubInterestsCommand(majorInterestId);
    }
}
