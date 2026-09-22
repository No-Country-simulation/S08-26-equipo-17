package com.condotrack.modules.parcel;

import com.condotrack.modules.auth.User;
import com.condotrack.modules.building.Unit;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

/** Represents a package received by the building concierge. */
@Entity
@Table(name = "package_deliveries")
public class PackageDelivery {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "received_by_user_id", nullable = false)
    private User receivedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "package_type", nullable = false, length = 30)
    private PackageType packageType = PackageType.PARCEL;

    @Column(name = "carrier_name", nullable = false, length = 100)
    private String carrierName;

    @Column(name = "tracking_code", nullable = false, unique = true, length = 50)
    private String trackingCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PackageStatus status = PackageStatus.PENDING_PICKUP;

    @Column(name = "received_at", nullable = false, updatable = false)
    private OffsetDateTime receivedAt = OffsetDateTime.now();

    @Column(name = "picked_up_at")
    private OffsetDateTime pickedUpAt;

    @Column(name = "picked_up_by_name", length = 120)
    private String pickedUpByName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_operator_user_id")
    private User pickupOperator;

    protected PackageDelivery() {}

    public PackageDelivery(Unit unit, User receivedBy, PackageType packageType,
                           String carrierName, String trackingCode) {
        this.unit = unit;
        this.receivedBy = receivedBy;
        this.packageType = packageType != null ? packageType : PackageType.PARCEL;
        this.carrierName = carrierName;
        this.trackingCode = trackingCode;
    }

    /** Changes the package state after the resident picks it up. */
    public void markDelivered(String pickedUpByName, User operator) {
        this.status = PackageStatus.DELIVERED;
        this.pickedUpAt = OffsetDateTime.now();
        this.pickedUpByName = pickedUpByName;
        this.pickupOperator = operator;
    }

    public UUID getId() { return id; }
    public Unit getUnit() { return unit; }
    public User getReceivedBy() { return receivedBy; }
    public PackageType getPackageType() { return packageType; }
    public String getCarrierName() { return carrierName; }
    public String getTrackingCode() { return trackingCode; }
    public PackageStatus getStatus() { return status; }
    public OffsetDateTime getReceivedAt() { return receivedAt; }
    public OffsetDateTime getPickedUpAt() { return pickedUpAt; }
    public String getPickedUpByName() { return pickedUpByName; }
    public User getPickupOperator() { return pickupOperator; }
}
