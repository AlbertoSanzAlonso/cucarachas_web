import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Plus, Wrench, RefreshCcw } from 'lucide-react';
import API_BASE from '@/config/api';

const emptyForm = {
  nameCa: '',
  nameEs: '',
  nameEn: '',
  durationMinutes: 60,
  active: true,
};

const ServicesManager = () => {
  const token = useSelector((state) => state.auth.token);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/agenda/admin/services?all=1`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error carregant serveis');
      setServices(Array.isArray(data.services) ? data.services : []);
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.nameEs.trim() && !form.nameCa.trim()) return;
    setSaving(true);
    setError('');
    try {
      const nameEs = form.nameEs.trim() || form.nameCa.trim();
      const nameCa = form.nameCa.trim() || nameEs;
      const res = await fetch(`${API_BASE}/api/agenda/admin/services`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nameEs,
          nameCa,
          nameEn: form.nameEn.trim() || nameEs,
          durationMinutes: Number(form.durationMinutes) || 60,
          active: form.active,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No s'ha pogut crear");
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item) => {
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/agenda/admin/services/${item.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !item.active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No s'ha pogut actualitzar");
      await load();
    } catch (err) {
      setError(err.message || 'Error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 px-1">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-admin-text uppercase tracking-tight">
            Serveis
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-admin-text-muted mt-1">
            Catàleg bookable · durada
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-primary-gray/5 text-admin-text hover:bg-primary-gray/10"
        >
          <RefreshCcw size={14} /> Actualitzar
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 text-red-600 px-4 py-3 text-sm font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form
          onSubmit={handleCreate}
          className="lg:col-span-1 bg-admin-card rounded-[2rem] border border-admin-border shadow-sm p-6 space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="text-primary-blue" size={20} />
            <h3 className="font-black text-admin-text uppercase tracking-tight text-sm">
              Nou servei
            </h3>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-admin-text-muted">
              Nom (CA)
            </label>
            <input
              value={form.nameCa}
              onChange={(e) => setForm((f) => ({ ...f, nameCa: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-admin-border px-3 py-2 text-sm font-medium"
              placeholder="Ex: Primera revisió"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-admin-text-muted">
              Nom (ES)
            </label>
            <input
              value={form.nameEs}
              onChange={(e) => setForm((f) => ({ ...f, nameEs: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-admin-border px-3 py-2 text-sm font-medium"
              placeholder="Ex: Primera revisión"
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-admin-text-muted">
              Nom (EN)
            </label>
            <input
              value={form.nameEn}
              onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-admin-border px-3 py-2 text-sm font-medium"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-admin-text-muted">
              Durada (min)
            </label>
            <input
              type="number"
              min={15}
              max={480}
              step={15}
              value={form.durationMinutes}
              onChange={(e) =>
                setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) || 60 }))
              }
              className="mt-1 w-full rounded-xl border border-admin-border px-3 py-2 text-sm font-medium"
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest bg-accent-green text-white hover:bg-accent-green-hv disabled:opacity-40"
          >
            <Plus size={16} /> {saving ? 'Creant…' : 'Afegir servei'}
          </button>
        </form>

        <div className="lg:col-span-2 bg-admin-card rounded-[2rem] border border-admin-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-admin-border">
            <h3 className="font-black text-admin-text uppercase tracking-tight text-sm">
              Catàleg
            </h3>
          </div>
          {loading ? (
            <p className="p-10 text-center text-admin-text-muted font-bold uppercase tracking-widest text-xs animate-pulse">
              Carregant…
            </p>
          ) : services.length === 0 ? (
            <p className="p-10 text-center text-admin-text-muted font-medium">
              Cap servei encara.
            </p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {services.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="px-6 py-4 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-black text-admin-text">
                      {item.nameCa || item.nameEs}
                    </p>
                    <p className="text-xs text-admin-text-muted font-medium mt-1">
                      {item.durationMinutes} min · {item.id}
                      {item.nameEs && item.nameEs !== item.nameCa
                        ? ` · ES: ${item.nameEs}`
                        : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        item.active
                          ? 'bg-green-100 text-green-600'
                          : 'bg-admin-muted text-admin-text-muted'
                      }`}
                    >
                      {item.active ? 'Actiu' : 'Inactiu'}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleActive(item)}
                      className="text-[10px] font-black uppercase tracking-widest text-primary-blue hover:underline"
                    >
                      {item.active ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesManager;
