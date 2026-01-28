package com.samgov.ingestor.controller;

import com.samgov.ingestor.model.Contract.ContractStatus;
import com.samgov.ingestor.model.ContractDeliverable.DeliverableStatus;
import com.samgov.ingestor.service.ContractService;
import com.samgov.ingestor.service.ContractService.ClinDto;
import com.samgov.ingestor.service.ContractService.ContractDto;
import com.samgov.ingestor.service.ContractService.ContractSummaryDto;
import com.samgov.ingestor.service.ContractService.CreateClinRequest;
import com.samgov.ingestor.service.ContractService.CreateContractRequest;
import com.samgov.ingestor.service.ContractService.CreateDeliverableRequest;
import com.samgov.ingestor.service.ContractService.CreateModificationRequest;
import com.samgov.ingestor.service.ContractService.CreateOptionRequest;
import com.samgov.ingestor.service.ContractService.DeliverableDto;
import com.samgov.ingestor.service.ContractService.ModificationDto;
import com.samgov.ingestor.service.ContractService.OptionDto;
import com.samgov.ingestor.service.ContractService.UpdateClinRequest;
import com.samgov.ingestor.service.ContractService.UpdateContractRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    // Contract endpoints

    @PostMapping
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_CREATE')")
    public ResponseEntity<ContractDto> createContract(@Valid @RequestBody CreateContractRequest request) {
        log.info("Creating contract: {}", request.contractNumber());
        ContractDto contract = contractService.createContract(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(contract);
    }

    @GetMapping
    public ResponseEntity<Page<ContractDto>> getContracts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "contractNumber") String sortBy,
        @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ContractDto> contracts = contractService.getContracts(pageable);
        return ResponseEntity.ok(contracts);
    }

    @GetMapping("/active")
    public ResponseEntity<Page<ContractDto>> getActiveContracts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("popEndDate").ascending());
        Page<ContractDto> contracts = contractService.getActiveContracts(pageable);
        return ResponseEntity.ok(contracts);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ContractDto>> searchContracts(
        @RequestParam String keyword,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ContractDto> contracts = contractService.searchContracts(keyword, pageable);
        return ResponseEntity.ok(contracts);
    }

    @GetMapping("/expiring")
    public ResponseEntity<List<ContractDto>> getExpiringContracts(
        @RequestParam(defaultValue = "90") int daysAhead
    ) {
        List<ContractDto> contracts = contractService.getExpiringContracts(daysAhead);
        return ResponseEntity.ok(contracts);
    }

    @GetMapping("/{contractId}")
    public ResponseEntity<ContractDto> getContract(@PathVariable UUID contractId) {
        ContractDto contract = contractService.getContract(contractId);
        return ResponseEntity.ok(contract);
    }

    @GetMapping("/{contractId}/summary")
    public ResponseEntity<ContractSummaryDto> getContractSummary(@PathVariable UUID contractId) {
        ContractSummaryDto summary = contractService.getContractSummary(contractId);
        return ResponseEntity.ok(summary);
    }

    @PutMapping("/{contractId}")
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<ContractDto> updateContract(
        @PathVariable UUID contractId,
        @Valid @RequestBody UpdateContractRequest request
    ) {
        ContractDto contract = contractService.updateContract(contractId, request);
        return ResponseEntity.ok(contract);
    }

    @PatchMapping("/{contractId}/status")
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<Void> updateContractStatus(
        @PathVariable UUID contractId,
        @RequestParam ContractStatus status
    ) {
        contractService.updateContractStatus(contractId, status);
        return ResponseEntity.ok().build();
    }

    // CLIN endpoints

    @PostMapping("/{contractId}/clins")
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<ClinDto> addClin(
        @PathVariable UUID contractId,
        @Valid @RequestBody CreateClinRequest request
    ) {
        ClinDto clin = contractService.addClin(contractId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(clin);
    }

    @GetMapping("/{contractId}/clins")
    public ResponseEntity<List<ClinDto>> getClins(@PathVariable UUID contractId) {
        List<ClinDto> clins = contractService.getClins(contractId);
        return ResponseEntity.ok(clins);
    }

    @PutMapping("/{contractId}/clins/{clinId}")
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<ClinDto> updateClin(
        @PathVariable UUID contractId,
        @PathVariable UUID clinId,
        @Valid @RequestBody UpdateClinRequest request
    ) {
        ClinDto clin = contractService.updateClin(contractId, clinId, request);
        return ResponseEntity.ok(clin);
    }

    // Modification endpoints

    @PostMapping("/{contractId}/modifications")
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<ModificationDto> createModification(
        @PathVariable UUID contractId,
        @Valid @RequestBody CreateModificationRequest request
    ) {
        log.info("Creating modification {} for contract {}", request.modificationNumber(), contractId);
        ModificationDto modification = contractService.createModification(contractId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(modification);
    }

    @GetMapping("/{contractId}/modifications")
    public ResponseEntity<List<ModificationDto>> getModifications(@PathVariable UUID contractId) {
        List<ModificationDto> modifications = contractService.getModifications(contractId);
        return ResponseEntity.ok(modifications);
    }

    @PostMapping("/{contractId}/modifications/{modificationId}/execute")
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<ModificationDto> executeModification(
        @PathVariable UUID contractId,
        @PathVariable UUID modificationId
    ) {
        log.info("Executing modification {} for contract {}", modificationId, contractId);
        ModificationDto modification = contractService.executeModification(contractId, modificationId);
        return ResponseEntity.ok(modification);
    }

    // Option endpoints

    @PostMapping("/{contractId}/options")
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<OptionDto> addOption(
        @PathVariable UUID contractId,
        @Valid @RequestBody CreateOptionRequest request
    ) {
        OptionDto option = contractService.addOption(contractId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(option);
    }

    @GetMapping("/{contractId}/options")
    public ResponseEntity<List<OptionDto>> getOptions(@PathVariable UUID contractId) {
        List<OptionDto> options = contractService.getOptions(contractId);
        return ResponseEntity.ok(options);
    }

    @PostMapping("/{contractId}/options/{optionId}/exercise")
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<OptionDto> exerciseOption(
        @PathVariable UUID contractId,
        @PathVariable UUID optionId,
        @RequestParam(required = false) String modificationNumber
    ) {
        log.info("Exercising option {} for contract {}", optionId, contractId);
        OptionDto option = contractService.exerciseOption(contractId, optionId, modificationNumber);
        return ResponseEntity.ok(option);
    }

    @GetMapping("/options/approaching-deadlines")
    public ResponseEntity<List<OptionDto>> getApproachingOptionDeadlines(
        @RequestParam(defaultValue = "60") int daysAhead
    ) {
        List<OptionDto> options = contractService.getApproachingOptionDeadlines(daysAhead);
        return ResponseEntity.ok(options);
    }

    // Deliverable endpoints

    @PostMapping("/{contractId}/deliverables")
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<DeliverableDto> addDeliverable(
        @PathVariable UUID contractId,
        @Valid @RequestBody CreateDeliverableRequest request
    ) {
        DeliverableDto deliverable = contractService.addDeliverable(contractId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(deliverable);
    }

    @GetMapping("/{contractId}/deliverables")
    public ResponseEntity<List<DeliverableDto>> getDeliverables(@PathVariable UUID contractId) {
        List<DeliverableDto> deliverables = contractService.getDeliverables(contractId);
        return ResponseEntity.ok(deliverables);
    }

    @PatchMapping("/{contractId}/deliverables/{deliverableId}/status")
    @PreAuthorize("@tenantSecurityService.hasPermission('CONTRACT_UPDATE')")
    public ResponseEntity<DeliverableDto> updateDeliverableStatus(
        @PathVariable UUID contractId,
        @PathVariable UUID deliverableId,
        @RequestParam DeliverableStatus status
    ) {
        DeliverableDto deliverable = contractService.updateDeliverableStatus(contractId, deliverableId, status);
        return ResponseEntity.ok(deliverable);
    }

    @GetMapping("/{contractId}/deliverables/overdue")
    public ResponseEntity<List<DeliverableDto>> getOverdueDeliverables(@PathVariable UUID contractId) {
        List<DeliverableDto> deliverables = contractService.getOverdueDeliverables(contractId);
        return ResponseEntity.ok(deliverables);
    }
}
