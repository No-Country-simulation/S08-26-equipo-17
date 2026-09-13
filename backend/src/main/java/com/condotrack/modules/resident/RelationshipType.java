package com.condotrack.modules.resident;

/**
 * How a user is related to a housing unit.
 *
 * <p>One person can be linked to several units (for example, an owner who
 * rents out a second apartment), and each link has exactly one type:</p>
 * <ul>
 *   <li>{@code OWNER} - owns the unit (property owner).</li>
 *   <li>{@code TENANT} - rents the unit (lease holder).</li>
 *   <li>{@code FAMILY_MEMBER} - lives there as part of the household.</li>
 * </ul>
 */
public enum RelationshipType {
    OWNER,
    TENANT,
    FAMILY_MEMBER
}
