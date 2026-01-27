package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.InvoiceLineItem;
import com.samgov.ingestor.model.InvoiceLineItem.LineType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceLineItemRepository extends JpaRepository<InvoiceLineItem, UUID> {

    List<InvoiceLineItem> findByInvoiceIdOrderBySortOrderAsc(UUID invoiceId);

    List<InvoiceLineItem> findByInvoiceIdOrderByLineNumber(UUID invoiceId);

    Optional<InvoiceLineItem> findByInvoiceIdAndId(UUID invoiceId, UUID id);

    List<InvoiceLineItem> findByInvoiceIdAndLineType(UUID invoiceId, LineType lineType);

    List<InvoiceLineItem> findByClinId(UUID clinId);

    @Query("SELECT SUM(li.amount) FROM InvoiceLineItem li WHERE li.invoice.id = :invoiceId")
    Optional<BigDecimal> sumAmountByInvoiceId(@Param("invoiceId") UUID invoiceId);

    @Query("SELECT SUM(li.amount) FROM InvoiceLineItem li WHERE li.invoice.id = :invoiceId AND li.lineType = :lineType")
    Optional<BigDecimal> sumAmountByInvoiceIdAndLineType(
        @Param("invoiceId") UUID invoiceId,
        @Param("lineType") LineType lineType
    );

    @Query("SELECT SUM(li.hours) FROM InvoiceLineItem li WHERE li.invoice.id = :invoiceId AND li.lineType = :lineType")
    Optional<BigDecimal> sumLaborHoursByInvoiceId(@Param("invoiceId") UUID invoiceId, @Param("lineType") LineType lineType);

    void deleteByInvoiceId(UUID invoiceId);
}
