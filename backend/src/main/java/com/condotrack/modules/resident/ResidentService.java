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

    public List<ResidentResponse> listResidents(UUID unitId) {
        findUnit(unitId);
        return userUnitRepository.findResidentsByUnitId(unitId).stream()
            .map(ResidentResponse::from)
            .toList();
    }

    @Transactional
    public ResidentResponse associateResident(UUID unitId, AssociateResidentRequest req) {
        Unit unit = findUnit(unitId);
        User user = findUser(req.userId());
        if (userUnitRepository.existsByUserIdAndUnitId(user.getId(), unit.getId())) {
            throw new ConflictException("User " + user.getId() + " is already a resident of unit " + unit.getId());
        }
        RelationshipType type = req.relationshipType() != null ? req.relationshipType() : RelationshipType.INQUILINO;
        boolean primary = req.primary() == null || req.primary();
        UserUnit link = new UserUnit(user, unit, type, primary);
        return ResidentResponse.from(userUnitRepository.save(link));
    }

    @Transactional
    public ResidentResponse createResidentProfile(UUID unitId, CreateResidentProfileRequest req) {
        Unit unit = findUnit(unitId);
        userRepository.findByEmailIgnoreCase(req.email()).ifPresent(u -> {
            throw new ConflictException("Email already registered: " + req.email());
        });
        User user = ResidentUserFactory.create(req, passwordEncoder);
        User saved = userRepository.save(user);
        RelationshipType type = req.relationshipType() != null ? req.relationshipType() : RelationshipType.INQUILINO;
        boolean primary = req.primary() == null || req.primary();
        UserUnit link = new UserUnit(saved, unit, type, primary);
        return ResidentResponse.from(userUnitRepository.save(link));
    }

    @Transactional
    public void removeResident(UUID unitId, UUID userId) {
        UserUnit link = userUnitRepository.findByUserIdAndUnitId(userId, unitId)
            .orElseThrow(() -> new ResourceNotFoundException("Resident link not found for user " + userId + " and unit " + unitId));
        userUnitRepository.delete(link);
    }

    // ---- Perfiles de usuario ----

    public List<UserProfileResponse> listUsers() {
        return userRepository.findAll().stream().map(this::toProfile).toList();
    }

    public UserProfileResponse getUser(UUID id) {
        return toProfile(findUser(id));
    }

    private UserProfileResponse toProfile(User user) {
        List<UUID> units = userUnitRepository.findByUserId(user.getId()).stream()
            .map(uu -> uu.getUnit().getId())
            .toList();
        return new UserProfileResponse(
            user.getId(), user.getName(), user.getEmail(), user.getPhone(),
            user.getRole() != null ? user.getRole() : Role.MORADOR,
            user.isEnabled(), user.getCreatedAt(), units);
    }

    private Unit findUnit(UUID id) {
        return unitRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Unit not found: " + id));
    }

    private User findUser(UUID id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }
}
