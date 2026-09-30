package com.condotrack.modules.reservation;

import com.condotrack.modules.audit.AuditService;
import com.condotrack.modules.auth.Role;
import com.condotrack.modules.auth.User;
import com.condotrack.modules.auth.UserRepository;
import com.condotrack.modules.building.Building;
import com.condotrack.modules.building.Unit;
import com.condotrack.modules.building.UnitRepository;
import com.condotrack.modules.building.BuildingRepository;
import com.condotrack.modules.reservation.ReservationDtos.CommonAreaResponse;
import com.condotrack.modules.reservation.ReservationDtos.CreateCommonAreaRequest;
import com.condotrack.modules.reservation.ReservationDtos.CreateReservationRequest;
import com.condotrack.modules.reservation.ReservationDtos.ReservationResponse;
import com.condotrack.modules.reservation.ReservationDtos.UpdateCommonAreaRequest;
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

import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock private CommonAreaRepository commonAreaRepository;
    @Mock private ReservationRepository reservationRepository;
    @Mock private UnitRepository unitRepository;
    @Mock private UserRepository userRepository;
    @Mock private UserUnitRepository userUnitRepository;
    @Mock private AuditService auditService;
    @Mock private BuildingRepository buildingRepository;

    private ReservationService service;

    @BeforeEach
    void setUp() {
        service = new ReservationService(
                commonAreaRepository,
                reservationRepository,
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

    private CommonArea createCommonArea(UUID id, String name, Building building) {
        try {
            var constructor = CommonArea.class.getDeclaredConstructor();
            constructor.setAccessible(true);
            CommonArea area = constructor.newInstance();
            org.springframework.test.util.ReflectionTestUtils.setField(area, "id", id);
            org.springframework.test.util.ReflectionTestUtils.setField(area, "name", name);
            org.springframework.test.util.ReflectionTestUtils.setField(area, "building", building);
            return area;
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }

    @Test
    @DisplayName("Resident can create reservation for their own linked unit")
    void residentCanCreateReservationForLinkedUnit() {
        User resident = new User("Morador 101", "resident101@condotrack.com", "hash", null, Role.RESIDENT);
        var auth = new UsernamePasswordAuthenticationToken(resident, null, resident.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        UUID unitId = UUID.randomUUID();
        UUID areaId = UUID.randomUUID();
        Building building = new Building("Edifício Solar", "Av Paulista 100", 10);
        Unit unit = new Unit(building, "Torre A", "101", 1);
        CommonArea area = createCommonArea(areaId, "Salão de Festas", building);

        OffsetDateTime start = OffsetDateTime.now().plusDays(1);
        OffsetDateTime end = start.plusHours(4);
        CreateReservationRequest req = new CreateReservationRequest(areaId, unitId, start, end);

        when(commonAreaRepository.findByIdForUpdate(areaId)).thenReturn(Optional.of(area));
        when(unitRepository.findById(unitId)).thenReturn(Optional.of(unit));
        when(userUnitRepository.existsByUserIdAndUnitId(resident.getId(), unitId)).thenReturn(true);
        when(reservationRepository.existsConflict(area.getId(), start, end)).thenReturn(false);

        ReservationResponse response = service.create(req);

        assertThat(response).isNotNull();
        assertThat(response.unitId()).isEqualTo(unit.getId());
        assertThat(response.commonAreaName()).isEqualTo("Salão de Festas");
    }

    @Test
    @DisplayName("Resident cannot create reservation for unlinked unit (throws AccessDeniedException)")
    void residentCannotCreateReservationForUnlinkedUnit() {
        User resident = new User("Morador 101", "resident101@condotrack.com", "hash", null, Role.RESIDENT);
        var auth = new UsernamePasswordAuthenticationToken(resident, null, resident.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        UUID unit102Id = UUID.randomUUID();
        UUID areaId = UUID.randomUUID();
        Building building = new Building("Edifício Solar", "Av Paulista 100", 10);
        CommonArea area = createCommonArea(areaId, "Salão de Festas", building);

        OffsetDateTime start = OffsetDateTime.now().plusDays(1);
        OffsetDateTime end = start.plusHours(4);
        CreateReservationRequest req = new CreateReservationRequest(areaId, unit102Id, start, end);

        when(commonAreaRepository.findByIdForUpdate(areaId)).thenReturn(Optional.of(area));
        when(userUnitRepository.existsByUserIdAndUnitId(resident.getId(), unit102Id)).thenReturn(false);

        assertThatThrownBy(() -> service.create(req))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Morador não possui vínculo com a unidade indicada");
    }

    @Test
    @DisplayName("Admin can create reservation for any unit without resident link check")
    void adminCanCreateReservationForAnyUnit() {
        User admin = new User("Admin", "admin@condotrack.com", "hash", null, Role.ADMIN);
        var auth = new UsernamePasswordAuthenticationToken(admin, null, admin.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        UUID unitId = UUID.randomUUID();
        UUID areaId = UUID.randomUUID();
        Building building = new Building("Edifício Solar", "Av Paulista 100", 10);
        Unit unit = new Unit(building, "Torre A", "102", 1);
        CommonArea area = createCommonArea(areaId, "Churrasqueira", building);

        OffsetDateTime start = OffsetDateTime.now().plusDays(2);
        OffsetDateTime end = start.plusHours(3);
        CreateReservationRequest req = new CreateReservationRequest(areaId, unitId, start, end);

        when(commonAreaRepository.findByIdForUpdate(areaId)).thenReturn(Optional.of(area));
        when(unitRepository.findById(unitId)).thenReturn(Optional.of(unit));
        when(reservationRepository.existsConflict(area.getId(), start, end)).thenReturn(false);

        ReservationResponse response = service.create(req);

        assertThat(response).isNotNull();
        assertThat(response.unitId()).isEqualTo(unit.getId());
    }

    @Test
    @DisplayName("Throws ConflictException (HTTP 409) when time slot is already booked")
    void throwsConflictExceptionWhenSlotAlreadyBooked() {
        User resident = new User("Morador 101", "resident101@condotrack.com", "hash", null, Role.RESIDENT);
        var auth = new UsernamePasswordAuthenticationToken(resident, null, resident.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        UUID unitId = UUID.randomUUID();
        UUID areaId = UUID.randomUUID();
        Building building = new Building("Edifício Solar", "Av Paulista 100", 10);
        Unit unit = new Unit(building, "Torre A", "101", 1);
        CommonArea area = createCommonArea(areaId, "Churrasqueira Gourmet", building);

        OffsetDateTime start = OffsetDateTime.now().plusDays(1);
        OffsetDateTime end = start.plusHours(3);
        CreateReservationRequest req = new CreateReservationRequest(areaId, unitId, start, end);

        when(commonAreaRepository.findByIdForUpdate(areaId)).thenReturn(Optional.of(area));
        when(userUnitRepository.existsByUserIdAndUnitId(resident.getId(), unitId)).thenReturn(true);
        when(unitRepository.findById(unitId)).thenReturn(Optional.of(unit));
        when(reservationRepository.existsConflict(area.getId(), start, end)).thenReturn(true);

        assertThatThrownBy(() -> service.create(req))
                .isInstanceOf(com.condotrack.common.exception.ConflictException.class)
                .hasMessage("Time slot already booked for: Churrasqueira Gourmet");
    }

    @Test
    @DisplayName("Admin creates common area successfully")
    void adminCreatesCommonAreaSuccessfully() {
        User admin = new User("Admin", "admin@condotrack.com", "hash", null, Role.ADMIN);
        var auth = new UsernamePasswordAuthenticationToken(admin, null, admin.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        UUID buildingId = UUID.randomUUID();
        Building building = new Building("Edifício Solar", "Av Paulista 100", 10);
        when(buildingRepository.findById(buildingId)).thenReturn(Optional.of(building));

        CreateCommonAreaRequest req = new CreateCommonAreaRequest(
                buildingId, "Academia", 15, LocalTime.of(6, 0), LocalTime.of(22, 0), "Regras de uso"
        );

        CommonAreaResponse response = service.createCommonArea(req);

        assertThat(response).isNotNull();
        assertThat(response.name()).isEqualTo("Academia");
        assertThat(response.maxCapacity()).isEqualTo(15);
        verify(commonAreaRepository).save(any(CommonArea.class));
    }

    @Test
    @DisplayName("Admin updates common area successfully")
    void adminUpdatesCommonAreaSuccessfully() {
        User admin = new User("Admin", "admin@condotrack.com", "hash", null, Role.ADMIN);
        var auth = new UsernamePasswordAuthenticationToken(admin, null, admin.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        UUID areaId = UUID.randomUUID();
        Building building = new Building("Edifício Solar", "Av Paulista 100", 10);
        CommonArea area = createCommonArea(areaId, "Piscina", building);
        when(commonAreaRepository.findById(areaId)).thenReturn(Optional.of(area));

        UpdateCommonAreaRequest req = new UpdateCommonAreaRequest(
                "Piscina Aquecida", 20, LocalTime.of(9, 0), LocalTime.of(21, 0), "Uso de touca", true
        );

        CommonAreaResponse response = service.updateCommonArea(areaId, req);

        assertThat(response).isNotNull();
        assertThat(response.name()).isEqualTo("Piscina Aquecida");
        assertThat(response.maxCapacity()).isEqualTo(20);
        verify(commonAreaRepository).save(area);
    }

    @Test
    @DisplayName("Admin deletes common area successfully (soft delete)")
    void adminDeletesCommonAreaSuccessfully() {
        User admin = new User("Admin", "admin@condotrack.com", "hash", null, Role.ADMIN);
        var auth = new UsernamePasswordAuthenticationToken(admin, null, admin.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        UUID areaId = UUID.randomUUID();
        Building building = new Building("Edifício Solar", "Av Paulista 100", 10);
        CommonArea area = createCommonArea(areaId, "Cinema", building);
        when(commonAreaRepository.findById(areaId)).thenReturn(Optional.of(area));

        CommonAreaResponse response = service.deleteCommonArea(areaId);

        assertThat(response).isNotNull();
        assertThat(response.active()).isFalse();
        assertThat(area.isActive()).isFalse();
        verify(commonAreaRepository).save(area);
    }
}
