-- =============================================================================
-- SAMGov Database Initialization Script
-- =============================================================================
-- This script runs automatically when the PostgreSQL container starts for
-- the first time. It sets up the initial database schema, extensions, and
-- seed data required for the application.
--
-- Note: This script only runs once on fresh container creation.
--       For migrations, use Flyway or Liquibase via the Spring Boot app.
-- =============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create schemas for organization
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS audit;

-- =============================================================================
-- Core Tables
-- =============================================================================

-- Opportunities table (main entity)
CREATE TABLE IF NOT EXISTS core.opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notice_id VARCHAR(255) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    solicitation_number VARCHAR(255),
    department VARCHAR(255),
    sub_tier VARCHAR(255),
    office VARCHAR(255),
    posted_date TIMESTAMP WITH TIME ZONE,
    response_deadline TIMESTAMP WITH TIME ZONE,
    archive_date TIMESTAMP WITH TIME ZONE,
    set_aside_type VARCHAR(100),
    set_aside_description TEXT,
    naics_code VARCHAR(10),
    classification_code VARCHAR(50),
    pop_zip VARCHAR(20),
    pop_city VARCHAR(255),
    pop_state VARCHAR(100),
    pop_country VARCHAR(100),
    description TEXT,
    link TEXT,
    active BOOLEAN DEFAULT true,
    type VARCHAR(100),
    resource_links JSONB,
    point_of_contact JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_opportunities_notice_id ON core.opportunities(notice_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_posted_date ON core.opportunities(posted_date DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_response_deadline ON core.opportunities(response_deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_naics ON core.opportunities(naics_code);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON core.opportunities(type);
CREATE INDEX IF NOT EXISTS idx_opportunities_set_aside ON core.opportunities(set_aside_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_active ON core.opportunities(active);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_opportunities_title_search ON core.opportunities USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_opportunities_description_search ON core.opportunities USING gin(to_tsvector('english', COALESCE(description, '')));

-- =============================================================================
-- User Management Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS core.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    organization VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON core.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON core.users(role);

-- =============================================================================
-- Saved Searches Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS core.saved_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES core.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    filters JSONB NOT NULL,
    email_alerts BOOLEAN DEFAULT false,
    alert_frequency VARCHAR(50) DEFAULT 'daily',
    last_run TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON core.saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_alerts ON core.saved_searches(email_alerts) WHERE email_alerts = true;

-- =============================================================================
-- Tracked Opportunities Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS core.tracked_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES core.users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES core.opportunities(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'watching',
    notes TEXT,
    reminder_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_tracked_user ON core.tracked_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_tracked_opportunity ON core.tracked_opportunities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_tracked_reminder ON core.tracked_opportunities(reminder_date) WHERE reminder_date IS NOT NULL;

-- =============================================================================
-- Audit Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit.opportunity_changes (
    id BIGSERIAL PRIMARY KEY,
    opportunity_id UUID REFERENCES core.opportunities(id) ON DELETE SET NULL,
    notice_id VARCHAR(255),
    change_type VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_opportunity ON audit.opportunity_changes(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_audit_notice ON audit.opportunity_changes(notice_id);
CREATE INDEX IF NOT EXISTS idx_audit_changed_at ON audit.opportunity_changes(changed_at DESC);

-- =============================================================================
-- Pipeline/Ingestion Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS core.pipeline_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pipeline_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    records_processed INTEGER DEFAULT 0,
    records_inserted INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_message TEXT,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_pipeline_name ON core.pipeline_runs(pipeline_name);
CREATE INDEX IF NOT EXISTS idx_pipeline_status ON core.pipeline_runs(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_started ON core.pipeline_runs(started_at DESC);

-- =============================================================================
-- Functions
-- =============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT table_schema || '.' || table_name
        FROM information_schema.columns
        WHERE column_name = 'updated_at'
        AND table_schema IN ('core', 'audit')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_updated_at ON %s', t);
        EXECUTE format('CREATE TRIGGER update_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Grant Permissions
-- =============================================================================

-- Grant usage on schemas
GRANT USAGE ON SCHEMA core TO PUBLIC;
GRANT USAGE ON SCHEMA audit TO PUBLIC;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA core TO PUBLIC;
GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA audit TO PUBLIC;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA core TO PUBLIC;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA audit TO PUBLIC;

-- =============================================================================
-- Initial Data
-- =============================================================================

-- Insert test user for development
INSERT INTO core.users (email, first_name, last_name, organization, role, email_verified)
VALUES ('admin@samgov.local', 'Admin', 'User', 'SAMGov Development', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'SAMGov database initialization completed at %', NOW();
END;
$$;
