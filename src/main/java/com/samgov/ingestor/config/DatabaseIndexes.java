package com.samgov.ingestor.config;

/**
 * Documentation of recommended database indexes for performance.
 * These should be added via Flyway or Liquibase migrations.
 * 
 * Run these SQL statements to create performance indexes:
 * 
 * -- Opportunity indexes
 * CREATE INDEX IF NOT EXISTS idx_opportunities_tenant_status 
 *     ON opportunities(tenant_id, status);
 * CREATE INDEX IF NOT EXISTS idx_opportunities_tenant_deadline 
 *     ON opportunities(tenant_id, response_deadline);
 * CREATE INDEX IF NOT EXISTS idx_opportunities_tenant_posted 
 *     ON opportunities(tenant_id, posted_date DESC);
 * CREATE INDEX IF NOT EXISTS idx_opportunities_notice_id 
 *     ON opportunities(notice_id);
 * CREATE INDEX IF NOT EXISTS idx_opportunities_type 
 *     ON opportunities(tenant_id, type);
 * 
 * -- Contract indexes
 * CREATE INDEX IF NOT EXISTS idx_contracts_tenant_status 
 *     ON contracts(tenant_id, status);
 * CREATE INDEX IF NOT EXISTS idx_contracts_tenant_number 
 *     ON contracts(tenant_id, contract_number);
 * CREATE INDEX IF NOT EXISTS idx_contracts_end_date 
 *     ON contracts(tenant_id, end_date);
 * 
 * -- User indexes
 * CREATE INDEX IF NOT EXISTS idx_users_tenant_email 
 *     ON users(tenant_id, email);
 * CREATE INDEX IF NOT EXISTS idx_users_tenant_status 
 *     ON users(tenant_id, status);
 * 
 * -- Session indexes
 * CREATE INDEX IF NOT EXISTS idx_sessions_user_id 
 *     ON sessions(user_id);
 * CREATE INDEX IF NOT EXISTS idx_sessions_expires_at 
 *     ON sessions(expires_at);
 * 
 * -- Audit log indexes
 * CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_timestamp 
 *     ON audit_logs(tenant_id, timestamp DESC);
 * CREATE INDEX IF NOT EXISTS idx_audit_logs_entity 
 *     ON audit_logs(entity_type, entity_id);
 * 
 * -- Full-text search
 * CREATE INDEX IF NOT EXISTS idx_opportunities_fts 
 *     ON opportunities USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
 */
public class DatabaseIndexes {

    private DatabaseIndexes() {
        // Documentation class only
    }

    public static final String[] RECOMMENDED_INDEXES = {
        "CREATE INDEX IF NOT EXISTS idx_opportunities_tenant_status ON opportunities(tenant_id, status)",
        "CREATE INDEX IF NOT EXISTS idx_opportunities_tenant_deadline ON opportunities(tenant_id, response_deadline)",
        "CREATE INDEX IF NOT EXISTS idx_opportunities_tenant_posted ON opportunities(tenant_id, posted_date DESC)",
        "CREATE INDEX IF NOT EXISTS idx_contracts_tenant_status ON contracts(tenant_id, status)",
        "CREATE INDEX IF NOT EXISTS idx_contracts_end_date ON contracts(tenant_id, end_date)",
        "CREATE INDEX IF NOT EXISTS idx_users_tenant_email ON users(tenant_id, email)",
        "CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_timestamp ON audit_logs(tenant_id, timestamp DESC)"
    };
}
