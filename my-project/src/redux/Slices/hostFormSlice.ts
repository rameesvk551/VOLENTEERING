import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import server from "../../server/app";

interface LanguageAndLevel {
  language: string;
  level: string;
}

type UploadedImage = {
  file: File;
  preview: string;
  description: string;
};

interface FormState {
  step: number;
  data: {
    email: string;
    address: Address
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
    accomadationDescription:string,
   about:string
   helpDescription:string
   accomadationType:string,
   culturalExchange:string,
   whatElse:string,
   wifiDescription:string
   parkingDescription:string
   title: string;
  phone: string;
  volenteerCapacity:number
  [key: string]: any; // To handle dynamic updates
  };
}
interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude: number; 
  longitude: number; 
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
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      latitude: 0,
      longitude: 0,
    },
    description: "",
    selectedHelpTypes: [],
    allowed: [],
    accepted: [],
    languageDescription: "",
    languageAndLevel: [],
    showIntreastInLanguageExchange: false,
    privateComment: "",
    organisation: "",
    images: [], 
    accomadationDescription:"",
   title:"",
   about:"",
   helpDescription:"",
   accomadationType:"",
   culturalExchange:"",
   whatElse:"",
   wifiDescription:"",
   parkingDescription:"",
   phone:"",
   volenteerCapacity:1,
}

}
// ** Redux Slice **
const hostFormSlice = createSlice({
  name: "hostForm",
  initialState,
  reducers: {
    nextStep: (state) => {
      state.step += 1;
      console.log("steeppppppp   is",state.step);
      
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
    updateIntrestInLanguageExchange: (state, action: PayloadAction<boolean>) => {
      state.data.showIntreastInLanguageExchange = action.payload;
    },
    updateEmail: (state, action: PayloadAction<string>) => {
      state.data.email = action.payload;
    },
    updateAddress: (state, action: PayloadAction<Address>) => {
      state.data.address = action.payload;
    },
    addImages: (state, action: PayloadAction<UploadedImage[]>) => {
      state.data.images = [...state.data.images, ...action.payload];  // ✅ Fix reference
    },
    removeImage: (state, action: PayloadAction<number>) => {
      state.data.images = state.data.images.filter((_, index) => index !== action.payload); // ✅ Fix reference
    },
    updateImageDescription: (state, action: PayloadAction<{ index: number; description: string }>) => {
      const { index, description } = action.payload;
      if (state.data.images[index]) {  // ✅ Fix reference
        state.data.images[index].description = description;
      }
    },
    setHostFormData: (state, action: PayloadAction<FormState["data"]>) => {
      state.data = action.payload;
      console.log("sssssssssssssstates",state.data);
      
    },
    updateField: (state, action: PayloadAction<{ field: string; value: any }>) => {
      state.data[action.payload.field] = action.payload.value;
    },
    
    
    resetForm: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(addDetails.pending, (state) => {
        console.log("Submitting details...");
        // You can add a `loading` field in state and update it here if needed
      })
      .addCase(addDetails.fulfilled, (state) => {
        state.step += 1;
        console.log("Details added successfully!");
      })
      .addCase(addDetails.rejected, (state, action) => {
        console.error("Error adding details:", action.payload);
        // Optionally, set an error message in the state
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
  updateField
} = hostFormSlice.actions;

export default hostFormSlice.reducer;
