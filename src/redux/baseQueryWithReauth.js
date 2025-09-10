// // src/redux/baseQueryWithReauth.js
// import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// import { setCredentials, logOut } from "./auth/authSlice";
// import { BASE_URL } from "../constants/apiUrls";

// const rawBaseQuery = fetchBaseQuery({
//   baseUrl: BASE_URL,
//   prepareHeaders: (headers, { getState }) => {
//     const token = getState().auth?.token;
//     if (token) {
//       headers.set("Authorization", `Bearer ${token}`);
//     }
//     return headers;
//   },
// });

// export const baseQueryWithReauth = async (args, api, extraOptions) => {
//   let result = await rawBaseQuery(args, api, extraOptions);
//   if (result?.error?.status === 401) {
//     const refreshToken = api.getState().auth.refreshToken;

//     if (refreshToken) {
//       // Try refreshing the token
//       const refreshResult = await rawBaseQuery(
//         {
//           url: "/api/employee/refreshToken",
//           method: "POST",
//           body: { refreshToken },
//         },
//         api,
//         extraOptions
//       );

//       if (refreshResult?.data) {
//         const { accessToken, refreshToken: newRefreshToken, formattedEmployee } =
//           refreshResult.data;

//         // Save new tokens & user
//         api.dispatch(
//           setCredentials({
//             user: formattedEmployee,
//             token: accessToken,
//             refreshToken: newRefreshToken,
//           })
//         );

//         // Retry the original request
//         result = await rawBaseQuery(args, api, extraOptions);
//       } else {
//         api.dispatch(logOut());
//         // api.dispatch(api.util.resetApiState());
//         api.util.resetApiState();
//       }
//     } else {
//       api.dispatch(logOut());
//       api.util.resetApiState();
//       // api.dispatch(api.util.resetApiState())
//     }
//   }

//   return result;
// };
// src/redux/baseQueryWithReauth.js
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, logOut } from "./auth/authSlice";
import { BASE_URL } from "../constants/apiUrls";
import { api as apiSlice } from "./service"; // ← your createApi instance

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  // credentials: "include", // ← enable if you use cookies
  prepareHeaders: (headers, { getState }) => {
    const token = getState()?.auth?.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  try {
    let result = await rawBaseQuery(args, api, extraOptions);

    // 401 → logout + reset cache
    if (result?.error?.status === 401) {
      api.dispatch(logOut());
      api.dispatch(apiSlice.util.resetApiState());
      return result;
    }

    // Success: only capture token/user on login (or refresh) route
    if (result?.data) {
      const url = typeof args === "string" ? args : args?.url;
      const isLogin = url?.includes("/admin/auth/login");
      const isRefresh = url?.includes("/refreshToken");

      if (isLogin || isRefresh) {
        const token = result.data?.token;
        const user = result.data?.user;
        if (token && user) {
          api.dispatch(setCredentials({ token, user }));
        }
      }
    } else if (result?.error) {
      console.error("API Error:", result.error);
    }

    return result;
  } catch (e) {
    console.error("baseQueryWithReauth fatal error:", e);
    // defensive: log out + reset to avoid bad state
    api.dispatch(logOut());
    api.dispatch(apiSlice.util.resetApiState());
    throw e;
  }
};