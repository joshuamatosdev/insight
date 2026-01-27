package com.samgov.ingestor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * Request for faceted search with multiple filters
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacetedSearchRequest {

    private String query;
    private List<String> naicsCodes;
    private List<String> setAsideCodes;
    private List<String> types;
    private List<String> agencies;
    private LocalDate responseDateFrom;
    private LocalDate responseDateTo;
    private Double valueMin;
    private Double valueMax;
    private Boolean active;
    private String sortBy;
    private String sortOrder;
    private int page;
    private int size;
}
