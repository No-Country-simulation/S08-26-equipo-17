package com.condotrack.modules.resident;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserUnitRepository extends JpaRepository<UserUnit, UUID> {

    List<UserUnit> findByUnitId(UUID unitId);

    List<UserUnit> findByUserId(UUID userId);

    Optional<UserUnit> findByUserIdAndUnitId(UUID userId, UUID unitId);

    boolean existsByUserIdAndUnitId(UUID userId, UUID unitId);

    @Query("select uu from UserUnit uu join fetch uu.user join fetch uu.unit where uu.unit.id = :unitId")
    List<UserUnit> findResidentsByUnitId(UUID unitId);
}
