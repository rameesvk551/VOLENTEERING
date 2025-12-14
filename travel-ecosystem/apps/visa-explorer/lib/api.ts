// api.ts
import type { Passport, VisaRule, CountryFeature, ColorMap } from '../types';

export async function fetchPassports(): Promise<Passport[]> {
  const res = await fetch('/api/passports');
  if (!res.ok) throw new Error('Failed to fetch passports');
  return res.json();
}

export async function fetchVisaMap(from: string): Promise<ColorMap> {
  const res = await fetch(`/api/visa/${from}/map`);
  if (!res.ok) throw new Error('Failed to fetch visa map');
  return res.json();
}

export async function fetchVisaRule(from: string, to: string): Promise<VisaRule> {
  const res = await fetch(`/api/visa/${from}/${to}`);
  if (!res.ok) throw new Error('Failed to fetch visa rule');
  return res.json();
}
