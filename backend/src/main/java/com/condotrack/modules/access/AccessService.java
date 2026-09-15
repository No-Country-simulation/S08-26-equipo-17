package com.condotrack.modules.access;

import com.condotrack.common.exception.BusinessException;
import com.condotrack.common.exception.ConflictException;
import com.condotrack.common.exception.ResourceNotFoundException;
import com.condotrack.modules.access.AccessDtos.*;
import com.condotrack.modules.audit.AuditModule;
import com.condotrack.modules.audit.AuditService;
import com.condotrack.modules.auth.Role;
import com.condotrack.modules.auth.User;
import com.condotrack.modules.auth.UserRepository;
import com.condotrack.modules.building.Unit;
import com.condotrack.modules.building.UnitRepository;
import com.condotrack.modules.resident.UserUnitRepository;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Contains the business rules for visitor authorizations and access logs. */
@Service
@Transactional(readOnly = true)
public class AccessService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final AccessAuthorizationRepository authorizationRepository;
    private final AccessLogRepository accessLogRepository;
    private final UnitRepository unitRepository;
    private final UserRepository userRepository;
    private final UserUnitRepository userUnitRepository;
    private final AuditService auditService;

    public AccessService(AccessAuthorizationRepository authorizationRepository,
                         AccessLogRepository accessLogRepository, UnitRepository unitRepository,
                         UserRepository userRepository, UserUnitRepository userUnitRepository,
                         AuditService auditService) {
        this.authorizationRepository = authorizationRepository;
        this.accessLogRepository = accessLogRepository;
        this.unitRepository = unitRepository;
        this.userRepository = userRepository;
        this.userUnitRepository = userUnitRepository;
        this.auditService = auditService;
    }

    /** Creates a unique, time-limited QR authorization for a unit. */
    @Transactional
    public AuthorizationResponse createAuthorization(CreateAuthorizationRequest req) {
        User creator = currentUser();
        Unit unit = unitRepository.findById(req.unitId())
            .orElseThrow(() -> new ResourceNotFoundException("Unit not found: " + req.unitId()));
        if (creator.getRole() != Role.ADMIN
                && !userUnitRepository.existsByUserIdAndUnitId(creator.getId(), unit.getId())) {
            throw new BusinessException("You can only invite guests to your own unit.");
        }
        if (req.validUntil().isBefore(req.validFrom())) {
            throw new BusinessException("validUntil must be after validFrom.");
        }
        String token = generateToken();
        AccessAuthorization auth = new AccessAuthorization(unit, creator, req.visitorName().trim(),
            req.visitorDocument(), token, req.validFrom(), req.validUntil());
        authorizationRepository.save(auth);
        auditService.log(unit.getBuilding().getId(), unit.getId(), creator.getId(),
            AuditModule.ACCESS, "AUTHORIZATION_CREATED",
            "Guest pass created for " + req.visitorName() + " (" + token + ")",
            "{\"tokenCode\":\"" + token + "\"}");
        return AuthorizationResponse.from(auth);
    }

    @Transactional
    public ValidateQrResponse validateQr(ValidateQrRequest req) {
        User operator = currentUser();
        AccessAuthorization auth = authorizationRepository.findByTokenCode(req.tokenCode().trim())
            .orElseThrow(() -> new ResourceNotFoundException("Invitation not found for token."));
        if (auth.getStatus() == AuthorizationStatus.USED) {
            throw new ConflictException("Invitation already used.");
        }
        if (auth.getStatus() != AuthorizationStatus.PENDING) {
            throw new BusinessException("Invitation is " + auth.getStatus().name().toLowerCase() + ".");
        }
        OffsetDateTime now = OffsetDateTime.now();
        if (now.isAfter(auth.getValidUntil()) || now.isBefore(auth.getValidFrom())) {
            auth.markExpired();
            auditService.log(auth.getUnit().getBuilding().getId(), auth.getUnit().getId(), operator.getId(),
                AuditModule.ACCESS, "QR_EXPIRED",
                "Expired QR presented for " + auth.getVisitorName(), "{\"tokenCode\":\"" + auth.getTokenCode() + "\"}");
            throw new BusinessException("Invitation expired.");
        }
        auth.markUsed();
        Unit unit = auth.getUnit();
        accessLogRepository.save(new AccessLog(auth, unit, auth.getVisitorName(),
            auth.getVisitorDocument(), AccessDirection.ENTRY, operator, "QR validated"));
        auditService.log(unit.getBuilding().getId(), unit.getId(), operator.getId(),
            AuditModule.ACCESS, "ENTRY_LOGGED",
            "Entry of " + auth.getVisitorName() + " via QR by " + operator.getName(),
            "{\"tokenCode\":\"" + auth.getTokenCode() + "\"}");
        return new ValidateQrResponse(true, auth.getId(), unit.getNumberCode(), unit.getBlock(),
            auth.getCreatedBy().getName(), auth.getVisitorName(), OffsetDateTime.now());
    }

    @Transactional
    public AccessLogResponse manualEntry(ManualEntryRequest req) {
        User operator = currentUser();
        Unit unit = unitRepository.findById(req.unitId())
            .orElseThrow(() -> new ResourceNotFoundException("Unit not found: " + req.unitId()));
        AccessLog log = new AccessLog(null, unit, req.visitorName().trim(),
            req.visitorDocument(), AccessDirection.ENTRY, operator, req.notes());
        accessLogRepository.save(log);
        auditService.log(unit.getBuilding().getId(), unit.getId(), operator.getId(),
            AuditModule.ACCESS, "ENTRY_LOGGED",
            "Manual entry of " + req.visitorName() + " by " + operator.getName(), "{}");
        return AccessLogResponse.from(log);
    }

    @Transactional
    public AccessLogResponse checkout(CheckoutRequest req) {
        User operator = currentUser();
        Unit unit = unitRepository.findById(req.unitId())
            .orElseThrow(() -> new ResourceNotFoundException("Unit not found: " + req.unitId()));
        AccessLog log = new AccessLog(null, unit, req.visitorName().trim(),
            req.visitorDocument(), AccessDirection.EXIT, operator, req.notes());
        accessLogRepository.save(log);
        auditService.log(unit.getBuilding().getId(), unit.getId(), operator.getId(),
            AuditModule.ACCESS, "EXIT_LOGGED",
            "Exit of " + req.visitorName() + " registered by " + operator.getName(), "{}");
        return AccessLogResponse.from(log);
    }

    private String generateToken() {
        String token;
        do {
            token = "AUTH-QR-" + String.format("%08X", RANDOM.nextInt(0x10000000, 0xFFFFFFFF));
        } while (authorizationRepository.findByTokenCode(token).isPresent());
        return token;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}
