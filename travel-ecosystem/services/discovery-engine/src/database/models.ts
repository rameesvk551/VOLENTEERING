// Neo4j node/relationship models
export interface Destination {
  id: string;
  name: string;
  country: string;
}

export interface VisaRequirement {
  country: string;
  required: boolean;
}
