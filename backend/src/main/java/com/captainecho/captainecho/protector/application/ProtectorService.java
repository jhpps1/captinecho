package com.captainecho.captainecho.protector.application;

import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.ProtectorErrorCode;
import com.captainecho.captainecho.protector.application.command.CreatePinCommand;
import com.captainecho.captainecho.protector.application.command.UpdatePinCommand;
import com.captainecho.captainecho.protector.application.command.VerifyPinCommand;
import com.captainecho.captainecho.protector.application.result.CreatePinResult;
import com.captainecho.captainecho.protector.application.result.UpdatePinResult;
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
            throw new EchoException(ProtectorErrorCode.PIN_NOT_FOUND);
        }

        // 3. PIN 검증
        boolean isValid = passwordEncoder.matches(command.pin(), storedPin);

        return new VerifyPinResult(isValid);
    }

    @Transactional
    public UpdatePinResult updatePin(UpdatePinCommand command) {
        // 1. Protector 조회
        Protector protector = protectorRepository.findById(command.protectorId())
                .orElseThrow(() -> new EchoException(ProtectorErrorCode.PROTECTOR_NOT_FOUND));

        // 2. PIN 등록 여부 확인
        String storedPin = protector.getProtectorPin();

        if (storedPin == null || storedPin.isEmpty()) {
            throw new EchoException(ProtectorErrorCode.PIN_NOT_FOUND);
        }

        // 3. 현재 PIN 검증
        if (!passwordEncoder.matches(command.currentPin(), storedPin)) {
            throw new EchoException(ProtectorErrorCode.PIN_NOT_MATCH);
        }

        // 4. 새 PIN 암호화
        String encodedNewPin = passwordEncoder.encode(command.newPin());

        // 5. PIN 업데이트
        protector.updateProtectorPin(encodedNewPin);

        return new UpdatePinResult(true);
    }
}
