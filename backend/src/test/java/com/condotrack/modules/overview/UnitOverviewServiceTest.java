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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

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

    private UnitOverviewService service;

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
                auditLogRepository
        );
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
}
