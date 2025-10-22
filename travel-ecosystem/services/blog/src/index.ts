import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ service: 'blog-service', status: 'ok' });
});

const port = process.env.PORT || 4002;
app.listen(port, () => console.log(`blog-service running on ${port}`));
