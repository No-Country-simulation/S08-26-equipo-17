package com.condotrack.modules.resident;

import com.condotrack.modules.auth.User;
import com.condotrack.modules.building.Unit;
import jakarta.persistence.*;
import java.util.UUID;

/**
 * Vínculo entre {@link User} y {@link Unit}.
 *
 * <p>Tabla canónica: {@code user_units} (ver {@code V1__init_schema.sql}).
 * La vista de compatibilidad {@code unit_residents} (ver {@code V3__seed_demo_data.sql})
 * expone las mismas columnas para el módulo "Desarrollador 3".
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
    private RelationshipType relationshipType = RelationshipType.INQUILINO;

    @Column(name = "is_primary", nullable = false)
    private boolean primary = true;

    protected UserUnit() {}

    public UserUnit(User user, Unit unit, RelationshipType relationshipType, boolean primary) {
        this.user = user;
        this.unit = unit;
        this.relationshipType = relationshipType != null ? relationshipType : RelationshipType.INQUILINO;
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
