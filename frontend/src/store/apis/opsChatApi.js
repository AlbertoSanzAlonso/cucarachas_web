import { baseApi } from './baseApi';

export const opsChatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOpsModels: builder.query({
      query: () => 'ops/models/',
    }),
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
      query: ({ id, content, language, model, confirm_action }) => ({
        url: `ops/conversations/${id}/messages/`,
        method: 'POST',
        body: confirm_action
          ? { confirm_action, language, model }
          : { content, language, model },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'OpsConversations', id },
        { type: 'OpsConversations', id: 'LIST' },
        { type: 'OpsNotes', id: `conv-${id}` },
      ],
    }),
    sendOpsVoice: builder.mutation({
      query: ({ id, audio, language, speak, model }) => {
        const body = new FormData();
        body.append('audio', audio, audio.name || 'nota.webm');
        body.append('language', language || 'ca');
        if (speak) body.append('speak', 'true');
        if (model) body.append('model', model);
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
    createOpsRealtimeSession: builder.mutation({
      query: (body) => ({
        url: 'ops/realtime/session/',
        method: 'POST',
        body: body || {},
      }),
      invalidatesTags: [{ type: 'OpsConversations', id: 'LIST' }],
    }),
    runOpsRealtimeTool: builder.mutation({
      query: (body) => ({
        url: 'ops/realtime/tool/',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, body) =>
        body?.conversation_id
          ? [
              { type: 'OpsConversations', id: body.conversation_id },
              { type: 'OpsConversations', id: 'LIST' },
            ]
          : [{ type: 'OpsConversations', id: 'LIST' }],
    }),
    saveOpsRealtimeTranscript: builder.mutation({
      query: (body) => ({
        url: 'ops/realtime/transcript/',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, body) =>
        body?.conversation_id
          ? [
              { type: 'OpsConversations', id: body.conversation_id },
              { type: 'OpsConversations', id: 'LIST' },
            ]
          : [{ type: 'OpsConversations', id: 'LIST' }],
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
        {
          type: 'OpsNotes',
          id: params?.scope === 'global'
            ? 'GLOBAL'
            : params?.conversation
              ? `conv-${params.conversation}`
              : 'LIST',
        },
      ],
    }),
    createOpsNote: builder.mutation({
      query: (body) => ({
        url: 'ops/notes/',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, body) => [
        { type: 'OpsNotes', id: body?.conversation ? `conv-${body.conversation}` : 'GLOBAL' },
        { type: 'OpsNotes', id: 'LIST' },
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
        { type: 'OpsNotes', id: conversation ? `conv-${conversation}` : 'GLOBAL' },
        { type: 'OpsNotes', id: 'LIST' },
        { type: 'OpsConversations', id: conversation },
      ],
    }),
  }),
});

export const {
  useGetOpsModelsQuery,
  useGetOpsConversationsQuery,
  useGetOpsConversationQuery,
  useCreateOpsConversationMutation,
  useUpdateOpsConversationMutation,
  useDeleteOpsConversationMutation,
  useSendOpsMessageMutation,
  useSendOpsVoiceMutation,
  useCreateOpsRealtimeSessionMutation,
  useRunOpsRealtimeToolMutation,
  useSaveOpsRealtimeTranscriptMutation,
  useGetOpsNotesQuery,
  useCreateOpsNoteMutation,
  useUpdateOpsNoteMutation,
  useDeleteOpsNoteMutation,
} = opsChatApi;
