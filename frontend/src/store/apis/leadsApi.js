import { baseApi } from './baseApi';

export const leadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeads: builder.query({
      query: () => 'clientes/',
      providesTags: ['Leads'],
    }),
    updateLeadStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `clientes/${id}/`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Leads'],
    }),
    createLead: builder.mutation({
      query: (newLead) => ({
        url: 'clientes/',
        method: 'POST',
        body: newLead,
      }),
      invalidatesTags: ['Leads'],
    }),
  }),
});

export const { 
  useGetLeadsQuery, 
  useUpdateLeadStatusMutation, 
  useCreateLeadMutation 
} = leadsApi;
