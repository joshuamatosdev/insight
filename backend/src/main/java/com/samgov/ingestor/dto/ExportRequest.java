package com.samgov.ingestor.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request for batch export.
 * Uses String IDs since Opportunity entities use String IDs.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExportRequest {

    @NotNull
    private ExportFormat format;

    @NotEmpty
    private List<String> ids;

    private String templateId;
    private boolean includeAttachments;

    public enum ExportFormat {
        PDF,
        EXCEL,
        CSV,
        JSON
    }
}
