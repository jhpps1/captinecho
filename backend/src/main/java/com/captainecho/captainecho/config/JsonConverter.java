package com.captainecho.captainecho.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

/**
 * JSON 컬럼을 Map&lt;String, Object&gt;로 자동 변환하는 JPA 컨버터
 * curriculum_structure (JSONB) 컬럼에 사용
 */
@Converter
@Slf4j
public class JsonConverter implements AttributeConverter<Map<String, Object>, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Map -> JSON 문자열 (DB 저장 시)
     */
    @Override
    public String convertToDatabaseColumn(Map<String, Object> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return null;
        }

        try {
            String json = objectMapper.writeValueAsString(attribute);
            log.debug("Map을 JSON으로 변환: size={}", attribute.size());
            return json;
        } catch (JsonProcessingException e) {
            log.error("JSON 직렬화 실패: {}", attribute, e);
            throw new IllegalArgumentException("JSON 변환 실패", e);
        }
    }

    /**
     * JSON 문자열 -> Map (DB 조회 시)
     */
    @Override
    public Map<String, Object> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }

        try {
            Map<String, Object> map = objectMapper.readValue(
                dbData,
                new TypeReference<Map<String, Object>>() {}
            );
            log.debug("JSON을 Map으로 변환: size={}", map.size());
            return map;
        } catch (JsonProcessingException e) {
            log.error("JSON 파싱 실패: {}", dbData, e);
            throw new IllegalArgumentException("JSON 파싱 실패", e);
        }
    }
}
