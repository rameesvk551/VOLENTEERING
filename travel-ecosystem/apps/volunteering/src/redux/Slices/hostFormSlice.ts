import { createSlice, PayloadAction, createAsyncThunk, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import axios from 'axios';
import server from '@server/app';

export interface LanguageAndLevel {
  language: string;
  level: string;
}

export type UploadedImage = {
  file: File;
  preview: string;
  description: string;
};

export interface Address {
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
}

interface FormDataState {
  email: string;
  address: Address;
  description: string;
  selectedHelpTypes: string[];
  allowed: string[];
  accepted: string[];
  languageDescription: string;
  languageAndLevel: LanguageAndLevel[];
  showIntreastInLanguageExchange: boolean;
  privateComment: string;
  organisation: string;
  images: UploadedImage[];
  accomadationDescription: string;
  title: string;
  about: string;
  helpDescription: string;
  accomadationType: string;
  culturalExchange: string;
  whatElse: string;
  wifiDescription: string;
  parkingDescription: string;
  phone: string;
  volenteerCapacity: number;
  [key: string]: unknown;
}

export interface FormState {
  step: number;
  data: FormDataState;
}

export const addDetails = createAsyncThunk<any, void, { state: { hostForm: FormState } }>(
  'hostForm/addDetails',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { hostForm: FormState };
      const formData = state.hostForm.data;

      const response = await axios.post(`${server}/host/add-details`, formData, {
        withCredentials: true,
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'An error occurred');
    }
  }
);

const initialState: FormState = {
  step: 1,
  data: {
    email: '',
    address: {
      place_id: 0,
      display_name: '',
      lat: '',
      lon: '',
      boundingbox: ['', '', '', ''],
      class: '',
      type: '',
      importance: 0,
      name: '',
      osm_id: 0,
      osm_type: '',
      place_rank: 0,
      addresstype: '',
      licence: '',
    },
    description: '',
    selectedHelpTypes: [],
    allowed: [],
    accepted: [],
    languageDescription: '',
    languageAndLevel: [],
    showIntreastInLanguageExchange: false,
    privateComment: '',
    organisation: '',
    images: [],
    accomadationDescription: '',
    title: '',
    about: '',
    helpDescription: '',
    accomadationType: '',
    culturalExchange: '',
    whatElse: '',
    wifiDescription: '',
    parkingDescription: '',
    phone: '',
    volenteerCapacity: 1,
  },
};

const hostFormSlice = createSlice({
  name: 'hostForm',
  initialState,
  reducers: {
    nextStep: (state: FormState) => {
      state.step += 1;
    },
    prevStep: (state: FormState) => {
      state.step -= 1;
    },
    toggleHelpType: (state: FormState, action: PayloadAction<string>) => {
      const index = state.data.selectedHelpTypes.indexOf(action.payload);
      if (index === -1) {
        state.data.selectedHelpTypes.push(action.payload);
      } else {
        state.data.selectedHelpTypes.splice(index, 1);
      }
    },
  addAccepted: (state: FormState, action: PayloadAction<string>) => {
      const index = state.data.accepted.indexOf(action.payload);
      if (index === -1) {
        state.data.accepted.push(action.payload);
      } else {
        state.data.accepted.splice(index, 1);
      }
    },
  addAllowed: (state: FormState, action: PayloadAction<string>) => {
      const index = state.data.allowed.indexOf(action.payload);
      if (index === -1) {
        state.data.allowed.push(action.payload);
      } else {
        state.data.allowed.splice(index, 1);
      }
    },
    updateDescription: (state: FormState, action: PayloadAction<string>) => {
      state.data.description = action.payload;
    },
    updateLanguageDescription: (state: FormState, action: PayloadAction<string>) => {
      state.data.languageDescription = action.payload;
    },
    updatePrivateComment: (state: FormState, action: PayloadAction<string>) => {
      state.data.privateComment = action.payload;
    },
    updateOrganisation: (state: FormState, action: PayloadAction<string>) => {
      state.data.organisation = action.payload;
    },
    updateLanguageAndLevel: (
      state: FormState,
      action: PayloadAction<{ language: string; level: string }>
    ) => {
      state.data.languageAndLevel.push(action.payload);
    },
    deleteLanguageAndLevel: (state: FormState, action: PayloadAction<number>) => {
      if (state.data.languageAndLevel[action.payload]) {
        state.data.languageAndLevel.splice(action.payload, 1);
      }
    },
    updateIntrestInLanguageExchange: (state: FormState, action: PayloadAction<boolean>) => {
      state.data.showIntreastInLanguageExchange = action.payload;
    },
    updateEmail: (state: FormState, action: PayloadAction<string>) => {
      state.data.email = action.payload;
    },
    updateAddress: (state: FormState, action: PayloadAction<Address>) => {
      state.data.address = action.payload;
    },
    addImages: (state: FormState, action: PayloadAction<UploadedImage[]>) => {
      state.data.images = [...state.data.images, ...action.payload];
    },
    removeImage: (state: FormState, action: PayloadAction<number>) => {
      state.data.images = state.data.images.filter((_, index) => index !== action.payload);
    },
    updateImageDescription: (
      state: FormState,
      action: PayloadAction<{ index: number; description: string }>
    ) => {
      const { index, description } = action.payload;
      if (state.data.images[index]) {
        state.data.images[index].description = description;
      }
    },
    setHostFormData: (state: FormState, action: PayloadAction<FormState['data']>) => {
      state.data = action.payload;
    },
    updateField: (
      state: FormState,
      action: PayloadAction<{ field: string; value: unknown }>
    ) => {
      state.data[action.payload.field] = action.payload.value;
    },
    resetForm: () => initialState,
  },
  extraReducers: (builder: ActionReducerMapBuilder<FormState>) => {
    builder
      .addCase(addDetails.fulfilled, (state: FormState) => {
        state.step += 1;
      });
  },
});

export const {
  nextStep,
  prevStep,
  addAccepted,
  addAllowed,
  updateOrganisation,
  updatePrivateComment,
  toggleHelpType,
  updateDescription,
  updateLanguageDescription,
  updateLanguageAndLevel,
  updateIntrestInLanguageExchange,
  deleteLanguageAndLevel,
  resetForm,
  updateEmail,
  updateAddress,
  addImages,
  removeImage,
  updateImageDescription,
  setHostFormData,
  updateField,
} = hostFormSlice.actions;

export default hostFormSlice.reducer;
