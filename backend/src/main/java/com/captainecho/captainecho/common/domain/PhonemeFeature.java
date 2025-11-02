package com.captainecho.captainecho.common.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "phoneme_feature")
public class PhonemeFeature {

    @Id
    @Column(name = "phoneme", length = 1)
    private Character phoneme;

    @Column(name = "is_vowel", nullable = false)
    private Boolean isVowel;

    @Column(name = "place", nullable = false, length = 10)
    private String place;

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
