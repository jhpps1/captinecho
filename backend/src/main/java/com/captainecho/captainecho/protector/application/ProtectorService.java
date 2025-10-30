package com.captainecho.captainecho.protector.application;

import com.captainecho.captainecho.common.util.GoogleTokenVerifier;
import com.captainecho.captainecho.jwt.util.JwtUtil;
import com.captainecho.captainecho.protector.application.command.LoginCommand;
import com.captainecho.captainecho.protector.application.result.LoginResult;
import com.captainecho.captainecho.protector.domain.Protector;
import com.captainecho.captainecho.protector.persistence.ProtectorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 보호자 관련 비즈니스 로직을 처리하는 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProtectorService {

    private final ProtectorRepository protectorRepository;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final JwtUtil jwtUtil;

    /**
     * Google 소셜 로그인 처리
     * 1. Google ID Token 검증
     * 2. 기존 사용자 조회 또는 신규 사용자 생성
     * 3. JWT 액세스 토큰 발급
     *
     * @param command 로그인 요청 정보 (idToken, provider)
     * @return 로그인 결과 (protectorId, accessToken)
     */
    @Transactional
    public LoginResult login(LoginCommand command) {
        // 1. Google ID Token 검증 및 socialId 추출
        String socialId = googleTokenVerifier.verify(command.idToken());

        // 2. 기존 사용자 조회 또는 신규 사용자 생성
        Protector protector = protectorRepository.findByProviderAndSocialId(command.provider(), socialId)
                .orElseGet(() -> createNewProtector(command.provider(), socialId));

        // 3. JWT 액세스 토큰 생성
        String accessToken = jwtUtil.generateAccessToken(protector.getProtectorId());

        return new LoginResult(protector.getProtectorId(), accessToken);
    }

    private Protector createNewProtector(String provider, String socialId) {
        Protector newProtector = Protector.builder()
                .parentPin(null)
                .provider(provider)
                .socialId(socialId)
                .build();

        return protectorRepository.save(newProtector);
    }
}
