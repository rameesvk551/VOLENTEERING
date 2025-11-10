import { lookupVisa, resolveCountryCode, type VisaInfo, type VisaRequirement } from './visaCatalog.js';

export class VisaProvider {
  async getVisa(from: string, to: string): Promise<VisaInfo> {
    const fromCode = resolveCountryCode(from);
    const toCode = resolveCountryCode(to);

    const requirement: VisaRequirement = lookupVisa(fromCode, toCode);

    return {
      fromCountry: fromCode,
      toCountry: toCode,
      visaRequirement: requirement,
      lastUpdated: new Date().toISOString()
    };
  }

  async bulk(from: string, destinations: string[]): Promise<VisaInfo[]> {
    const results: VisaInfo[] = [];

    for (const destination of destinations) {
      results.push(await this.getVisa(from, destination));
    }

    return results;
  }
}
