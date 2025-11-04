package com.captainecho.captainecho.dashboard.presentation.response;

import com.captainecho.captainecho.dashboard.application.result.DiscussionResult;

public record DiscussionResponse(
        String discussion
) {
    public static DiscussionResponse from(DiscussionResult result) {
        return new DiscussionResponse(result.discussion());
    }
}
