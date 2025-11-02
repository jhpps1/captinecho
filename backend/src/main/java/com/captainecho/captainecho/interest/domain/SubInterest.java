package com.captainecho.captainecho.interest.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "sub_interest")
public class SubInterest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sub_interest_id")
    private Short subInterestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "major_interest_id", nullable = false)
    private MajorInterest majorInterest;

    @Column(name = "small_interest_name", nullable = false, length = 50)
    private String smallInterestName;

    @Builder
    public SubInterest(MajorInterest majorInterest, String smallInterestName) {
        this.majorInterest = majorInterest;
        this.smallInterestName = smallInterestName;
    }
}
