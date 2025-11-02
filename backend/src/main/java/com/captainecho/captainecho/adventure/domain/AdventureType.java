package com.captainecho.captainecho.adventure.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "adventure_type")
public class AdventureType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "adventure_type_id")
    private Integer adventureTypeId;

    @Column(name = "adventure_name", nullable = false, length = 50)
    private String adventureName;

    @Column(name = "adventure_info", nullable = false, length = 500)
    private String adventureInfo;

    @Column(name = "adventure_info_image", length = 2048)
    private String adventureInfoImage;

    @Builder
    public AdventureType(String adventureName, String adventureInfo, String adventureInfoImage) {
        this.adventureName = adventureName;
        this.adventureInfo = adventureInfo;
        this.adventureInfoImage = adventureInfoImage;
    }
}
