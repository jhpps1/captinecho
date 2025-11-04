package com.captainecho.captainecho.adventure.application;

import com.captainecho.captainecho.adventure.application.result.AdventureTypeDto;
import com.captainecho.captainecho.adventure.application.result.AdventureTypeListResult;
import com.captainecho.captainecho.adventure.domain.AdventureType;
import com.captainecho.captainecho.adventure.persistence.AdventureTypeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public class AdventureTypeService {

    private final AdventureTypeRepository adventureTypeRepository;

    @Transactional(readOnly = true)
    public AdventureTypeListResult getAllAdventureTypes() {
        List<AdventureType> adventureTypes = adventureTypeRepository.findAll();
        List<AdventureTypeDto> dtos = adventureTypes.stream()
                .map(adventureType -> AdventureTypeDto.builder()
                        .adventureTypeId(adventureType.getAdventureTypeId())
                        .adventureName(adventureType.getAdventureName())
                        .adventureInfo(adventureType.getAdventureInfo())
                        .adventureInfoImage(adventureType.getAdventureInfoImage())
                        .build())
                .toList();
        return new AdventureTypeListResult(dtos);
    }
}
