package com.condotrack.modules.overview;

import com.condotrack.common.exception.ResourceNotFoundException;
import com.condotrack.modules.access.AccessLogRepository;
import com.condotrack.modules.audit.AuditLogRepository;
import com.condotrack.modules.building.Building;
import com.condotrack.modules.building.Unit;
import com.condotrack.modules.building.UnitRepository;
import com.condotrack.modules.incident.IncidentRepository;
import com.condotrack.modules.move.MoveRepository;
import com.condotrack.modules.overview.UnitOverviewDtos.UnitOverviewResponse;
import com.condotrack.modules.parcel.PackageDeliveryRepository;
import com.condotrack.modules.reservation.ReservationRepository;
import com.condotrack.modules.resident.UserUnitRepository;
import com.condotrack.modules.auth.Role;
import com.condotrack.modules.auth.User;
import com.condotrack.modules.auth.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UnitOverviewServiceTest {

    @Mock private UnitRepository unitRepository;
    @Mock private UserUnitRepository userUnitRepository;
    @Mock private PackageDeliveryRepository packageDeliveryRepository;
    @Mock private AccessLogRepository accessLogRepository;
    @Mock private ReservationRepository reservationRepository;
    @Mock private MoveRepository moveRepository;
    @Mock private IncidentRepository incidentRepository;
    @Mock private AuditLogRepository auditLogRepository;
    @Mock private UserRepository userRepository;

    private UnitOverviewService service;
    private User adminUser;

    @BeforeEach
    void setUp() {
        service = new UnitOverviewService(
                unitRepository,
                userUnitRepository,
                packageDeliveryRepository,
                accessLogRepository,
                reservationRepository,
                moveRepository,
                incidentRepository,
                auditLogRepository,
                userRepository
        );
        adminUser = new User("Admin", "admin@condotrack.com", "hash", null, Role.ADMIN);
        var auth = new UsernamePasswordAuthenticationToken(adminUser, null, adminUser.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Throws ResourceNotFoundException when unit not found")
    void unitNotFound() {
        UUID unitId = UUID.randomUUID();
        when(unitRepository.findById(unitId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getOverview(unitId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Returns full 360 overview for valid unit")
    void validUnitOverview() {
        UUID buildingId = UUID.randomUUID();
        UUID unitId = UUID.randomUUID();

        Building building = new Building("Edifício Solar", "Av Paulista 100", 10);
        Unit unit = new Unit(building, "Torre A", "101", 1);

        when(unitRepository.findById(unitId)).thenReturn(Optional.of(unit));
        when(userUnitRepository.findResidentsByUnitId(unitId)).thenReturn(List.of());
        when(packageDeliveryRepository.findByUnitIdOrderByReceivedAtDesc(unitId)).thenReturn(List.of());
        when(accessLogRepository.findByUnitIdOrderByTimestampDesc(unitId)).thenReturn(List.of());
        when(reservationRepository.findByUnitIdOrderByStartTimeDesc(unitId)).thenReturn(List.of());
        when(moveRepository.findByUnitIdOrderByScheduledDateDesc(unitId)).thenReturn(List.of());
        when(incidentRepository.findByUnitIdAndStatusNotOrderByCreatedAtDesc(eq(unitId), any())).thenReturn(List.of());
        when(auditLogRepository.findByUnitIdOrderByTimestampDesc(eq(unitId), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        UnitOverviewResponse response = service.getOverview(unitId);

        assertThat(response).isNotNull();
        assertThat(response.unit().buildingName()).isEqualTo("Edifício Solar");
        assertThat(response.unit().numberCode()).isEqualTo("101");
        assertThat(response.residents()).isEmpty();
        assertThat(response.pendingPackages()).isEmpty();
        assertThat(response.recentAccesses()).isEmpty();
    }

    @Test
    @DisplayName("Resident can access own unit overview")
    void residentCanAccessOwnUnitOverview() {
        UUID unitId = UUID.randomUUID();
        User resident = new User("Morador 101", "resident101@condotrack.com", "hash", null, Role.RESIDENT);
        var auth = new UsernamePasswordAuthenticationToken(resident, null, resident.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        Building building = new Building("Edifício Solar", "Av Paulista 100", 10);
        Unit unit = new Unit(building, "Torre A", "101", 1);

        when(userUnitRepository.existsByUserIdAndUnitId(resident.getId(), unitId)).thenReturn(true);
        when(unitRepository.findById(unitId)).thenReturn(Optional.of(unit));
        when(userUnitRepository.findResidentsByUnitId(unitId)).thenReturn(List.of());
        when(packageDeliveryRepository.findByUnitIdOrderByReceivedAtDesc(unitId)).thenReturn(List.of());
        when(accessLogRepository.findByUnitIdOrderByTimestampDesc(unitId)).thenReturn(List.of());
        when(reservationRepository.findByUnitIdOrderByStartTimeDesc(unitId)).thenReturn(List.of());
        when(moveRepository.findByUnitIdOrderByScheduledDateDesc(unitId)).thenReturn(List.of());
        when(incidentRepository.findByUnitIdAndStatusNotOrderByCreatedAtDesc(eq(unitId), any())).thenReturn(List.of());
        when(auditLogRepository.findByUnitIdOrderByTimestampDesc(eq(unitId), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        UnitOverviewResponse response = service.getOverview(unitId);

        assertThat(response).isNotNull();
        assertThat(response.unit().numberCode()).isEqualTo("101");
    }

    @Test
    @DisplayName("Resident receives AccessDeniedException when accessing other unit overview")
    void residentCannotAccessOtherUnitOverview() {
        UUID unit102Id = UUID.randomUUID();
        User resident101 = new User("Morador 101", "resident101@condotrack.com", "hash", null, Role.RESIDENT);
        var auth = new UsernamePasswordAuthenticationToken(resident101, null, resident101.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        when(userUnitRepository.existsByUserIdAndUnitId(resident101.getId(), unit102Id)).thenReturn(false);

        assertThatThrownBy(() -> service.getOverview(unit102Id))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Morador não tem permissão para visualizar dados de outra unidade");
    }

    @Test
    @DisplayName("Concierge can access any unit overview without being linked to unit")
    void conciergeCanAccessAnyUnitOverview() {
        UUID unitId = UUID.randomUUID();
        User concierge = new User("Porteiro", "concierge@condotrack.com", "hash", null, Role.CONCIERGE);
        var auth = new UsernamePasswordAuthenticationToken(concierge, null, concierge.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        Building building = new Building("Edifício Solar", "Av Paulista 100", 10);
        Unit unit = new Unit(building, "Torre A", "102", 1);

        when(unitRepository.findById(unitId)).thenReturn(Optional.of(unit));
        when(userUnitRepository.findResidentsByUnitId(unitId)).thenReturn(List.of());
        when(packageDeliveryRepository.findByUnitIdOrderByReceivedAtDesc(unitId)).thenReturn(List.of());
        when(accessLogRepository.findByUnitIdOrderByTimestampDesc(unitId)).thenReturn(List.of());
        when(reservationRepository.findByUnitIdOrderByStartTimeDesc(unitId)).thenReturn(List.of());
        when(moveRepository.findByUnitIdOrderByScheduledDateDesc(unitId)).thenReturn(List.of());
        when(incidentRepository.findByUnitIdAndStatusNotOrderByCreatedAtDesc(eq(unitId), any())).thenReturn(List.of());
        when(auditLogRepository.findByUnitIdOrderByTimestampDesc(eq(unitId), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        UnitOverviewResponse response = service.getOverview(unitId);

        assertThat(response).isNotNull();
        assertThat(response.unit().numberCode()).isEqualTo("102");
    }
}
