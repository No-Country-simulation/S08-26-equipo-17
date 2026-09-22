package com.condotrack.modules.parcel;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

/** Database queries for package deliveries. */
public interface PackageDeliveryRepository extends JpaRepository<PackageDelivery, UUID> {
    Optional<PackageDelivery> findByTrackingCode(String trackingCode);
    boolean existsByTrackingCode(String trackingCode);
    Page<PackageDelivery> findByStatusOrderByReceivedAtDesc(PackageStatus status, Pageable pageable);
    List<PackageDelivery> findByUnitIdOrderByReceivedAtDesc(UUID unitId);
}
