package com.condotrack.modules.building;

import com.condotrack.common.exception.ResourceNotFoundException;
import com.condotrack.modules.building.BuildingDtos.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class BuildingService {

    private final BuildingRepository buildingRepository;
    private final UnitRepository unitRepository;

    public BuildingService(BuildingRepository buildingRepository, UnitRepository unitRepository) {
        this.buildingRepository = buildingRepository;
        this.unitRepository = unitRepository;
    }

    public List<BuildingResponse> listBuildings() {
        return buildingRepository.findAll().stream().map(BuildingResponse::from).toList();
    }

    public BuildingResponse getBuilding(UUID id) {
        return BuildingResponse.from(findBuilding(id));
    }

    @Transactional
    public BuildingResponse createBuilding(BuildingRequest req) {
        Building building = new Building(req.name(), req.address(), req.totalUnits());
        return BuildingResponse.from(buildingRepository.save(building));
    }

    public List<UnitResponse> listUnits(UUID buildingId) {
        findBuilding(buildingId);
        return unitRepository.findByBuildingId(buildingId).stream().map(UnitResponse::from).toList();
    }

    public UnitResponse getUnit(UUID unitId) {
        return UnitResponse.from(findUnit(unitId));
    }

    @Transactional
    public UnitResponse createUnit(UnitRequest req) {
        Building building = findBuilding(req.buildingId());
        Unit unit = new Unit(building, req.block(), req.numberCode(), req.floor());
        return UnitResponse.from(unitRepository.save(unit));
    }

    private Building findBuilding(UUID id) {
        return buildingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Building not found: " + id));
    }

    private Unit findUnit(UUID id) {
        return unitRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Unit not found: " + id));
    }
}
