package com.condotrack.modules.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
    @NotBlank(message = "O token é obrigatório.")
    String token,

    @NotBlank(message = "A nova senha é obrigatória.")
    @Size(min = 6, message = "A nova senha deve conter pelo menos 6 caracteres.")
    String newPassword
) {
}
