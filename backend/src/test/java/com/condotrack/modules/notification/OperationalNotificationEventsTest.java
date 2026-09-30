package com.condotrack.modules.notification;

import com.condotrack.modules.auth.Role;
import com.condotrack.modules.auth.User;
import com.condotrack.modules.auth.UserRepository;
import com.condotrack.modules.building.Building;
import com.condotrack.modules.building.BuildingRepository;
import com.condotrack.modules.building.Unit;
import com.condotrack.modules.building.UnitRepository;
import com.condotrack.modules.incident.*;
import com.condotrack.modules.incident.IncidentDtos.CreateIncidentRequest;
import com.condotrack.modules.incident.IncidentDtos.UpdateIncidentStatusRequest;
import com.condotrack.modules.move.*;
import com.condotrack.modules.move.MoveDtos.CreateMoveRequest;
import com.condotrack.modules.move.MoveDtos.ReviewMoveRequest;
import com.condotrack.modules.parcel.PackageDeliveryRepository;
import com.condotrack.modules.parcel.PackageDtos.RegisterPackageRequest;
import com.condotrack.modules.parcel.PackageService;
import com.condotrack.modules.parcel.PackageType;
import com.condotrack.modules.reservation.*;
import com.condotrack.modules.reservation.ReservationDtos.CreateReservationRequest;
import com.condotrack.modules.resident.RelationshipType;
import com.condotrack.modules.resident.UserUnit;
import com.condotrack.modules.resident.UserUnitRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.TestPropertySource;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:op_notif_test_db;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.flyway.enabled=false",
    "app.security.jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
})
class OperationalNotificationEventsTest {

    @Autowired private PackageService packageService;
    @Autowired private MoveService moveService;
    @Autowired private IncidentService incidentService;
    @Autowired private ReservationService reservationService;

    @Autowired private UserNotificationRepository userNotificationRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private BuildingRepository buildingRepository;
    @Autowired private UnitRepository unitRepository;
    @Autowired private UserUnitRepository userUnitRepository;
    @Autowired private PackageDeliveryRepository packageDeliveryRepository;
    @Autowired private MoveRepository moveRepository;
    @Autowired private IncidentRepository incidentRepository;
    @Autowired private ReservationRepository reservationRepository;
    @Autowired private CommonAreaRepository commonAreaRepository;

    private Building building;
    private Unit unit;
    private User admin;
    private User resident1;
    private User resident2;
    private CommonArea commonArea;

    @BeforeEach
    void setUp() {
        cleanAll();

        building = buildingRepository.save(new Building("Residencial Araucária", "Rua das Flores 123", 20));
        unit = unitRepository.save(new Unit(building, "Torre B", "302", 3));

        admin = userRepository.save(new User("Síndico Chefe", "sindico.op@condotrack.com", "hash", "11988881111", Role.ADMIN));
        resident1 = userRepository.save(new User("Morador Um", "morador1.op@condotrack.com", "hash", "11988882222", Role.RESIDENT));
        resident2 = userRepository.save(new User("Morador Dois", "morador2.op@condotrack.com", "hash", "11988883333", Role.RESIDENT));

        userUnitRepository.save(new UserUnit(resident1, unit, RelationshipType.OWNER, true));
        userUnitRepository.save(new UserUnit(resident2, unit, RelationshipType.TENANT, true));

        commonArea = new CommonArea(building, "Salão de Festas", 50, LocalTime.of(8, 0), LocalTime.of(23, 0), "Regras");
        commonAreaRepository.save(commonArea);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
        cleanAll();
    }

    private void cleanAll() {
        userNotificationRepository.deleteAll();
        packageDeliveryRepository.deleteAll();
        moveRepository.deleteAll();
        incidentRepository.deleteAll();
        reservationRepository.deleteAll();
        commonAreaRepository.deleteAll();
        userUnitRepository.deleteAll();
        unitRepository.deleteAll();
        buildingRepository.deleteAll();
        userRepository.deleteAll();
    }

    private void authenticate(User user) {
        var auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("Package registration notifies all residents of the unit (FR-20)")
    void packageRegistrationNotifiesAllUnitResidents() {
        authenticate(admin);

        RegisterPackageRequest req = new RegisterPackageRequest(
                unit.getId(), "Mercado Livre", "ML-998877", PackageType.PACKAGE
        );
        packageService.register(req);

        List<UserNotification> notifsRes1 = userNotificationRepository.findByUserIdOrderByCreatedAtDesc(resident1.getId());
        List<UserNotification> notifsRes2 = userNotificationRepository.findByUserIdOrderByCreatedAtDesc(resident2.getId());

        assertThat(notifsRes1).hasSize(1);
        assertThat(notifsRes1.get(0).getModule()).isEqualTo("PACKAGE");
        assertThat(notifsRes1.get(0).getTitle()).isEqualTo("Nova encomenda recebida");
        assertThat(notifsRes1.get(0).getMessage()).contains("Mercado Livre").contains("ML-998877");

        assertThat(notifsRes2).hasSize(1);
        assertThat(notifsRes2.get(0).getModule()).isEqualTo("PACKAGE");
        assertThat(notifsRes2.get(0).getTitle()).isEqualTo("Nova encomenda recebida");
        assertThat(notifsRes2.get(0).getMessage()).contains("Mercado Livre").contains("ML-998877");
    }

    @Test
    @DisplayName("Move approval and rejection notify requesting resident (FR-20)")
    void moveApprovalAndRejectionNotifyResident() {
        authenticate(resident1);
        CreateMoveRequest createReq = new CreateMoveRequest(
                unit.getId(), MoveType.IN, LocalDate.now().plusDays(7), MoveShift.MORNING
        );
        var moveResp = moveService.create(createReq);

        // Síndico aprova
        authenticate(admin);
        ReviewMoveRequest approveReq = new ReviewMoveRequest(MoveStatus.APPROVED, "Autorizado pelo condomínio");
        moveService.review(moveResp.id(), approveReq);

        List<UserNotification> notifsApproved = userNotificationRepository.findByUserIdOrderByCreatedAtDesc(resident1.getId());
        assertThat(notifsApproved).hasSize(1);
        assertThat(notifsApproved.get(0).getModule()).isEqualTo("MOVE");
        assertThat(notifsApproved.get(0).getTitle()).isEqualTo("Mudança Aprovada");
        assertThat(notifsApproved.get(0).getMessage()).contains("aprovada").contains("Autorizado pelo condomínio");

        // Cria segunda mudança e síndico rejeita
        authenticate(resident1);
        CreateMoveRequest createReq2 = new CreateMoveRequest(
                unit.getId(), MoveType.OUT, LocalDate.now().plusDays(10), MoveShift.AFTERNOON
        );
        var moveResp2 = moveService.create(createReq2);

        authenticate(admin);
        ReviewMoveRequest rejectReq = new ReviewMoveRequest(MoveStatus.REJECTED, "Elevador em manutenção no dia");
        moveService.review(moveResp2.id(), rejectReq);

        List<UserNotification> notifsAll = userNotificationRepository.findByUserIdOrderByCreatedAtDesc(resident1.getId());
        assertThat(notifsAll).hasSize(2);
        assertThat(notifsAll.get(0).getTitle()).isEqualTo("Mudança Rejeitada");
        assertThat(notifsAll.get(0).getMessage()).contains("rejeitada").contains("Elevador em manutenção");
    }

    @Test
    @DisplayName("Incident status update notifies ticket creator (FR-20)")
    void incidentStatusUpdateNotifiesTicketCreator() {
        authenticate(resident1);
        CreateIncidentRequest incReq = new CreateIncidentRequest(
                unit.getId(), "Lâmpada queimada no corredor", "Lâmpada do 3º andar apagada",
                null, IncidentCategory.ELECTRICAL, IncidentPriority.LOW
        );
        var ticketResp = incidentService.create(incReq);

        authenticate(admin);
        UpdateIncidentStatusRequest updateReq = new UpdateIncidentStatusRequest(
                IncidentStatus.IN_PROGRESS, null, null
        );
        incidentService.updateStatus(ticketResp.id(), updateReq);

        List<UserNotification> notifs = userNotificationRepository.findByUserIdOrderByCreatedAtDesc(resident1.getId());
        assertThat(notifs).hasSize(1);
        assertThat(notifs.get(0).getModule()).isEqualTo("MAINTENANCE");
        assertThat(notifs.get(0).getTitle()).isEqualTo("Atualização no Chamado");
        assertThat(notifs.get(0).getMessage()).contains("IN_PROGRESS");

        // Conclusão com parecer técnico
        UpdateIncidentStatusRequest resolveReq = new UpdateIncidentStatusRequest(
                IncidentStatus.RESOLVED, null, "Lâmpada substituída por LED 12W"
        );
        incidentService.updateStatus(ticketResp.id(), resolveReq);

        List<UserNotification> notifsAfterResolve = userNotificationRepository.findByUserIdOrderByCreatedAtDesc(resident1.getId());
        assertThat(notifsAfterResolve).hasSize(2);
        assertThat(notifsAfterResolve.get(0).getTitle()).isEqualTo("Chamado Concluído");
        assertThat(notifsAfterResolve.get(0).getMessage()).contains("RESOLVED");
    }

    @Test
    @DisplayName("Reservation confirmation and cancellation notify resident (FR-20)")
    void reservationConfirmationAndCancellationNotifyResident() {
        authenticate(resident1);
        OffsetDateTime start = OffsetDateTime.now().plusDays(2);
        OffsetDateTime end = start.plusHours(4);

        CreateReservationRequest resReq = new CreateReservationRequest(
                commonArea.getId(), unit.getId(), start, end
        );
        var resResp = reservationService.create(resReq);

        List<UserNotification> notifsCreated = userNotificationRepository.findByUserIdOrderByCreatedAtDesc(resident1.getId());
        assertThat(notifsCreated).hasSize(1);
        assertThat(notifsCreated.get(0).getModule()).isEqualTo("RESERVATION");
        assertThat(notifsCreated.get(0).getTitle()).isEqualTo("Reserva Confirmada");
        assertThat(notifsCreated.get(0).getMessage()).contains("Salão de Festas");

        // Cancelamento
        reservationService.cancel(resResp.id());

        List<UserNotification> notifsCancelled = userNotificationRepository.findByUserIdOrderByCreatedAtDesc(resident1.getId());
        assertThat(notifsCancelled).hasSize(2);
        assertThat(notifsCancelled.get(0).getTitle()).isEqualTo("Reserva Cancelada");
        assertThat(notifsCancelled.get(0).getMessage()).contains("Salão de Festas");
    }
}
