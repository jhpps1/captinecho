package com.captainecho.captainecho.adventure.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 탐험 타입 Entity
 * 각 탐험의 종류와 설명을 관리
 */
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "adventure_type")
public class AdventureType {

    /**
     * 탐험 타입 ID (PK)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "adventure_type_id")
    private Integer adventureTypeId;

    /**
     * 탐험 이름
     */
    @Column(name = "adventure_name", nullable = false, length = 50)
    private String adventureName;

    /**
     * 탐험 설명
     */
    @Column(name = "adventure_info", nullable = false, length = 500)
    private String adventureInfo;

    /**
     * 탐험 설명 이미지 URL
     */
    @Column(name = "adventure_info_image", length = 2048)
    private String adventureInfoImage;

    @Builder
    public AdventureType(String adventureName, String adventureInfo, String adventureInfoImage) {
        this.adventureName = adventureName;
        this.adventureInfo = adventureInfo;
        this.adventureInfoImage = adventureInfoImage;
    }
}
