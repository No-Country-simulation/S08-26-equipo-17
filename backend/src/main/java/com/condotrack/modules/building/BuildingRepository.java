package com.condotrack.modules.building;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface BuildingRepository extends JpaRepository<Building, UUID> {}
