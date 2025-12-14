// types.ts
export interface Passport {
  code: string;
  name: string;
  flagUrl: string;
}

export interface SourceInfo {
  name: string;
  url: string;
  confidence: number;
}

export interface VisaRule {
  from: string;
  to: string;
  status: string;
  duration?: string;
  notes?: string;
  applyUrl?: string;
  docsRequired?: string[];
  sources: SourceInfo[];
  lastUpdated: string;
}

export interface ColorMap {
  [countryCode: string]: string;
}

export interface CountryFeature {
  type: "Feature";
  properties: { ISO_A3: string; name: string };
  geometry: any;
}
