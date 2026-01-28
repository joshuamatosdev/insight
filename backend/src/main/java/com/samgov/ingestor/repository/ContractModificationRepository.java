package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.ContractModification;
import com.samgov.ingestor.model.ContractModification.ModificationStatus;
import com.samgov.ingestor.model.ContractModification.ModificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContractModificationRepository extends JpaRepository<ContractModification, UUID> {

    List<ContractModification> findByContractIdOrderByModificationNumberDesc(UUID contractId);

    Page<ContractModification> findByContractId(UUID contractId, Pageable pageable);

    Optional<ContractModification> findByContractIdAndId(UUID contractId, UUID id);

    Optional<ContractModification> findByContractIdAndModificationNumber(UUID contractId, String modificationNumber);

    boolean existsByContractIdAndModificationNumber(UUID contractId, String modificationNumber);

    List<ContractModification> findByContractIdAndStatus(UUID contractId, ModificationStatus status);

    List<ContractModification> findByContractIdAndModificationType(UUID contractId, ModificationType type);

    @Query("SELECT SUM(m.valueChange) FROM ContractModification m WHERE m.contract.id = :contractId AND m.status = 'EXECUTED'")
    Optional<BigDecimal> sumValueChangeByContractId(@Param("contractId") UUID contractId);

    @Query("SELECT SUM(m.fundingChange) FROM ContractModification m WHERE m.contract.id = :contractId AND m.status = 'EXECUTED'")
    Optional<BigDecimal> sumFundingChangeByContractId(@Param("contractId") UUID contractId);

    @Query("SELECT COUNT(m) FROM ContractModification m WHERE m.contract.id = :contractId")
    long countByContractId(@Param("contractId") UUID contractId);

    @Query("SELECT COUNT(m) FROM ContractModification m WHERE m.contract.id = :contractId AND m.status = :status")
    long countByContractIdAndStatus(@Param("contractId") UUID contractId, @Param("status") ModificationStatus status);

    // Get the latest modification number
    @Query("SELECT m.modificationNumber FROM ContractModification m WHERE m.contract.id = :contractId ORDER BY m.createdAt DESC LIMIT 1")
    Optional<String> findLatestModificationNumber(@Param("contractId") UUID contractId);

    void deleteByContractId(UUID contractId);
}
