import express from 'express';
import { getVisaInfo } from '../controllers/visaController';

const router = express.Router();

router.get('/:country', getVisaInfo);

export default router;
