package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.Invoice;
import com.samgov.ingestor.model.Invoice.InvoiceStatus;
import com.samgov.ingestor.model.Invoice.InvoiceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    Page<Invoice> findByTenantId(UUID tenantId, Pageable pageable);

    Optional<Invoice> findByTenantIdAndId(UUID tenantId, UUID id);

    Page<Invoice> findByContractId(UUID contractId, Pageable pageable);

    List<Invoice> findByContractIdOrderByInvoiceDateDesc(UUID contractId);

    Optional<Invoice> findByTenantIdAndInvoiceNumber(UUID tenantId, String invoiceNumber);

    boolean existsByTenantIdAndInvoiceNumber(UUID tenantId, String invoiceNumber);

    List<Invoice> findByTenantIdAndStatus(UUID tenantId, InvoiceStatus status);

    Page<Invoice> findByTenantIdAndStatus(UUID tenantId, InvoiceStatus status, Pageable pageable);

    // Unpaid invoices
    @Query("""
        SELECT i FROM Invoice i
        WHERE i.tenant.id = :tenantId
        AND i.status NOT IN ('PAID', 'CANCELLED')
        ORDER BY i.dueDate ASC
        """)
    List<Invoice> findUnpaidInvoices(@Param("tenantId") UUID tenantId);

    // Overdue invoices
    @Query("""
        SELECT i FROM Invoice i
        WHERE i.tenant.id = :tenantId
        AND i.status NOT IN ('PAID', 'CANCELLED')
        AND i.dueDate IS NOT NULL
        AND i.dueDate < :today
        ORDER BY i.dueDate ASC
        """)
    List<Invoice> findOverdueInvoices(@Param("tenantId") UUID tenantId, @Param("today") LocalDate today);

    // Sum totals by status
    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.contract.id = :contractId AND i.status = :status")
    Optional<BigDecimal> sumTotalAmountByContractIdAndStatus(
        @Param("contractId") UUID contractId,
        @Param("status") InvoiceStatus status
    );

    // Total invoiced
    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.contract.id = :contractId AND i.status IN ('SUBMITTED', 'RECEIVED', 'APPROVED', 'PAID')")
    Optional<BigDecimal> sumInvoicedAmountByContractId(@Param("contractId") UUID contractId);

    // Total paid
    @Query("SELECT SUM(i.amountPaid) FROM Invoice i WHERE i.contract.id = :contractId")
    Optional<BigDecimal> sumPaidAmountByContractId(@Param("contractId") UUID contractId);

    // Outstanding balance
    @Query("SELECT SUM(i.totalAmount - COALESCE(i.amountPaid, 0)) FROM Invoice i WHERE i.contract.id = :contractId AND i.status NOT IN ('PAID', 'CANCELLED')")
    Optional<BigDecimal> sumOutstandingBalanceByContractId(@Param("contractId") UUID contractId);

    // By date range
    @Query("""
        SELECT i FROM Invoice i
        WHERE i.tenant.id = :tenantId
        AND i.invoiceDate >= :startDate
        AND i.invoiceDate <= :endDate
        ORDER BY i.invoiceDate DESC
        """)
    List<Invoice> findByDateRange(
        @Param("tenantId") UUID tenantId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    // Tenant totals
    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.tenant.id = :tenantId AND i.status NOT IN ('DRAFT', 'CANCELLED')")
    Optional<BigDecimal> sumTotalInvoicedByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(i.totalAmount - COALESCE(i.amountPaid, 0)) FROM Invoice i WHERE i.tenant.id = :tenantId AND i.status NOT IN ('PAID', 'CANCELLED')")
    Optional<BigDecimal> sumOutstandingByTenantId(@Param("tenantId") UUID tenantId);

    // Count by status
    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.tenant.id = :tenantId AND i.status = :status")
    long countByTenantIdAndStatus(@Param("tenantId") UUID tenantId, @Param("status") InvoiceStatus status);

    // By status and due date
    List<Invoice> findByTenantIdAndStatusAndDueDateBefore(UUID tenantId, InvoiceStatus status, LocalDate dueDate);

    // Tenant totals for summary
    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.tenant.id = :tenantId")
    BigDecimal sumTotalAmountByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(i.amountPaid) FROM Invoice i WHERE i.tenant.id = :tenantId")
    BigDecimal sumAmountPaidByTenantId(@Param("tenantId") UUID tenantId);
}
