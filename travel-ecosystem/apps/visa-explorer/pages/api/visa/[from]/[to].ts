import type { NextApiRequest, NextApiResponse } from 'next';

const visaRules = {
  'USA-IND': {
    from: 'USA',
    to: 'IND',
    status: 'visa-free',
    duration: '180 days',
    notes: 'Tourist entry allowed',
    applyUrl: 'https://indianvisaonline.gov.in',
    docsRequired: ['Passport', 'Return Ticket'],
    sources: [
      { name: 'Official', url: 'https://indianvisaonline.gov.in', confidence: 0.95 },
    ],
    lastUpdated: '2025-11-01',
  },
  'IND-USA': {
    from: 'IND',
    to: 'USA',
    status: 'required',
    duration: '90 days',
    notes: 'ESTA required',
    applyUrl: 'https://esta.cbp.dhs.gov',
    docsRequired: ['Passport', 'ESTA Approval'],
    sources: [
      { name: 'US Gov', url: 'https://esta.cbp.dhs.gov', confidence: 0.9 },
    ],
    lastUpdated: '2025-10-15',
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { from, to } = req.query;
  const rule = visaRules[`${from}-${to}`];
  if (rule) return res.status(200).json(rule);
  res.status(404).json({ error: 'Not found' });
}
