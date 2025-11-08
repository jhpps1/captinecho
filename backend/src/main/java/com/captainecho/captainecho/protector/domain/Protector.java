package com.captainecho.captainecho.protector.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "protector")
public class Protector {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "protector_id")
    private Integer protectorId;

    @Column(name = "protector_pin", length = 100)
    private String protectorPin;

    @Column(name = "provider", nullable = false)
    @Enumerated(EnumType.STRING)
    private Provider provider;

    @Column(name = "social_id", nullable = false, length = 255)
    private String socialId;

    @Column(name = "email", length = 500)
    private String email;

    @Column(name = "max_student_count")
    @ColumnDefault("2")
    private Short maxStudentCount;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_deleted", nullable = false)
    @ColumnDefault("false")
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Builder
    public Protector(String protectorPin, Provider provider, String socialId, String email, Short maxStudentCount) {
        this.protectorPin = protectorPin;
        this.provider = provider;
        this.socialId = socialId;
        this.email = email;
        this.maxStudentCount = maxStudentCount != null ? maxStudentCount : 2;
        this.isDeleted = false;
    }


    public void delete() {
        this.isDeleted = true;
        this.deletedAt = LocalDateTime.now();
    }

    public void updateProtectorPin(String newPin) {
        this.protectorPin = newPin;
    }

    public void updateMaxStudentCount(Short count) {
        this.maxStudentCount = count;
    }

    public void updateEmail(String email) {
        this.email = email;
    }
}
