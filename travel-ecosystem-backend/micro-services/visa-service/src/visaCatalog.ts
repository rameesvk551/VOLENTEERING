export interface VisaRequirement {
  country: string;
  countryCode: string;
  visaRequired: boolean;
  visaType?: string;
  maxStay?: string;
  description: string;
  processingTime?: string;
  cost?: string;
  requirements?: string[];
  notes?: string;
  sourceUrl?: string;
}

export interface VisaInfo {
  fromCountry: string;
  toCountry: string;
  visaRequirement: VisaRequirement;
  lastUpdated: string;
}

const catalog: Record<string, Partial<VisaRequirement>> = {
  'US-IN': {
    visaRequired: true,
    visaType: 'evisa',
    maxStay: '60 days',
    description: 'US citizens require an e-Visa to visit India for tourism purposes.',
    processingTime: '1-4 business days',
    cost: '$80 USD',
    requirements: [
      'Valid passport with 6 months validity',
      'Recent passport-size photograph',
      'Return ticket',
      'Proof of accommodation'
    ],
    sourceUrl: 'https://indianvisaonline.gov.in'
  },
  'GB-IN': {
    visaRequired: true,
    visaType: 'evisa',
    maxStay: '60 days',
    description: 'UK citizens require an e-Visa to visit India.',
    processingTime: '1-4 business days',
    cost: '£80 GBP',
    requirements: ['Valid passport', 'Photograph', 'Return ticket', 'Accommodation proof']
  },
  'IN-US': {
    visaRequired: true,
    visaType: 'visa_required',
    maxStay: 'Varies by visa type',
    description: 'Indian citizens require a visa to visit the United States.',
    processingTime: 'Several weeks',
    cost: '$160 USD',
    requirements: ['Valid passport', 'DS-160 form', 'Interview appointment', 'Supporting documents']
  },
  'US-FR': {
    visaRequired: false,
    visaType: 'visa_free',
    maxStay: '90 days',
    description: 'US citizens can visit France without a visa for up to 90 days.',
    requirements: ['Valid passport', 'Return ticket', 'Sufficient funds']
  },
  'GB-FR': {
    visaRequired: false,
    visaType: 'visa_free',
    maxStay: '90 days',
    description: 'UK citizens can visit France without a visa.',
    requirements: ['Valid passport', 'Return ticket']
  },
  'IN-AE': {
    visaRequired: true,
    visaType: 'visa_on_arrival',
    maxStay: '60 days',
    description: 'Indian citizens can get visa on arrival in UAE.',
    processingTime: 'Immediate',
    cost: 'AED 100',
    requirements: ['Valid passport', 'Return ticket', 'Hotel booking']
  },
  'US-TH': {
    visaRequired: false,
    visaType: 'visa_free',
    maxStay: '30 days',
    description: 'US citizens can visit Thailand without a visa for up to 30 days.',
    requirements: ['Valid passport', 'Return ticket']
  },
  'IN-TH': {
    visaRequired: true,
    visaType: 'visa_on_arrival',
    maxStay: '15 days',
    description: 'Indian citizens can get visa on arrival in Thailand.',
    cost: '2000 THB',
    requirements: ['Valid passport', 'Recent photograph', 'Return ticket']
  }
};

export function lookupVisa(from: string, to: string): VisaRequirement {
  const key = `${from.toUpperCase()}-${to.toUpperCase()}`;
  const match = catalog[key];

  if (match) {
    return {
      country: to,
      countryCode: to,
      visaRequired: match.visaRequired ?? true,
      ...match
    } as VisaRequirement;
  }

  return {
    country: to,
    countryCode: to,
    visaRequired: true,
    visaType: 'visa_required',
    description: 'Please check with the embassy for specific visa requirements.',
    notes: 'Visa requirements may vary based on nationality and travel purpose.'
  };
}

export function resolveCountryCode(country: string): string {
  const map: Record<string, string> = {
    india: 'IN',
    'united states': 'US',
    usa: 'US',
    'united kingdom': 'GB',
    uk: 'GB',
    france: 'FR',
    germany: 'DE',
    japan: 'JP',
    china: 'CN',
    thailand: 'TH',
    uae: 'AE',
    dubai: 'AE',
    singapore: 'SG',
    australia: 'AU',
    canada: 'CA',
    spain: 'ES',
    italy: 'IT'
  };

  return map[country.toLowerCase()] ?? country.toUpperCase().slice(0, 2);
}
