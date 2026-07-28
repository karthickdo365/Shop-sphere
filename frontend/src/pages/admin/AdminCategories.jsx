import { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, Edit, X, Upload, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api.js';

const emptyForm = { name: '', slug: '', description: '', image: '' };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'upload'
  const fileRef = useRef(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const r = await api.get('/categories');
      setCategories(r.data.data);
    } catch (e) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setUploadMode('url');
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, description: c.description || '', image: c.image || '' });
    setUploadMode('url');
    setModalOpen(true);
  };

  const handleDelete = async (c) => {
    if (!confirm(`Delete "${c.name}"? All products in this category will also be deleted.`)) return;
    try {
      await api.delete(`/categories/${c.id}`);
      toast.success('Category deleted');
      fetch();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete');
    }
  };

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const r = await api.post('/uploads', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((f) => ({ ...f, image: r.data.data.url }));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description.trim(),
        image: form.image.trim() || null,
      };
      if (editing) {
        await api.put(`/categories/${editing.id}`, payload);
        toast.success('Category updated');
      } else {
        await api.post('/categories', payload);
        toast.success('Category created');
      }
      setModalOpen(false);
      fetch();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save');
    }
  };

  return (
    <div className="admin-categories">
      <div className="page-header">
        <div>
          <h1>Categories</h1>
          <p>{categories.length} categories</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : (
        <div className="cat-grid">
          {categories.map((c) => (
            <div key={c.id} className="cat-card">
              <div className="cat-img">
                {c.image ? <img src={c.image} alt={c.name} /> : <div className="no-img">No Image</div>}
              </div>
              <div className="cat-info">
                <h3>{c.name}</h3>
                <p className="cat-slug">{c.slug}</p>
                <p className="cat-count">{c._count?.products || 0} products</p>
                <div className="cat-actions">
                  <button onClick={() => openEdit(c)} className="icon-action edit"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(c)} className="icon-action delete"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="modal-body">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Slug (leave blank to auto-generate)</label>
                <input className="form-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated from name" />
              </div>

              {/* Image: URL or Upload */}
              <div className="form-group">
                <div className="image-mode-tabs">
                  <button
                    type="button"
                    className={`mode-tab ${uploadMode === 'url' ? 'active' : ''}`}
                    onClick={() => setUploadMode('url')}
                  >
                    <LinkIcon size={14} /> URL
                  </button>
                  <button
                    type="button"
                    className={`mode-tab ${uploadMode === 'upload' ? 'active' : ''}`}
                    onClick={() => setUploadMode('upload')}
                  >
                    <Upload size={14} /> Upload Photo
                  </button>
                </div>

                {uploadMode === 'url' ? (
                  <input
                    className="form-input"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://..."
                  />
                ) : (
                  <div className="upload-area">
                    <input
                      type="file"
                      ref={fileRef}
                      onChange={onFileChange}
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="upload-btn"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                    >
                      <Upload size={16} /> {uploading ? 'Uploading...' : 'Choose Image'}
                    </button>
                    <p className="upload-hint">JPG, PNG, WEBP — max 5MB</p>
                  </div>
                )}

                {form.image && (
                  <div className="image-preview">
                    <img src={form.image} alt="Preview" />
                    <button
                      type="button"
                      className="remove-img"
                      onClick={() => setForm({ ...form, image: '' })}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-categories { max-width: 1200px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .page-header h1 { font-size: 26px; font-weight: 700; }
        .page-header p { color: var(--color-text-light); font-size: 14px; margin-top: 4px; }
        .cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
        .cat-card {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .cat-img { aspect-ratio: 16/10; background: var(--color-light-gray); }
        .cat-img img { width: 100%; height: 100%; object-fit: cover; }
        .no-img { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--color-text-light); font-size: 12px; }
        .cat-info { padding: 14px; position: relative; }
        .cat-info h3 { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
        .cat-slug { font-size: 12px; color: var(--color-text-light); }
        .cat-count { font-size: 12px; color: var(--color-accent); margin-top: 6px; font-weight: 500; }
        .cat-actions { position: absolute; top: 12px; right: 12px; display: flex; gap: 4px; }
        .icon-action {
          width: 26px; height: 26px;
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.9);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          color: var(--color-text);
        }
        .icon-action.edit:hover { background: var(--color-accent); color: #fff; }
        .icon-action.delete:hover { background: #dc2626; color: #fff; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: flex-start; justify-content: center; padding: 20px; overflow-y: auto; }
        .modal { background: #fff; border-radius: 12px; width: 100%; max-width: 480px; margin: 20px 0; }
        .modal-header { padding: 18px 24px; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; }
        .modal-header h2 { font-size: 18px; font-weight: 600; }
        .modal-header button { color: var(--color-text-light); padding: 4px; }
        .modal-body { padding: 24px; }
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; }
        .form-input, .form-textarea {
          width: 100%; padding: 10px 12px;
          border: 1px solid var(--color-border); border-radius: 6px;
          font-size: 14px;
        }
        .form-textarea { resize: vertical; }
        .image-mode-tabs {
          display: flex;
          gap: 0;
          margin-bottom: 10px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          overflow: hidden;
          width: fit-content;
        }
        .mode-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 500;
          background: #fff;
          color: var(--color-text-light);
          border-radius: 0;
        }
        .mode-tab.active {
          background: var(--color-accent);
          color: #fff;
        }
        .upload-area {
          border: 1px dashed var(--color-border);
          border-radius: 6px;
          padding: 20px;
          text-align: center;
        }
        .upload-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: var(--color-accent);
          color: #fff;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
        }
        .upload-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .upload-hint { font-size: 11px; color: var(--color-text-light); margin-top: 8px; }
        .image-preview {
          position: relative;
          margin-top: 10px;
          display: inline-block;
        }
        .image-preview img {
          width: 120px;
          height: 80px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid var(--color-border);
        }
        .remove-img {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 22px;
          height: 22px;
          background: var(--color-accent);
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-footer { padding-top: 16px; border-top: 1px solid var(--color-border); display: flex; justify-content: flex-end; gap: 10px; }
      `}</style>
    </div>
  );
}
