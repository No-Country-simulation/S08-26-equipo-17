package com.condotrack.modules.incident;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface IncidentRepository extends JpaRepository<IncidentTicket, UUID> {
    Page<IncidentTicket> findByOrderByCreatedAtDesc(Pageable pageable);
    List<IncidentTicket> findByUnitIdAndStatusNotOrderByCreatedAtDesc(UUID unitId, IncidentStatus status);

    @Query("SELECT t FROM IncidentTicket t JOIN FETCH t.createdBy LEFT JOIN FETCH t.unit WHERE t.photoUrl LIKE %:filename%")
    List<IncidentTicket> findByPhotoUrlContaining(@Param("filename") String filename);
}
