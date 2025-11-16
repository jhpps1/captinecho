package com.captainecho.captainecho.protector.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Getter
@Table(name = "protector")
public class Protector {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "protector_id")
    private Integer protectorId;

    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "password", length = 250)
    private String password;

    @Column(name = "protector_pin", length = 100)
    private String protectorPin;

    @Column(name = "provider", nullable = false)
    @Enumerated(EnumType.STRING)
    private Provider provider;

    @Column(name = "social_id", length = 255, nullable = true)
    private String socialId;

    @Column(name = "email", length = 500)
    private String email;

    @Column(name = "max_student_count")
    @ColumnDefault("2")
    @Builder.Default
    private Short maxStudentCount = 2;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "terms_agreed", nullable = false)
    @ColumnDefault("false")
    @Builder.Default
    private Boolean termsAgreed = false;

    @Column(name = "is_deleted", nullable = false)
    @ColumnDefault("false")
    @Builder.Default
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

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

    public void updateTermsAgreed(Boolean termsAgreed) {
        this.termsAgreed = termsAgreed;
    }

    public void updateId(String id) {
        this.id = id;
    }

    public void updatePassword(String password) {
        this.password = password;
    }
}
