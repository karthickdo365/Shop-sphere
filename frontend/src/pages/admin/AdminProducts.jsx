import { useEffect, useState, useRef } from 'react';
import { Plus, Search, Edit, Trash2, X, Upload, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api.js';
import { formatPrice, getFirstImage } from '../../utils/helpers.js';
import SpecificationsEditor from '../../components/SpecificationsEditor.jsx';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['BLACK', 'BLUE', 'BEIGE', 'BURGUNDY', 'DARK GREY', 'NAVY', 'PEACOCK', 'RED', 'GREY', 'BOTTLE GREEN', 'BROWN', 'GREEN', 'WHITE', 'OLIVE'];

const emptyForm = {
  name: '',
  description: '',
  basePrice: '',
  discountPrice: '',
  categoryId: '',
  bundleAvailable: false,
  bundleLabel: 'Bundle Available',
  isFeatured: false,
  isNewArrival: false,
  isOnOffer: false,
  images: [],
  variants: [],
  specifications: [],
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.set('q', search);
      const r = await api.get(`/products/admin/all?${params.toString()}`);
      setProducts(r.data.data);
      setPagination(r.data.pagination);
    } catch (e) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const r = await api.get('/categories');
    setCategories(r.data.data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id || '' });
    setModalOpen(true);
  };

  const openEdit = async (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || '',
      basePrice: String(p.basePrice),
      discountPrice: p.discountPrice ? String(p.discountPrice) : '',
      categoryId: p.categoryId,
      bundleAvailable: p.bundleAvailable,
      bundleLabel: p.bundleLabel || 'Bundle Available',
      isFeatured: p.isFeatured,
      isNewArrival: p.isNewArrival,
      isOnOffer: p.isOnOffer,
      images: (p.images || []).map((i) => ({ url: i.url, alt: i.alt || '' })),
      variants: (p.variants || []).map((v) => ({ size: v.size, color: v.color, stock: v.stock, sku: v.sku })),
      specifications: (p.specifications || []).map((s) => ({ section: s.section, key: s.key, value: s.value })),
    });
    setModalOpen(true);
  };

  const handleDelete = async (p) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${p.id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete');
    }
  };

  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append('image', file);
    const r = await api.post('/uploads', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return r.data.data.url;
  };

  const onFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    toast.loading('Uploading images...');
    try {
      const urls = [];
      for (const f of files) {
        const url = await uploadImage(f);
        urls.push({ url, alt: '' });
      }
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
      toast.dismiss();
      toast.success(`${urls.length} image(s) uploaded`);
    } catch (e) {
      toast.dismiss();
      toast.error('Upload failed');
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeImage = (idx) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  // Multi-select size/color: toggling a size adds/removes all (size × all selected colors) variants
  const toggleSize = (size, checked) => {
    setForm((f) => {
      const selectedColors = [...new Set(f.variants.map((v) => v.color))];
      let next;
      if (checked) {
        // Add variants for this size × every selected color (or default BLACK if none)
        const colorsToAdd = selectedColors.length > 0 ? selectedColors : ['BLACK'];
        const newVariants = colorsToAdd
          .filter((c) => !f.variants.some((v) => v.size === size && v.color === c))
          .map((c) => ({ size, color: c, stock: 10, sku: '' }));
        next = [...f.variants, ...newVariants];
        // If we just added BLACK as default, also ensure other colors are reflected
        if (selectedColors.length === 0) {
          // No colors were selected — that's fine, BLACK is the default
        }
      } else {
        // Remove all variants with this size
        next = f.variants.filter((v) => v.size !== size);
      }
      return { ...f, variants: next };
    });
  };

  const toggleColor = (color, checked) => {
    setForm((f) => {
      const selectedSizes = [...new Set(f.variants.map((v) => v.size))];
      let next;
      if (checked) {
        const sizesToAdd = selectedSizes.length > 0 ? selectedSizes : ['M'];
        const newVariants = sizesToAdd
          .filter((s) => !f.variants.some((v) => v.size === s && v.color === color))
          .map((s) => ({ size: s, color, stock: 10, sku: '' }));
        next = [...f.variants, ...newVariants];
      } else {
        next = f.variants.filter((v) => v.color !== color);
      }
      return { ...f, variants: next };
    });
  };

  const updateVariant = (idx, field, value) => {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, i) => (i === idx ? { ...v, [field]: value } : v)),
    }));
  };

  const removeVariant = (idx) => {
    setForm((f) => ({ ...f, variants: f.variants.filter((_, i) => i !== idx) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.basePrice || !form.categoryId) {
      toast.error('Name, Price, and Category are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        basePrice: Number(form.basePrice),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        categoryId: form.categoryId,
        bundleAvailable: form.bundleAvailable,
        bundleLabel: form.bundleAvailable ? form.bundleLabel : null,
        isFeatured: form.isFeatured,
        isNewArrival: form.isNewArrival,
        isOnOffer: form.isOnOffer,
        images: form.images,
        variants: form.variants,
      };
      if (editing) {
        await api.put(`/products/${editing.id}`, payload);
        // Save specifications separately
        const validSpecs = form.specifications
          .filter((s) => s.section?.trim() && s.key?.trim() && s.value?.trim())
          .map((s) => ({ section: s.section.trim(), key: s.key.trim(), value: s.value.trim() }));
        await api.post(`/products/${editing.id}/specifications`, { specifications: validSpecs });
        toast.success('Product updated');
      } else {
        const r = await api.post('/products', payload);
        const newId = r.data.data.id;
        // Save specifications for newly created product
        const validSpecs = form.specifications
          .filter((s) => s.section?.trim() && s.key?.trim() && s.value?.trim())
          .map((s) => ({ section: s.section.trim(), key: s.key.trim(), value: s.value.trim() }));
        if (validSpecs.length > 0) {
          await api.post(`/products/${newId}/specifications`, { specifications: validSpecs });
        }
        toast.success('Product created');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-products">
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>{pagination.total || 0} products in catalog</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} color="#999" />
          <input
            placeholder="Search by name or slug..."
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          />
        </div>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <p>No products found. Click "Add Product" to create one.</p>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Flags</th>
                  <th>Sold</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const stock = p.variants?.reduce((s, v) => s + v.stock, 0) || 0;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="prod-cell">
                          <img src={getFirstImage(p)} alt={p.name} />
                          <div>
                            <p className="prod-name">{p.name}</p>
                            <p className="prod-slug">{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td>{p.category?.name}</td>
                      <td>
                        <strong>{formatPrice(p.discountPrice ?? p.basePrice)}</strong>
                        {p.discountPrice && (
                          <p className="muted-strike">{formatPrice(p.basePrice)}</p>
                        )}
                      </td>
                      <td>
                        <span className={`stock-badge ${stock === 0 ? 'out' : stock < 10 ? 'low' : 'ok'}`}>
                          {stock}
                        </span>
                      </td>
                      <td>
                        <div className="flag-row">
                          {p.isFeatured && <span className="flag featured" title="Featured"><Star size={11} /></span>}
                          {p.isNewArrival && <span className="flag new" title="New">NEW</span>}
                          {p.isOnOffer && <span className="flag offer" title="On Offer">OFFER</span>}
                          {p.bundleAvailable && <span className="flag bundle" title="Bundle">BUNDLE</span>}
                        </div>
                      </td>
                      <td>{p._count?.orderItems || 0}</td>
                      <td>
                        <div className="row-actions">
                          <button onClick={() => openEdit(p)} className="icon-action edit" title="Edit">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(p)} className="icon-action delete" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>&laquo; Prev</button>
              <span>Page {page} of {pagination.totalPages}</span>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next &raquo;</button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setModalOpen(false)} className="modal-close"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="modal-body">
              <div className="form-row">
                <div className="form-group full">
                  <label className="form-label">Product Name *</label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Base Price (MRP) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={form.basePrice}
                    onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Price</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={form.discountPrice}
                    onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                    placeholder="Leave blank for no discount"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    required
                  >
                    <option value="">Select...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Flags */}
              <div className="form-group">
                <label className="form-label">Flags</label>
                <div className="checkbox-row">
                  <label className="checkbox-pill">
                    <input type="checkbox" checked={form.bundleAvailable} onChange={(e) => setForm({ ...form, bundleAvailable: e.target.checked })} />
                    Bundle Available
                  </label>
                  <label className="checkbox-pill">
                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                    Featured
                  </label>
                  <label className="checkbox-pill">
                    <input type="checkbox" checked={form.isNewArrival} onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })} />
                    New Arrival
                  </label>
                  <label className="checkbox-pill">
                    <input type="checkbox" checked={form.isOnOffer} onChange={(e) => setForm({ ...form, isOnOffer: e.target.checked })} />
                    On Offer
                  </label>
                </div>
              </div>

              {/* Images */}
              <div className="form-group">
                <label className="form-label">Product Images</label>
                <div className="image-uploader">
                  <input
                    type="file"
                    ref={fileRef}
                    onChange={onFileChange}
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    style={{ display: 'none' }}
                  />
                  <button type="button" className="upload-btn" onClick={() => fileRef.current?.click()}>
                    <Upload size={16} /> Upload Images
                  </button>
                  <div className="image-grid">
                    {form.images.map((img, i) => (
                      <div key={i} className="image-thumb">
                        <img src={img.url} alt="" />
                        <button type="button" className="remove-thumb" onClick={() => removeImage(i)}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Variants — multi-select sizes + colors, auto-generate variants */}
              <div className="form-group">
                <label className="form-label">Sizes & Colors (select multiple)</label>
                <p className="variant-help">
                  Tick multiple sizes (e.g. S, M, L, XL) and multiple colors. Variants are auto-generated for every combination. Set stock per variant.
                </p>

                {/* Size multi-select */}
                <div className="multi-section">
                  <p className="multi-label">Sizes</p>
                  <div className="checkbox-grid">
                    {SIZES.map((s) => {
                      const checked = form.variants.some((v) => v.size === s);
                      return (
                        <label key={s} className={`check-pill ${checked ? 'checked' : ''}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => toggleSize(s, e.target.checked)}
                          />
                          {s}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Color multi-select */}
                <div className="multi-section">
                  <p className="multi-label">Colors</p>
                  <div className="checkbox-grid color-grid">
                    {COLORS.map((c) => {
                      const checked = form.variants.some((v) => v.color === c);
                      return (
                        <label key={c} className={`check-pill color-pill ${checked ? 'checked' : ''}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => toggleColor(c, e.target.checked)}
                          />
                          {c}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Auto-generated variants table */}
                {form.variants.length > 0 ? (
                  <div className="variant-table-wrap">
                    <div className="variant-table-header">
                      <span>Size</span>
                      <span>Color</span>
                      <span>Stock</span>
                      <span>SKU (auto)</span>
                      <span></span>
                    </div>
                    <div className="variant-list">
                      {form.variants.map((v, i) => (
                        <div key={`${v.size}-${v.color}`} className="variant-row">
                          <span className="v-size">{v.size}</span>
                          <span className="v-color">{v.color}</span>
                          <input
                            type="number"
                            value={v.stock}
                            onChange={(e) => updateVariant(i, 'stock', Number(e.target.value))}
                            className="form-input sm"
                            placeholder="0"
                            min={0}
                          />
                          <input
                            type="text"
                            value={v.sku || ''}
                            onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                            className="form-input sm"
                            placeholder="auto"
                          />
                          <button
                            type="button"
                            className="icon-action delete"
                            onClick={() => removeVariant(i)}
                            title="Remove this variant"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="muted-text">Select at least one size and one color above to create variants.</p>
                )}
              </div>

              {/* Specifications */}
              <div className="form-group">
                <SpecificationsEditor
                  specs={form.specifications}
                  onChange={(specs) => setForm({ ...form, specifications: specs })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : (editing ? 'Update Product' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-products { max-width: 1200px; }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .page-header h1 { font-size: 26px; font-weight: 700; }
        .page-header p { color: var(--color-text-light); font-size: 14px; margin-top: 4px; }
        .toolbar { margin-bottom: 16px; }
        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1px solid var(--color-border);
          padding: 8px 14px;
          border-radius: 8px;
          max-width: 360px;
        }
        .search-box input { flex: 1; border: none; outline: none; background: transparent; font-size: 14px; }
        .table-wrap {
          background: #fff;
          border-radius: 12px;
          overflow-x: auto;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .admin-table th {
          text-align: left;
          padding: 12px 16px;
          font-size: 11px;
          font-weight: 600;
          color: var(--color-text-light);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--color-border);
          white-space: nowrap;
        }
        .admin-table td { padding: 12px 16px; border-bottom: 1px solid var(--color-border); vertical-align: middle; }
        .prod-cell { display: flex; align-items: center; gap: 10px; }
        .prod-cell img { width: 44px; height: 44px; border-radius: 6px; object-fit: cover; background: var(--color-light-gray); }
        .prod-name { font-weight: 500; max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .prod-slug { font-size: 11px; color: var(--color-text-light); }
        .muted-strike { font-size: 11px; color: #999; text-decoration: line-through; }
        .stock-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        .stock-badge.ok { background: rgba(22, 163, 74, 0.15); color: #15803d; }
        .stock-badge.low { background: rgba(245, 158, 11, 0.15); color: #b45309; }
        .stock-badge.out { background: rgba(244, 51, 54, 0.15); color: #b91c1c; }
        .flag-row { display: flex; gap: 4px; flex-wrap: wrap; }
        .flag {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .flag.featured { background: rgba(245, 158, 11, 0.15); color: #b45309; }
        .flag.new { background: rgba(59, 130, 246, 0.15); color: #2563eb; }
        .flag.offer { background: rgba(244, 51, 54, 0.15); color: #b91c1c; }
        .flag.bundle { background: rgba(139, 92, 246, 0.15); color: #7c3aed; }
        .row-actions { display: flex; gap: 4px; }
        .icon-action {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-light-gray);
          color: var(--color-text);
          transition: all 0.2s;
        }
        .icon-action.edit:hover { background: var(--color-accent); color: #fff; }
        .icon-action.delete:hover { background: #dc2626; color: #fff; }
        .empty-state {
          background: #fff;
          padding: 60px 20px;
          text-align: center;
          border-radius: 12px;
          color: var(--color-text-light);
        }
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-top: 20px;
        }
        .pagination button {
          padding: 8px 14px;
          border: 1px solid var(--color-border);
          background: #fff;
          border-radius: 6px;
          font-size: 13px;
        }
        .pagination button:hover:not(:disabled) { background: var(--color-accent); color: #fff; border-color: var(--color-accent); }
        .pagination button:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 200;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 20px;
          overflow-y: auto;
        }
        .modal {
          background: #fff;
          border-radius: 12px;
          width: 100%;
          max-width: 720px;
          margin: 20px 0;
        }
        .modal-header {
          padding: 18px 24px;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          background: #fff;
          border-radius: 12px 12px 0 0;
          z-index: 1;
        }
        .modal-header h2 { font-size: 18px; font-weight: 600; }
        .modal-close { color: var(--color-text-light); padding: 4px; }
        .modal-close:hover { color: var(--color-text); }
        .modal-body { padding: 24px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .form-row .full { grid-column: 1 / -1; }
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; }
        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          font-size: 14px;
          background: #fff;
        }
        .form-input.sm, .form-select.sm { padding: 8px 10px; font-size: 13px; }
        .form-textarea { resize: vertical; }
        .checkbox-row { display: flex; flex-wrap: wrap; gap: 12px; }
        .checkbox-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: var(--color-light-gray);
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
        }
        .checkbox-pill input { margin: 0; }
        .image-uploader { display: flex; flex-direction: column; gap: 12px; }
        .upload-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border: 1px dashed var(--color-accent);
          color: var(--color-accent);
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          align-self: flex-start;
        }
        .upload-btn:hover { background: rgba(244, 51, 54, 0.05); }
        .image-grid { display: flex; flex-wrap: wrap; gap: 10px; }
        .image-thumb {
          position: relative;
          width: 72px;
          height: 72px;
          border-radius: 6px;
          overflow: hidden;
          background: var(--color-light-gray);
        }
        .image-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .remove-thumb {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgba(0,0,0,0.6);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .variant-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .variant-help { font-size: 12px; color: var(--color-text-light); margin-bottom: 14px; line-height: 1.5; }
        .multi-section { margin-bottom: 14px; }
        .multi-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-text-light);
          margin-bottom: 8px;
        }
        .checkbox-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .check-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          border: 1px solid var(--color-border);
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          background: #fff;
        }
        .check-pill input { margin: 0; }
        .check-pill.checked {
          background: var(--color-text);
          color: #fff;
          border-color: var(--color-text);
        }
        .check-pill.color-pill { font-size: 11px; }
        .variant-table-wrap {
          margin-top: 12px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          overflow: hidden;
        }
        .variant-table-header {
          display: grid;
          grid-template-columns: 70px 1fr 90px 1fr 36px;
          gap: 8px;
          padding: 8px 10px;
          background: var(--color-light-gray);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-text-light);
        }
        .variant-list { display: flex; flex-direction: column; gap: 0; }
        .variant-row {
          display: grid;
          grid-template-columns: 70px 1fr 90px 1fr 36px;
          gap: 8px;
          padding: 8px 10px;
          border-top: 1px solid var(--color-border);
          align-items: center;
        }
        .v-size, .v-color {
          font-size: 13px;
          font-weight: 500;
        }
        .muted-text { font-size: 13px; color: var(--color-text-light); font-style: italic; }
        .modal-footer {
          padding-top: 16px;
          border-top: 1px solid var(--color-border);
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        @media (max-width: 600px) {
          .form-row { grid-template-columns: 1fr; }
          .variant-row { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
