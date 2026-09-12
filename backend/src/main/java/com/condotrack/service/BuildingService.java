package com.condotrack.service;

import com.condotrack.dto.BuildingRequest;
import com.condotrack.dto.BuildingResponse;
import com.condotrack.model.Building;
import com.condotrack.repository.BuildingRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BuildingService {

    private final BuildingRepository buildingRepository;

    public BuildingService(BuildingRepository buildingRepository) {
        this.buildingRepository = buildingRepository;
    }

    public BuildingResponse createBuilding(BuildingRequest request) {
        Building building = new Building(request.name(), request.address());
        Building savedBuilding = buildingRepository.save(building);
        return new BuildingResponse(savedBuilding.getId(), savedBuilding.getName(), savedBuilding.getAddress());
    }

    public List<BuildingResponse> getAllBuildings() {
        return buildingRepository.findAll().stream()
                .map(building -> new BuildingResponse(building.getId(), building.getName(), building.getAddress()))
                .collect(Collectors.toList());
    }
}