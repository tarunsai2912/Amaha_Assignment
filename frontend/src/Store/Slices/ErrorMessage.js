import { createSlice } from "@reduxjs/toolkit";

const ErrorMessageSlice = createSlice({
  name: "errormessage",
  initialState: {
    errorMessage: [],
  },
  reducers: {
    addError: (state, action) => {
      state.errorMessage=action.payload;
    },
  },
});

export const { addError  } = ErrorMessageSlice.actions;

export default ErrorMessageSlice.reducer;