export type VisaType = 'visa-free' | 'voa' | 'evisa' | 'visa-required' | 'closed';

export interface Country {
  code: string;
  name: string;
  flag: string;
  region: string;
  population?: number;
}

export interface VisaRequirement {
  title: string;
  description: string;
  mandatory: boolean;
}

export interface VisaFees {
  amount: number;
  currency: string;
}

export interface ProcessingTime {
  min: number;
  max: number;
  unit: 'days' | 'weeks' | 'months';
}

export interface Embassy {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
}

export interface VisaInfo {
  id: string;
  origin: Country;
  destination: Country;
  visaType: VisaType;
  stayDuration: number; // in days
  validityPeriod?: number; // in days
  fees?: VisaFees;
  processingTime: ProcessingTime;
  complexityScore: number; // 0-100
  requirements: VisaRequirement[];
  embassy?: Embassy;
  lastUpdated: Date;
}

export interface BookmarkedPlan {
  id: string;
  name: string;
  destinations: Country[];
  createdAt: Date;
}

export interface SearchFilters {
  origin?: string;
  visaType?: VisaType[];
  region?: string[];
  maxComplexity?: number;
  minStayDuration?: number;
  maxCost?: number;
}
