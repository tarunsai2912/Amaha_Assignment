import { createSlice } from "@reduxjs/toolkit";

const accessToMultipeAssigneSlice = createSlice({
  name: "accesstomultiple",
  initialState: {
    acsessToMultipleAssignee: false
  },
  reducers: {

    setAccess: (state, action) => {
      state.acsessToMultipleAssignee = action.payload;
    },
  },
});
export const { setAccess } = accessToMultipeAssigneSlice.actions;
export default accessToMultipeAssigneSlice.reducer;