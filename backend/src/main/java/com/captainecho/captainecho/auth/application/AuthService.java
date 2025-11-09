package com.captainecho.captainecho.auth.application;

import com.captainecho.captainecho.common.util.GoogleTokenInfo;
import com.captainecho.captainecho.common.util.GoogleTokenVerifier;
import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.AuthErrorCode;
import com.captainecho.captainecho.jwt.util.JwtUtil;
import com.captainecho.captainecho.auth.application.command.LoginCommand;
import com.captainecho.captainecho.auth.application.result.LoginResult;
import com.captainecho.captainecho.protector.domain.Protector;
import com.captainecho.captainecho.protector.domain.Provider;
import com.captainecho.captainecho.protector.persistence.ProtectorRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class AuthService {

    private final ProtectorRepository protectorRepository;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final JwtUtil jwtUtil;

    @Transactional
    public LoginResult login(LoginCommand command) {
        GoogleTokenInfo tokenInfo = googleTokenVerifier.verify(command.idToken());

        Provider provider;
        try {
            provider = Provider.valueOf(command.provider().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new EchoException(AuthErrorCode.INVALID_PROVIDER);
        }

        // 신규 회원 여부 판단
        var existingProtector = protectorRepository.findByProviderAndSocialId(provider, tokenInfo.socialId());
        boolean isNewUser = existingProtector.isEmpty();

        Protector protector = existingProtector
                .orElseGet(() -> createNewProtector(provider, tokenInfo.socialId(), tokenInfo.email()));

        // 기존 사용자이지만 이메일이 없는 경우 자동 업데이트
        if ((protector.getEmail() == null || protector.getEmail().isEmpty()) && tokenInfo.email() != null) {
            protector.updateEmail(tokenInfo.email());
            protectorRepository.save(protector);
            log.info("기존 보호자 이메일 업데이트 완료 - Protector ID: {}, Email: {}", protector.getProtectorId(), tokenInfo.email());
        }

        String accessToken = jwtUtil.generateAccessToken(protector.getProtectorId());

        return new LoginResult(protector.getProtectorId(), accessToken, isNewUser);
    }

    private Protector createNewProtector(Provider provider, String socialId, String email) {
        Protector newProtector = Protector.builder()
                .protectorPin("000000")
                .provider(provider)
                .socialId(socialId)
                .email(email)
                .build();

        return protectorRepository.save(newProtector);
    }
}
