package com.captainecho.captainecho.common.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 음소 자질 Entity
 * 한글 자음/모음의 특성 정보
 */
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "phoneme_feature")
public class PhonemeFeature {

    /**
     * 음소 (PK)
     * 예: ㄱ, ㄴ, ㅏ, ㅑ 등
     */
    @Id
    @Column(name = "phoneme", length = 1)
    private Character phoneme;

    /**
     * 모음 여부
     */
    @Column(name = "is_vowel", nullable = false)
    private Boolean isVowel;

    /**
     * 조음 위치
     * 예: 양순음, 경구개음 등
     */
    @Column(name = "place", nullable = false, length = 10)
    private String place;

    /**
     * 조음 방법
     * 예: 파열음, 마찰음 등
     */
    @Column(name = "manner", nullable = false, length = 10)
    private String manner;

    @Builder
    public PhonemeFeature(Character phoneme, Boolean isVowel, String place, String manner) {
        this.phoneme = phoneme;
        this.isVowel = isVowel;
        this.place = place;
        this.manner = manner;
    }
}
