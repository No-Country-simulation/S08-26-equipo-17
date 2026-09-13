package com.condotrack.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;

/**
 * Standard envelope for every API response.
 *
 * <p>Beginner note: instead of returning raw objects, controllers always
 * return this wrapper so the frontend can rely on the same shape:</p>
 * <pre>
 * { "success": true, "message": "...", "data": {...}, "timestamp": "..." }
 * </pre>
 *
 * @param success   true for 2xx outcomes, false for errors.
 * @param message   human-readable summary (English).
 * @param data      the actual payload (may be null).
 * @param timestamp when the response was built.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        boolean success,
        String message,
        T data,
        Instant timestamp
) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, "Operation completed successfully.", data, Instant.now());
    }

    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data, Instant.now());
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null, Instant.now());
    }
}
