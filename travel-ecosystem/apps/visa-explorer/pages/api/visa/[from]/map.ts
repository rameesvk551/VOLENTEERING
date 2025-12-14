import type { NextApiRequest, NextApiResponse } from 'next';

const colorMap = {
  USA: { IND: 'visa-free', JPN: 'evisa', AUS: 'voa', GBR: 'required' },
  IND: { USA: 'evisa', JPN: 'visa-free', AUS: 'required', GBR: 'voa' },
  JPN: { USA: 'visa-free', IND: 'required', AUS: 'evisa', GBR: 'voa' },
  // ...
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { from } = req.query;
  res.status(200).json(colorMap[from as string] || {});
}
