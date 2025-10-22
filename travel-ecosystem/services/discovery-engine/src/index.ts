import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ service: 'discovery-engine', status: 'ok' });
});

// Add routes here (chains, graph, crawlers as needed)

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`discovery-engine running on ${port}`));
