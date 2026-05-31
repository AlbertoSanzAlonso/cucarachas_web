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
    updateLead: builder.mutation({
      query: ({ id, nombre, email, telefono, documento_fiscal }) => ({
        url: `clientes/${id}/`,
        method: 'PATCH',
        body: { nombre, email, telefono, documento_fiscal },
      }),
      invalidatesTags: ['Leads'],
    }),
    deleteLead: builder.mutation({
      query: (id) => ({
        url: `clientes/${id}/`,
        method: 'DELETE',
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
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useCreateLeadMutation,
} = leadsApi;
