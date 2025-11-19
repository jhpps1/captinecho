package com.captainecho.captainecho.auth.application;

import com.captainecho.captainecho.common.util.GoogleTokenInfo;
import com.captainecho.captainecho.common.util.GoogleTokenVerifier;
import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.AuthErrorCode;
import com.captainecho.captainecho.jwt.util.JwtUtil;
import com.captainecho.captainecho.auth.application.command.LocalLoginCommand;
import com.captainecho.captainecho.auth.application.command.LocalSignupCommand;
import com.captainecho.captainecho.auth.application.command.LoginCommand;
import com.captainecho.captainecho.auth.application.result.LoginResult;
import com.captainecho.captainecho.auth.application.result.SignupResult;
import com.captainecho.captainecho.protector.domain.Protector;
import com.captainecho.captainecho.protector.domain.Provider;
import com.captainecho.captainecho.protector.persistence.ProtectorRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class AuthService {

    private final ProtectorRepository protectorRepository;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

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

        // 탈퇴한 회원인지 확인
        if (Boolean.TRUE.equals(protector.getIsDeleted())) {
            throw new EchoException(AuthErrorCode.DELETED_USER);
        }

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

    @Transactional
    public SignupResult localSignup(LocalSignupCommand command) {
        // 1. 아이디 중복 체크
        if (protectorRepository.existsById(command.username())) {
            throw new EchoException(AuthErrorCode.DUPLICATE_USERNAME);
        }

        // 2. 이메일 중복 체크
        if (protectorRepository.existsByEmail(command.email())) {
            throw new EchoException(AuthErrorCode.DUPLICATE_EMAIL);
        }

        // 3. 비밀번호 해싱
        String hashedPassword = passwordEncoder.encode(command.password());

        // 4. Protector 엔티티 생성 (Provider.LOCAL, socialId=null)
        Protector newProtector = Protector.builder()
                .id(command.username())
                .password(hashedPassword)
                .email(command.email())
                .protectorPin("000000")
                .provider(Provider.LOCAL)
                .socialId(null)
                .build();

        Protector savedProtector = protectorRepository.save(newProtector);
        log.info("일반 회원가입 완료 - Protector ID: {}, Username: {}", savedProtector.getProtectorId(), savedProtector.getId());

        return new SignupResult(true);
    }

    @Transactional(readOnly = true)
    public LoginResult localLogin(LocalLoginCommand command) {
        // 1. 사용자 조회
        Protector protector = protectorRepository.findById(command.username())
                .orElseThrow(() -> new EchoException(AuthErrorCode.USER_NOT_FOUND));

        // 2. 탈퇴 여부 확인
        if (Boolean.TRUE.equals(protector.getIsDeleted())) {
            throw new EchoException(AuthErrorCode.DELETED_USER);
        }

        // 3. 비밀번호 검증
        if (!passwordEncoder.matches(command.password(), protector.getPassword())) {
            throw new EchoException(AuthErrorCode.INVALID_CREDENTIALS);
        }

        // 4. JWT 토큰 생성
        String accessToken = jwtUtil.generateAccessToken(protector.getProtectorId());

        // 5. 신규 사용자 여부 판단 (약관 미동의 = 신규 사용자)
        boolean isNewUser = !Boolean.TRUE.equals(protector.getTermsAgreed());

        log.info("일반 로그인 성공 - Protector ID: {}, Username: {}, isNewUser: {}",
                 protector.getProtectorId(), protector.getId(), isNewUser);

        return new LoginResult(protector.getProtectorId(), accessToken, isNewUser);
    }
}
