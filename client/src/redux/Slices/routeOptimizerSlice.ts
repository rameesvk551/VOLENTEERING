import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RouteOptimizationResponse, TravelMode } from '@/types/route';
import { buildEtaTicker } from '@/lib/route/utils';
import { optimizeRoute } from '../thunks/routeOptimizerThunk';

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface RouteOptimizerState {
  status: 'idle' | 'loading' | 'success' | 'error';
  travelMode: TravelMode;
  routeData: RouteOptimizationResponse | null;
  focusedSeq: number | null;
  bottomSheetSeq: number | null;
  userLocation: UserLocation | null;
  etaTicker: { startsAt: number; endsAt: number } | null;
  lastUpdated?: string;
  error?: string;
  usedMock?: boolean;
}

const initialState: RouteOptimizerState = {
  status: 'idle',
  travelMode: 'WALKING',
  routeData: null,
  focusedSeq: null,
  bottomSheetSeq: null,
  userLocation: null,
  etaTicker: null
};

const routeOptimizerSlice = createSlice({
  name: 'routeOptimizer',
  initialState,
  reducers: {
    setTravelMode(state, action: PayloadAction<TravelMode>) {
      state.travelMode = action.payload;
    },
    setFocusedSeq(state, action: PayloadAction<number | null>) {
      state.focusedSeq = action.payload;
    },
    setBottomSheetSeq(state, action: PayloadAction<number | null>) {
      state.bottomSheetSeq = action.payload;
    },
    setUserLocation(state, action: PayloadAction<UserLocation | null>) {
      state.userLocation = action.payload;
    },
    clearRoute(state) {
      state.routeData = null;
      state.status = 'idle';
      state.focusedSeq = null;
      state.bottomSheetSeq = null;
      state.error = undefined;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(optimizeRoute.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(optimizeRoute.fulfilled, (state, action) => {
        state.status = 'success';
        state.routeData = action.payload.data;
        state.travelMode = action.payload.travelMode;
        state.focusedSeq = action.payload.data.optimizedOrder?.[0]?.seq ?? null;
        state.bottomSheetSeq = null;
        state.lastUpdated = new Date().toISOString();
        state.etaTicker = buildEtaTicker(action.payload.data.summary);
        state.usedMock = action.payload.mocked;
      })
      .addCase(optimizeRoute.rejected, (state, action) => {
        state.status = 'error';
        state.error = (action.payload as string) || action.error.message || 'Unable to optimize route';
      });
  }
});

export const { setTravelMode, setFocusedSeq, setBottomSheetSeq, setUserLocation, clearRoute } =
  routeOptimizerSlice.actions;

export default routeOptimizerSlice.reducer;
