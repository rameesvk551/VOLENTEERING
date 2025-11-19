import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getVisaMap, getVisaRule, getVisaSources } from './service';

const fromParam = z.string().length(3).toUpperCase();
const toParam = z.string().length(3).toUpperCase();

export default async function routes(fastify: FastifyInstance) {
  fastify.get('/visa/:from/map', {
    schema: {
      params: z.object({ from: fromParam }).strict().parse,
    },
    handler: async (req, reply) => {
      const { from } = req.params as any;
      const map = await getVisaMap(from);
      reply.send(map);
    },
  });

  fastify.get('/visa/:from/:to', {
    schema: {
      params: z.object({ from: fromParam, to: toParam }).strict().parse,
    },
    handler: async (req, reply) => {
      const { from, to } = req.params as any;
      const rule = await getVisaRule(from, to);
      if (!rule) return reply.code(404).send({ error: 'Not found' });
      reply.send(rule);
    },
  });

  fastify.get('/visa/:from/:to/sources', {
    schema: {
      params: z.object({ from: fromParam, to: toParam }).strict().parse,
    },
    handler: async (req, reply) => {
      const { from, to } = req.params as any;
      const sources = await getVisaSources(from, to);
      reply.send(sources);
    },
  });
}
