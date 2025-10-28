package com.captainecho.captainecho.protector.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Protector {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long protectorId;


}
