import type { NextApiRequest, NextApiResponse } from 'next';

const passports = [
  { code: 'USA', name: 'United States', flagUrl: '/flags/usa.svg' },
  { code: 'GBR', name: 'United Kingdom', flagUrl: '/flags/gbr.svg' },
  { code: 'IND', name: 'India', flagUrl: '/flags/ind.svg' },
  { code: 'JPN', name: 'Japan', flagUrl: '/flags/jpn.svg' },
  { code: 'AUS', name: 'Australia', flagUrl: '/flags/aus.svg' },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(passports);
}
