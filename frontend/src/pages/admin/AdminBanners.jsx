import { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, Edit, X, Upload, Link as LinkIcon, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api.js';

const emptyForm = {
  title: '',
  subtitle: '',
  imageUrl: '',
  linkUrl: '',
  position: 0,
  isActive: true,
  startsAt: '',
  endsAt: '',
};

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState('url');
  const fileRef = useRef(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const r = await api.get('/banners/admin/all');
      setBanners(r.data.data);
    } catch (e) {
      toast.error('Failed to load banners');
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

  const openEdit = (b) => {
    setEditing(b);
    setForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      imageUrl: b.imageUrl || '',
      linkUrl: b.linkUrl || '',
      position: b.position ?? 0,
      isActive: b.isActive,
      startsAt: b.startsAt ? new Date(b.startsAt).toISOString().slice(0, 16) : '',
      endsAt: b.endsAt ? new Date(b.endsAt).toISOString().slice(0, 16) : '',
    });
    setUploadMode('url');
    setModalOpen(true);
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
      setForm((f) => ({ ...f, imageUrl: r.data.data.url }));
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
    if (!form.title.trim() || !form.imageUrl.trim()) {
      toast.error('Title and image are required');
      return;
    }
    try {
      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        imageUrl: form.imageUrl.trim(),
        linkUrl: form.linkUrl.trim() || null,
        position: Number(form.position) || 0,
        isActive: form.isActive,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      };
      if (editing) {
        await api.put(`/banners/${editing.id}`, payload);
        toast.success('Banner updated');
      } else {
        await api.post('/banners', payload);
        toast.success('Banner created');
      }
      setModalOpen(false);
      fetch();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (b) => {
    if (!confirm(`Delete banner "${b.title}"?`)) return;
    try {
      await api.delete(`/banners/${b.id}`);
      toast.success('Banner deleted');
      fetch();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const toggleActive = async (b) => {
    try {
      await api.patch(`/banners/${b.id}/toggle`);
      fetch();
    } catch (e) {
      toast.error('Failed to toggle');
    }
  };

  return (
    <div className="admin-banners">
      <div className="page-header">
        <div>
          <h1>Banners</h1>
          <p>{banners.length} banners • {banners.filter(b => b.isActive).length} active</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Add Banner
        </button>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : banners.length === 0 ? (
        <div className="empty-state">
          <ImageIcon size={48} color="#ccc" />
          <h3>No banners yet</h3>
          <p>Banners appear as a carousel on the home page.</p>
          <button className="btn btn-primary" onClick={openCreate}>Create First Banner</button>
        </div>
      ) : (
        <div className="banner-list">
          {banners.map((b) => (
            <div key={b.id} className={`banner-row ${!b.isActive ? 'inactive' : ''}`}>
              <div className="banner-thumb">
                <img src={b.imageUrl} alt={b.title} />
                <span className={`status-dot ${b.isActive ? 'active' : 'inactive'}`} />
              </div>
              <div className="banner-info">
                <h3>{b.title}</h3>
                {b.subtitle && <p className="banner-sub">{b.subtitle}</p>}
                <div className="banner-meta">
                  <span>Position: {b.position}</span>
                  {b.linkUrl && <span><LinkIcon size={11} /> Links to: {b.linkUrl}</span>}
                  {b.startsAt && <span>Starts: {new Date(b.startsAt).toLocaleString('en-IN')}</span>}
                  {b.endsAt && <span>Ends: {new Date(b.endsAt).toLocaleString('en-IN')}</span>}
                </div>
              </div>
              <div className="banner-actions">
                <button
                  className="icon-action"
                  onClick={() => toggleActive(b)}
                  title={b.isActive ? 'Hide' : 'Show'}
                >
                  {b.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button className="icon-action edit" onClick={() => openEdit(b)} title="Edit">
                  <Edit size={16} />
                </button>
                <button className="icon-action delete" onClick={() => handleDelete(b)} title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Banner' : 'Add Banner'}</h2>
              <button onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="modal-body">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  className="form-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Mega Electronics Sale"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Subtitle</label>
                <input
                  className="form-input"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="e.g. Up to 70% off on mobiles, laptops & more"
                />
              </div>

              {/* Image: URL or Upload */}
              <div className="form-group">
                <label className="form-label">Banner Image *</label>
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
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
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
                    <p className="upload-hint">JPG, PNG, WEBP — max 5MB. Recommended size: 1600×500</p>
                  </div>
                )}
                {form.imageUrl && (
                  <div className="image-preview banner-preview">
                    <img src={form.imageUrl} alt="Preview" />
                    <button
                      type="button"
                      className="remove-img"
                      onClick={() => setForm({ ...form, imageUrl: '' })}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Link URL (optional)</label>
                <input
                  className="form-input"
                  value={form.linkUrl}
                  onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                  placeholder="/category/mobiles or https://..."
                />
                <p className="hint">Where users go when they click the banner. Use relative paths like /category/mobiles for internal links.</p>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Position (lower = first)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
                    min={0}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <label className="checkbox-pill">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    Active (show on home page)
                  </label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date (optional)</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={form.startsAt}
                    onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date (optional)</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={form.endsAt}
                    onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                  />
                </div>
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
        .admin-banners { max-width: 1000px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .page-header h1 { font-size: 26px; font-weight: 700; }
        .page-header p { color: var(--color-text-light); font-size: 14px; margin-top: 4px; }
        .empty-state {
          background: #fff;
          padding: 60px 20px;
          text-align: center;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .empty-state h3 { font-size: 18px; }
        .empty-state p { color: var(--color-text-light); font-size: 14px; }
        .banner-list { display: flex; flex-direction: column; gap: 12px; }
        .banner-row {
          display: grid;
          grid-template-columns: 200px 1fr auto;
          gap: 16px;
          align-items: center;
          padding: 12px;
          background: #fff;
          border: 1px solid var(--color-border);
          border-radius: 10px;
          transition: opacity 0.2s;
        }
        .banner-row.inactive { opacity: 0.55; }
        .banner-thumb {
          position: relative;
          width: 200px;
          height: 70px;
          border-radius: 6px;
          overflow: hidden;
          background: var(--color-light-gray);
        }
        .banner-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .status-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid #fff;
        }
        .status-dot.active { background: var(--color-success); }
        .status-dot.inactive { background: #999; }
        .banner-info h3 { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
        .banner-sub { font-size: 12px; color: var(--color-text-light); margin-bottom: 6px; }
        .banner-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 11px;
          color: var(--color-text-light);
        }
        .banner-meta span { display: inline-flex; align-items: center; gap: 4px; }
        .banner-actions { display: flex; gap: 6px; }
        .icon-action {
          width: 34px; height: 34px;
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          background: var(--color-light-gray);
          color: var(--color-text);
          transition: all 0.2s;
        }
        .icon-action.edit:hover { background: var(--color-accent); color: #fff; }
        .icon-action.delete:hover { background: #dc2626; color: #fff; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: flex-start; justify-content: center; padding: 20px; overflow-y: auto; }
        .modal { background: #fff; border-radius: 12px; width: 100%; max-width: 560px; margin: 20px 0; }
        .modal-header { padding: 18px 24px; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: #fff; z-index: 1; border-radius: 12px 12px 0 0; }
        .modal-header h2 { font-size: 18px; font-weight: 600; }
        .modal-header button { color: var(--color-text-light); padding: 4px; }
        .modal-body { padding: 24px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; }
        .form-input {
          width: 100%; padding: 10px 12px;
          border: 1px solid var(--color-border); border-radius: 6px;
          font-size: 14px;
        }
        .hint { font-size: 11px; color: var(--color-text-light); margin-top: 4px; }
        .image-mode-tabs {
          display: flex;
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
        }
        .mode-tab.active { background: var(--color-accent); color: #fff; }
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
        .banner-preview { width: 100%; max-width: 320px; }
        .banner-preview img { width: 100%; height: 100px; object-fit: cover; border-radius: 6px; border: 1px solid var(--color-border); }
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
        .checkbox-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--color-light-gray);
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
        }
        .checkbox-pill input { margin: 0; }
        .modal-footer { padding-top: 16px; border-top: 1px solid var(--color-border); display: flex; justify-content: flex-end; gap: 10px; }
        @media (max-width: 700px) {
          .banner-row { grid-template-columns: 1fr; }
          .banner-thumb { width: 100%; height: 100px; }
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
