import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Camera, Plus, RefreshCcw, Trash2, UserCog, X } from 'lucide-react';
import API_BASE from '@/config/api';

const EMPTY_FORM = {
  name: '',
  role: 'Tècnic',
  active: true,
  serviceIds: ['primera-revisio'],
  photoFile: null,
  photoPreview: '',
};

function initials(name) {
  return (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
}

function StaffAvatar({ name, photoUrl, size = 44 }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover border border-gray-100 shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-primary-blue/10 text-primary-blue flex items-center justify-center font-black text-xs shrink-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

const TechniciansManager = () => {
  const token = useSelector((state) => state.auth.token);
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const createPhotoRef = useRef(null);
  const editPhotoRefs = useRef({});

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [staffRes, svcRes] = await Promise.all([
        fetch(`${API_BASE}/api/agenda/admin/staff?all=1`, {
          headers: { Authorization: `Token ${token}` },
        }),
        fetch(`${API_BASE}/api/agenda/admin/services`, {
          headers: { Authorization: `Token ${token}` },
        }),
      ]);
      const staffData = await staffRes.json();
      const svcData = await svcRes.json();
      if (!staffRes.ok) throw new Error(staffData.error || 'Error carregant tècnics');
      setStaff(Array.isArray(staffData.staff) ? staffData.staff : []);
      setServices(Array.isArray(svcData.services) ? svcData.services : []);
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (form.photoPreview) URL.revokeObjectURL(form.photoPreview);
    };
  }, [form.photoPreview]);

  const setCreatePhoto = (file) => {
    setForm((f) => {
      if (f.photoPreview) URL.revokeObjectURL(f.photoPreview);
      if (!file) return { ...f, photoFile: null, photoPreview: '' };
      return {
        ...f,
        photoFile: file,
        photoPreview: URL.createObjectURL(file),
      };
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError('');
    try {
      const body = new FormData();
      body.append('name', form.name.trim());
      body.append('role', form.role.trim());
      body.append('active', form.active ? 'true' : 'false');
      body.append('serviceIds', JSON.stringify(form.serviceIds));
      if (form.photoFile) body.append('photo', form.photoFile);

      const res = await fetch(`${API_BASE}/api/agenda/admin/staff`, {
        method: 'POST',
        headers: { Authorization: `Token ${token}` },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No s'ha pogut crear");
      setCreatePhoto(null);
      setForm(EMPTY_FORM);
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
      const res = await fetch(`${API_BASE}/api/agenda/admin/staff/${item.id}`, {
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

  const deleteStaff = async (item) => {
    const ok = window.confirm(
      `Eliminar el tècnic «${item.name}»? Les cites existents es conservaran sense assignar.`,
    );
    if (!ok) return;
    setDeletingId(item.id);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/agenda/admin/staff/${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No s'ha pogut eliminar");
      }
      await load();
    } catch (err) {
      setError(err.message || 'Error');
    } finally {
      setDeletingId('');
    }
  };

  const uploadPhoto = async (item, file) => {
    if (!file) return;
    setUploadingId(item.id);
    setError('');
    try {
      const body = new FormData();
      body.append('photo', file);
      const res = await fetch(`${API_BASE}/api/agenda/admin/staff/${item.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Token ${token}` },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No s'ha pogut pujar la foto");
      await load();
    } catch (err) {
      setError(err.message || 'Error');
    } finally {
      setUploadingId('');
    }
  };

  const clearPhoto = async (item) => {
    setUploadingId(item.id);
    setError('');
    try {
      const body = new FormData();
      body.append('clearPhoto', 'true');
      const res = await fetch(`${API_BASE}/api/agenda/admin/staff/${item.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Token ${token}` },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No s'ha pogut eliminar la foto");
      await load();
    } catch (err) {
      setError(err.message || 'Error');
    } finally {
      setUploadingId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 px-1">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-primary-gray uppercase tracking-tight">
            Tècnics
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-primary-gray/40 mt-1">
            Columnes de l&apos;agenda · disponibilitat
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-primary-gray/5 text-primary-gray hover:bg-primary-gray/10"
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
          className="lg:col-span-1 bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <UserCog className="text-primary-blue" size={20} />
            <h3 className="font-black text-primary-gray uppercase tracking-tight text-sm">
              Nou tècnic
            </h3>
          </div>

          <div className="flex flex-col items-center gap-3 py-2">
            <button
              type="button"
              onClick={() => createPhotoRef.current?.click()}
              className="relative group"
              aria-label="Afegir foto del tècnic"
            >
              <StaffAvatar
                name={form.name || 'T'}
                photoUrl={form.photoPreview}
                size={88}
              />
              <span className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera size={22} />
              </span>
            </button>
            <input
              ref={createPhotoRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => setCreatePhoto(e.target.files?.[0] || null)}
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => createPhotoRef.current?.click()}
                className="text-[10px] font-black uppercase tracking-widest text-primary-blue hover:underline"
              >
                {form.photoFile ? 'Canviar foto' : 'Pujar foto'}
              </button>
              {form.photoFile && (
                <button
                  type="button"
                  onClick={() => {
                    setCreatePhoto(null);
                    if (createPhotoRef.current) createPhotoRef.current.value = '';
                  }}
                  className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary-gray/40 hover:text-red-500"
                >
                  <X size={12} /> Treure
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-primary-gray/40">
              Nom
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium"
              placeholder="Ex: Joan Martínez"
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-primary-gray/40">
              Rol
            </label>
            <input
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-primary-gray/40">
              Serveis
            </label>
            <div className="mt-2 space-y-2">
              {services.map((svc) => {
                const checked = form.serviceIds.includes(svc.id);
                return (
                  <label key={svc.id} className="flex items-center gap-2 text-sm font-medium text-primary-gray">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setForm((f) => ({
                          ...f,
                          serviceIds: checked
                            ? f.serviceIds.filter((id) => id !== svc.id)
                            : [...f.serviceIds, svc.id],
                        }))
                      }
                    />
                    {svc.nameEs || svc.nameCa} ({svc.durationMinutes} min)
                  </label>
                );
              })}
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest bg-accent-green text-white hover:bg-accent-green-hv disabled:opacity-40"
          >
            <Plus size={16} /> {saving ? 'Creant…' : 'Afegir tècnic'}
          </button>
        </form>

        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h3 className="font-black text-primary-gray uppercase tracking-tight text-sm">
              Equip actiu
            </h3>
          </div>
          {loading ? (
            <p className="p-10 text-center text-primary-gray/40 font-bold uppercase tracking-widest text-xs animate-pulse">
              Carregant…
            </p>
          ) : staff.length === 0 ? (
            <p className="p-10 text-center text-primary-gray/40 font-medium">
              Cap tècnic encara.
            </p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {staff.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="px-6 py-4 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <StaffAvatar name={item.name} photoUrl={item.photoUrl} size={48} />
                    <div className="min-w-0">
                      <p className="font-black text-primary-gray truncate">{item.name}</p>
                      <p className="text-xs text-primary-gray/40 font-medium mt-1 truncate">
                        {item.role || 'Sense rol'} · {item.id}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          type="button"
                          disabled={uploadingId === item.id}
                          onClick={() => editPhotoRefs.current[item.id]?.click()}
                          className="text-[10px] font-black uppercase tracking-widest text-primary-blue hover:underline disabled:opacity-40"
                        >
                          {uploadingId === item.id
                            ? 'Pujant…'
                            : item.photoUrl
                              ? 'Canviar foto'
                              : 'Pujar foto'}
                        </button>
                        {item.photoUrl && (
                          <button
                            type="button"
                            disabled={uploadingId === item.id}
                            onClick={() => clearPhoto(item)}
                            className="text-[10px] font-black uppercase tracking-widest text-primary-gray/40 hover:text-red-500 disabled:opacity-40"
                          >
                            Eliminar foto
                          </button>
                        )}
                        <input
                          ref={(el) => {
                            editPhotoRefs.current[item.id] = el;
                          }}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = '';
                            if (file) uploadPhoto(item, file);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        item.active
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-500'
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
                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => deleteStaff(item)}
                      className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-500 hover:underline disabled:opacity-40"
                    >
                      <Trash2 size={12} />
                      {deletingId === item.id ? 'Eliminant…' : 'Eliminar'}
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

export default TechniciansManager;
