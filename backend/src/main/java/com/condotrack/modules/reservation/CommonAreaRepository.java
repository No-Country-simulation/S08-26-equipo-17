package com.condotrack.modules.reservation;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommonAreaRepository extends JpaRepository<CommonArea, UUID> {
    List<CommonArea> findByBuildingIdAndActiveTrue(UUID buildingId);
    List<CommonArea> findByActiveTrue();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ca FROM CommonArea ca WHERE ca.id = :id")
    Optional<CommonArea> findByIdForUpdate(@Param("id") UUID id);
}
