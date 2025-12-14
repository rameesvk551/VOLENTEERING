import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import server from "../../server/app";
// ** Async Thunk to Submit Form Data to Backend **
export const addDetails = createAsyncThunk("hostForm/addDetails", async (_, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const formData = state.hostForm.data;
        console.log(formData);
        const response = await axios.post(`${server}/host/add-details`, formData, {
            withCredentials: true,
        });
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data || error.message || "An error occurred");
    }
});
// ** Initial State **
const initialState = {
    step: 1,
    data: {
        email: "",
        address: {
            place_id: 0,
            display_name: "",
            lat: "",
            lon: "",
            boundingbox: ["", "", "", ""],
            class: "",
            type: "",
            importance: 0,
            name: "",
            osm_id: 0,
            osm_type: "",
            place_rank: 0,
            addresstype: "",
            licence: ""
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
        accomadationDescription: "",
        title: "",
        about: "",
        helpDescription: "",
        accomadationType: "",
        culturalExchange: "",
        whatElse: "",
        wifiDescription: "",
        parkingDescription: "",
        phone: "",
        volenteerCapacity: 1,
    }
};
// ** Redux Slice **
const hostFormSlice = createSlice({
    name: "hostForm",
    initialState,
    reducers: {
        nextStep: (state) => {
            state.step += 1;
            console.log("steeppppppp   is", state.step);
        },
        prevStep: (state) => {
            state.step -= 1;
        },
        toggleHelpType: (state, action) => {
            const index = state.data.selectedHelpTypes.indexOf(action.payload);
            if (index === -1) {
                state.data.selectedHelpTypes.push(action.payload);
            }
            else {
                state.data.selectedHelpTypes.splice(index, 1);
            }
        },
        addAccepted: (state, action) => {
            const index = state.data.accepted.indexOf(action.payload);
            if (index === -1) {
                state.data.accepted.push(action.payload);
            }
            else {
                state.data.accepted.splice(index, 1);
            }
        },
        addAllowed: (state, action) => {
            const index = state.data.allowed.indexOf(action.payload);
            if (index === -1) {
                state.data.allowed.push(action.payload);
            }
            else {
                state.data.allowed.splice(index, 1);
            }
        },
        updateDescription: (state, action) => {
            state.data.description = action.payload;
        },
        updateLanguageDescription: (state, action) => {
            state.data.languageDescription = action.payload;
        },
        updatePrivateComment: (state, action) => {
            state.data.privateComment = action.payload;
        },
        updateOrganisation: (state, action) => {
            state.data.organisation = action.payload;
        },
        updateLanguageAndLevel: (state, action) => {
            state.data.languageAndLevel.push(action.payload);
        },
        deleteLanguageAndLevel: (state, action) => {
            if (state.data.languageAndLevel[action.payload]) {
                state.data.languageAndLevel.splice(action.payload, 1);
            }
        },
        updateIntrestInLanguageExchange: (state, action) => {
            state.data.showIntreastInLanguageExchange = action.payload;
        },
        updateEmail: (state, action) => {
            state.data.email = action.payload;
        },
        updateAddress: (state, action) => {
            state.data.address = action.payload;
            console.log("aaaaaaaaadress", state.data.address);
        },
        addImages: (state, action) => {
            state.data.images = [...state.data.images, ...action.payload]; // ✅ Fix reference
        },
        removeImage: (state, action) => {
            state.data.images = state.data.images.filter((_, index) => index !== action.payload); // ✅ Fix reference
        },
        updateImageDescription: (state, action) => {
            const { index, description } = action.payload;
            if (state.data.images[index]) { // ✅ Fix reference
                state.data.images[index].description = description;
            }
        },
        setHostFormData: (state, action) => {
            state.data = action.payload;
            console.log("sssssssssssssstates", state.data);
        },
        updateField: (state, action) => {
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
export const { nextStep, prevStep, addAccepted, addAllowed, updateOrganisation, updatePrivateComment, toggleHelpType, updateDescription, updateLanguageDescription, updateLanguageAndLevel, updateIntrestInLanguageExchange, deleteLanguageAndLevel, resetForm, updateEmail, updateAddress, addImages, removeImage, updateImageDescription, setHostFormData, updateField } = hostFormSlice.actions;
export default hostFormSlice.reducer;
