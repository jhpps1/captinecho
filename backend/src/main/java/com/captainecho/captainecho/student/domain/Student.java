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

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "student")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_id")
    private Integer studentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "protector_id", nullable = false)
    private Protector protector;

    @Column(name = "name", nullable = false, length = 30)
    private String name;

    @Column(name = "gender", length = 10)
    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(name = "birth", nullable = false)
    private LocalDate birth;

    @Column(name = "profile_image", length = 2048)
    private String profileImage;

    @Column(name = "coin", nullable = false)
    @ColumnDefault("0")
    private Integer coin = 0;

    @Column(name = "grade", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private Grade grade;

    @Column(name = "level")
    private Short level;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

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

    /**
     * 프로필 이미지를 업데이트합니다.
     *
     * @param imageUrl 새로운 프로필 이미지 URL
     */
    public void updateProfileImage(String imageUrl) {
        this.profileImage = imageUrl;
    }
}
