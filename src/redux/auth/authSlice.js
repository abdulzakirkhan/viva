// authSlice.js
import { createSlice } from "@reduxjs/toolkit";


const initialState = {
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // payload: { token, user, refreshToken? }
    setCredentials: (state, action) => {
      const { token = null, user = null, refreshToken = null } = action.payload || {};
      state.token = token;
      state.refreshToken = refreshToken;
      state.user = user;
      state.isAuthenticated = !!token;
    },

    

    logOut: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;
export default authSlice.reducer;
