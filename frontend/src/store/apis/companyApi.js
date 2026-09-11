import { baseApi } from './baseApi';

export const companyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCompany: builder.query({
      query: (lang = 'ca') => `company/?lang=${lang}`,
      providesTags: ['Company'],
    }),
    getFaq: builder.query({
      query: ({ lang = 'ca', category } = {}) => {
        const qs = new URLSearchParams({ lang });
        if (category && category !== 'all') qs.set('category', category);
        return `faq/?${qs}`;
      },
      providesTags: ['Faq'],
    }),
  }),
});

export const { useGetCompanyQuery, useGetFaqQuery } = companyApi;
