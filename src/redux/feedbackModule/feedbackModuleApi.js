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


    //url: `${LIST_PACKAGES}/audits?${body?.from ? `from=${body.from}` : ""}${body?.to ? `&to=${body.to}` : ""}${body?.packageId ? `&packageId=${body.packageId}` : ""}${body?.updatedBy ? `&updatedBy=${body.updatedBy}` : ""}${body?.fieldIncludes ? `&fieldIncludes=${body.fieldIncludes}` : ""}`,
    getAuditFeedbacks: builder.query({
      query: (body) => {
        return {
          url: `${FEEDBACKS}/audits?${body?.from ? `from=${body.from}` : ""}${body?.to ? `&to=${body.to}` : ""}${body?.feedbackId ? `&feedbackId=${body.feedbackId}` : ""}${body?.actedBy ? `&actedBy=${body.actedBy}` : ""}${body?.action ? `&action=${body.action}` : ""}`,
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
          url: `${FEEDBACKS}/audits/export.xlsx?${body?.from ? `from=${body.from}` : ""}${body?.to ? `&to=${body.to}` : ""}${body?.feedbackId ? `&feedbackId=${body.feedbackId}` : ""}${body?.actedBy ? `&actedBy=${body.actedBy}` : ""}${body?.action ? `&action=${body.action}` : ""}`,
          method: "GET",
          responseHandler: (response) => response.blob(),
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
    useLazyGetExportExcelAuditFeedbacksQuery,
} = feedbackModuleApi;
