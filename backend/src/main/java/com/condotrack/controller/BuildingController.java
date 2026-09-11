package com.condotrack.controller;

import com.condotrack.dto.BuildingRequest;
import com.condotrack.dto.BuildingResponse;
import com.condotrack.service.BuildingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

public class BuildingController {
    private final BuildingService buildingService;

    public BuildingController(BuildingService buildingService) {
        this.buildingService = buildingService;
    }

    @PostMapping
    public ResponseEntity<BuildingResponse> create(@RequestBody BuildingRequest request) {
        BuildingResponse response = buildingService.createBuilding(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BuildingResponse>> getAll() {
        List<BuildingResponse> response = buildingService.getAllBuildings();
        return ResponseEntity.ok(response);
    }
}
