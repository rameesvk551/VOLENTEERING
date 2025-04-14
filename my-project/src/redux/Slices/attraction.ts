// src/redux/slices/attractionsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Attraction = {
  id: string;
  name: string;
  categories: string[];
  location: {
    address: string;
    country: string;
    cross_street?: string;
    formatted_address: string;
    locality: string;
    postcode: string;
    region: string;
  };
  geocodes: {
    latitude: number;
    longitude: number;
  };
};

type AttractionsState = {
  searchedPlace: string;
  selectedPlace: string | null;
  attractions: Attraction[];
};

const initialState: AttractionsState = {
  searchedPlace: '',
  selectedPlace: null,
  attractions: [],
};

const attractionsSlice = createSlice({
  name: 'attractions',
  initialState,
  reducers: {
    setSearchedPlace(state, action: PayloadAction<string>) {
      state.searchedPlace = action.payload;
    },
    setSelectedPlace(state, action: PayloadAction<string | null>) {
      state.selectedPlace = action.payload;
    },
    setAttractions(state, action: PayloadAction<Attraction[]>) {
      state.attractions = action.payload;
    },
  },
});

export const { setSearchedPlace, setSelectedPlace, setAttractions } = attractionsSlice.actions;

export default attractionsSlice.reducer;
