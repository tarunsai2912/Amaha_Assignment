import { createSlice } from "@reduxjs/toolkit";

const loggedInSlice = createSlice({
  name: "loggedin",
  initialState: {
    loggedin: localStorage.getItem("token") ? true : false,
  },
  reducers: {
    addItem: (state, action) => {
      const token = localStorage.getItem("token");
      state.loggedin = token ? true : false;
    },
    setLoggin: (state, action) => {
      state.loggedin = action.payload;
    },
  },
});
export const { addItem, setLoggin } = loggedInSlice.actions;
export default loggedInSlice.reducer;