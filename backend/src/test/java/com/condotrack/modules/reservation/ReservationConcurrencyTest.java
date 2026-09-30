package com.condotrack.modules.reservation;

import com.condotrack.common.exception.ConflictException;
import com.condotrack.modules.auth.Role;
import com.condotrack.modules.auth.User;
import com.condotrack.modules.auth.UserRepository;
import com.condotrack.modules.building.Building;
import com.condotrack.modules.building.BuildingRepository;
import com.condotrack.modules.building.Unit;
import com.condotrack.modules.building.UnitRepository;
import com.condotrack.modules.reservation.ReservationDtos.CreateReservationRequest;
import com.condotrack.modules.reservation.ReservationDtos.ReservationResponse;
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
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:concurrency_db;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.flyway.enabled=false"
})
class ReservationConcurrencyTest {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private CommonAreaRepository commonAreaRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private BuildingRepository buildingRepository;

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserUnitRepository userUnitRepository;

    private Building building;
    private Unit unit;
    private CommonArea commonArea;
    private User resident1;
    private User resident2;

    @BeforeEach
    void setUp() {
        reservationRepository.deleteAll();
        userUnitRepository.deleteAll();
        commonAreaRepository.deleteAll();
        unitRepository.deleteAll();
        userRepository.deleteAll();
        buildingRepository.deleteAll();

        building = buildingRepository.save(new Building("Edifício Concorrência", "Rua Teste 100", 20));
        unit = unitRepository.save(new Unit(building, "Torre A", "101", 1));

        resident1 = userRepository.save(new User("Morador 1", "morador1@concurrency.test", "hash", "11999990001", Role.RESIDENT));
        resident2 = userRepository.save(new User("Morador 2", "morador2@concurrency.test", "hash", "11999990002", Role.RESIDENT));

        userUnitRepository.save(new UserUnit(resident1, unit, RelationshipType.OWNER, true));
        userUnitRepository.save(new UserUnit(resident2, unit, RelationshipType.TENANT, true));

        commonArea = createCommonArea("Churrasqueira Gourmet", building);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
        reservationRepository.deleteAll();
        userUnitRepository.deleteAll();
        commonAreaRepository.deleteAll();
        unitRepository.deleteAll();
        userRepository.deleteAll();
        buildingRepository.deleteAll();
    }

    private CommonArea createCommonArea(String name, Building building) {
        try {
            var constructor = CommonArea.class.getDeclaredConstructor();
            constructor.setAccessible(true);
            CommonArea area = constructor.newInstance();
            ReflectionTestUtils.setField(area, "name", name);
            ReflectionTestUtils.setField(area, "building", building);
            ReflectionTestUtils.setField(area, "maxCapacity", 20);
            ReflectionTestUtils.setField(area, "openTime", LocalTime.of(8, 0));
            ReflectionTestUtils.setField(area, "closeTime", LocalTime.of(22, 0));
            ReflectionTestUtils.setField(area, "active", true);
            return commonAreaRepository.save(area);
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }

    @Test
    @DisplayName("Concorrência: 2 threads simultâneas para o mesmo intervalo - 1 sucesso (201), 1 ConflictException (409), 1 registro gravado")
    void testConcurrentReservationsForSameSlotSerializedByPessimisticLock() throws Exception {
        OffsetDateTime startTime = OffsetDateTime.now().plusDays(2).withHour(14).withMinute(0).withSecond(0).withNano(0);
        OffsetDateTime endTime = startTime.plusHours(3);

        CreateReservationRequest req1 = new CreateReservationRequest(commonArea.getId(), unit.getId(), startTime, endTime);
        CreateReservationRequest req2 = new CreateReservationRequest(commonArea.getId(), unit.getId(), startTime, endTime);

        int numberOfThreads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch readyLatch = new CountDownLatch(numberOfThreads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(numberOfThreads);

        List<ReservationResponse> successes = new CopyOnWriteArrayList<>();
        List<Throwable> errors = new CopyOnWriteArrayList<>();

        // Thread 1 para o Morador 1
        executor.submit(() -> {
            try {
                readyLatch.countDown();
                startLatch.await();
                SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken(resident1, null, resident1.getAuthorities())
                );
                ReservationResponse res = reservationService.create(req1);
                successes.add(res);
            } catch (Throwable t) {
                errors.add(t);
            } finally {
                SecurityContextHolder.clearContext();
                doneLatch.countDown();
            }
        });

        // Thread 2 para o Morador 2
        executor.submit(() -> {
            try {
                readyLatch.countDown();
                startLatch.await();
                SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken(resident2, null, resident2.getAuthorities())
                );
                ReservationResponse res = reservationService.create(req2);
                successes.add(res);
            } catch (Throwable t) {
                errors.add(t);
            } finally {
                SecurityContextHolder.clearContext();
                doneLatch.countDown();
            }
        });

        // Espera ambas as threads estarem prontas e libera a largada simultânea
        boolean ready = readyLatch.await(5, TimeUnit.SECONDS);
        assertThat(ready).isTrue();
        startLatch.countDown();

        // Aguarda a conclusão das duas threads
        boolean finished = doneLatch.await(15, TimeUnit.SECONDS);
        assertThat(finished).isTrue();
        executor.shutdown();

        // Validações do requisito:
        // 1. Exatamente 1 deve ser confirmada com sucesso (201 Created)
        assertThat(successes).hasSize(1);
        assertThat(successes.get(0).id()).isNotNull();
        assertThat(successes.get(0).status()).isEqualTo("CONFIRMED");

        // 2. Exatamente 1 deve falhar com ConflictException (409 Conflict)
        assertThat(errors).hasSize(1);
        Throwable error = errors.get(0);
        assertThat(error).isInstanceOf(ConflictException.class);
        assertThat(error.getMessage()).isEqualTo("Time slot already booked for: " + commonArea.getName());

        // 3. O banco de dados deve conter exatamente 1 registro para aquele intervalo
        List<Reservation> reservationsInDb = reservationRepository.findAll();
        assertThat(reservationsInDb).hasSize(1);
        Reservation savedReservation = reservationsInDb.get(0);
        assertThat(savedReservation.getCommonArea().getId()).isEqualTo(commonArea.getId());
        assertThat(savedReservation.getStatus()).isEqualTo(ReservationStatus.CONFIRMED);
    }
}
