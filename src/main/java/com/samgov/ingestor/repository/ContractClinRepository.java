package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.ContractClin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContractClinRepository extends JpaRepository<ContractClin, UUID> {

    List<ContractClin> findByContractIdOrderBySortOrderAsc(UUID contractId);

    Optional<ContractClin> findByContractIdAndId(UUID contractId, UUID id);

    Optional<ContractClin> findByContractIdAndClinNumber(UUID contractId, String clinNumber);

    boolean existsByContractIdAndClinNumber(UUID contractId, String clinNumber);

    List<ContractClin> findByContractIdAndIsOptionTrue(UUID contractId);

    List<ContractClin> findByContractIdAndIsOptionFalse(UUID contractId);

    @Query("SELECT SUM(c.totalValue) FROM ContractClin c WHERE c.contract.id = :contractId")
    Optional<BigDecimal> sumTotalValueByContractId(@Param("contractId") UUID contractId);

    @Query("SELECT SUM(c.fundedAmount) FROM ContractClin c WHERE c.contract.id = :contractId")
    Optional<BigDecimal> sumFundedAmountByContractId(@Param("contractId") UUID contractId);

    @Query("SELECT SUM(c.invoicedAmount) FROM ContractClin c WHERE c.contract.id = :contractId")
    Optional<BigDecimal> sumInvoicedAmountByContractId(@Param("contractId") UUID contractId);

    @Query("SELECT MAX(c.sortOrder) FROM ContractClin c WHERE c.contract.id = :contractId")
    Optional<Integer> findMaxSortOrderByContractId(@Param("contractId") UUID contractId);

    void deleteByContractId(UUID contractId);
}
