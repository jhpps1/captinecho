package com.captainecho.captainecho.interest.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 관심사 소분류 Entity
 * 예: "공룡", "우주" 등
 */
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "sub_interest")
public class SubInterest {

    /**
     * 관심사 소분류 ID (PK)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sub_interest_id")
    private Short subInterestId;

    /**
     * 관심사 대분류 (FK)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "major_interest_id", nullable = false)
    private MajorInterest majorInterest;

    /**
     * 관심사 소분류명
     * 예: "공룡", "우주" 등
     */
    @Column(name = "small_interest_name", nullable = false, length = 50)
    private String smallInterestName;

    @Builder
    public SubInterest(MajorInterest majorInterest, String smallInterestName) {
        this.majorInterest = majorInterest;
        this.smallInterestName = smallInterestName;
    }
}
