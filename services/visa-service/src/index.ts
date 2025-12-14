
import Fastify from 'fastify';
import cors from '@fastify/cors';
// @ts-ignore
const compress = require('@fastify/compress');
import mongoose from 'mongoose';
import routes from './routes';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/visa';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const fastify = Fastify({ logger: true });

fastify.register(cors, { origin: CORS_ORIGIN });
fastify.register(compress);

fastify.register(routes);

mongoose.connect(MONGO_URI).then(() => {
  fastify.log.info('MongoDB connected');
  fastify.listen({ port: PORT, host: '0.0.0.0' }, err => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    fastify.log.info(`Visa Service running on port ${PORT}`);
  });
});
