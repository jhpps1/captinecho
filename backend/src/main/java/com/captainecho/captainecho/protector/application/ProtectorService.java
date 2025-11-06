package com.captainecho.captainecho.protector.application;

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
import com.captainecho.captainecho.student.persistence.StudentRepository;
import com.captainecho.captainecho.protector.application.result.StudentListResult;
import com.captainecho.captainecho.protector.application.result.StudentDto;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class ProtectorService {

    private final ProtectorRepository protectorRepository;
    private final StudentRepository studentRepository;
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

    /**
     * 보호자의 학생 목록 조회
     */
    @Transactional(readOnly = true)
    public StudentListResult getStudents(Long protectorId) {
        // 1. 학생 목록 조회
        List<Student> students = studentRepository.findByProtector_ProtectorId(protectorId);

        // 2. DTO 변환
        List<StudentDto> studentDtos = students.stream()
                .map(student -> StudentDto.builder()
                        .studentId(student.getStudentId())
                        .name(student.getName())
                        .gender(student.getGender() != null ? student.getGender().name() : null)
                        .profileImage(student.getProfileImage())
                        .grade(student.getGrade() != null ? student.getGrade().name() : null)
                        .level(student.getLevel() != null ? student.getLevel().intValue() : null)
                        .coin(student.getCoin())
                        .build())
                .collect(Collectors.toList());

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
}
