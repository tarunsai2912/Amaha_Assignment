import { createSlice } from "@reduxjs/toolkit";

const TriggeringRenderingSlice = createSlice({
  name: "triggeringrendering",
  initialState: {
    rendering: 0, 
  },
  reducers: {
    addItem: (state) => {
      state.rendering += 1;
    },
  },
});

export const { addItem } = TriggeringRenderingSlice.actions;

export default TriggeringRenderingSlice.reducer;
