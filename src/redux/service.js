import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth'; // ✅ Correct import

export const api = createApi({
  reducerPath: 'api',
  tagTypes: [
    'RoleModule',
    'Users',
    'GetAllClients',
    "PackagesList",
    "GetKpis",
    "GetAllFeedbacks",
    "GetAuditFeedbacks",
    "GetAllPackagesAudit"
  ],
  baseQuery: baseQueryWithReauth,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});
