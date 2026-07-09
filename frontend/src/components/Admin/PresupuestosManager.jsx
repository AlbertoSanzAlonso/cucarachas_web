import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Loader2,
  Pencil,
  Mail,
  X,
  Bot,
  User,
  Save,
} from 'lucide-react';
import { useGetLeadsQuery } from '@/store/apis/leadsApi';
import {
  useCreatePresupuestoMutation,
  useCreatePresupuestoPdfMutation,
  useDownloadPresupuestoPdfMutation,
  useGetPresupuestosQuery,
  useGetPresupuestoDetailQuery,
  useUpdatePresupuestoMutation,
  useDeletePresupuestoMutation,
  useSendPresupuestoEmailMutation,
  downloadBlob,
} from '@/store/apis/presupuestosApi';
import { normalizeLead } from '@/utils/leadDisplay';
import {
  PRESUPUESTO_TEMPLATES,
  calcTotalConIva,
  getPresupuestoTemplate,
} from '@/utils/presupuestoTemplates';

const emptyLine = () => ({ concepto: '', descripcion: '', precio: '', cantidad: 1 });

const ESTADO_LABELS = {
  borrador: 'Esborrany',
  enviado: 'Enviat',
  aceptado: 'Acceptat',
  rechazado: 'Rebutjat',
};

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
  const [createPresupuesto, { isLoading: saving }] = useCreatePresupuestoMutation();
  const [createPdf, { isLoading: creating }] = useCreatePresupuestoPdfMutation();
  const [updatePresupuesto, { isLoading: updating }] = useUpdatePresupuestoMutation();
  const [deletePresupuesto] = useDeletePresupuestoMutation();
  const [sendEmail, { isLoading: sending }] = useSendPresupuestoEmailMutation();
  const [downloadPdf] = useDownloadPresupuestoPdfMutation();
  const [downloadingId, setDownloadingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [sendTarget, setSendTarget] = useState(null);
  const [sendEmailValue, setSendEmailValue] = useState('');
  const [sendSubject, setSendSubject] = useState('');
  const [sendBody, setSendBody] = useState('');

  const { data: editDetail, isFetching: loadingEdit } = useGetPresupuestoDetailQuery(editingId, {
    skip: !editingId,
  });

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
  const [estado, setEstado] = useState('borrador');
  const [templateId, setTemplateId] = useState('');
  const [lineas, setLineas] = useState([emptyLine()]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const resetForm = () => {
    setEditingId(null);
    setClienteId('');
    setDireccion('');
    setCiudad('Barcelona');
    setFecha(new Date().toISOString().slice(0, 10));
    setValidezDias(30);
    setGarantiaMeses(12);
    setNotas('');
    setPestType('');
    setSeverity('');
    setTipoPropiedad('Residencial');
    setEstado('borrador');
    setTemplateId('');
    setLineas([emptyLine()]);
    setError('');
  };

  const loadForEdit = (item) => {
    setEditingId(item.id);
    setError('');
    setSuccess('');
  };

  React.useEffect(() => {
    if (!editDetail || !editingId) return;
    setClienteId(String(editDetail.cliente));
    setDireccion(editDetail.direccion || '');
    setCiudad(editDetail.ciudad || 'Barcelona');
    setValidezDias(30);
    setGarantiaMeses(editDetail.garantia_meses || 12);
    setNotas(editDetail.notas || '');
    setPestType(editDetail.pest_type || '');
    setSeverity(editDetail.severity || '');
    setTipoPropiedad(editDetail.tipo_propiedad || 'Residencial');
    setEstado(editDetail.estado || 'borrador');
    setTemplateId('');
    setLineas(
      (editDetail.detalles || []).map((d) => ({
        concepto: d.concepto || d.line_label || '',
        descripcion: d.descripcion || '',
        precio: d.precio_unitario,
        cantidad: d.cantidad,
      })),
    );
    if (!editDetail.detalles?.length) setLineas([emptyLine()]);
  }, [editDetail, editingId]);

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

  const buildLineasPayload = () =>
    lineas
      .map((line) => ({
        concepto: line.concepto.trim(),
        descripcion: (line.descripcion || '').trim(),
        precio: parseFloat(line.precio),
        cantidad: parseInt(line.cantidad, 10) || 1,
      }))
      .filter((line) => line.concepto && line.precio > 0);

  const buildNewPayload = () => ({
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
    lineas: buildLineasPayload(),
  });

  const validateNewForm = () => {
    const lineasPayload = buildLineasPayload();
    if (!lineasPayload.length) {
      setError('Afegeix almenys una línia amb concepte i preu.');
      return null;
    }
    if (!clienteId) {
      setError('Selecciona un client de la base de dades.');
      return null;
    }
    return buildNewPayload();
  };

  const handleSaveNew = async () => {
    setError('');
    setSuccess('');
    const payload = validateNewForm();
    if (!payload) return;

    try {
      const created = await createPresupuesto(payload).unwrap();
      setSuccess(`Pressupost #${String(created.id).padStart(4, '0')} desat correctament.`);
      refetch();
      resetForm();
    } catch (err) {
      setError(err.data?.detail || err.message || 'No s\'ha pogut desar el pressupost.');
    }
  };

  const handleSaveAndPdf = async () => {
    setError('');
    setSuccess('');
    const payload = validateNewForm();
    if (!payload) return;

    try {
      const result = await createPdf(payload).unwrap();
      const filename = `pressupost-cecsa-${String(result.id || 'nou').padStart(4, '0')}.pdf`;
      downloadBlob(result.blob, filename);
      setSuccess('Pressupost desat i PDF descarregat.');
      refetch();
      resetForm();
    } catch (err) {
      setError(err.message || 'No s\'ha pogut generar el pressupost.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const lineasPayload = buildLineasPayload();
    if (!lineasPayload.length) {
      setError('Afegeix almenys una línia amb concepte i preu.');
      return;
    }

    if (editingId) {
      try {
        await updatePresupuesto({
          id: editingId,
          lineas: lineasPayload,
          validez_dias: Number(validezDias),
          garantia_meses: Number(garantiaMeses),
          notas,
          estado,
          direccion,
          ciudad,
          tipo_propiedad: tipoPropiedad,
        }).unwrap();
        setSuccess('Pressupost actualitzat correctament.');
        refetch();
      } catch (err) {
        setError(err.data?.detail || err.message || 'No s\'ha pogut actualitzar el pressupost.');
      }
      return;
    }

    await handleSaveNew();
  };

  const handleDownloadExisting = async (id) => {
    setDownloadingId(id);
    setError('');
    try {
      const blob = await downloadPdf(id).unwrap();
      downloadBlob(blob, `pressupost-cecsa-${String(id).padStart(4, '0')}.pdf`);
    } catch {
      setError('No s\'ha pogut descarregar el PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (item) => {
    const ok = window.confirm(
      `Eliminar el pressupost #${String(item.id).padStart(4, '0')} de ${item.cliente_nombre}?`,
    );
    if (!ok) return;
    setError('');
    try {
      await deletePresupuesto(item.id).unwrap();
      if (editingId === item.id) resetForm();
      refetch();
    } catch (err) {
      setError(err.data?.detail || 'No s\'ha pogut eliminar el pressupost.');
    }
  };

  const openSendModal = (item) => {
    setSendTarget(item);
    setSendEmailValue(item.cliente_email || '');
    setSendSubject(`Pressupost CECSA #${String(item.id).padStart(4, '0')}`);
    setSendBody('');
    setError('');
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!sendTarget) return;
    setError('');
    try {
      await sendEmail({
        id: sendTarget.id,
        email: sendEmailValue.trim(),
        subject: sendSubject.trim(),
        body: sendBody.trim(),
      }).unwrap();
      setSuccess(`Pressupost enviat a ${sendEmailValue.trim()}.`);
      setSendTarget(null);
      refetch();
    } catch (err) {
      setError(err.data?.detail || err.message || 'No s\'ha pogut enviar el correu.');
    }
  };

  const isSaving = creating || updating || saving;

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-primary-gray uppercase tracking-tight">
            Pressupostos
          </h2>
          <p className="text-primary-gray/40 font-medium text-sm">
            Pressupostos del Bio-Assistent i creació manual — edita, envia o elimina
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
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary-gray/50">
              {editingId ? `Editar #${String(editingId).padStart(4, '0')}` : 'Nou pressupost'}
            </h3>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-primary-gray/50 hover:text-primary-gray"
              >
                <X size={14} />
                Cancel·lar
              </button>
            )}
          </div>

          {editingId && loadingEdit && (
            <p className="text-sm text-primary-gray/40 animate-pulse">Carregant dades...</p>
          )}

          {!editingId && (
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
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!editingId && (
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
            )}

            {editingId && (
              <label className="block space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-gray/40">
                  Estat
                </span>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-primary-gray focus:outline-none focus:border-primary-blue"
                >
                  {Object.entries(ESTADO_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {!editingId && (
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
            )}

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

          <div className="sticky bottom-0 z-10 -mx-6 md:-mx-10 px-6 md:px-10 py-4 bg-white/95 backdrop-blur-sm border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            {editingId ? (
              <button
                type="submit"
                disabled={isSaving || loadingEdit}
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-xs font-black uppercase tracking-widest text-white disabled:opacity-60"
                style={{ background: 'var(--primary-blue)' }}
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Pencil size={16} />
                )}
                Desar canvis
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-xs font-black uppercase tracking-widest text-white disabled:opacity-60 flex-1 sm:flex-none"
                  style={{ background: 'var(--accent-green)' }}
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Desar pressupost
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndPdf}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-xs font-black uppercase tracking-widest text-white disabled:opacity-60 flex-1 sm:flex-none"
                  style={{ background: 'var(--primary-blue)' }}
                >
                  {creating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  Desar i PDF
                </button>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm font-bold text-red-500 bg-red-50 rounded-2xl px-4 py-3">{error}</p>
          )}
          {success && (
            <p className="text-sm font-bold text-emerald-600 bg-emerald-50 rounded-2xl px-4 py-3">
              {success}
            </p>
          )}
        </form>

        <section className="xl:col-span-2 bg-white rounded-3xl md:rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-50">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary-gray/50">
              Tots els pressupostos
            </h3>
          </div>
          <div className="divide-y divide-gray-50 flex-1 overflow-y-auto max-h-[900px]">
            {listLoading ? (
              <p className="p-8 text-center text-primary-gray/40 text-sm font-bold animate-pulse">
                Carregant...
              </p>
            ) : !presupuestos?.length ? (
              <p className="p-8 text-center text-primary-gray/40 text-sm">
                Encara no hi ha pressupostos. Els del Bio-Assistent apareixeran aquí automàticament.
              </p>
            ) : (
              presupuestos.map((item) => (
                <div key={item.id} className="px-6 py-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-primary-gray truncate flex items-center gap-2">
                        #{String(item.id).padStart(4, '0')} — {item.cliente_nombre}
                        {item.origen === 'agent' ? (
                          <Bot size={14} className="text-primary-blue shrink-0" title="Bio-Assistent" />
                        ) : (
                          <User size={14} className="text-primary-gray/30 shrink-0" title="Admin" />
                        )}
                      </p>
                      <p className="text-xs text-primary-gray/40 mt-1">
                        {formatMoney(item.total_monto)} · {formatDate(item.created_at)}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gray-100 text-primary-gray/60">
                        {ESTADO_LABELS[item.estado] || item.estado}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => loadForEdit(item)}
                      className="p-2 rounded-xl text-primary-gray/60 hover:bg-gray-50 hover:text-primary-blue"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openSendModal(item)}
                      className="p-2 rounded-xl text-primary-gray/60 hover:bg-gray-50 hover:text-accent-green"
                      title="Enviar per correu"
                    >
                      <Mail size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadExisting(item.id)}
                      disabled={downloadingId === item.id}
                      className="p-2 rounded-xl text-primary-blue hover:bg-primary-blue/5"
                      title="Descarregar PDF"
                    >
                      {downloadingId === item.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Download size={16} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="p-2 rounded-xl text-red-400 hover:bg-red-50"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {sendTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form
            onSubmit={handleSendEmail}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-md p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-primary-gray">
                Enviar pressupost #{String(sendTarget.id).padStart(4, '0')}
              </h3>
              <button type="button" onClick={() => setSendTarget(null)} className="text-primary-gray/40">
                <X size={20} />
              </button>
            </div>
            <label className="block space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-gray/40">
                Correu del client *
              </span>
              <input
                type="email"
                required
                value={sendEmailValue}
                onChange={(e) => setSendEmailValue(e.target.value)}
                placeholder="client@exemple.cat"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-gray/40">
                Assumpte
              </span>
              <input
                type="text"
                value={sendSubject}
                onChange={(e) => setSendSubject(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-gray/40">
                Missatge (opcional)
              </span>
              <textarea
                rows={4}
                value={sendBody}
                onChange={(e) => setSendBody(e.target.value)}
                placeholder="Text personalitzat (si es deixa buit, s'usa la plantilla per defecte)"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm resize-none"
              />
            </label>
            <button
              type="submit"
              disabled={sending}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-xs font-black uppercase tracking-widest text-white disabled:opacity-60"
              style={{ background: 'var(--accent-green)' }}
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
              Enviar PDF per correu
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PresupuestosManager;
