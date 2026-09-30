package com.condotrack.modules.notification;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserNotificationRepository extends JpaRepository<UserNotification, UUID> {

    List<UserNotification> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<UserNotification> findByIdAndUserId(UUID id, UUID userId);

    long countByUserIdAndIsReadFalse(UUID userId);
}
