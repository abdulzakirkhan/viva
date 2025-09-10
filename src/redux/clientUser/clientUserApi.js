// src/redux/auth/authApi.js
import { BLOCK_CLIENT, CLIENT_USER } from "../../constants/apiUrls";
import { api } from "../service";

export const permissionModuleApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllClients: builder.query({
      query: () => {
        return {
          url: CLIENT_USER,
          method: "GET",
        };
      },
      providesTags: ["GetAllClients"],
    }),


    blockClient: builder.mutation({
      query: (body) => {
        const id=body?.id;
        return {
          url: `${BLOCK_CLIENT}/${id}`,
          method: "PUT",
        };
      },
      invalidatesTags: ["GetAllClients"],
    }),

    // Add more auth endpoints as needed
  }),
});

export const {
    useGetAllClientsQuery,
    useBlockClientMutation,
} = permissionModuleApi;
