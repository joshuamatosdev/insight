package com.samgov.ingestor.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "opportunities", uniqueConstraints = {
    @UniqueConstraint(columnNames = "solicitation_number", name = "uk_solicitation_number")
})
public class Opportunity {

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @Column(name = "title")
    private String title;

    @Column(name = "solicitation_number", unique = true)
    private String solicitationNumber;

    @Column(name = "posted_date")
    private LocalDate postedDate;

    @Column(name = "response_deadline")
    private LocalDate responseDeadLine;

    @Column(name = "naics_code")
    private String naicsCode;

    @Column(name = "type")
    private String type;

    @Column(name = "url")
    private String url;
}
