import authReducer from "./reducers/authReducer";
import { configureStore } from "@reduxjs/toolkit"
import wodReducer from "./reducers/wodReducer";


const store = configureStore({
    reducer: {
        auth: authReducer, //accessibile con state.auth
        wod: wodReducer //accessibile con state.wod
    }
})

export default store;