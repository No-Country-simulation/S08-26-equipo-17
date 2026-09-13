package com.condotrack.modules.auth;

/**
 * User roles used across the whole platform.
 *
 * <p>Think of a role as a "badge" that decides which doors (API endpoints)
 * a user can open:</p>
 * <ul>
 *   <li>{@code ADMIN} - building manager. Can do everything, including approvals.</li>
 *   <li>{@code CONCIERGE} - front-desk operator. Handles visitors and packages.</li>
 *   <li>{@code RESIDENT} - person who lives in a unit. Books amenities, invites guests.</li>
 * </ul>
 *
 * <p>Spring Security automatically converts these into authorities such as
 * {@code ROLE_ADMIN}, which are checked with {@code hasRole('ADMIN)'}.</p>
 */
public enum Role {
    ADMIN,
    CONCIERGE,
    RESIDENT
}
