import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ service: 'volenteering-service', status: 'ok' });
});

const port = process.env.PORT || 4003;
app.listen(port, () => console.log(`volenteering-service running on ${port}`));
