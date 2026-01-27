package com.samgov.ingestor.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * Request for batch export
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExportRequest {

    @NotNull
    private ExportFormat format;

    @NotEmpty
    private List<UUID> ids;

    private String templateId;
    private boolean includeAttachments;

    public enum ExportFormat {
        PDF,
        EXCEL,
        CSV,
        JSON
    }
}
