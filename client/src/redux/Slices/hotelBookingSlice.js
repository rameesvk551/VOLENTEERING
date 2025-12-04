import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    searchedPlace: '',
    fromDate: '',
    toDate: '',
};
const hotelBookingSlice = createSlice({
    name: 'hotelBooking',
    initialState,
    reducers: {
        setSearchedPlace(state, action) {
            state.searchedPlace = action.payload;
        },
        setFromDate(state, action) {
            state.fromDate = action.payload;
        },
        setToDate(state, action) {
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
