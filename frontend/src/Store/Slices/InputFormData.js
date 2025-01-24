import { createSlice } from "@reduxjs/toolkit";

const InputFormDataSlice = createSlice({
  name: "inputformdata",
  initialState: {
    inputFormData: [],
  },
  reducers: {
    addItem: (state, action) => {
      state.inputFormData = action.payload;
    },
  },
});

export const { addItem } = InputFormDataSlice.actions;

export default InputFormDataSlice.reducer;
