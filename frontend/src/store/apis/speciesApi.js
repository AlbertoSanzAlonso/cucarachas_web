import { baseApi } from './baseApi';

export const speciesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSpecies: builder.query({
      query: () => 'api_service?select=*',
      providesTags: ['Species'],
    }),
    updateSpecies: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `api_service?id=eq.${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['Species'],
    }),
  }),
});

export const { 
  useGetSpeciesQuery, 
  useUpdateSpeciesMutation 
} = speciesApi;
