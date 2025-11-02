package com.captainecho.captainecho.interest.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 관심사 대분류 Entity
 * 예: "동물", "과학" 등
 */
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "major_interest")
public class MajorInterest {

    /**
     * 관심사 대분류 ID (PK)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "major_interest_id")
    private Short majorInterestId;

    /**
     * 관심사 대분류명
     * 예: "동물", "과학" 등
     */
    @Column(name = "major_interest_name", nullable = false, length = 50)
    private String majorInterestName;

    @Builder
    public MajorInterest(String majorInterestName) {
        this.majorInterestName = majorInterestName;
    }
}
