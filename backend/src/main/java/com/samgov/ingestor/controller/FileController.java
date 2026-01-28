package com.samgov.ingestor.controller;

import com.samgov.ingestor.service.StorageService;
import com.samgov.ingestor.service.StorageService.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for file storage operations.
 *
 * Provides endpoints for:
 * - Direct file upload (for small files)
 * - Presigned URL upload (for large files)
 * - File download (direct and presigned)
 * - File listing, search, and deletion
 */
@RestController
@RequestMapping("/files")
@Validated
@Tag(name = "Files", description = "File storage and management endpoints")
public class FileController {

    private final StorageService storageService;

    public FileController(StorageService storageService) {
        this.storageService = storageService;
    }

    // ==================== Upload Endpoints ====================

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    @Operation(summary = "Upload a file directly", description = "Upload a file directly to S3. Best for files under 10MB.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "File uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request"),
        @ApiResponse(responseCode = "413", description = "File too large")
    })
    public ResponseEntity<FileDto> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) String referenceType,
            @RequestParam(required = false) String referenceId
    ) throws IOException {
        FileUploadRequest request = new FileUploadRequest(
                file.getOriginalFilename(),
                file.getContentType(),
                description,
                tags,
                referenceType,
                referenceId
        );

        FileDto result = storageService.uploadFile(file, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/upload/presigned")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    @Operation(summary = "Initiate a presigned upload",
               description = "Get a presigned URL for uploading large files directly to S3")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Presigned URL generated"),
        @ApiResponse(responseCode = "400", description = "Invalid request")
    })
    public ResponseEntity<FileUploadResponse> initiatePresignedUpload(
            @Valid @RequestBody FileUploadRequest request
    ) {
        FileUploadResponse response = storageService.initiatePresignedUpload(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload/{fileId}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    @Operation(summary = "Confirm presigned upload",
               description = "Confirm that a presigned upload has completed successfully")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Upload confirmed"),
        @ApiResponse(responseCode = "404", description = "File not found"),
        @ApiResponse(responseCode = "400", description = "File not in pending state or not found in S3")
    })
    public ResponseEntity<FileDto> confirmUpload(@PathVariable UUID fileId) {
        FileDto result = storageService.confirmUpload(fileId);
        return ResponseEntity.ok(result);
    }

    // ==================== Download Endpoints ====================

    @GetMapping("/download/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    @Operation(summary = "Download a file directly", description = "Stream file content directly from S3")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "File content",
                content = @Content(mediaType = "application/octet-stream")),
        @ApiResponse(responseCode = "404", description = "File not found"),
        @ApiResponse(responseCode = "400", description = "File not available for download")
    })
    public ResponseEntity<InputStreamResource> downloadFile(@PathVariable UUID id) {
        FileDownload download = storageService.downloadFile(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(download.contentType()));
        headers.setContentLength(download.size());
        headers.setContentDispositionFormData("attachment", download.fileName());

        return ResponseEntity.ok()
                .headers(headers)
                .body(new InputStreamResource(download.inputStream()));
    }

    @GetMapping("/presigned/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    @Operation(summary = "Get a presigned download URL",
               description = "Get a time-limited presigned URL for downloading a file")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Presigned URL generated"),
        @ApiResponse(responseCode = "404", description = "File not found"),
        @ApiResponse(responseCode = "400", description = "File not available for download")
    })
    public ResponseEntity<PresignedUrlResponse> getPresignedDownloadUrl(@PathVariable UUID id) {
        PresignedUrlResponse response = storageService.getPresignedDownloadUrl(id);
        return ResponseEntity.ok(response);
    }

    // ==================== List and Search Endpoints ====================

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    @Operation(summary = "List files", description = "List all files for the current tenant with pagination")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "List of files")
    })
    public ResponseEntity<Page<FileDto>> listFiles(Pageable pageable) {
        Page<FileDto> files = storageService.listFiles(pageable);
        return ResponseEntity.ok(files);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    @Operation(summary = "Get file metadata", description = "Get metadata for a specific file")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "File metadata"),
        @ApiResponse(responseCode = "404", description = "File not found")
    })
    public ResponseEntity<FileDto> getFile(@PathVariable UUID id) {
        return storageService.getFile(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/reference/{referenceType}/{referenceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    @Operation(summary = "List files by reference",
               description = "List files associated with a specific entity (e.g., opportunity, contract)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "List of files")
    })
    public ResponseEntity<List<FileDto>> listFilesByReference(
            @PathVariable @Size(max = 50) String referenceType,
            @PathVariable @Size(max = 100) String referenceId
    ) {
        List<FileDto> files = storageService.listFilesByReference(referenceType, referenceId);
        return ResponseEntity.ok(files);
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER', 'USER')")
    @Operation(summary = "Search files", description = "Search files by keyword in name, description, or tags")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Search results")
    })
    public ResponseEntity<Page<FileDto>> searchFiles(
            @RequestParam @NotBlank @Size(max = 200) String keyword,
            Pageable pageable
    ) {
        Page<FileDto> results = storageService.searchFiles(keyword, pageable);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER', 'BD_MANAGER')")
    @Operation(summary = "Get storage summary", description = "Get storage usage summary for the current tenant")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Storage summary")
    })
    public ResponseEntity<StorageSummary> getStorageSummary() {
        StorageSummary summary = storageService.getStorageSummary();
        return ResponseEntity.ok(summary);
    }

    // ==================== Delete Endpoint ====================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONTRACT_MANAGER')")
    @Operation(summary = "Delete a file", description = "Soft delete a file (can be recovered within retention period)")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "File deleted"),
        @ApiResponse(responseCode = "404", description = "File not found")
    })
    public ResponseEntity<Void> deleteFile(@PathVariable UUID id) {
        boolean deleted = storageService.deleteFile(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
