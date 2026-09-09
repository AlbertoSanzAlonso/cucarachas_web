import { baseApi } from './baseApi';

export const leadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeads: builder.query({
      query: (params) => {
        const crmStatus = params?.crm_status;
        const qs = crmStatus ? `?crm_status=${encodeURIComponent(crmStatus)}` : '';
        return `clientes/${qs}`;
      },
      providesTags: ['Leads'],
    }),
    updateLeadStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `clientes/${id}/`,
        method: 'PATCH',
        body: { crm_status: status },
      }),
      invalidatesTags: ['Leads'],
    }),
    updateLead: builder.mutation({
      query: ({ id, nombre, email, telefono, documento_fiscal, crm_status }) => {
        const body = { nombre, email, telefono, documento_fiscal };
        if (crm_status) body.crm_status = crm_status;
        return {
          url: `clientes/${id}/`,
          method: 'PATCH',
          body,
        };
      },
      invalidatesTags: ['Leads'],
    }),
    unlockLeadStatus: builder.mutation({
      query: (id) => ({
        url: `clientes/${id}/unlock-status/`,
        method: 'POST',
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
  useUnlockLeadStatusMutation,
  useDeleteLeadMutation,
  useCreateLeadMutation,
} = leadsApi;
