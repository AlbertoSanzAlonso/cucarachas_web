import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_INSFORGE_URL}/rest/v1/`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY;
      
      if (anonKey) {
        headers.set('apikey', anonKey);
      }
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Leads', 'Species'],
  endpoints: () => ({}),
});
