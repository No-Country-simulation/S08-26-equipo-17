package com.condotrack.modules.parcel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.UUID;

/** Request and response objects used by the package API. */
public class PackageDtos {

    public record RegisterPackageRequest(
        @NotNull UUID unitId,
        @NotBlank String carrierName,
        @NotBlank String trackingCode,
        PackageType packageType
    ) {}

    public record DeliverPackageRequest(@NotBlank String pickedUpByName) {}

    public record PackageResponse(UUID id, UUID unitId, String packageType, String carrierName,
                                  String trackingCode, String status, OffsetDateTime receivedAt,
                                  OffsetDateTime pickedUpAt, String pickedUpByName) {
        static PackageResponse from(PackageDelivery p) {
            return new PackageResponse(p.getId(), p.getUnit().getId(),
                p.getPackageType().name(), p.getCarrierName(), p.getTrackingCode(),
                p.getStatus().name(), p.getReceivedAt(), p.getPickedUpAt(), p.getPickedUpByName());
        }
    }
}
