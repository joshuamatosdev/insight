export interface SbirAward {
  id: string;
  firm: string;
  awardTitle: string;
  agency: string;
  branch: string;
  phase: string;
  program: string;
  agencyTrackingNumber: string;
  contract: string;
  proposalAwardDate: string;
  contractEndDate: string;
  solicitationNumber: string;
  solicitationYear: number;
  topicCode: string;
  awardYear: number;
  awardAmount: number;
  uei: string;
  hubzoneOwned: boolean;
  sociallyEconomicallyDisadvantaged: boolean;
  womenOwned: boolean;
  numberEmployees: number;
  companyUrl: string;
  city: string;
  state: string;
  zip: string;
  pocName: string;
  pocEmail: string;
  pocPhone: string;
  piName: string;
  piEmail: string;
  researchKeywords: string;
  abstractText: string;
  awardLink: string;
  isSbir: boolean;
  isSttr: boolean;
}

export interface SbirStats {
  totalAwards: number;
  sbirCount: number;
  sttrCount: number;
  agencies: string[];
  phases: string[];
}

export function formatAwardAmount(amount: number | null | undefined): string {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getAgencyFullName(code: string): string {
  const agencies: Record<string, string> = {
    DOD: 'Department of Defense',
    HHS: 'Health and Human Services',
    NASA: 'NASA',
    NSF: 'National Science Foundation',
    DOE: 'Department of Energy',
    USDA: 'Dept. of Agriculture',
    EPA: 'Environmental Protection Agency',
    DOC: 'Department of Commerce',
    ED: 'Department of Education',
    DOT: 'Department of Transportation',
    DHS: 'Homeland Security',
  };
  return agencies[code] || code;
}
