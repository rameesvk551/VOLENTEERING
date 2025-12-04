type Host = {
  _id: string;
  email: string;
  heading: string;
  title: string;
  about: string;
  phone: string;
  description: string;
  volenteerCapacity: number;
  address: {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    boundingbox: [string, string, string, string];
    class: string;
    type: string;
    importance: number;
    name: string;
    osm_id: number;
    osm_type: string;
    place_rank: number;
    addresstype: string;
    licence: string;
  };
  selectedHelpTypes: string[];
  allowed: string[];
  accepted: string[];
  languageDescription: string;
  languageAndLevel: {
    language: string;
    level: string;
  }[];
  showIntreastInLanguageExchange: boolean;
  privateComment: string;
  organisation: string;
  images: {
    url: string;
    description: string;
    _id?: string;
  }[];
  accomadationDescription: string;
  accomadationType: string;
  culturalExchange: string;
  whatElse: string;
  wifiDescription: string;
  parkingDescription: string;
  helpDescription: string;
  // Additional properties for UI
  reviews?: {
    id: string;
    rating: number;
    comment: string;
    reviewerProfile: string;
    reviewerName: string;
  }[];
  lastActive?: string | Date;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  acceptedWorkawayersCount?: number;
  minimumStay?: string;
  availability?: string;
};
  