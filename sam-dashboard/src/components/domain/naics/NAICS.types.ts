import {CSSProperties} from 'react';

export interface NAICSBadgeProps {
  code: string | undefined;
  className?: string;
  style?: CSSProperties;
}

export interface NAICSDistributionProps {
  distribution: Record<string, number>;
  total: number;
  maxItems?: number;
}

export const NAICS_DESCRIPTIONS: Record<string, string> = {
  '541511': 'Custom Computer Programming',
  '541512': 'Computer Systems Design',
  '541513': 'Computer Facilities Management',
  '541519': 'Other Computer Related Services',
  '518210': 'Data Processing & Hosting',
  '513210': 'Software Publishers',
  '541611': 'Admin Management Consulting',
  '541618': 'Other Management Consulting',
  '541690': 'Other Scientific Consulting',
  '541330': 'Engineering Services',
  '541715': 'R&D Physical/Bio Sciences',
  '541713': 'R&D Nanotechnology',
  '541714': 'R&D Biotechnology',
  '541720': 'R&D Social Sciences',
  '611420': 'Computer Training',
  '611430': 'Professional Management Training',
  '541360': 'Geophysical Surveying',
  '541370': 'Surveying & Mapping',
  '541990': 'Other Professional Services',
};

export function getNAICSDescription(code: string | undefined): string {
  if (!code) return 'Unknown';
  return NAICS_DESCRIPTIONS[code] || 'Other';
}
