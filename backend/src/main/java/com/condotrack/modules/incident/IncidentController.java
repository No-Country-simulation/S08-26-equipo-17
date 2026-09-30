package com.condotrack.modules.incident;

import com.condotrack.common.dto.ApiResponse;
import com.condotrack.common.exception.BusinessException;
import com.condotrack.modules.incident.IncidentDtos.*;
import jakarta.validation.Valid;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    /** Upload maintenance photo attachment (FR-15). */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UploadPhotoResponse>> uploadPhoto(
            @RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Photo file cannot be empty.");
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            throw new BusinessException("Invalid photo format. Supported formats: image/jpeg, image/png, image/webp");
        }

        String normalizedContentType = contentType.toLowerCase().split(";")[0].trim();
        if (!normalizedContentType.equals("image/jpeg")
                && !normalizedContentType.equals("image/png")
                && !normalizedContentType.equals("image/webp")) {
            throw new BusinessException("Invalid photo format. Supported formats: image/jpeg, image/png, image/webp");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.lastIndexOf('.') != -1) {
            String rawExt = originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase();
            if (rawExt.matches("^\\.[a-zA-Z0-9]+$")) {
                extension = rawExt;
            }
        }

        if (extension.isBlank()) {
            if ("image/jpeg".equals(normalizedContentType)) {
                extension = ".jpg";
            } else if ("image/png".equals(normalizedContentType)) {
                extension = ".png";
            } else if ("image/webp".equals(normalizedContentType)) {
                extension = ".webp";
            } else {
                extension = ".jpg";
            }
        }

        String uniqueFilename = UUID.randomUUID().toString() + extension;
        Path uploadDir = Paths.get("uploads", "incidents").toAbsolutePath().normalize();

        try {
            Files.createDirectories(uploadDir);
            Path destinationFile = uploadDir.resolve(uniqueFilename).normalize();
            if (!destinationFile.startsWith(uploadDir)) {
                throw new BusinessException("Invalid file destination path.");
            }
            Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new BusinessException("Failed to store file: " + e.getMessage());
        }

        String photoUrl = "/api/v1/incidents/photos/" + uniqueFilename;
        UploadPhotoResponse response = new UploadPhotoResponse(
            photoUrl,
            originalFilename != null && !originalFilename.isBlank() ? originalFilename : uniqueFilename,
            file.getSize(),
            contentType
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Photo uploaded successfully.", response));
    }

    /** Secure photo download / viewing endpoint with unit and ownership access control (RNF-03). */
    @GetMapping("/photos/{filename:.+}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> getPhoto(@PathVariable String filename) {
        return incidentService.getPhoto(filename);
    }

    /** Any authenticated user (resident or concierge) can report a maintenance issue. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IncidentResponse create(@Valid @RequestBody CreateIncidentRequest req) {
        return incidentService.create(req);
    }

    /** Returns all incidents, newest first. */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','CONCIERGE','PORTARIA')")
    public Page<IncidentResponse> list(
            @PageableDefault(size = 20) Pageable pageable) {
        return incidentService.list(pageable);
    }

    /** Admin assigns a technician and advances the ticket lifecycle. */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public IncidentResponse updateStatus(@PathVariable UUID id,
                                         @Valid @RequestBody UpdateIncidentStatusRequest req) {
        return incidentService.updateStatus(id, req);
    }
}
