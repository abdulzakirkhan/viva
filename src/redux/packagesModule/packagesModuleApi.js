// src/redux/auth/authApi.js
import {  GET_RATES, LIST_PACKAGES, UPDATE_RATES } from "../../constants/apiUrls";
import { api } from "../service";

export const packagesModuleApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllPackages: builder.query({
      query: () => {
        return {
          url: LIST_PACKAGES,
          method: "GET",
        };
      },
      providesTags: ["PackagesList"],
    }),

    getMockLivePackagesRates: builder.query({
      query: () => {
        return {
          url: GET_RATES,
          method: "GET",
        };
      },
      providesTags: ["PackagesList"],
    }),

    updateMockLivePackageRates: builder.mutation({
      query: (body) => {
        return {
          url: UPDATE_RATES,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["PackagesList"],
    }),
    
    updatePackage: builder.mutation({
      query: (body) => {
        return {
          url: `${LIST_PACKAGES}/${body.id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["PackagesList"],
    }),


    getAllPackagesAudit: builder.query({
      query: (body) => {
        return {
          url: `${LIST_PACKAGES}/audits?${body?.from ? `from=${body.from}` : ""}${body?.to ? `&to=${body.to}` : ""}${body?.packageId ? `&packageId=${body.packageId}` : ""}${body?.updatedBy ? `&updatedBy=${body.updatedBy}` : ""}${body?.fieldIncludes ? `&fieldIncludes=${body.fieldIncludes}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["PackagesList","GetAllPackagesAudit"],
    }),

    ///packages/audits
    // Add more auth endpoints as needed
  }),
});

export const {
    useGetAllPackagesQuery,
    useGetMockLivePackagesRatesQuery,
    useUpdateMockLivePackageRatesMutation,
    useUpdatePackageMutation,
    useGetAllPackagesAuditQuery,
} = packagesModuleApi;
