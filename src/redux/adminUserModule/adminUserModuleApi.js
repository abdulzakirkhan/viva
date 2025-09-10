// src/redux/auth/authApi.js
import { ADMIN, ADMIN_AUDIT_LISTING, CHANGE_PASSWORD, PERMISSIONS_MODULES, USERS } from "../../constants/apiUrls";
import { api } from "../service";

export const permissionModuleApi = api.injectEndpoints({
  endpoints: (builder) => ({

    getAllUserListing: builder.query({
      query: () => {
        return {
          url: `${ADMIN}${USERS}`,
          method: "GET",
        };
      },
      providesTags: ["Users"],
    }),

    getPermissionsUser: builder.query({
      query: () => {
        return {
          url: PERMISSIONS_MODULES,
          method: "GET",
        };
      },
      providesTags: ["Users"],
    }),

    createAdminUser: builder.mutation({
      query: (body) => {
        return {
          url: `${ADMIN}${USERS}`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Users"],
    }),

    updateAdminUserPassword: builder.mutation({
      query: (body) => {
        return {
          url: `${ADMIN}${CHANGE_PASSWORD}`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Users"],
    }),

    updateAdminUserDetails: builder.mutation({
      query: (body) => {
        const { userId, ...rest } = body;
        return {
          url: `${ADMIN}${ADMIN}s/${userId}`,
          method: "PUT",
          body: rest,
        };
      },
      invalidatesTags: ["Users"],
    }),

    getAdminUserAuditListing: builder.query({
      query: (body) => {
        return {
          // url: `${ADMIN_AUDIT_LISTING}?from=${body.from}&to=${body.to}&action=${body.status}`,
          url: `${ADMIN_AUDIT_LISTING}?${body?.from ? "from=" + body.from + "&" : ""}${body?.to ? "to=" + body.to : ""}${body?.updatedBy ? "updatedBy=" + body.updatedBy : ""}${body?.adminUserId ? "adminUserId=" + body.adminUserId : ""}`,
          method: "GET",
        };
      },
      providesTags: ["Users"],
    }),

   

    // Add more auth endpoints as needed
  }),
});

export const {
  useGetAllUserListingQuery,
  useGetPermissionsUserQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserPasswordMutation,
  useUpdateAdminUserDetailsMutation,
  useGetAdminUserAuditListingQuery,
} = permissionModuleApi;
