import { configureStore } from '@reduxjs/toolkit';
import AssignList from './Slices/AssignList';
import InputFormData from "./Slices/InputFormData"
import ErrorMessage from "./Slices/ErrorMessage"
import LoggedOrNot from "./Slices/LoggedOrNot"
import AccessToMultipleAssignee from "./Slices/AsseccToMultipleAssignee"
import TriggeringRenderingSlice from "./Slices/TriggerringRendering"
const store = configureStore({
  reducer: {
    AssignList:AssignList,
    InputFormData:InputFormData,
    ErrorMessage:ErrorMessage,
    LoggedOrNot:LoggedOrNot,
    AccessToMultipleAssignee:AccessToMultipleAssignee,
    TriggeringRenderingSlice:TriggeringRenderingSlice
    
  },
});

export default store;