export interface VisaRequirement {
  from: string;
  to: string;
  required: boolean;
  type?: string;
  duration?: string;
  processingTime?: string;
  cost?: string;
  notes?: string[];
}

export class VisaService {
  async getVisaRequirements(from: string, to: string): Promise<VisaRequirement | null> {
    return {
      from,
      to,
      required: true,
      type: 'Tourist visa',
      duration: '30 days',
      processingTime: '5-7 business days',
      cost: '$120',
      notes: [
        'Passport must be valid for at least six months.',
        'Two blank pages required in passport.',
        'Return travel tickets or onward itinerary recommended.'
      ]
    };
  }
}
