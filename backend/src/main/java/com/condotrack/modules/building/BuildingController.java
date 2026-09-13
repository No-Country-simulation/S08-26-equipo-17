package com.condotrack.modules.building;

import com.condotrack.common.dto.ApiResponse;
import com.condotrack.modules.building.BuildingDtos.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class BuildingController {

    private final BuildingService buildingService;

    public BuildingController(BuildingService buildingService) {
        this.buildingService = buildingService;
    }

    @GetMapping("/buildings")
    public ResponseEntity<ApiResponse<List<BuildingResponse>>> listBuildings() {
        return ResponseEntity.ok(ApiResponse.ok(buildingService.listBuildings()));
    }

    @GetMapping("/buildings/{id}")
    public ResponseEntity<ApiResponse<BuildingResponse>> getBuilding(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(buildingService.getBuilding(id)));
    }

    @PostMapping("/buildings")
    public ResponseEntity<ApiResponse<BuildingResponse>> createBuilding(@RequestBody BuildingRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(buildingService.createBuilding(req)));
    }

    @GetMapping("/buildings/{buildingId}/units")
    public ResponseEntity<ApiResponse<List<UnitResponse>>> listUnits(@PathVariable UUID buildingId) {
        return ResponseEntity.ok(ApiResponse.ok(buildingService.listUnits(buildingId)));
    }

    @GetMapping("/units/{id}")
    public ResponseEntity<ApiResponse<UnitResponse>> getUnit(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(buildingService.getUnit(id)));
    }

    @PostMapping("/units")
    public ResponseEntity<ApiResponse<UnitResponse>> createUnit(@RequestBody UnitRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(buildingService.createUnit(req)));
    }
}
