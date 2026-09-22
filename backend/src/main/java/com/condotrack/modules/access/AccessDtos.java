package com.condotrack.modules.access;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.UUID;

/** Request and response objects used by the access API. */
public class AccessDtos {

    public record CreateAuthorizationRequest(
        @NotNull UUID unitId,
        @NotBlank String visitorName,
        String visitorDocument,
        @NotNull OffsetDateTime validFrom,
        @NotNull OffsetDateTime validUntil
    ) {}

    public record AuthorizationResponse(UUID id, UUID unitId, String visitorName, String visitorDocument,
                                        String tokenCode, OffsetDateTime validFrom, OffsetDateTime validUntil,
                                        String status, OffsetDateTime createdAt) {
        static AuthorizationResponse from(AccessAuthorization a) {
            return new AuthorizationResponse(a.getId(), a.getUnit().getId(), a.getVisitorName(),
                a.getVisitorDocument(), a.getTokenCode(), a.getValidFrom(), a.getValidUntil(),
                a.getStatus().name(), a.getCreatedAt());
        }
    }

    public record ValidateQrRequest(@NotBlank String tokenCode) {}

    public record ValidateQrResponse(boolean authorized, UUID authorizationId, String unitNumber,
                                     String block, String residentName, String visitorName,
                                     OffsetDateTime registeredAt) {}

    public record ManualEntryRequest(@NotNull UUID unitId, @NotBlank String visitorName,
                                     String visitorDocument, String notes) {}

    public record CheckoutRequest(@NotNull UUID unitId, @NotBlank String visitorName,
                                  String visitorDocument, String notes) {}

    public record AccessLogResponse(UUID id, UUID unitId, String visitorName, String visitorDocument,
                                    String direction, OffsetDateTime timestamp) {
        static AccessLogResponse from(AccessLog l) {
            return new AccessLogResponse(l.getId(), l.getUnit().getId(), l.getVisitorName(),
                l.getVisitorDocument(), l.getDirection().name(), l.getTimestamp());
        }
    }
}
