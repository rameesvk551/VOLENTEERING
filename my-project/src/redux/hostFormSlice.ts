import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import server from "../server/app";

interface LanguageAndLevel {
  language: string;
  level: string;
}

interface FormState {
  step: number;
  data: {
    email: string;
    address: string;
    description: string;
    selectedHelpTypes: string[];
    allowed: string[];
    accepted: string[];
    languageDescription: string;
    languageAndLevel: LanguageAndLevel[];
    showIntreastInLanguageExchange: string;
    privateComment: string;
    organisation: string;
  };
}

// ** Async Thunk to Submit Form Data to Backend **
export const addDetails = createAsyncThunk(
  "hostForm/addDetails",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { hostForm: FormState };
      const formData = state.hostForm.data;
console.log(formData);

      const response = await axios.post(`${server}/host/add-details`, formData, {
        withCredentials: true,
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || error.message || "An error occurred"
      );
    }
  }
);

// ** Initial State **
const initialState: FormState = {
  step: 1,
  data: {
    email: "",
    address: "",
    description: "",
    selectedHelpTypes: [],
    allowed: [],
    accepted: [],
    languageDescription: "",
    languageAndLevel: [],
    showIntreastInLanguageExchange: "",
    privateComment: "",
    organisation: "",
  },
};

// ** Redux Slice **
const hostFormSlice = createSlice({
  name: "hostForm",
  initialState,
  reducers: {
    nextStep: (state) => {
      state.step += 1;
    },
    prevStep: (state) => {
      state.step -= 1;
    },
    toggleHelpType: (state, action: PayloadAction<string>) => {
      const index = state.data.selectedHelpTypes.indexOf(action.payload);
      if (index === -1) {
        state.data.selectedHelpTypes.push(action.payload);
      } else {
        state.data.selectedHelpTypes.splice(index, 1);
      }
    },
    addAccepted: (state, action: PayloadAction<string>) => {
      const index = state.data.accepted.indexOf(action.payload);
      if (index === -1) {
        state.data.accepted.push(action.payload);
      } else {
        state.data.accepted.splice(index, 1);
      }
    },
    addAllowed: (state, action: PayloadAction<string>) => {
      const index = state.data.allowed.indexOf(action.payload);
      if (index === -1) {
        state.data.allowed.push(action.payload);
      } else {
        state.data.allowed.splice(index, 1);
      }
    },
    updateDescription: (state, action: PayloadAction<string>) => {
      state.data.description = action.payload;
    },
    updateLanguageDescription: (state, action: PayloadAction<string>) => {
      state.data.languageDescription = action.payload;
    },
    updatePrivateComment: (state, action: PayloadAction<string>) => {
      state.data.privateComment = action.payload;
    },
    updateOrganisation: (state, action: PayloadAction<string>) => {
      state.data.organisation = action.payload;
    },
    updateLanguageAndLevel: (
      state,
      action: PayloadAction<{ language: string; level: string }>
    ) => {
      state.data.languageAndLevel.push(action.payload);
    },
    deleteLanguageAndLevel: (state, action: PayloadAction<number>) => {
      if (state.data.languageAndLevel[action.payload]) {
        state.data.languageAndLevel.splice(action.payload, 1);
      }
    },
    updateIntrestInLanguageExchange: (state, action: PayloadAction<string>) => {
      state.data.showIntreastInLanguageExchange = action.payload;
    },
    updateEmail: (state, action: PayloadAction<string>) => {
      state.data.email = action.payload;
    },
    updateAddress: (state, action: PayloadAction<string>) => {
      state.data.address = action.payload;
    },
    resetForm: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(addDetails.pending, (state) => {
        console.log("Submitting details...");
      })
      .addCase(addDetails.fulfilled, (state) => {
        state.step += 1; // Move to the next step on success
        console.log("Details added successfully!");
      })
      .addCase(addDetails.rejected, (state, action) => {
        console.error("Error adding details:", action.payload);
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
} = hostFormSlice.actions;

export default hostFormSlice.reducer;
