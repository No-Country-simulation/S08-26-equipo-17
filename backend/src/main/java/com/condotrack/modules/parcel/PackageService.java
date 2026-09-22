package com.condotrack.modules.parcel;

import com.condotrack.common.exception.BusinessException;
import com.condotrack.common.exception.ConflictException;
import com.condotrack.common.exception.ResourceNotFoundException;
import com.condotrack.modules.audit.AuditModule;
import com.condotrack.modules.audit.AuditService;
import com.condotrack.modules.auth.User;
import com.condotrack.modules.auth.UserRepository;
import com.condotrack.modules.building.Unit;
import com.condotrack.modules.building.UnitRepository;
import com.condotrack.modules.notification.NotificationService;
import com.condotrack.modules.parcel.PackageDtos.*;
import com.condotrack.modules.resident.UserUnit;
import com.condotrack.modules.resident.UserUnitRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Contains the business rules for package reception and handover. */
@Service
@Transactional(readOnly = true)
public class PackageService {

    private final PackageDeliveryRepository packageRepository;
    private final UnitRepository unitRepository;
    private final UserRepository userRepository;
    private final UserUnitRepository userUnitRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public PackageService(PackageDeliveryRepository packageRepository, UnitRepository unitRepository,
                          UserRepository userRepository, UserUnitRepository userUnitRepository,
                          AuditService auditService, NotificationService notificationService) {
        this.packageRepository = packageRepository;
        this.unitRepository = unitRepository;
        this.userRepository = userRepository;
        this.userUnitRepository = userUnitRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    /** Saves a new package and notifies residents linked to the unit. */
    @Transactional
    public PackageResponse register(RegisterPackageRequest req) {
        User operator = currentUser();
        Unit unit = unitRepository.findById(req.unitId())
            .orElseThrow(() -> new ResourceNotFoundException("Unit not found: " + req.unitId()));
        if (packageRepository.existsByTrackingCode(req.trackingCode().trim())) {
            throw new ConflictException("Tracking code already registered: " + req.trackingCode());
        }
        PackageDelivery pkg = new PackageDelivery(unit, operator, req.packageType(),
            req.carrierName().trim(), req.trackingCode().trim());
        packageRepository.save(pkg);

        auditService.log(unit.getBuilding().getId(), unit.getId(), operator.getId(),
            AuditModule.PACKAGE, "PACKAGE_RECEIVED",
            "Package " + pkg.getTrackingCode() + " from " + pkg.getCarrierName() + " received by " + operator.getName(),
            "{\"trackingCode\":\"" + pkg.getTrackingCode() + "\"}");

        List<String> emails = userUnitRepository.findResidentsByUnitId(unit.getId()).stream()
            .map(UserUnit::getUser).map(User::getEmail).toList();
        notificationService.notifyPackageArrived(emails, pkg.getCarrierName(), pkg.getTrackingCode(), unit.getNumberCode());

        return PackageResponse.from(pkg);
    }

    /** Finds packages that have not been handed over yet. */
    public Page<PackageResponse> listPending(Pageable pageable) {
        return packageRepository.findByStatusOrderByReceivedAtDesc(PackageStatus.PENDING_PICKUP, pageable)
            .map(PackageResponse::from);
    }

    /** Completes a package handover and records the operator responsible. */
    @Transactional
    public PackageResponse deliver(UUID id, DeliverPackageRequest req) {
        User operator = currentUser();
        PackageDelivery pkg = packageRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Package not found: " + id));
        if (pkg.getStatus() == PackageStatus.DELIVERED) {
            throw new BusinessException("Package already delivered: " + id);
        }
        pkg.markDelivered(req.pickedUpByName().trim(), operator);
        Unit unit = pkg.getUnit();
        auditService.log(unit.getBuilding().getId(), unit.getId(), operator.getId(),
            AuditModule.PACKAGE, "PACKAGE_DELIVERED",
            "Package " + pkg.getTrackingCode() + " picked up by " + req.pickedUpByName(),
            "{\"trackingCode\":\"" + pkg.getTrackingCode() + "\"}");
        return PackageResponse.from(pkg);
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}
