package com.condotrack.modules.resident;

import com.condotrack.modules.auth.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Request/response shapes (DTOs) for the resident module.
 *
 * <p>Beginner note: a DTO (Data Transfer Object) is just the JSON shape the
 * API sends or receives. Records keep them short and immutable.</p>
 */
public class ResidentDtos {

    /** Resident data returned to the frontend, including the unit link. */
    public record ResidentResponse(
        UUID userId,
        String name,
        String email,
        String phone,
        Role role,
        String relationshipType,
        boolean primary
    ) {
        /** Build a response from a UserUnit link (user + unit + relationship). */
        public static ResidentResponse from(UserUnit uu) {
            return new ResidentResponse(
                uu.getUser().getId(),
                uu.getUser().getName(),
                uu.getUser().getEmail(),
                uu.getUser().getPhone(),
                uu.getUser().getRole(),
                uu.getRelationshipType().name(),
                uu.isPrimary()
            );
        }
    }

    /** Payload to link an existing user to a unit. */
    public record AssociateResidentRequest(
        @NotNull UUID userId,
        RelationshipType relationshipType,
        Boolean primary
    ) {}

    /** Payload to create a new user and link them to a unit in one call. */
    public record CreateResidentProfileRequest(
        @NotBlank String name,
        @NotBlank @Email String email,
        @NotBlank String password,
        String phone,
        Role role,
        RelationshipType relationshipType,
        Boolean primary
    ) {}

    /** Generic user profile with the list of linked unit ids. */
    public record UserProfileResponse(
        UUID id,
        String name,
        String email,
        String phone,
        Role role,
        boolean active,
        OffsetDateTime createdAt,
        java.util.List<UUID> units
    ) {}
}
