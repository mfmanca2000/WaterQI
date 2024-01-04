import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    loggedIn: false,
    userData: null
}

const authSlice = createSlice( {
    name: "auth",
    initialState: initialState,
    reducers: {
        login: (state, action) => {
            state.loggedIn = true;
            state.userData = action.payload.userData;
        },
        logout: (state) => {
            state.loggedIn = false;
            state.userData = null;
        }
    }
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer
