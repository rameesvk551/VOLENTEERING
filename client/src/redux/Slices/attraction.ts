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
  selectedPlace: {
    place: string;
    latitude: number;
    longitude: number;
  }[];
  

  
  attractions: Attraction[];
};

const initialState: AttractionsState = {
  searchedPlace: '',
  selectedPlace: [],
  attractions: [],
};

const attractionsSlice = createSlice({
  name: 'attractions',
  initialState,
  reducers: {
    setSearchedPlace(state, action: PayloadAction<string>) {
      state.searchedPlace = action.payload;
    },setSelectedPlace(
        state,
        action: PayloadAction<{ place: string; latitude: number; longitude: number }>
      ) {
        // Check for duplicates by name or coords before pushing (optional)
        const alreadyExists = state.selectedPlace.some(
          (p) =>
            p.place === action.payload.place 
          
        );
      
        if (!alreadyExists) {
          state.selectedPlace.push(action.payload);
        }
      },
      removeSelectedPlace: (
        state,
        action: PayloadAction<{ place: string; latitude: number; longitude: number }>
      ) => {
        state.selectedPlace = state.selectedPlace.filter(
          (item) =>
            item.place !== action.payload.place ||
            item.latitude !== action.payload.latitude ||
            item.longitude !== action.payload.longitude
        );
      },
      

    setAttractions(state, action: PayloadAction<Attraction[]>) {
      state.attractions = action.payload;
    },
  },
});

export const { setSearchedPlace, setSelectedPlace, setAttractions,removeSelectedPlace } = attractionsSlice.actions;

export default attractionsSlice.reducer;
