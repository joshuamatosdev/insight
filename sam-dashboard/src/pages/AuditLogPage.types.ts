import {AuditLog, AuditLogFilterState} from '../types';

export interface AuditLogPageProps {
    tenantId?: string;
}

export interface AuditLogTableProps {
    logs: AuditLog[];
    isLoading: boolean;
    expandedRowId: string | null;
    onToggleExpand: (id: string) => void;
}

export interface AuditLogFilterBarProps {
    filters: AuditLogFilterState;
    onFilterChange: (filters: AuditLogFilterState) => void;
}

export interface AuditLogRowProps {
    log: AuditLog;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

export interface AuditLogDetailsProps {
    details: string | null;
}
