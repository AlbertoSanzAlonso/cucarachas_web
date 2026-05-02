import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.cucarachasbarcelona.cat';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE}/api/`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('Authorization', `Token ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Leads', 'Species', 'Citas'],
  endpoints: () => ({}),
});
