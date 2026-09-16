import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Newspaper, Plus, Pencil, Trash2, RefreshCcw, ExternalLink, X } from 'lucide-react';
import {
  useGetBlogArticlesQuery,
  useCreateBlogArticleMutation,
  useUpdateBlogArticleMutation,
  useDeleteBlogArticleMutation,
} from '@/store/apis/blogApi';
import { getBlogCategories } from '@/components/Blog/blogData';
import BlogMarkdownEditor from '@/components/Admin/BlogMarkdownEditor';

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  category: 'prevencion',
  author: 'Equipo Técnico CECSA',
  image: '/assets/cockroach-focus.webp',
  read_time_minutes: 5,
  published_at: new Date().toISOString().slice(0, 10),
  is_published: true,
  meta_description: '',
};

const BlogManager = () => {
  const { data: articles = [], isLoading, isError, refetch } = useGetBlogArticlesQuery({ all: true });
  const [createArticle, { isLoading: creating }] = useCreateBlogArticleMutation();
  const [updateArticle, { isLoading: updating }] = useUpdateBlogArticleMutation();
  const [deleteArticle] = useDeleteBlogArticleMutation();

  const [form, setForm] = useState(emptyForm);
  const [editingSlug, setEditingSlug] = useState(null);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const categories = useMemo(
    () => getBlogCategories().filter((c) => c.id !== 'all'),
    []
  );

  const resetForm = () => {
    setForm(emptyForm);
    setEditingSlug(null);
    setShowForm(false);
    setError('');
  };

  const startEdit = (article) => {
    setEditingSlug(article.slug);
    setForm({
      title: article.title || '',
      slug: article.slug || '',
      excerpt: article.excerpt || '',
      body: article.body || '',
      category: article.category || 'prevencion',
      author: article.author || '',
      image: article.image || '',
      read_time_minutes: article.read_time_minutes || 5,
      published_at: article.published_at || '',
      is_published: !!article.is_published,
      meta_description: article.meta_description || '',
    });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.excerpt.trim() || !form.body.trim()) {
      setError('Títol, extracte i cos són obligatoris');
      return;
    }
    setError('');
    const payload = {
      ...form,
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      excerpt: form.excerpt.trim(),
      body: form.body.trim(),
      author: form.author.trim() || 'Equipo Técnico CECSA',
      image: form.image.trim() || '/assets/cockroach-focus.webp',
      read_time_minutes: Number(form.read_time_minutes) || 5,
      published_at: form.published_at || null,
      meta_description: form.meta_description.trim(),
    };

    try {
      if (editingSlug) {
        await updateArticle({ slug: editingSlug, ...payload }).unwrap();
      } else {
        await createArticle(payload).unwrap();
      }
      resetForm();
    } catch (err) {
      const data = err?.data;
      const msg =
        (typeof data === 'string' && data) ||
        data?.detail ||
        data?.title?.[0] ||
        data?.slug?.[0] ||
        err?.error ||
        "No s'ha pogut desar";
      setError(msg);
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm('Eliminar aquest article?')) return;
    setError('');
    try {
      await deleteArticle(slug).unwrap();
      if (editingSlug === slug) resetForm();
    } catch (err) {
      setError(err?.data?.detail || "No s'ha pogut eliminar");
    }
  };

  const togglePublished = async (article) => {
    setError('');
    try {
      await updateArticle({
        slug: article.slug,
        is_published: !article.is_published,
      }).unwrap();
    } catch (err) {
      setError(err?.data?.detail || "No s'ha pogut actualitzar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 px-1">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-admin-text uppercase tracking-tight">
            Blog
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-admin-text-muted mt-1">
            Articles públics · CRUD
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-primary-gray/5 text-admin-text hover:bg-primary-gray/10"
          >
            <RefreshCcw size={14} /> Actualitzar
          </button>
          <button
            type="button"
            onClick={() => {
              setForm(emptyForm);
              setEditingSlug(null);
              setShowForm(true);
              setError('');
            }}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-primary-blue text-white hover:bg-primary-blue-hv"
          >
            <Plus size={14} /> Nou article
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 text-red-600 px-4 py-3 text-sm font-bold">
          {error}
        </div>
      )}

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-admin-card rounded-[2rem] border border-admin-border shadow-sm p-6 md:p-8 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary-blue">
              {editingSlug ? 'Editar article' : 'Nou article'}
            </h3>
            <button type="button" onClick={resetForm} className="p-2 text-admin-text-muted hover:text-admin-text">
              <X size={18} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="space-y-1 md:col-span-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Títol</span>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-xl border border-admin-border bg-bg-light px-4 py-3 text-sm font-semibold"
                required
              />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Slug (opcional)</span>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className="w-full rounded-xl border border-admin-border bg-bg-light px-4 py-3 text-sm font-semibold"
                placeholder="auto des del títol"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Categoria</span>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-xl border border-admin-border bg-bg-light px-4 py-3 text-sm font-semibold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Autor</span>
              <input
                value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                className="w-full rounded-xl border border-admin-border bg-bg-light px-4 py-3 text-sm font-semibold"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Imatge (/assets/…)</span>
              <input
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                className="w-full rounded-xl border border-admin-border bg-bg-light px-4 py-3 text-sm font-semibold"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Minuts lectura</span>
              <input
                type="number"
                min={1}
                value={form.read_time_minutes}
                onChange={(e) => setForm((f) => ({ ...f, read_time_minutes: e.target.value }))}
                className="w-full rounded-xl border border-admin-border bg-bg-light px-4 py-3 text-sm font-semibold"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Data publicació</span>
              <input
                type="date"
                value={form.published_at || ''}
                onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))}
                className="w-full rounded-xl border border-admin-border bg-bg-light px-4 py-3 text-sm font-semibold"
              />
            </label>
            <label className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
                className="size-4 accent-[var(--primary-blue)]"
              />
              <span className="text-xs font-black uppercase tracking-widest text-admin-text-muted">Publicat</span>
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Extracte</span>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                rows={2}
                className="w-full rounded-xl border border-admin-border bg-bg-light px-4 py-3 text-sm font-semibold"
                required
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-admin-text-muted">
                Cos (editor visual · es guarda en Markdown)
              </span>
              <BlogMarkdownEditor
                contentKey={editingSlug || 'new'}
                value={form.body}
                onChange={(body) => setForm((f) => ({ ...f, body }))}
              />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Meta description (SEO)</span>
              <input
                value={form.meta_description}
                onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))}
                className="w-full rounded-xl border border-admin-border bg-bg-light px-4 py-3 text-sm font-semibold"
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-widest bg-primary-gray/5"
            >
              Cancel·lar
            </button>
            <button
              type="submit"
              disabled={creating || updating}
              className="rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-widest bg-accent-green text-primary-blue disabled:opacity-50"
            >
              {creating || updating ? 'Desant…' : editingSlug ? 'Desar canvis' : 'Crear article'}
            </button>
          </div>
        </motion.form>
      )}

      <div className="bg-admin-card rounded-[2rem] border border-admin-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-admin-text-muted font-bold">Carregant…</div>
        ) : isError ? (
          <div className="p-10 text-center text-red-500 font-bold">Error carregant articles</div>
        ) : articles.length === 0 ? (
          <div className="p-10 text-center text-admin-text-muted font-bold flex flex-col items-center gap-3">
            <Newspaper size={40} className="opacity-30" />
            Cap article encara
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {articles.map((article) => (
              <li key={article.slug} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
                <img
                  src={article.image}
                  alt=""
                  className="w-full md:w-28 h-20 object-cover rounded-2xl bg-bg-light"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-primary-blue truncate">{article.title}</h3>
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        article.is_published
                          ? 'bg-accent-green/20 text-primary-blue'
                          : 'bg-primary-gray/10 text-admin-text-muted'
                      }`}
                    >
                      {article.is_published ? 'Publicat' : 'Esborrany'}
                    </span>
                  </div>
                  <p className="text-xs text-admin-text-muted line-clamp-1">{article.excerpt}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-admin-text-muted">
                    {article.category} · {article.published_at || '—'} · /blog/{article.slug}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/blog/${article.slug}`}
                    target="_blank"
                    className="p-2 rounded-xl bg-primary-gray/5 text-admin-text hover:bg-primary-gray/10"
                    title="Obrir"
                  >
                    <ExternalLink size={16} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => togglePublished(article)}
                    className="px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-primary-blue/5 text-primary-blue"
                  >
                    {article.is_published ? 'Despublicar' : 'Publicar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(article)}
                    className="p-2 rounded-xl bg-primary-blue/5 text-primary-blue hover:bg-primary-blue/10"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(article.slug)}
                    className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BlogManager;
