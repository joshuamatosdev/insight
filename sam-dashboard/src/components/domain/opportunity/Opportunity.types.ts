import {CSSProperties, ReactNode} from 'react';

import type {components} from '@/types/api.generated';

/**
 * Opportunity type - uses the generated OpportunityDto from the backend API
 */
export type Opportunity = components['schemas']['OpportunityDto'];

export type OpportunityType = 'sources-sought' | 'presolicitation' | 'solicitation' | 'sbir' | 'sttr' | 'other';

export type SbirPhase = 'I' | 'II' | 'III' | null;

export function getOpportunityType(type: string | undefined): OpportunityType {
  if (type === undefined || type === null || type === '') return 'other';
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
  if (opportunity.isSttr === true) return 'STTR';
  if (opportunity.isSbir === true) return 'SBIR';
  return null;
}

export function getSbirPhaseLabel(phase: string | null | undefined): string {
  if (phase === undefined || phase === null || phase === '') return '';
  return `Phase ${phase}`;
}

export interface OpportunityCardProps {
  opportunity: Opportunity;
  className?: string;
  style?: CSSProperties;
  extraBadge?: ReactNode;
}

export interface OpportunityListProps {
  opportunities: Opportunity[];
  emptyMessage?: string;
  renderBadge?: (opportunity: Opportunity) => ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface OpportunityTableProps {
  opportunities: Opportunity[];
  maxRows?: number;
  className?: string;
  style?: CSSProperties;
}

export interface TypeBadgeProps {
  type: OpportunityType;
  label?: string;
  className?: string;
  style?: CSSProperties;
}
