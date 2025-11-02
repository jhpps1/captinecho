package com.captainecho.captainecho.interest.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "major_interest")
public class MajorInterest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "major_interest_id")
    private Short majorInterestId;

    @Column(name = "major_interest_name", nullable = false, length = 50)
    private String majorInterestName;

    @Builder
    public MajorInterest(String majorInterestName) {
        this.majorInterestName = majorInterestName;
    }
}
