package com.captainecho.captainecho.protector.presentation.request;

import jakarta.validation.constraints.NotNull;

public record UpdateTermsRequest(
        @NotNull(message = "약관 동의 여부는 필수입니다")
        Boolean termsAgreed
) {
}
