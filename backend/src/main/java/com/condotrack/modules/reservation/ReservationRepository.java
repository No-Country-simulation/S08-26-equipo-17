package com.condotrack.modules.reservation;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    /** Returns true if there is any CONFIRMED booking that overlaps the requested interval. */
    @Query("""
        SELECT COUNT(r) > 0 FROM Reservation r
        WHERE r.commonArea.id = :areaId
          AND r.status = 'CONFIRMED'
          AND r.startTime < :endTime
          AND r.endTime > :startTime
        """)
    boolean existsConflict(@Param("areaId") UUID areaId,
                           @Param("startTime") OffsetDateTime startTime,
                           @Param("endTime") OffsetDateTime endTime);

    List<Reservation> findByUnitIdOrderByStartTimeDesc(UUID unitId);

    List<Reservation> findByCommonAreaIdAndStatusOrderByStartTimeAsc(UUID commonAreaId, ReservationStatus status);
}
