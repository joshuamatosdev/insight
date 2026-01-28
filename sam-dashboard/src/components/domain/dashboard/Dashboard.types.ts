/**
 * Dashboard component types
 */

export interface PipelineStageData {
    stageId: string;
    stageName: string;
    count: number;
    value: number;
    weightedValue: number;
    color?: string;
}

export interface PipelineFunnelProps {
    stages: PipelineStageData[];
    totalValue: number;
    className?: string;
}

export interface AgencyDistributionData {
    agency: string;
    count: number;
    value: number;
}

export interface AgencyDistributionProps {
    data: AgencyDistributionData[];
    total: number;
    maxItems?: number;
    className?: string;
}

export interface ContractValueByTypeData {
    type: string;
    label: string;
    value: number;
    count: number;
}

export interface ContractValueByTypeProps {
    data: ContractValueByTypeData[];
    total: number;
    className?: string;
}

export interface DeadlineItem {
    id: string;
    title: string;
    deadline: string;
    type: string;
    agency?: string;
    value?: number;
}

export interface DeadlineTimelineProps {
    deadlines: DeadlineItem[];
    maxItems?: number;
    className?: string;
}

export interface SetAsideData {
    setAside: string;
    label: string;
    count: number;
    value: number;
}

export interface SetAsideDistributionProps {
    data: SetAsideData[];
    total: number;
    maxItems?: number;
    className?: string;
}

export interface UpcomingDeadline {
    id: string;
    title: string;
    agency: string;
    type: string;
    setAside: string | null;
    estimatedValue: number | null;
    deadline: string;
    daysRemaining: number;
}

export interface UpcomingDeadlinesTableProps {
    deadlines: UpcomingDeadline[];
    maxRows?: number;
    onRowClick?: (id: string) => void;
    className?: string;
}

export interface PipelineOpportunityRow {
    id: string;
    title: string;
    stageName: string;
    stageColor?: string;
    value: number | null;
    probability: number | null;
    weightedValue: number | null;
    owner: string | null;
    nextAction: string | null;
}

export interface PipelineOpportunitiesTableProps {
    opportunities: PipelineOpportunityRow[];
    maxRows?: number;
    onRowClick?: (id: string) => void;
    className?: string;
}

export interface ExpiringContract {
    id: string;
    contractNumber: string;
    title: string;
    agency: string | null;
    endDate: string;
    daysRemaining: number;
    value: number | null;
    type: 'contract' | 'option';
}

export interface ExpiringContractsTableProps {
    contracts: ExpiringContract[];
    maxRows?: number;
    onRowClick?: (id: string) => void;
    className?: string;
}

export interface ComplianceAlert {
    id: string;
    name: string;
    type: 'certification' | 'clearance';
    expirationDate: string;
    daysRemaining: number;
    status: string;
}

export interface ComplianceAlertsTableProps {
    alerts: ComplianceAlert[];
    maxRows?: number;
    onRowClick?: (id: string) => void;
    className?: string;
}
