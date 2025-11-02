package com.captainecho.captainecho.student.domain;

import com.captainecho.captainecho.protector.domain.Protector;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 학생 Entity
 */
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "student")
public class Student {

    /**
     * 학생 ID (PK)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_id")
    private Integer studentId;

    /**
     * 보호자 (FK)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "protector_id", nullable = false)
    private Protector protector;

    /**
     * 이름
     */
    @Column(name = "name", nullable = false, length = 30)
    private String name;

    /**
     * 성별
     * 성별이 선호하는 단어에 비중을 좀 더 실어주기 위함
     */
    @Column(name = "gender", length = 10)
    @Enumerated(EnumType.STRING)
    private Gender gender;

    /**
     * 생년월일 (YYYY-MM-DD)
     */
    @Column(name = "birth", nullable = false)
    private LocalDate birth;

    /**
     * 프로필 이미지 URL
     */
    @Column(name = "profile_image", length = 2048)
    private String profileImage;

    /**
     * 코인 (학습 보상 코인)
     */
    @Column(name = "coin", nullable = false)
    @ColumnDefault("0")
    private Integer coin = 0;

    /**
     * 학년 ("1학년", "미취학" 등)
     */
    @Column(name = "grade", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private Grade grade;

    /**
     * 레벨
     * 레벨이 NULL이라면 초기진단 진행
     */
    @Column(name = "level")
    private Short level;

    /**
     * 학생 등록일시
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 삭제 일시
     */
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    /**
     * 삭제 만료시간
     */
    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    @Builder
    public Student(Protector protector, String name, Gender gender, LocalDate birth,
                   String profileImage, Grade grade, Short level) {
        this.protector = protector;
        this.name = name;
        this.gender = gender;
        this.birth = birth;
        this.profileImage = profileImage;
        this.coin = 0;
        this.grade = grade;
        this.level = level;
    }
}
