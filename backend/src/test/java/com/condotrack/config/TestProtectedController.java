package com.condotrack.config;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Test-only controller used to verify endpoint authorization rules. */
@RestController
public class TestProtectedController {

    @GetMapping("/api/v1/access/authorizations")
    public ResponseEntity<Map<String, String>> authorizations() {
        return ResponseEntity.ok(Map.of("ok", "true"));
    }

    @GetMapping("/api/v1/packages/tracking")
    public ResponseEntity<Map<String, String>> packages() {
        return ResponseEntity.ok(Map.of("ok", "true"));
    }

    @GetMapping("/api/v1/audit-logs/list")
    public ResponseEntity<Map<String, String>> auditLogs() {
        return ResponseEntity.ok(Map.of("ok", "true"));
    }

    @GetMapping("/api/v1/incidents/test")
    public ResponseEntity<Map<String, String>> other() {
        return ResponseEntity.ok(Map.of("ok", "true"));
    }
}
