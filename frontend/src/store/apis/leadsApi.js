import { baseApi } from './baseApi';

export const leadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeads: builder.query({
      query: () => 'api_contactsubmission?select=*&order=created_at.desc',
      providesTags: ['Leads'],
    }),
    updateLeadStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `api_contactsubmission?id=eq.${id}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Leads'],
    }),
    createLead: builder.mutation({
      query: (newLead) => ({
        url: 'api_contactsubmission',
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
