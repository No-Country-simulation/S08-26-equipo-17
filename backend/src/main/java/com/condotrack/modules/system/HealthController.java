package com.condotrack.modules.system;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Sistema", description = "Endpoints de infraestrutura e monitoramento de saúde da API")
public class HealthController {

    @GetMapping
    @Operation(summary = "Verificar integridade da API", description = "Retorna o status operacional da aplicação CondoTrack")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "condotrack-api",
                "version", "1.0.0",
                "timestamp", Instant.now().toString()
        ));
    }
}
