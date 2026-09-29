package com.condotrack.modules.reservation;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommonAreaRepository extends JpaRepository<CommonArea, UUID> {
    List<CommonArea> findByBuildingIdAndActiveTrue(UUID buildingId);
    List<CommonArea> findByActiveTrue();
}
