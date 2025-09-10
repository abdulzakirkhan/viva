// src/redux/auth/authApi.js
import { PERMISSIONS_MODULES, ROLES_MODULES } from "../../constants/apiUrls";
import { api } from "../service";

export const permissionModuleApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPermissions: builder.query({
      query: () => {
        return {
          url: PERMISSIONS_MODULES,
          method: "GET",
        };
      },
      providesTags: ["RoleModule"],
    }),

    getRolesModules: builder.query({
      query: () => {
        return {
          url: ROLES_MODULES,
          method: "GET",
        };
      },
      providesTags: ["RoleModule"],
    }),

    createRoleModule: builder.mutation({
      query: (body) => {
        return {
          url: ROLES_MODULES,
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["RoleModule"],
    }),

    updateRoleModule: builder.mutation({
      query: (body) => {
        const { id, ...rest } = body;
        return {
          url: `${ROLES_MODULES}/${id}`,
          method: "PUT",
          body: rest,
        };
      },
      invalidatesTags: ["RoleModule"],
    }),

    // Add more auth endpoints as needed
  }),
});

export const {
  useGetPermissionsQuery,
  useGetRolesModulesQuery,
  useCreateRoleModuleMutation,
  useUpdateRoleModuleMutation,
} = permissionModuleApi;
