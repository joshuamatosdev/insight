export interface Opportunity {
  id: string;
  title: string;
  solicitationNumber: string;
  type: string;
  naicsCode: string;
  postedDate: string;
  responseDeadLine: string;
  url: string;
  sbirPhase?: string | null;
  isSbir?: boolean | null;
  isSttr?: boolean | null;
  source?: string | null;
}

export type OpportunityType = 'sources-sought' | 'presolicitation' | 'solicitation' | 'sbir' | 'sttr' | 'other';

export type SbirPhase = 'I' | 'II' | 'III' | null;

export function getOpportunityType(type: string | undefined): OpportunityType {
  if (!type) return 'other';
  const t = type.toLowerCase();
  if (t.includes('sources sought')) return 'sources-sought';
  if (t.includes('presol')) return 'presolicitation';
  if (t.includes('solicitation')) return 'solicitation';
  return 'other';
}

export function isSbirOpportunity(opportunity: Opportunity): boolean {
  return opportunity.isSbir === true || opportunity.isSttr === true;
}

export function getSbirLabel(opportunity: Opportunity): string | null {
  if (opportunity.isSttr) return 'STTR';
  if (opportunity.isSbir) return 'SBIR';
  return null;
}

export function getSbirPhaseLabel(phase: string | null | undefined): string {
  if (!phase) return '';
  return `Phase ${phase}`;
}
