import express from 'express';
import cors from 'cors';
import visaRoutes from './api/routes/visaRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/visa', visaRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});