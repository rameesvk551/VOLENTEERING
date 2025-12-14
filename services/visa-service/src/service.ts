import { VisaRuleModel, VisaRule } from './models';
import { getCache, setCache } from './cache';

const MAP_TTL = 60 * 60 * 24; // 24h
const RULE_TTL = 60 * 60 * 12; // 12h

export async function getVisaMap(from: string) {
  const cacheKey = `visa:map:${from}`;
  let map = await getCache<Record<string, string>>(cacheKey);
  if (map) return map;
  const rules = await VisaRuleModel.find({ from });
  map = {};
  for (const rule of rules) {
    map[rule.to] = rule.status;
  }
  await setCache(cacheKey, map, MAP_TTL);
  return map;
}

export async function getVisaRule(from: string, to: string) {
  const cacheKey = `visa:rule:${from}:${to}`;
  let rule = await getCache<VisaRule>(cacheKey);
  if (rule) return rule;
  rule = await VisaRuleModel.findOne({ from, to }) as any;
  if (rule) await setCache(cacheKey, rule, RULE_TTL);
  return rule;
}

export async function getVisaSources(from: string, to: string) {
  const rule = await getVisaRule(from, to);
  return rule?.sources || [];
}
