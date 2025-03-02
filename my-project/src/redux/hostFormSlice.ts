import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FormState {
  step: number;
  data: {
    email: string;
    address: string;
    description: string;
    selectedHelpTypes: string[];
    languageDescription:string
  };
}

const initialState: FormState = {
  step: 1,
  data: {
    email: "",
    address: "",
    description: "",
    selectedHelpTypes: [],
    languageDescription:""
  },
};

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
        state.data.selectedHelpTypes.push(action.payload); // ✅ Add if not selected
      } else {
        state.data.selectedHelpTypes.splice(index, 1); // ✅ Remove if already selected
      }
    },
    updateDescription: (state, action: PayloadAction<string>) => {
      state.data.description = action.payload;
    },
    updateLanguageDescription: (state, action: PayloadAction<string>) => {
      state.data.languageDescription = action.payload;
    },
    
    
    resetForm: () => initialState,
  },
});

// ✅ Correct Export
export const { nextStep, prevStep, toggleHelpType,updateDescription, resetForm } = hostFormSlice.actions;
export default hostFormSlice.reducer;
