package com.condotrack.modules.resident;

import com.condotrack.modules.auth.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.UUID;

public class ResidentDtos {

    public record ResidentResponse(
        UUID userId,
        String name,
        String email,
        String phone,
        Role role,
        String relationshipType,
        boolean primary
    ) {
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

    public record AssociateResidentRequest(
        @NotNull UUID userId,
        RelationshipType relationshipType,
        Boolean primary
    ) {}

    public record CreateResidentProfileRequest(
        @NotBlank String name,
        @NotBlank @Email String email,
        @NotBlank String password,
        String phone,
        Role role,
        RelationshipType relationshipType,
        Boolean primary
    ) {}

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
