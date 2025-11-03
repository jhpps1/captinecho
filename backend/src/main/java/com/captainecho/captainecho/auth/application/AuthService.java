package com.captainecho.captainecho.auth.application;

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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class AuthService {

    private final ProtectorRepository protectorRepository;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final JwtUtil jwtUtil;

    @Transactional
    public LoginResult login(LoginCommand command) {
        String socialId = googleTokenVerifier.verify(command.idToken());

        Provider provider;
        try {
            provider = Provider.valueOf(command.provider().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new EchoException(AuthErrorCode.INVALID_PROVIDER);
        }

        Protector protector = protectorRepository.findByProviderAndSocialId(provider, socialId)
                .orElseGet(() -> createNewProtector(provider, socialId));

        String accessToken = jwtUtil.generateAccessToken(protector.getProtectorId());

        return new LoginResult(protector.getProtectorId(), accessToken);
    }

    private Protector createNewProtector(Provider provider, String socialId) {
        Protector newProtector = Protector.builder()
                .protectorPin(null)
                .provider(provider)
                .socialId(socialId)
                .build();

        return protectorRepository.save(newProtector);
    }
}
