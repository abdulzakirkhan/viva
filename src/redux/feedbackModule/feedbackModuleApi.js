// src/redux/auth/authApi.js
import {  FEEDBACKS, GET_RATES, LIST_PACKAGES, UPDATE_RATES } from "../../constants/apiUrls";
import { api } from "../service";

export const feedbackModuleApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllFeedbacks: builder.query({
      query: (body) => {
        return {
          url: `${FEEDBACKS}/${body.status}`,
          method: "GET",
        };
      },
      providesTags: ["GetAllFeedbacks"],
    }),

    getAuditFeedbacks: builder.query({
      query: (body) => {
        return {
          url: `${FEEDBACKS}/audits?from=${body.from}&to=${body.to}&action=${body.action}`,
          method: "GET",
        };
      },
      providesTags: ["GetAuditFeedbacks"],
    }),

    updateFeedbackStatus: builder.mutation({
      query: (body) => {
        const { id, ...rest } = body;
        return {
          url: `${FEEDBACKS}/${id}/decision`,
          method: "PUT",
          body: rest,
        };
      },
      invalidatesTags: ["GetAuditFeedbacks", "GetAllFeedbacks"],
    }),


    getExportExcelAuditFeedbacks: builder.query({
      query: (body) => {
        return {
          url: `${FEEDBACKS}/audits/export.xlsx?from=${body.from}&to=${body.to}&action=${body.action}`,
          method: "GET",
        };
      },
      providesTags: ["GetAuditFeedbacks"],
    }),

    // Add more auth endpoints as needed
  }),
});

export const {
    useGetAllFeedbacksQuery,
    useGetAuditFeedbacksQuery,
    useUpdateFeedbackStatusMutation,
} = feedbackModuleApi;
