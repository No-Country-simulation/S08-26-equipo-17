package com.condotrack.modules.resident;

import com.condotrack.modules.auth.User;
import com.condotrack.modules.building.Unit;
import jakarta.persistence.*;
import java.util.UUID;

/**
 * Link between a {@link User} and a {@link Unit} (apartment / office).
 *
 * <p>Example: "Sofia (user) lives in Unit 101 (unit) as OWNER".</p>
 *
 * <p>Canonical table: {@code user_units} (see {@code V1__init_schema.sql}).
 * The compatibility view {@code unit_residents} (see
 * {@code V3__seed_demo_data.sql}) exposes the same columns for reporting.</p>
 *
 * <p>Fields:</p>
 * <ul>
 *   <li>{@code user} - who lives / owns there.</li>
 *   <li>{@code unit} - which apartment / office.</li>
 *   <li>{@code relationshipType} - OWNER, TENANT or FAMILY_MEMBER.</li>
 *   <li>{@code primary} - true for the main household contact of the unit.</li>
 * </ul>
 */
@Entity
@Table(name = "user_units", uniqueConstraints = {
    @UniqueConstraint(name = "uq_user_unit", columnNames = {"user_id", "unit_id"})
})
public class UserUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @Enumerated(EnumType.STRING)
    @Column(name = "relationship_type", nullable = false, length = 20)
    private RelationshipType relationshipType = RelationshipType.TENANT;

    @Column(name = "is_primary", nullable = false)
    private boolean primary = true;

    protected UserUnit() {}

    public UserUnit(User user, Unit unit, RelationshipType relationshipType, boolean primary) {
        this.user = user;
        this.unit = unit;
        // Default to TENANT when the caller does not specify a relationship.
        this.relationshipType = relationshipType != null ? relationshipType : RelationshipType.TENANT;
        this.primary = primary;
    }

    public UUID getId() { return id; }
    public User getUser() { return user; }
    public Unit getUnit() { return unit; }
    public RelationshipType getRelationshipType() { return relationshipType; }
    public boolean isPrimary() { return primary; }

    public void setRelationshipType(RelationshipType relationshipType) {
        this.relationshipType = relationshipType;
    }

    public void setPrimary(boolean primary) {
        this.primary = primary;
    }
}
