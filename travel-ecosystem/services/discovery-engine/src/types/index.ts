export interface DiscoveryQuery {
  destination?: string;
  interests?: string[];
}

export interface DiscoveryResult {
  recommendations: string[];
}
