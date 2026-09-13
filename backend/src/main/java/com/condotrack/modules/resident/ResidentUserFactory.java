package com.condotrack.modules.resident;

import com.condotrack.modules.auth.Role;
import com.condotrack.modules.auth.User;
import com.condotrack.modules.resident.ResidentDtos.CreateResidentProfileRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Small factory that builds a {@link User} from a resident sign-up request.
 *
 * <p>Why a separate factory? So {@code ResidentService} stays focused on
 * business rules (linking users to units) while password hashing and default
 * role selection live here in one reusable place.</p>
 */
final class ResidentUserFactory {
    private ResidentUserFactory() {}

    static User create(CreateResidentProfileRequest req, PasswordEncoder encoder) {
        // New accounts are RESIDENTs unless an admin explicitly picks another role.
        Role role = req.role() != null ? req.role() : Role.RESIDENT;
        return new User(req.name(), req.email(), encoder.encode(req.password()), req.phone(), role);
    }
}
