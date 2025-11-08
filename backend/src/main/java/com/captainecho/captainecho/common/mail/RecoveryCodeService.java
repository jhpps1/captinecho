package com.captainecho.captainecho.common.mail;

import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.AuthErrorCode;
import com.captainecho.captainecho.protector.domain.Protector;
import com.captainecho.captainecho.protector.persistence.ProtectorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecoveryCodeService {

    private final RedisTemplate<String, String> redisTemplate;
    private final EmailService emailService;
    private final ProtectorRepository protectorRepository;

    private static final String KEY_PREFIX = "pin:recovery:";
    private static final Duration CODE_EXPIRY = Duration.ofMinutes(5);
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String DEFAULT_PIN = "000000";

    /**
     * 6자리 인증 코드 생성 및 Redis에 저장
     */
    public String generateAndSaveCode(Integer protectorId) {
        String code = generateSixDigitCode();
        String key = KEY_PREFIX + protectorId;

        redisTemplate.opsForValue().set(key, code, CODE_EXPIRY);
        log.info("인증 코드 생성 및 저장 완료 - Protector ID: {}", protectorId);

        return code;
    }

    /**
     * 인증 코드 검증
     */
    public boolean verifyCode(Integer protectorId, String inputCode) {
        String key = KEY_PREFIX + protectorId;
        String storedCode = redisTemplate.opsForValue().get(key);

        if (storedCode == null) {
            log.warn("인증 코드가 존재하지 않거나 만료됨 - Protector ID: {}", protectorId);
            return false;
        }

        boolean isValid = storedCode.equals(inputCode);
        if (isValid) {
            // 검증 성공 시 코드 삭제
            redisTemplate.delete(key);
            log.info("인증 코드 검증 성공 및 삭제 - Protector ID: {}", protectorId);
        } else {
            log.warn("인증 코드 불일치 - Protector ID: {}", protectorId);
        }

        return isValid;
    }

    /**
     * 6자리 랜덤 숫자 생성
     */
    private String generateSixDigitCode() {
        int code = RANDOM.nextInt(900000) + 100000; // 100000 ~ 999999
        return String.valueOf(code);
    }

    /**
     * 인증 코드 강제 삭제 (선택사항)
     */
    public void deleteCode(Integer protectorId) {
        String key = KEY_PREFIX + protectorId;
        redisTemplate.delete(key);
        log.info("인증 코드 삭제 - Protector ID: {}", protectorId);
    }

    /**
     * PIN 복구 코드 발송
     */
    public void sendRecoveryCode(Long protectorId) {
        Protector protector = protectorRepository.findById(protectorId.intValue())
                .orElseThrow(() -> new EchoException(AuthErrorCode.PROTECTOR_NOT_FOUND));

        String code = generateAndSaveCode(protectorId.intValue());
        emailService.sendPinRecoveryCode(protector.getEmail(), code);
        log.info("PIN 복구 코드 이메일 발송 완료 - Protector ID: {}", protectorId);
    }

    /**
     * 인증 코드 검증 및 PIN 초기화
     */
    public void verifyAndResetPin(Long protectorId, String code) {
        boolean isValid = verifyCode(protectorId.intValue(), code);

        if (!isValid) {
            throw new EchoException(AuthErrorCode.INVALID_RECOVERY_CODE);
        }

        Protector protector = protectorRepository.findById(protectorId.intValue())
                .orElseThrow(() -> new EchoException(AuthErrorCode.PROTECTOR_NOT_FOUND));

        protector.updateProtectorPin(DEFAULT_PIN);
        protectorRepository.save(protector);

        log.info("PIN 초기화 완료 - Protector ID: {}", protectorId);
    }
}
