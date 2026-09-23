package com.condotrack.modules.move;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MoveRepository extends JpaRepository<MoveSchedule, UUID> {

    /** Returns true if the shift is already taken by an APPROVED move on the same date. */
    @Query("""
        SELECT COUNT(m) > 0 FROM MoveSchedule m
        WHERE m.unit.building.id = :buildingId
          AND m.scheduledDate = :date
          AND m.shift = :shift
          AND m.status = 'APPROVED'
        """)
    boolean existsApprovedConflict(@Param("buildingId") UUID buildingId,
                                   @Param("date") LocalDate date,
                                   @Param("shift") MoveShift shift);

    List<MoveSchedule> findByUnitIdOrderByScheduledDateDesc(UUID unitId);

    List<MoveSchedule> findByStatusOrderByScheduledDateAsc(MoveStatus status);
}
