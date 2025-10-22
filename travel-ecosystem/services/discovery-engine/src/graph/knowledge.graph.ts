import { getDriver } from '../database/connection';

export class KnowledgeGraph {
  async query(cypher: string, params?: Record<string, any>) {
    const session = getDriver().session();
    try {
      const result = await session.run(cypher, params);
      return result.records;
    } finally {
      await session.close();
    }
  }
}
