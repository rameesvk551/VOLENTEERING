  type Host = {
    _id: string;
    email: string;
    title: string;
    about: string;
    phone: string;
    description: string;
    volenteerCapacity: number;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
      latitude: number;
      longitude: number;
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
      _id?: string; // Optional because _id may not be available initially
    }[];
    accomadationDescription: string;
    accomadationType: string;
    culturalExchange: string;
    whatElse: string;
    wifiDescription: string;
    parkingDescription: string;
    helpDescription: string;
  };
  