package com.captainecho.captainecho.common.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "common_code")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class CommonCode {

    @Id
    @Column(name = "code", length = 5)
    private String code;

    @Column(name = "code_name", nullable = false, length = 50)
    private String codeName;

    @Column(name = "comment", length = 500)
    private String comment;

    @Column(name = "image_url", length = 2048)
    private String imageUrl;

    @Builder
    public CommonCode(String code, String codeName, String comment, String imageUrl) {
        this.code = code;
        this.codeName = codeName;
        this.comment = comment;
        this.imageUrl = imageUrl;
    }
}
