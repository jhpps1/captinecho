package com.captainecho.captainecho.protector.application;

import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.ProtectorErrorCode;
import com.captainecho.captainecho.protector.application.command.CreatePinCommand;
import com.captainecho.captainecho.protector.application.command.VerifyPinCommand;
import com.captainecho.captainecho.protector.application.result.CreatePinResult;
import com.captainecho.captainecho.protector.application.result.VerifyPinResult;
import com.captainecho.captainecho.protector.domain.Protector;
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
public class ProtectorService {

    private final ProtectorRepository protectorRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public CreatePinResult createPin(CreatePinCommand command) {
        // 1. Protector 조회
        Protector protector = protectorRepository.findById(command.protectorId())
                .orElseThrow(() -> new EchoException(ProtectorErrorCode.PROTECTOR_NOT_FOUND));

        // 2. PIN이 이미 설정되어 있는지 확인
        if (protector.getProtectorPin() != null && !protector.getProtectorPin().isEmpty()) {
            log.error("PIN already exists for protector: {}", protector.getProtectorId());
            throw new EchoException(ProtectorErrorCode.PIN_ALREADY_EXISTS);
        }

        // 3. PIN 암호화
        String encodedPin = passwordEncoder.encode(command.pin());

        // 4. PIN 저장
        protector.updateProtectorPin(encodedPin);

        return new CreatePinResult(true);
    }

    @Transactional(readOnly = true)
    public VerifyPinResult verifyPin(VerifyPinCommand command) {
        // 1. Protector 조회
        Protector protector = protectorRepository.findById(command.protectorId())
                .orElseThrow(() -> new EchoException(ProtectorErrorCode.PROTECTOR_NOT_FOUND));

        // 2. PIN 등록 여부 확인
        String storedPin = protector.getProtectorPin();

        if (storedPin == null || storedPin.isEmpty()) {
            log.error("PIN not found in database for protectorId: {}", command.protectorId());
            throw new EchoException(ProtectorErrorCode.PIN_NOT_FOUND);
        }

        // 3. PIN 검증
        boolean isValid = passwordEncoder.matches(command.pin(), storedPin);

        if (!isValid) {
            log.warn("PIN verification failed for protectorId: {}", command.protectorId());
        }

        return new VerifyPinResult(isValid);
    }
}
