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
public class Protector {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "protector_id")
    private Long protectorId;

    @Column(name = "parent_pin", length = 6)
    private String parentPin;

    @Column(name = "provider", nullable = false, length = 10)
    private String provider;

    @Column(name = "social_id", nullable = false)
    private String socialId;

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
    public Protector(String parentPin, String provider, String socialId, Short maxStudentCount) {
        this.parentPin = parentPin;
        this.provider = provider;
        this.socialId = socialId;
        this.maxStudentCount = maxStudentCount != null ? maxStudentCount : 2;
        this.isDeleted = false;
    }


    public void delete() {
        this.isDeleted = true;
        this.deletedAt = LocalDateTime.now();
    }

    public void updateParentPin(String newPin) {
        this.parentPin = newPin;
    }

    public void updateMaxStudentCount(Short count) {
        this.maxStudentCount = count;
    }
}
