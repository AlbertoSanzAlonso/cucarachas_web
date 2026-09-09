import { baseApi } from './baseApi';

export const blogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBlogArticles: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams();
        if (params.category && params.category !== 'all') qs.set('category', params.category);
        if (params.search) qs.set('search', params.search);
        if (params.all) qs.set('all', '1');
        const suffix = qs.toString() ? `?${qs}` : '';
        return `blog/${suffix}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ slug }) => ({ type: 'Blog', id: slug })),
              { type: 'Blog', id: 'LIST' },
            ]
          : [{ type: 'Blog', id: 'LIST' }],
    }),
    getBlogArticle: builder.query({
      query: (slug) => `blog/${slug}/`,
      providesTags: (_r, _e, slug) => [{ type: 'Blog', id: slug }],
    }),
    createBlogArticle: builder.mutation({
      query: (body) => ({
        url: 'blog/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Blog', id: 'LIST' }],
    }),
    updateBlogArticle: builder.mutation({
      query: ({ slug, ...body }) => ({
        url: `blog/${slug}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { slug }) => [
        { type: 'Blog', id: slug },
        { type: 'Blog', id: 'LIST' },
      ],
    }),
    deleteBlogArticle: builder.mutation({
      query: (slug) => ({
        url: `blog/${slug}/`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Blog', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetBlogArticlesQuery,
  useGetBlogArticleQuery,
  useCreateBlogArticleMutation,
  useUpdateBlogArticleMutation,
  useDeleteBlogArticleMutation,
} = blogApi;
