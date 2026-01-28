import {Opportunity} from '../components/domain';

export interface AllOpportunitiesPageProps {
    opportunities: Opportunity[];
}

export interface DashboardPageProps {
    opportunities: Opportunity[];
    onNavigate: (section: string) => void;
}

export interface NAICSPageProps {
    naicsCode: string;
    opportunities: Opportunity[];
}

export interface PresolicationPageProps {
    opportunities: Opportunity[];
}

export interface SBIRPageProps {
    opportunities: Opportunity[];
}

export interface SolicitationPageProps {
    opportunities: Opportunity[];
}

export interface SourcesSoughtPageProps {
    opportunities: Opportunity[];
}
