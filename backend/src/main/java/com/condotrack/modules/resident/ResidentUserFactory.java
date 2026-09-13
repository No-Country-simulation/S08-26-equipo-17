package com.condotrack.modules.resident;

import com.condotrack.modules.auth.Role;
import com.condotrack.modules.auth.User;
import com.condotrack.modules.resident.ResidentDtos.CreateResidentProfileRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

/** Factory para crear perfiles de usuario (usado por Dev 3). */
final class ResidentUserFactory {
    private ResidentUserFactory() {}

    static User create(CreateResidentProfileRequest req, PasswordEncoder encoder) {
        Role role = req.role() != null ? req.role() : Role.MORADOR;
        return new User(req.name(), req.email(), encoder.encode(req.password()), req.phone(), role);
    }
}
