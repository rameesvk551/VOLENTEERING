import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type HotelBookingState = {
  searchedPlace: string;
  fromDate: string; // use ISO string for serialization (e.g., '2025-04-17')
  toDate: string;
};

const initialState: HotelBookingState = {
  searchedPlace: '',
  fromDate: '',
  toDate: '',
};

const hotelBookingSlice = createSlice({
  name: 'hotelBooking',
  initialState,
  reducers: {
    setSearchedPlace(state, action: PayloadAction<string>) {
      state.searchedPlace = action.payload;
    },
    setFromDate(state, action: PayloadAction<string>) {
      state.fromDate = action.payload;
    },
    setToDate(state, action: PayloadAction<string>) {
      state.toDate = action.payload;
    },
    resetBooking(state) {
      state.searchedPlace = '';
      state.fromDate = '';
      state.toDate = '';
    },
  },
});

export const { setSearchedPlace, setFromDate, setToDate, resetBooking } = hotelBookingSlice.actions;

export default hotelBookingSlice.reducer;
