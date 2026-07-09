import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Trash2, Download, Loader2 } from 'lucide-react';
import { useGetLeadsQuery } from '@/store/apis/leadsApi';
import {
  useCreatePresupuestoPdfMutation,
  useDownloadPresupuestoPdfMutation,
  useGetPresupuestosQuery,
  downloadBlob,
} from '@/store/apis/presupuestosApi';
import { normalizeLead } from '@/utils/leadDisplay';
import {
  PRESUPUESTO_TEMPLATES,
  calcTotalConIva,
  getPresupuestoTemplate,
} from '@/utils/presupuestoTemplates';

const emptyLine = () => ({ concepto: '', descripcion: '', precio: '', cantidad: 1 });

const formatMoney = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat('ca-ES', { style: 'currency', currency: 'EUR' }).format(num);
};

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('ca-ES');
};

const PresupuestosManager = () => {
  const { data: leads, isLoading: leadsLoading } = useGetLeadsQuery();
  const { data: presupuestos, isLoading: listLoading, refetch } = useGetPresupuestosQuery();
  const [createPdf, { isLoading: creating }] = useCreatePresupuestoPdfMutation();
  const [downloadPdf] = useDownloadPresupuestoPdfMutation();
  const [downloadingId, setDownloadingId] = useState(null);

  const [clienteId, setClienteId] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('Barcelona');
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [validezDias, setValidezDias] = useState(30);
  const [garantiaMeses, setGarantiaMeses] = useState(12);
  const [notas, setNotas] = useState('');
  const [pestType, setPestType] = useState('');
  const [severity, setSeverity] = useState('');
  const [tipoPropiedad, setTipoPropiedad] = useState('Residencial');
  const [templateId, setTemplateId] = useState('');
  const [lineas, setLineas] = useState([emptyLine()]);
  const [error, setError] = useState('');

  const normalizedLeads = useMemo(
    () => (leads || []).map(normalizeLead).filter(Boolean),
    [leads],
  );

  const totalPreview = useMemo(
    () =>
      lineas.reduce((acc, line) => {
        const precio = parseFloat(line.precio);
        const qty = parseInt(line.cantidad, 10) || 0;
        if (Number.isNaN(precio) || qty < 1) return acc;
        return acc + precio * qty;
      }, 0),
    [lineas],
  );

  const totalConIvaPreview = useMemo(() => calcTotalConIva(totalPreview), [totalPreview]);

  const applyTemplate = (id) => {
    setTemplateId(id);
    if (!id) return;
    const tpl = getPresupuestoTemplate(id);
    if (!tpl) return;
    setGarantiaMeses(tpl.garantia_meses);
    setValidezDias(tpl.validez_dias);
    setNotas(tpl.notas);
    setPestType(tpl.pest_type);
    setSeverity(tpl.severity);
    setTipoPropiedad(tpl.tipo_propiedad);
    setLineas(
      tpl.lineas.map((line) => ({
        concepto: line.concepto,
        descripcion: line.descripcion || '',
        precio: line.precio,
        cantidad: line.cantidad,
      })),
    );
  };

  const updateLine = (index, field, value) => {
    setLineas((prev) => prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)));
  };

  const addLine = () => setLineas((prev) => [...prev, emptyLine()]);

  const removeLine = (index) => {
    setLineas((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!clienteId) {
      setError('Selecciona un client de la base de dades.');
      return;
    }

    const payload = {
      cliente_id: Number(clienteId),
      direccion,
      ciudad,
      tipo_propiedad: tipoPropiedad,
      fecha,
      validez_dias: Number(validezDias),
      garantia_meses: Number(garantiaMeses),
      pest_type: pestType,
      severity,
      notas,
      lineas: lineas
        .map((line) => ({
          concepto: line.concepto.trim(),
          descripcion: (line.descripcion || '').trim(),
          precio: parseFloat(line.precio),
          cantidad: parseInt(line.cantidad, 10) || 1,
        }))
        .filter((line) => line.concepto && line.precio > 0),
    };

    if (!payload.lineas.length) {
      setError('Afegeix almenys una línia amb concepte i preu.');
      return;
    }

    try {
      const result = await createPdf(payload).unwrap();
      const filename = `pressupost-cecsa-${String(result.id || 'nou').padStart(4, '0')}.pdf`;
      downloadBlob(result.blob, filename);
      refetch();
      setLineas([emptyLine()]);
      setNotas('');
      setTemplateId('');
      setPestType('');
      setSeverity('');
    } catch (err) {
      setError(err.message || 'No s\'ha pogut generar el pressupost.');
    }
  };

  const handleDownloadExisting = async (id) => {
    setDownloadingId(id);
    try {
      const blob = await downloadPdf(id).unwrap();
      downloadBlob(blob, `pressupost-cecsa-${String(id).padStart(4, '0')}.pdf`);
    } catch {
      setError('No s\'ha pogut descarregar el PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-primary-gray uppercase tracking-tight">
            Pressupostos
          </h2>
          <p className="text-primary-gray/40 font-medium text-sm">
            Genera pressupostos en PDF i alimenta el dataset del Bio-Assistent
          </p>
        </div>
        <div className="p-3 bg-primary-blue/5 rounded-2xl text-primary-blue">
          <FileText size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        <form
          onSubmit={handleSubmit}
          className="xl:col-span-3 bg-white rounded-3xl md:rounded-[3rem] shadow-sm border border-gray-100 p-6 md:p-10 space-y-6"
        >
          <h3 className="text-sm font-black uppercase tracking-widest text-primary-gray/50">
            Nou pressupost
          </h3>

          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary-gray/40">
              Plantilla (model CECSA)
            </span>
            <select
              value={templateId}
              onChange={(e) => applyTemplate(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-primary-gray focus:outline-none focus:border-primary-blue"
            >
              <option value="">Sense plantilla — línes en blanc</option>
              {PRESUPUESTO_TEMPLATES.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.label} ({tpl.id})
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-gray/40">
                Client *
              </span>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-primary-gray focus:outline-none focus:border-primary-blue"
                disabled={leadsLoading}
              >
                <option value="">Selecciona un lead...</option>
                {normalizedLeads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name}
                    {lead.phone ? ` — ${lead.phone}` : ''}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-gray/40">
                Data
              </span>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-primary-gray focus:outline-none focus:border-primary-blue"
              />
            </label>

            <label className="block space-y-2 md:col-span-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-gray/40">
                Adreça (opcional)
              </span>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Carrer Example 12, 3r 1a"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-primary-gray focus:outline-none focus:border-primary-blue"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-gray/40">
                Ciutat
              </span>
              <input
                type="text"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-primary-gray focus:outline-none focus:border-primary-blue"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-gray/40">
                Validesa (dies)
              </span>
              <input
                type="number"
                min={1}
                max={365}
                value={validezDias}
                onChange={(e) => setValidezDias(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-primary-gray focus:outline-none focus:border-primary-blue"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-gray/40">
                Garantia (mesos)
              </span>
              <input
                type="number"
                min={0}
                max={120}
                value={garantiaMeses}
                onChange={(e) => setGarantiaMeses(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-primary-gray focus:outline-none focus:border-primary-blue"
              />
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-gray/40">
                Conceptes i preus *
              </span>
              <button
                type="button"
                onClick={addLine}
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-blue hover:text-primary-blue-hv"
              >
                <Plus size={14} />
                Afegir línia
              </button>
            </div>

            {lineas.map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 p-4 rounded-2xl border border-gray-100 bg-gray-50/50"
              >
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-12 md:col-span-6">
                    <input
                      type="text"
                      value={line.concepto}
                      onChange={(e) => updateLine(index, 'concepto', e.target.value)}
                      placeholder="Concepte (ex: Desinsectació paneroles)"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-primary-gray focus:outline-none focus:border-primary-blue bg-white"
                    />
                  </div>
                  <div className="col-span-5 md:col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.precio}
                      onChange={(e) => updateLine(index, 'precio', e.target.value)}
                      placeholder="Preu € (sense IVA)"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-primary-gray focus:outline-none focus:border-primary-blue bg-white"
                    />
                  </div>
                  <div className="col-span-5 md:col-span-2">
                    <input
                      type="number"
                      min="1"
                      value={line.cantidad}
                      onChange={(e) => updateLine(index, 'cantidad', e.target.value)}
                      placeholder="Qt."
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-primary-gray focus:outline-none focus:border-primary-blue bg-white"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeLine(index)}
                      className="p-3 rounded-2xl text-red-400 hover:bg-red-50 transition-colors"
                      aria-label="Eliminar línia"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <textarea
                  value={line.descripcion}
                  onChange={(e) => updateLine(index, 'descripcion', e.target.value)}
                  rows={2}
                  placeholder="Descripció detallada del servei (opcional, surt al PDF)"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-xs font-medium text-primary-gray/70 focus:outline-none focus:border-primary-blue bg-white resize-none"
                />
              </motion.div>
            ))}
          </div>

          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary-gray/40">
              Notes (opcional)
            </span>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              placeholder="Condicions especials, observacions..."
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-primary-gray focus:outline-none focus:border-primary-blue resize-none"
            />
          </label>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-gray-100">
            <div className="text-sm font-bold text-primary-gray space-y-1">
              <p>
                Base imposable:{' '}
                <span className="text-primary-blue">{formatMoney(totalPreview)}</span>
              </p>
              <p>
                Total amb IVA (21%):{' '}
                <span className="text-primary-blue text-lg">{formatMoney(totalConIvaPreview)}</span>
              </p>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-xs font-black uppercase tracking-widest text-white disabled:opacity-60"
              style={{ background: 'var(--primary-blue)' }}
            >
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Generar PDF
            </button>
          </div>

          {error && (
            <p className="text-sm font-bold text-red-500 bg-red-50 rounded-2xl px-4 py-3">{error}</p>
          )}
        </form>

        <section className="xl:col-span-2 bg-white rounded-3xl md:rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary-gray/50">
              Recents
            </h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-[720px] overflow-y-auto">
            {listLoading ? (
              <p className="p-8 text-center text-primary-gray/40 text-sm font-bold animate-pulse">
                Carregant...
              </p>
            ) : !presupuestos?.length ? (
              <p className="p-8 text-center text-primary-gray/40 text-sm">
                Encara no hi ha pressupostos generats.
              </p>
            ) : (
              presupuestos.map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-primary-gray truncate">
                      #{String(item.id).padStart(4, '0')} — {item.cliente_nombre}
                    </p>
                    <p className="text-xs text-primary-gray/40 mt-1">
                      {formatMoney(item.total_monto)} · {formatDate(item.created_at)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadExisting(item.id)}
                    disabled={downloadingId === item.id}
                    className="shrink-0 p-2 rounded-xl text-primary-blue hover:bg-primary-blue/5"
                    title="Descarregar PDF"
                  >
                    {downloadingId === item.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Download size={18} />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PresupuestosManager;
