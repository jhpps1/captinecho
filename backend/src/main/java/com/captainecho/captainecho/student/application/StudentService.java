package com.captainecho.captainecho.student.application;

import com.captainecho.captainecho.adventure.persistence.DayProblemRepository;
import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.ProtectorErrorCode;
import com.captainecho.captainecho.exception.code.StudentErrorCode;
import com.captainecho.captainecho.interest.domain.SubInterest;
import com.captainecho.captainecho.interest.persistence.SubInterestRepository;
import com.captainecho.captainecho.protector.domain.Protector;
import com.captainecho.captainecho.protector.persistence.ProtectorRepository;
import com.captainecho.captainecho.student.application.command.GetDailyCompletedCountCommand;
import com.captainecho.captainecho.student.application.command.GetDailyGoalCountCommand;
import com.captainecho.captainecho.student.application.command.RegisterStudentCommand;
import com.captainecho.captainecho.student.application.result.GetDailyCompletedCountResult;
import com.captainecho.captainecho.student.application.result.GetDailyGoalCountResult;
import com.captainecho.captainecho.student.application.result.RegisterStudentResult;
import com.captainecho.captainecho.student.domain.Grade;
import com.captainecho.captainecho.student.domain.Student;
import com.captainecho.captainecho.student.domain.StudentInterest;
import com.captainecho.captainecho.student.persistence.StudentInterestRepository;
import com.captainecho.captainecho.student.persistence.StudentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class StudentService {

    private final StudentRepository studentRepository;
    private final StudentInterestRepository studentInterestRepository;
    private final ProtectorRepository protectorRepository;
    private final SubInterestRepository subInterestRepository;
    private final DayProblemRepository dayProblemRepository;

    @Transactional
    public RegisterStudentResult registerStudent(RegisterStudentCommand command) {
        // 1. Protector 존재 확인
        Protector protector = protectorRepository.findById(command.protectorId())
                .orElseThrow(() -> new EchoException(ProtectorErrorCode.PROTECTOR_NOT_FOUND));

        // 2. 현재 등록된 학생 수 확인
        List<Student> currentStudents = studentRepository.findByProtector_ProtectorId(command.protectorId());
        if (currentStudents.size() >= protector.getMaxStudentCount()) {
            throw new EchoException(StudentErrorCode.MAX_STUDENT_COUNT_EXCEEDED);
        }

        // 3. Long interestId를 Short로 변환 (관심사가 있는 경우에만)
        List<Short> shortInterestIds = command.interestIds().stream()
                .map(id -> {
                    if (id > Short.MAX_VALUE || id < Short.MIN_VALUE) {
                        throw new EchoException(StudentErrorCode.INVALID_SUB_INTEREST);
                    }
                    return id.shortValue();
                })
                .collect(Collectors.toList());

        // 4. SubInterest 유효성 검증 (관심사가 있는 경우에만)
        List<SubInterest> subInterests = List.of();
        if (!shortInterestIds.isEmpty()) {
            subInterests = subInterestRepository.findAllById(shortInterestIds);
            if (subInterests.size() != shortInterestIds.size()) {

                throw new EchoException(StudentErrorCode.INVALID_SUB_INTEREST);
            }
        }

        // 5. Student 엔티티 생성 및 저장 (level=1, coin=0)
        Student student = Student.builder()
                .protector(protector)
                .name(command.studentName())
                .gender(command.gender())
                .birth(command.birth())
                .grade(command.grade())
                .level((short) 1)
                .build();

        Student savedStudent = studentRepository.save(student);

        // 6. StudentInterest 엔티티들 생성 및 저장
        List<StudentInterest> studentInterests = subInterests.stream()
                .map(subInterest -> StudentInterest.builder()
                        .student(savedStudent)
                        .subInterest(subInterest)
                        .build())
                .toList();

        studentInterestRepository.saveAll(studentInterests);

        // 7. 결과 반환
        return new RegisterStudentResult(true);
    }

    @Transactional(readOnly = true)
    public GetDailyGoalCountResult getDailyGoalCount(GetDailyGoalCountCommand command) {
        // 1. 학생 존재 여부 확인
        if (!studentRepository.existsById(command.studentId())) {
            throw new EchoException(StudentErrorCode.STUDENT_NOT_FOUND);
        }

        // 2. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 3. 오늘 할당된 문제 개수 조회
        Integer todayGoalCount = dayProblemRepository.countByStudent_StudentIdAndAssignedDate(
                command.studentId(),
                LocalDate.now()
        );

        return GetDailyGoalCountResult.from(todayGoalCount);
    }

    @Transactional(readOnly = true)
    public GetDailyCompletedCountResult getDailyCompletedCount(GetDailyCompletedCountCommand command) {
        // 1. 학생 존재 여부 확인
        if (!studentRepository.existsById(command.studentId())) {
            throw new EchoException(StudentErrorCode.STUDENT_NOT_FOUND);
        }

        // 2. 보호자-학생 관계 확인
        if (!studentRepository.existsByStudentIdAndProtectorId(command.studentId(), command.protectorId())) {
            throw new EchoException(StudentErrorCode.STUDENT_ACCESS_DENIED);
        }

        // 3. 오늘 완료한 문제 개수 조회 (isCompleted = true)
        Integer completedCount = dayProblemRepository.countByStudent_StudentIdAndAssignedDateAndIsCompleted(
                command.studentId(),
                LocalDate.now(),
                true
        );

        return GetDailyCompletedCountResult.from(completedCount);
    }
}
