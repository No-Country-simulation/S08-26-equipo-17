package com.condotrack.modules.resident;

import com.condotrack.common.exception.ConflictException;
import com.condotrack.common.exception.ResourceNotFoundException;
import com.condotrack.modules.auth.Role;
import com.condotrack.modules.auth.User;
import com.condotrack.modules.auth.UserRepository;
import com.condotrack.modules.building.Unit;
import com.condotrack.modules.building.UnitRepository;
import com.condotrack.modules.resident.ResidentDtos.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Business rules for residents (users linked to housing units).
 *
 * <p>Responsibilities:</p>
 * <ul>
 *   <li>List who lives in a unit.</li>
 *   <li>Link an existing user to a unit (e.g. a new tenant moves in).</li>
 *   <li>Create a brand-new user profile and link it in one step.</li>
 *   <li>Unlink a resident who moved out.</li>
 *   <li>List / fetch generic user profiles.</li>
 * </ul>
 */
@Service
@Transactional(readOnly = true)
public class ResidentService {

    private final UserUnitRepository userUnitRepository;
    private final UserRepository userRepository;
    private final UnitRepository unitRepository;
    private final PasswordEncoder passwordEncoder;

    public ResidentService(UserUnitRepository userUnitRepository,
                           UserRepository userRepository,
                           UnitRepository unitRepository,
                           PasswordEncoder passwordEncoder) {
        this.userUnitRepository = userUnitRepository;
        this.userRepository = userRepository;
        this.unitRepository = unitRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /** Return every resident linked to the given unit. Throws 404 if the unit does not exist. */
    public List<ResidentResponse> listResidents(UUID unitId) {
        findUnit(unitId);
        return userUnitRepository.findResidentsByUnitId(unitId).stream()
            .map(ResidentResponse::from)
            .toList();
    }

    /**
     * Link an already-registered user to a unit.
     * Fails with 409 (conflict) if the link already exists.
     */
    @Transactional
    public ResidentResponse associateResident(UUID unitId, AssociateResidentRequest req) {
        Unit unit = findUnit(unitId);
        User user = findUser(req.userId());
        if (userUnitRepository.existsByUserIdAndUnitId(user.getId(), unit.getId())) {
            throw new ConflictException("User " + user.getId() + " is already a resident of unit " + unit.getId());
        }
        // Default relationship is TENANT (renter); owners/family are set explicitly.
        RelationshipType type = req.relationshipType() != null ? req.relationshipType() : RelationshipType.TENANT;
        // Default to primary contact unless the caller says otherwise.
        boolean primary = req.primary() == null || req.primary();
        UserUnit link = new UserUnit(user, unit, type, primary);
        return ResidentResponse.from(userUnitRepository.save(link));
    }

    /**
     * Create a new user account and immediately link it to the unit.
     * Fails with 409 if the e-mail is already registered.
     */
    @Transactional
    public ResidentResponse createResidentProfile(UUID unitId, CreateResidentProfileRequest req) {
        Unit unit = findUnit(unitId);
        userRepository.findByEmailIgnoreCase(req.email()).ifPresent(u -> {
            throw new ConflictException("Email already registered: " + req.email());
        });
        User user = ResidentUserFactory.create(req, passwordEncoder);
        User saved = userRepository.save(user);
        RelationshipType type = req.relationshipType() != null ? req.relationshipType() : RelationshipType.TENANT;
        boolean primary = req.primary() == null || req.primary();
        UserUnit link = new UserUnit(saved, unit, type, primary);
        return ResidentResponse.from(userUnitRepository.save(link));
    }

    /** Remove the link between a user and a unit (move-out). Throws 404 if the link is missing. */
    @Transactional
    public void removeResident(UUID unitId, UUID userId) {
        UserUnit link = userUnitRepository.findByUserIdAndUnitId(userId, unitId)
            .orElseThrow(() -> new ResourceNotFoundException("Resident link not found for user " + userId + " and unit " + unitId));
        userUnitRepository.delete(link);
    }

    // ---- User profiles (generic account directory) ----

    /** List every user account, regardless of unit. Used by admins and concierge staff. */
    public List<UserProfileResponse> listUsers() {
        return userRepository.findAll().stream().map(this::toProfile).toList();
    }

    /** Fetch a single user profile by id. Throws 404 when unknown. */
    public UserProfileResponse getUser(UUID id) {
        return toProfile(findUser(id));
    }

    /** Convert a User entity + its unit links into an API-friendly profile object. */
    private UserProfileResponse toProfile(User user) {
        List<UUID> units = userUnitRepository.findByUserId(user.getId()).stream()
            .map(uu -> uu.getUnit().getId())
            .toList();
        return new UserProfileResponse(
            user.getId(), user.getName(), user.getEmail(), user.getPhone(),
            user.getRole() != null ? user.getRole() : Role.RESIDENT,
            user.isEnabled(), user.getCreatedAt(), units);
    }

    /** Helper: load a unit or fail with 404. */
    private Unit findUnit(UUID id) {
        return unitRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Unit not found: " + id));
    }

    /** Helper: load a user or fail with 404. */
    private User findUser(UUID id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }
}
