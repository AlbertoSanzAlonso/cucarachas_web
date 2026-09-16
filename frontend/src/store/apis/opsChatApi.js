import { baseApi } from './baseApi';

export const opsChatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOpsConversations: builder.query({
      query: (params) => {
        const q = params?.q ? `?q=${encodeURIComponent(params.q)}` : '';
        return `ops/conversations/${q}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'OpsConversations', id })),
              { type: 'OpsConversations', id: 'LIST' },
            ]
          : [{ type: 'OpsConversations', id: 'LIST' }],
    }),
    getOpsConversation: builder.query({
      query: (id) => `ops/conversations/${id}/`,
      providesTags: (_r, _e, id) => [
        { type: 'OpsConversations', id },
        { type: 'OpsNotes', id: `conv-${id}` },
      ],
    }),
    createOpsConversation: builder.mutation({
      query: (body) => ({
        url: 'ops/conversations/',
        method: 'POST',
        body: body || {},
      }),
      invalidatesTags: [{ type: 'OpsConversations', id: 'LIST' }],
    }),
    updateOpsConversation: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `ops/conversations/${id}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'OpsConversations', id },
        { type: 'OpsConversations', id: 'LIST' },
      ],
    }),
    deleteOpsConversation: builder.mutation({
      query: (id) => ({
        url: `ops/conversations/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'OpsConversations', id: 'LIST' }],
    }),
    sendOpsMessage: builder.mutation({
      query: ({ id, content, language }) => ({
        url: `ops/conversations/${id}/messages/`,
        method: 'POST',
        body: { content, language },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'OpsConversations', id },
        { type: 'OpsConversations', id: 'LIST' },
        { type: 'OpsNotes', id: `conv-${id}` },
      ],
    }),
    sendOpsVoice: builder.mutation({
      query: ({ id, audio, language }) => {
        const body = new FormData();
        body.append('audio', audio, audio.name || 'nota.webm');
        body.append('language', language || 'ca');
        return {
          url: `ops/conversations/${id}/messages/`,
          method: 'POST',
          body,
        };
      },
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'OpsConversations', id },
        { type: 'OpsConversations', id: 'LIST' },
        { type: 'OpsNotes', id: `conv-${id}` },
      ],
    }),
    getOpsNotes: builder.query({
      query: (params) => {
        const sp = new URLSearchParams();
        if (params?.conversation) sp.set('conversation', params.conversation);
        if (params?.scope) sp.set('scope', params.scope);
        const qs = sp.toString();
        return qs ? `ops/notes/?${qs}` : 'ops/notes/';
      },
      providesTags: (_r, _e, params) => [
        { type: 'OpsNotes', id: params?.conversation ? `conv-${params.conversation}` : 'LIST' },
      ],
    }),
    createOpsNote: builder.mutation({
      query: (body) => ({
        url: 'ops/notes/',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, body) => [
        { type: 'OpsNotes', id: body?.conversation ? `conv-${body.conversation}` : 'LIST' },
        { type: 'OpsConversations', id: body?.conversation },
      ],
    }),
    updateOpsNote: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `ops/notes/${id}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['OpsNotes'],
    }),
    deleteOpsNote: builder.mutation({
      query: ({ id, conversation }) => ({
        url: `ops/notes/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { conversation }) => [
        { type: 'OpsNotes', id: conversation ? `conv-${conversation}` : 'LIST' },
        { type: 'OpsConversations', id: conversation },
      ],
    }),
  }),
});

export const {
  useGetOpsConversationsQuery,
  useGetOpsConversationQuery,
  useCreateOpsConversationMutation,
  useUpdateOpsConversationMutation,
  useDeleteOpsConversationMutation,
  useSendOpsMessageMutation,
  useSendOpsVoiceMutation,
  useGetOpsNotesQuery,
  useCreateOpsNoteMutation,
  useUpdateOpsNoteMutation,
  useDeleteOpsNoteMutation,
} = opsChatApi;
