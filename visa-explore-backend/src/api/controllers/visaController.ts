import { Request, Response } from 'express';

export const getVisaInfo = (req: Request, res: Response) => {
  const { country } = req.params;
  res.json({ country, requirements: 'Sample requirements' });
};