import { baseApi } from './baseApi';

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const presupuestosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPresupuestos: builder.query({
      query: () => 'presupuestos/list/',
      providesTags: ['Presupuestos'],
    }),
    getPresupuestoDetail: builder.query({
      query: (id) => `presupuestos/${id}/`,
      providesTags: (_result, _err, id) => [{ type: 'Presupuestos', id }],
    }),
    createPresupuesto: builder.mutation({
      query: (body) => ({
        url: 'presupuestos/create/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Presupuestos'],
    }),
    createPresupuestoPdf: builder.mutation({
      query: (body) => ({
        url: 'presupuestos/create_pdf/',
        method: 'POST',
        body,
        responseHandler: async (response) => {
          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.detail || 'Error en generar el pressupost');
          }
          const blob = await response.blob();
          const id = response.headers.get('X-Presupuesto-Id');
          return { blob, id };
        },
      }),
      invalidatesTags: ['Presupuestos'],
    }),
    updatePresupuesto: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `presupuestos/${id}/update/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Presupuestos'],
    }),
    deletePresupuesto: builder.mutation({
      query: (id) => ({
        url: `presupuestos/${id}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Presupuestos'],
    }),
    sendPresupuestoEmail: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `presupuestos/${id}/send/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Presupuestos'],
    }),
    downloadPresupuestoPdf: builder.mutation({
      query: (id) => ({
        url: `presupuestos/${id}/pdf/`,
        responseHandler: async (response) => {
          if (!response.ok) {
            throw new Error('No s\'ha pogut descarregar el PDF');
          }
          return response.blob();
        },
      }),
    }),
  }),
});

export const {
  useGetPresupuestosQuery,
  useGetPresupuestoDetailQuery,
  useCreatePresupuestoMutation,
  useCreatePresupuestoPdfMutation,
  useUpdatePresupuestoMutation,
  useDeletePresupuestoMutation,
  useSendPresupuestoEmailMutation,
  useDownloadPresupuestoPdfMutation,
} = presupuestosApi;

export { downloadBlob };
