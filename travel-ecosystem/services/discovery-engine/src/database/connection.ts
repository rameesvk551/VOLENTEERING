import neo4j from 'neo4j-driver';

let driver: any;

export async function connectNeo4j() {
  const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
  const user = process.env.NEO4J_USER || 'neo4j';
  const password = process.env.NEO4J_PASSWORD || 'password';
  driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  await driver.verifyConnectivity();
  console.log('Neo4j connected');
}

export function getDriver() {
  return driver;
}
