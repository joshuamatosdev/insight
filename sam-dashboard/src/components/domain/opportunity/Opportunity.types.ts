export interface Opportunity {
  id: string;
  title: string;
  solicitationNumber: string;
  type: string;
  naicsCode: string;
  postedDate: string;
  responseDeadLine: string;
  url: string;
}

export type OpportunityType = 'sources-sought' | 'presolicitation' | 'solicitation' | 'other';

export function getOpportunityType(type: string | undefined): OpportunityType {
  if (!type) return 'other';
  const t = type.toLowerCase();
  if (t.includes('sources sought')) return 'sources-sought';
  if (t.includes('presol')) return 'presolicitation';
  if (t.includes('solicitation')) return 'solicitation';
  return 'other';
}
