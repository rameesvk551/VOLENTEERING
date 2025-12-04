// src/redux/slices/attractionsSlice.ts
import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    searchedPlace: '',
    selectedPlace: [],
    attractions: [],
};
const attractionsSlice = createSlice({
    name: 'attractions',
    initialState,
    reducers: {
        setSearchedPlace(state, action) {
            state.searchedPlace = action.payload;
        }, setSelectedPlace(state, action) {
            // Check for duplicates by name or coords before pushing (optional)
            const alreadyExists = state.selectedPlace.some((p) => p.place === action.payload.place);
            if (!alreadyExists) {
                state.selectedPlace.push(action.payload);
            }
        },
        removeSelectedPlace: (state, action) => {
            state.selectedPlace = state.selectedPlace.filter((item) => item.place !== action.payload.place ||
                item.latitude !== action.payload.latitude ||
                item.longitude !== action.payload.longitude);
        },
        setAttractions(state, action) {
            state.attractions = action.payload;
        },
    },
});
export const { setSearchedPlace, setSelectedPlace, setAttractions, removeSelectedPlace } = attractionsSlice.actions;
export default attractionsSlice.reducer;
