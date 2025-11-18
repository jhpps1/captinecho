package com.captainecho.captainecho.adventure.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * BlankPosition Enum Converter
 * DB의 빈 문자열("")을 NULL로 변환하여 IllegalArgumentException 방지
 */
@Converter(autoApply = true)
public class BlankPositionConverter implements AttributeConverter<BlankPosition, String> {

    @Override
    public String convertToDatabaseColumn(BlankPosition attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name();
    }

    @Override
    public BlankPosition convertToEntityAttribute(String dbData) {
        // 빈 문자열이나 NULL을 NULL로 변환
        if (dbData == null || dbData.isBlank()) {
            return null;
        }

        try {
            return BlankPosition.valueOf(dbData);
        } catch (IllegalArgumentException e) {
            // 잘못된 Enum 값이 DB에 있을 경우 NULL 반환
            return null;
        }
    }
}
