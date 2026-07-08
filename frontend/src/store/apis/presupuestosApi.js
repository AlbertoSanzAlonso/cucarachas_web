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
    downloadPresupuestoPdf: builder.mutation({
      query: (id) => ({
        url: `presupuestos/${id}/pdf/`,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetPresupuestosQuery,
  useCreatePresupuestoPdfMutation,
  useDownloadPresupuestoPdfMutation,
} = presupuestosApi;

export { downloadBlob };
