package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.ContractOption;
import com.samgov.ingestor.model.ContractOption.OptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContractOptionRepository extends JpaRepository<ContractOption, UUID> {

    List<ContractOption> findByContractIdOrderByOptionNumberAsc(UUID contractId);

    Optional<ContractOption> findByContractIdAndId(UUID contractId, UUID id);

    Optional<ContractOption> findByContractIdAndOptionNumber(UUID contractId, Integer optionNumber);

    boolean existsByContractIdAndOptionNumber(UUID contractId, Integer optionNumber);

    List<ContractOption> findByContractIdAndStatus(UUID contractId, OptionStatus status);

    // Pending options
    @Query("SELECT o FROM ContractOption o WHERE o.contract.id = :contractId AND o.status = 'PENDING' ORDER BY o.exerciseDeadline ASC")
    List<ContractOption> findPendingOptionsByContractId(@Param("contractId") UUID contractId);

    // Options with approaching deadlines
    @Query("""
        SELECT o FROM ContractOption o
        WHERE o.status = 'PENDING'
        AND o.exerciseDeadline IS NOT NULL
        AND o.exerciseDeadline <= :deadline
        AND o.exerciseDeadline >= :today
        ORDER BY o.exerciseDeadline ASC
        """)
    List<ContractOption> findOptionsWithApproachingDeadlines(
        @Param("today") LocalDate today,
        @Param("deadline") LocalDate deadline
    );

    // By tenant (through contract)
    @Query("""
        SELECT o FROM ContractOption o
        JOIN o.contract c
        WHERE c.tenant.id = :tenantId
        AND o.status = 'PENDING'
        AND o.exerciseDeadline <= :deadline
        ORDER BY o.exerciseDeadline ASC
        """)
    List<ContractOption> findPendingOptionsByTenantWithApproachingDeadlines(
        @Param("tenantId") UUID tenantId,
        @Param("deadline") LocalDate deadline
    );

    @Query("SELECT SUM(o.optionValue) FROM ContractOption o WHERE o.contract.id = :contractId AND o.status = 'PENDING'")
    Optional<BigDecimal> sumPendingOptionValueByContractId(@Param("contractId") UUID contractId);

    @Query("SELECT SUM(o.optionValue) FROM ContractOption o WHERE o.contract.id = :contractId AND o.status = 'EXERCISED'")
    Optional<BigDecimal> sumExercisedOptionValueByContractId(@Param("contractId") UUID contractId);

    @Query("SELECT COUNT(o) FROM ContractOption o WHERE o.contract.id = :contractId AND o.status = :status")
    long countByContractIdAndStatus(@Param("contractId") UUID contractId, @Param("status") OptionStatus status);

    @Query("SELECT MAX(o.optionNumber) FROM ContractOption o WHERE o.contract.id = :contractId")
    Optional<Integer> findMaxOptionNumberByContractId(@Param("contractId") UUID contractId);

    void deleteByContractId(UUID contractId);
}
