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
        log.info("=== ProtectorService.createPin ===");
        log.info("ProtectorId: {}", command.protectorId());
        log.info("Input PIN: {}", command.pin());

        // 1. Protector 조회
        Protector protector = protectorRepository.findById(command.protectorId())
                .orElseThrow(() -> new EchoException(ProtectorErrorCode.PROTECTOR_NOT_FOUND));

        log.info("Protector found: {}", protector.getProtectorId());

        // 2. PIN이 이미 설정되어 있는지 확인
        if (protector.getProtectorPin() != null && !protector.getProtectorPin().isEmpty()) {
            log.error("PIN already exists for protector: {}", protector.getProtectorId());
            throw new EchoException(ProtectorErrorCode.PIN_ALREADY_EXISTS);
        }

        // 3. PIN 암호화
        String encodedPin = passwordEncoder.encode(command.pin());
        log.info("PIN encoded successfully. Encoded PIN starts with: {}", encodedPin.substring(0, 10) + "...");

        // 4. PIN 저장
        protector.updateProtectorPin(encodedPin);
        log.info("PIN saved successfully");

        return new CreatePinResult(true);
    }

    @Transactional(readOnly = true)
    public VerifyPinResult verifyPin(VerifyPinCommand command) {
        log.info("=== ProtectorService.verifyPin ===");
        log.info("ProtectorId: {}", command.protectorId());
        log.info("Input PIN: {}", command.pin());

        // 1. Protector 조회
        Protector protector = protectorRepository.findById(command.protectorId())
                .orElseThrow(() -> new EchoException(ProtectorErrorCode.PROTECTOR_NOT_FOUND));

        log.info("Protector found: {}", protector.getProtectorId());

        // 2. PIN 등록 여부 확인
        String storedPin = protector.getProtectorPin();
        log.info("Stored PIN exists: {}", storedPin != null && !storedPin.isEmpty());
        log.info("Stored PIN starts with: {}", storedPin != null && storedPin.length() > 10 ? storedPin.substring(0, 10) + "..." : storedPin);

        if (storedPin == null || storedPin.isEmpty()) {
            log.error("PIN not found in database");
            throw new EchoException(ProtectorErrorCode.PIN_NOT_FOUND);
        }

        // 3. PIN 검증
        log.info("Calling passwordEncoder.matches()...");
        boolean isValid = passwordEncoder.matches(command.pin(), storedPin);
        log.info("PIN verification result: {}", isValid);

        return new VerifyPinResult(isValid);
    }
}
