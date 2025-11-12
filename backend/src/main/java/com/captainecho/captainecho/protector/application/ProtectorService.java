package com.captainecho.captainecho.protector.application;

import com.captainecho.captainecho.common.mail.EmailService;
import com.captainecho.captainecho.common.mail.RecoveryCodeService;
import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.ProtectorErrorCode;
import com.captainecho.captainecho.protector.application.command.CreatePinCommand;
import com.captainecho.captainecho.protector.application.command.GetStudentCountCommand;
import com.captainecho.captainecho.protector.application.command.UpdatePinCommand;
import com.captainecho.captainecho.protector.application.command.VerifyPinCommand;
import com.captainecho.captainecho.protector.application.result.CreatePinResult;
import com.captainecho.captainecho.protector.application.result.GetStudentCountResult;
import com.captainecho.captainecho.protector.application.result.UpdatePinResult;
import com.captainecho.captainecho.protector.application.result.VerifyPinResult;
import com.captainecho.captainecho.protector.domain.Protector;
import com.captainecho.captainecho.protector.persistence.ProtectorRepository;
import com.captainecho.captainecho.student.domain.Student;
import com.captainecho.captainecho.student.domain.StudentInterest;
import com.captainecho.captainecho.student.persistence.StudentRepository;
import com.captainecho.captainecho.protector.application.result.StudentListResult;
import com.captainecho.captainecho.protector.application.result.StudentDto;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class ProtectorService {

    private final ProtectorRepository protectorRepository;
    private final StudentRepository studentRepository;
    private final com.captainecho.captainecho.student.persistence.StudentInterestRepository studentInterestRepository;
    private final EmailService emailService;
    private final RecoveryCodeService recoveryCodeService;

    @Transactional
    public CreatePinResult createPin(CreatePinCommand command) {
        // 1. Protector 조회
        Protector protector = protectorRepository.findById(command.protectorId())
                .orElseThrow(() -> new EchoException(ProtectorErrorCode.PROTECTOR_NOT_FOUND));

        // 2. PIN이 이미 설정되어 있는지 확인
        if (protector.getProtectorPin() != null && !protector.getProtectorPin().isEmpty()) {
            throw new EchoException(ProtectorErrorCode.PIN_ALREADY_EXISTS);
        }

        // 3. PIN 저장 (평문)
        protector.updateProtectorPin(command.pin());

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

        // 3. PIN 검증 (평문 비교)
        boolean isValid = command.pin().equals(storedPin);

        // 4. PIN 불일치 시 예외 발생
        if (!isValid) {
            throw new EchoException(ProtectorErrorCode.PIN_NOT_MATCH);
        }

        return new VerifyPinResult(true);
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

        // 3. 현재 PIN 검증 (평문 비교)
        if (!command.currentPin().equals(storedPin)) {
            throw new EchoException(ProtectorErrorCode.PIN_NOT_MATCH);
        }

        // 4. 새 PIN 업데이트 (평문)
        protector.updateProtectorPin(command.newPin());

        return new UpdatePinResult(true);
    }

    /**
     * 보호자의 학생 목록 조회 (N+1 문제 해결)
     */
    @Transactional(readOnly = true)
    public StudentListResult getStudents(Integer protectorId) {
        // 1. 학생 목록 조회 (1개 쿼리)
        List<Student> students = studentRepository.findByProtector_ProtectorId(protectorId);
        log.info("📋 조회된 학생 수: {}", students.size());

        if (students.isEmpty()) {
            return new StudentListResult(List.of());
        }

        // 2. 학생 ID 리스트 추출
        List<Integer> studentIds = students.stream()
                .map(Student::getStudentId)
                .collect(Collectors.toList());

        // 3. 모든 학생의 관심사를 한 번에 조회 (1개 쿼리, IN 절 사용으로 N+1 방지)
        List<StudentInterest> allStudentInterests = studentInterestRepository
                .findByStudentIdsWithSubInterest(studentIds);
        log.info("📚 조회된 전체 관심사 개수: {}", allStudentInterests.size());

        // 4. 학생 ID별로 관심사 그룹화 (메모리에서 처리)
        Map<Integer, List<StudentInterest>> interestsByStudentId = allStudentInterests.stream()
                .collect(Collectors.groupingBy(si -> si.getStudent().getStudentId()));

        // 5. DTO 변환
        List<StudentDto> studentDtos = students.stream()
                .map(student -> {
                    // 해당 학생의 관심사 가져오기 (이미 메모리에 로드됨, 추가 쿼리 없음)
                    List<StudentInterest> studentInterests = interestsByStudentId
                            .getOrDefault(student.getStudentId(), List.of());

                    log.info("👤 학생 ID {}: 관심사 개수 = {}", student.getStudentId(), studentInterests.size());

                    List<StudentDto.InterestDto> interests = studentInterests.stream()
                            .map(studentInterest -> {
                                log.info("  ✨ 관심사: ID={}, 이름={}",
                                    studentInterest.getSubInterest().getSubInterestId(),
                                    studentInterest.getSubInterest().getSmallInterestName());
                                return StudentDto.InterestDto.builder()
                                        .interestId(studentInterest.getSubInterest().getSubInterestId().intValue())
                                        .interestName(studentInterest.getSubInterest().getSmallInterestName())
                                        .build();
                            })
                            .collect(Collectors.toList());

                    log.info("  🎯 변환된 관심사 DTO 개수: {}", interests.size());

                    return StudentDto.builder()
                            .studentId(student.getStudentId())
                            .name(student.getName())
                            .gender(student.getGender() != null ? student.getGender().name() : null)
                            .birth(student.getBirth() != null ? student.getBirth().toString() : null)
                            .profileImage(student.getProfileImage())
                            .grade(student.getGrade() != null ? student.getGrade().name() : null)
                            .level(student.getLevel() != null ? student.getLevel().intValue() : null)
                            .coin(student.getCoin())
                            .interests(interests)
                            .build();
                })
                .collect(Collectors.toList());

        log.info("✅ 최종 StudentDto 개수: {}", studentDtos.size());
        return new StudentListResult(studentDtos);
    }

    /**
     * 보호자의 학생 계정 수 조회
     */
    @Transactional(readOnly = true)
    public GetStudentCountResult getStudentCount(GetStudentCountCommand command) {
        // 1. Protector 조회
        Protector protector = protectorRepository.findById(command.protectorId())
                .orElseThrow(() -> new EchoException(ProtectorErrorCode.PROTECTOR_NOT_FOUND));

        // 2. 총 할당 계정 수
        Integer totalCount = protector.getMaxStudentCount().intValue();

        // 3. 현재 등록된 학생 수 (삭제되지 않은 학생만)
        Integer currentStudentCount = studentRepository.findActiveStudentsByProtectorId(command.protectorId()).size();

        // 4. 남은 계정 수 계산
        Integer remainCount = totalCount - currentStudentCount;

        return GetStudentCountResult.of(totalCount, remainCount);
    }

    /**
     * PIN 복구 인증 코드 전송
     */
    @Transactional
    public void sendRecoveryCode(Integer protectorId) {
        // 1. Protector 조회
        Protector protector = protectorRepository.findById(protectorId)
                .orElseThrow(() -> new EchoException(ProtectorErrorCode.PROTECTOR_NOT_FOUND));

        // 2. 이메일 확인
        String email = protector.getEmail();
        if (email == null || email.isEmpty()) {
            throw new EchoException(ProtectorErrorCode.EMAIL_NOT_FOUND);
        }

        // 3. 인증 코드 생성 및 Redis 저장
        String code = recoveryCodeService.generateAndSaveCode(protectorId);

        // 4. 이메일 발송
        emailService.sendPinRecoveryCode(email, code);

        log.info("PIN 복구 인증 코드 전송 완료 - Protector ID: {}, Email: {}", protectorId, email);
    }

    /**
     * PIN 복구 인증 코드 검증 및 PIN 초기화
     */
    @Transactional
    public void verifyRecoveryCodeAndResetPin(Integer protectorId, String code) {
        // 1. Protector 조회
        Protector protector = protectorRepository.findById(protectorId)
                .orElseThrow(() -> new EchoException(ProtectorErrorCode.PROTECTOR_NOT_FOUND));

        // 2. 인증 코드 검증
        boolean isValid = recoveryCodeService.verifyCode(protectorId, code);

        if (!isValid) {
            throw new EchoException(ProtectorErrorCode.INVALID_RECOVERY_CODE);
        }

        // 3. PIN 초기화 (기본값 "000000"으로 리셋)
        protector.updateProtectorPin("000000");

        log.info("PIN 초기화 완료 - Protector ID: {}", protectorId);
    }

    /**
     * 약관 동의 업데이트
     */
    @Transactional
    public void updateTermsAgreed(Integer protectorId, Boolean termsAgreed) {
        // 1. Protector 조회
        Protector protector = protectorRepository.findById(protectorId)
                .orElseThrow(() -> new EchoException(ProtectorErrorCode.PROTECTOR_NOT_FOUND));

        // 2. 약관 동의 상태 업데이트
        protector.updateTermsAgreed(termsAgreed);

        log.info("약관 동의 상태 업데이트 완료 - Protector ID: {}, Terms Agreed: {}", protectorId, termsAgreed);
    }
}
