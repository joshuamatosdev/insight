package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.BudgetItem;
import com.samgov.ingestor.model.BudgetItem.BudgetCategory;
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
public interface BudgetItemRepository extends JpaRepository<BudgetItem, UUID> {

    List<BudgetItem> findByContractId(UUID contractId);

    Page<BudgetItem> findByContractId(UUID contractId, Pageable pageable);

    Optional<BudgetItem> findByContractIdAndId(UUID contractId, UUID id);

    List<BudgetItem> findByContractIdAndCategory(UUID contractId, BudgetCategory category);

    List<BudgetItem> findByContractIdAndFiscalYear(UUID contractId, Integer fiscalYear);

    List<BudgetItem> findByCliId(UUID clinId);

    // Sum budgeted amount
    @Query("SELECT SUM(b.budgetedAmount) FROM BudgetItem b WHERE b.contract.id = :contractId")
    Optional<BigDecimal> sumBudgetedAmountByContractId(@Param("contractId") UUID contractId);

    // Sum actual amount
    @Query("SELECT SUM(b.actualAmount) FROM BudgetItem b WHERE b.contract.id = :contractId")
    Optional<BigDecimal> sumActualAmountByContractId(@Param("contractId") UUID contractId);

    // Sum committed amount
    @Query("SELECT SUM(b.committedAmount) FROM BudgetItem b WHERE b.contract.id = :contractId")
    Optional<BigDecimal> sumCommittedAmountByContractId(@Param("contractId") UUID contractId);

    // By category
    @Query("SELECT SUM(b.budgetedAmount) FROM BudgetItem b WHERE b.contract.id = :contractId AND b.category = :category")
    Optional<BigDecimal> sumBudgetedAmountByContractIdAndCategory(
        @Param("contractId") UUID contractId,
        @Param("category") BudgetCategory category
    );

    @Query("SELECT SUM(b.actualAmount) FROM BudgetItem b WHERE b.contract.id = :contractId AND b.category = :category")
    Optional<BigDecimal> sumActualAmountByContractIdAndCategory(
        @Param("contractId") UUID contractId,
        @Param("category") BudgetCategory category
    );

    // Over budget items
    @Query("""
        SELECT b FROM BudgetItem b
        WHERE b.contract.id = :contractId
        AND b.actualAmount > b.budgetedAmount
        """)
    List<BudgetItem> findOverBudgetItems(@Param("contractId") UUID contractId);

    // CLIN-based summaries
    @Query("SELECT SUM(b.budgetedAmount) FROM BudgetItem b WHERE b.clin.id = :clinId")
    Optional<BigDecimal> sumBudgetedAmountByCliId(@Param("clinId") UUID clinId);

    @Query("SELECT SUM(b.actualAmount) FROM BudgetItem b WHERE b.clin.id = :clinId")
    Optional<BigDecimal> sumActualAmountByCliId(@Param("clinId") UUID clinId);

    void deleteByContractId(UUID contractId);
}
