import {ANALYTICS, ANALYTICS_USERS_KPIS, ANALYTICS_USERS_KPIS_WEEKLY_SERIRES, USERS} from "../../constants/apiUrls";
import { api } from "../service";

export const analyticsModuleApi = api.injectEndpoints({
  endpoints: (builder) => ({

    getAllUsersKpis: builder.query({
      query: () => {
        return {
          url: ANALYTICS_USERS_KPIS,
          method: "GET",
        };
      },
      providesTags: ["GetKpis"],
    }),
    getKpisWeeklySeries: builder.query({
      query: () => {
        return {
          url: ANALYTICS_USERS_KPIS_WEEKLY_SERIRES,
          method: "GET",
        };
      },
      providesTags: ["GetKpis"],
    }),

    getDailyUser: builder.query({
      query: (body) => {
        return {
          url: `${ANALYTICS}${USERS}/daily?from=${body.from}&to=${body.to}`,
          method: "GET",
        };
      },
      providesTags: ["GetKpis"],
    }),

    // Add more auth endpoints as needed
  }),
});

export const {
    useGetAllUsersKpisQuery,
    useGetKpisWeeklySeriesQuery,
    useGetDailyUserQuery,
} = analyticsModuleApi;