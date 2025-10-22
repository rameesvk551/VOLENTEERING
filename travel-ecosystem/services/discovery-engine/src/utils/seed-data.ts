import { getDriver } from '../database/connection';

export async function seedData() {
  const session = getDriver().session();
  try {
    await session.run(`
      CREATE (d:Destination {name: 'Paris', country: 'France'})
      RETURN d
    `);
    console.log('Seed data inserted');
  } finally {
    await session.close();
  }
}
