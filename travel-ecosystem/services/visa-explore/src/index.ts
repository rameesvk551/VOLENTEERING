import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ service: 'visa-explore', status: 'ok' });
});

const port = process.env.PORT || 4001;
app.listen(port, () => console.log(`visa-explore running on ${port}`));
