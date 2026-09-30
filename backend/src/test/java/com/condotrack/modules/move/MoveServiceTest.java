package com.condotrack.modules.move;

import com.condotrack.modules.audit.AuditService;
import com.condotrack.modules.auth.Role;
import com.condotrack.modules.auth.User;
import com.condotrack.modules.auth.UserRepository;
import com.condotrack.modules.building.Building;
import com.condotrack.modules.building.Unit;
import com.condotrack.modules.building.UnitRepository;
import com.condotrack.modules.move.MoveDtos.CreateMoveRequest;
import com.condotrack.modules.move.MoveDtos.MoveResponse;
import com.condotrack.modules.resident.UserUnitRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MoveServiceTest {

    @Mock private MoveRepository moveRepository;
    @Mock private UnitRepository unitRepository;
    @Mock private UserRepository userRepository;
    @Mock private UserUnitRepository userUnitRepository;
    @Mock private AuditService auditService;
    @Mock private com.condotrack.modules.building.BuildingRepository buildingRepository;

    private MoveService service;

    @BeforeEach
    void setUp() {
        service = new MoveService(
                moveRepository,
                unitRepository,
                userRepository,
                userUnitRepository,
                auditService,
                buildingRepository
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Resident can create move request for linked unit")
    void residentCanCreateMoveForLinkedUnit() {
        User resident = new User("Morador 101", "resident101@condotrack.com", "hash", null, Role.RESIDENT);
        var auth = new UsernamePasswordAuthenticationToken(resident, null, resident.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        UUID unitId = UUID.randomUUID();
        Building building = new Building("Edifício Solar", "Av Paulista 100", 10);
        Unit unit = new Unit(building, "Torre A", "101", 1);
        CreateMoveRequest req = new CreateMoveRequest(unitId, MoveType.IN, LocalDate.now().plusDays(5), MoveShift.MORNING);

        when(userUnitRepository.existsByUserIdAndUnitId(resident.getId(), unitId)).thenReturn(true);
        when(unitRepository.findById(unitId)).thenReturn(Optional.of(unit));

        MoveResponse response = service.create(req);

        assertThat(response).isNotNull();
        assertThat(response.shift()).isEqualTo("MORNING");
    }

    @Test
    @DisplayName("Resident cannot create move request for unlinked unit (throws AccessDeniedException)")
    void residentCannotCreateMoveForUnlinkedUnit() {
        User resident = new User("Morador 101", "resident101@condotrack.com", "hash", null, Role.RESIDENT);
        var auth = new UsernamePasswordAuthenticationToken(resident, null, resident.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        UUID unit102Id = UUID.randomUUID();
        CreateMoveRequest req = new CreateMoveRequest(unit102Id, MoveType.IN, LocalDate.now().plusDays(5), MoveShift.MORNING);

        when(userUnitRepository.existsByUserIdAndUnitId(resident.getId(), unit102Id)).thenReturn(false);

        assertThatThrownBy(() -> service.create(req))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Morador só pode solicitar mudança para a sua própria unidade");
    }

    @Test
    @DisplayName("Admin can create move request for any unit without resident link check")
    void adminCanCreateMoveForAnyUnit() {
        User admin = new User("Admin", "admin@condotrack.com", "hash", null, Role.ADMIN);
        var auth = new UsernamePasswordAuthenticationToken(admin, null, admin.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        UUID unitId = UUID.randomUUID();
        Building building = new Building("Edifício Solar", "Av Paulista 100", 10);
        Unit unit = new Unit(building, "Torre A", "102", 1);
        CreateMoveRequest req = new CreateMoveRequest(unitId, MoveType.OUT, LocalDate.now().plusDays(3), MoveShift.AFTERNOON);

        when(unitRepository.findById(unitId)).thenReturn(Optional.of(unit));

        MoveResponse response = service.create(req);

        assertThat(response).isNotNull();
        assertThat(response.unitId()).isEqualTo(unit.getId());
    }

    @Test
    @DisplayName("Admin can approve move request when no conflict exists")
    void adminCanApproveMoveRequestWhenNoConflict() {
        User admin = new User("Admin", "admin@condotrack.com", "hash", null, Role.ADMIN);
        var auth = new UsernamePasswordAuthenticationToken(admin, null, admin.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        UUID buildingId = UUID.randomUUID();
        Building building = new Building("Edifício Solar", "Av Paulista 100", 10);
        org.springframework.test.util.ReflectionTestUtils.setField(building, "id", buildingId);

        Unit unit = new Unit(building, "Torre A", "101", 1);
        UUID moveId = UUID.randomUUID();
        MoveSchedule move = new MoveSchedule(unit, admin, MoveType.IN, LocalDate.now().plusDays(5), MoveShift.MORNING);
        org.springframework.test.util.ReflectionTestUtils.setField(move, "id", moveId);

        when(moveRepository.findByIdForUpdate(moveId)).thenReturn(Optional.of(move));
        when(buildingRepository.findByIdForUpdate(buildingId)).thenReturn(Optional.of(building));
        when(moveRepository.existsApprovedConflict(buildingId, move.getScheduledDate(), move.getShift())).thenReturn(false);

        MoveDtos.ReviewMoveRequest req = new MoveDtos.ReviewMoveRequest(MoveStatus.APPROVED, "Approved by admin");
        MoveResponse response = service.review(moveId, req);

        assertThat(response).isNotNull();
        assertThat(response.status()).isEqualTo("APPROVED");
        assertThat(move.getStatus()).isEqualTo(MoveStatus.APPROVED);
    }

    @Test
    @DisplayName("Admin review throws ConflictException (HTTP 409) when shift is already taken")
    void adminReviewThrowsConflictExceptionWhenShiftTaken() {
        User admin = new User("Admin", "admin@condotrack.com", "hash", null, Role.ADMIN);
        var auth = new UsernamePasswordAuthenticationToken(admin, null, admin.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        UUID buildingId = UUID.randomUUID();
        Building building = new Building("Edifício Solar", "Av Paulista 100", 10);
        org.springframework.test.util.ReflectionTestUtils.setField(building, "id", buildingId);

        Unit unit = new Unit(building, "Torre A", "101", 1);
        UUID moveId = UUID.randomUUID();
        MoveSchedule move = new MoveSchedule(unit, admin, MoveType.IN, LocalDate.now().plusDays(5), MoveShift.MORNING);
        org.springframework.test.util.ReflectionTestUtils.setField(move, "id", moveId);

        when(moveRepository.findByIdForUpdate(moveId)).thenReturn(Optional.of(move));
        when(buildingRepository.findByIdForUpdate(buildingId)).thenReturn(Optional.of(building));
        when(moveRepository.existsApprovedConflict(buildingId, move.getScheduledDate(), move.getShift())).thenReturn(true);

        MoveDtos.ReviewMoveRequest req = new MoveDtos.ReviewMoveRequest(MoveStatus.APPROVED, "Approval attempt");

        assertThatThrownBy(() -> service.review(moveId, req))
                .isInstanceOf(com.condotrack.common.exception.ConflictException.class)
                .hasMessage("Shift MORNING on " + move.getScheduledDate() + " is already taken");
    }

    @Test
    @DisplayName("Admin can reject move request")
    void adminCanRejectMoveRequest() {
        User admin = new User("Admin", "admin@condotrack.com", "hash", null, Role.ADMIN);
        var auth = new UsernamePasswordAuthenticationToken(admin, null, admin.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        UUID buildingId = UUID.randomUUID();
        Building building = new Building("Edifício Solar", "Av Paulista 100", 10);
        org.springframework.test.util.ReflectionTestUtils.setField(building, "id", buildingId);

        Unit unit = new Unit(building, "Torre A", "101", 1);
        UUID moveId = UUID.randomUUID();
        MoveSchedule move = new MoveSchedule(unit, admin, MoveType.IN, LocalDate.now().plusDays(5), MoveShift.MORNING);
        org.springframework.test.util.ReflectionTestUtils.setField(move, "id", moveId);

        when(moveRepository.findByIdForUpdate(moveId)).thenReturn(Optional.of(move));

        MoveDtos.ReviewMoveRequest req = new MoveDtos.ReviewMoveRequest(MoveStatus.REJECTED, "Dates unavailable");
        MoveResponse response = service.review(moveId, req);

        assertThat(response).isNotNull();
        assertThat(response.status()).isEqualTo("REJECTED");
        assertThat(move.getStatus()).isEqualTo(MoveStatus.REJECTED);
    }
}
