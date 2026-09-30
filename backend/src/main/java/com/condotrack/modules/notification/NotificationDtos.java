package com.condotrack.modules.notification;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.OffsetDateTime;
import java.util.UUID;

public class NotificationDtos {

    public record NotificationResponse(
        UUID id,
        UUID userId,
        String title,
        String message,
        String module,
        @JsonProperty("isRead") boolean isRead,
        OffsetDateTime createdAt
    ) {
        public static NotificationResponse from(UserNotification notification) {
            return new NotificationResponse(
                notification.getId(),
                notification.getUser() != null ? notification.getUser().getId() : null,
                notification.getTitle(),
                notification.getMessage(),
                notification.getModule(),
                notification.isRead(),
                notification.getCreatedAt()
            );
        }
    }
}
