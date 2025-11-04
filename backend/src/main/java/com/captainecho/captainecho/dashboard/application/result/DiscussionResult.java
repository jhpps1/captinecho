package com.captainecho.captainecho.dashboard.application.result;

public record DiscussionResult(
        String discussion
) {
    public static DiscussionResult from(String discussion) {
        return new DiscussionResult(discussion);
    }
}
