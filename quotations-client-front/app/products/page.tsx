'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Shell } from '@/components/Shell';
import { apiFetch } from '@/lib/api';
import {
  Package,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  X,
  Upload,
  ImageOff,
  Camera,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:5000';

interface Product {
  _id: string;
  name: string;
  description: string;
  unit: string;
  unitPrice: number;
  hsnCode: string;
  valveSize: string;
  image: string;
}

interface FormState {
  name: string;
  description: string;
  unit: string;
  unitPrice: number;
  hsnCode: string;
  valveSize: string;

}

export default function ProductMaster() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<FormState>({
    name: '', description: '', unit: 'PCS', unitPrice: 0, hsnCode: '', valveSize: ''
  });

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(''); // data-url or server URL
  const [clearImage, setClearImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image lightbox
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const fetchProducts = async (p: number) => {
    setLoading(true);
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}products?page=${p}&limit=${limit}`, {
        credentials: 'include',
      });
      const data = await res.json();
      setProducts(data.products);
      setTotal(data.total);
      setPage(data.page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(page); }, [page]);

  const handleOpenModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        unit: product.unit || 'PCS',
        unitPrice: product.unitPrice || 0,
        hsnCode: product.hsnCode || '',
        valveSize: product.valveSize || '',
      });
      setImagePreview(product.image ? `${API_BASE}${product.image}` : '');
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', unit: 'PCS', unitPrice: 0, hsnCode: '', valveSize: '' });
      setImagePreview('');
    }
    setImageFile(null);
    setClearImage(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setImageFile(null);
    setImagePreview('');
    setClearImage(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setClearImage(false);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setClearImage(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingProduct
      ? `${process.env.NEXT_PUBLIC_API_URL}products/${editingProduct._id}`
      : `${process.env.NEXT_PUBLIC_API_URL}products`;
    const method = editingProduct ? 'PUT' : 'POST';

    // Always send as FormData so multer can parse the file
    const body = new FormData();
    body.append('name', formData.name);
    body.append('description', formData.description);
    body.append('unit', formData.unit);
    body.append('unitPrice', String(formData.unitPrice));
    body.append('hsnCode', formData.hsnCode);
    body.append('valveSize', formData.valveSize);
    if (imageFile) body.append('image', imageFile);
    if (clearImage) body.append('clearImage', 'true');

    try {
      const res = await apiFetch(url, { method, credentials: 'include', body });
      if (res.ok) {
        handleCloseModal();
        fetchProducts(page);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}products/${id}`, {
        method: 'DELETE', credentials: 'include',
      });
      fetchProducts(page);
    } catch (err) { console.error(err); }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <Shell>
      <section className="p-8 space-y-8 flex-1">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight uppercase">Item Master</h1>
            <p className="text-secondary font-medium mt-1">Managing {total} Inventory Items</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary text-white px-6 py-3 text-xs font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" />
            Add New Item
          </button>
        </div>

        {/* Table */}
        <div className="bg-surface-container-low p-1 shadow-sm border border-surface-container-high">
          <div className="bg-surface-container-lowest overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-highest">
                  <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant w-16">Image</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Item Info</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">HSN Code</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Valve Size</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Pricing</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Unit</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {loading ? (
                  <tr><td colSpan={7} className="p-10 text-center text-secondary font-bold uppercase text-[10px] animate-pulse">Loading Items...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={7} className="p-10 text-center text-secondary font-bold uppercase text-[10px]">No items found</td></tr>
                ) : products.map((product) => (
                  <tr key={product._id} className="hover:bg-primary/5 transition-colors group">
                    {/* Thumbnail */}
                    <td className="px-4 py-4">
                      {product.image ? (
                        <button
                          onClick={() => setLightboxSrc(`${API_BASE}${product.image}`)}
                          className="w-12 h-12 border border-surface-container-high overflow-hidden hover:border-primary transition-all group/img flex items-center justify-center"
                        >
                          <img
                            src={`${API_BASE}${product.image}`}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
                          />
                        </button>
                      ) : (
                        <div className="w-12 h-12 border border-surface-container-high flex items-center justify-center bg-surface-container text-secondary/40">
                          <ImageOff className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-on-surface text-sm uppercase">{product.name}</div>
                      <div className="text-[10px] text-secondary font-medium lowercase line-clamp-1 max-w-xs">{product.description}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs font-mono">{product.hsnCode || '---'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs font-mono">{product.valveSize || '---'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-black text-primary">₹{product.unitPrice.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-surface-container-highest text-secondary border border-surface-container-high">
                        {product.unit}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="w-8 h-8 flex items-center justify-center border border-surface-container-high text-secondary hover:text-primary hover:border-primary transition-all shadow-sm"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="w-8 h-8 flex items-center justify-center border border-surface-container-high text-secondary hover:text-red-500 hover:border-red-500 transition-all shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="p-4 bg-surface-container-lowest border-t border-surface-container-high flex justify-between items-center">
              <span className="text-[10px] font-bold text-secondary uppercase">
                Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total} entries
              </span>
              <div className="flex gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="w-8 h-8 flex items-center justify-center border border-surface-container-high hover:bg-surface-container-high disabled:opacity-20 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center px-4 text-xs font-black uppercase text-primary bg-primary/5">
                  Page {page} of {totalPages}
                </div>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="w-8 h-8 flex items-center justify-center border border-surface-container-high hover:bg-surface-container-high disabled:opacity-20 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Add / Edit Modal ─── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-surface-container-low w-full max-w-xl shadow-2xl border border-surface-container-high overflow-y-auto max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-surface-container-high flex justify-between items-center bg-surface-container-lowest sticky top-0 z-10">
                <h2 className="text-xl font-black uppercase tracking-tight">
                  {editingProduct ? 'Edit Item' : 'Register New Item'}
                </h2>
                <button onClick={handleCloseModal} className="text-secondary hover:text-on-surface">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* ── Image Upload Zone ── */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest">
                    Product Image
                  </label>

                  {imagePreview ? (
                    /* Preview */
                    <div className="relative group border border-surface-container-high overflow-hidden bg-surface-container">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-52 object-contain"
                      />
                      {/* Overlay actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-all"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-600 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Drop zone */
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-40 border-2 border-dashed border-surface-container-high hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 text-secondary group"
                    >
                      <div className="w-12 h-12 border border-surface-container-high flex items-center justify-center bg-surface-container group-hover:border-primary group-hover:text-primary transition-all">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold uppercase tracking-widest group-hover:text-primary transition-colors">
                          Click to Upload Image
                        </p>
                        <p className="text-[10px] text-secondary/60 mt-1">JPEG · PNG · WEBP · max 5 MB</p>
                      </div>
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                {/* Item Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Item Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-surface-container-lowest p-3 border border-surface-container-high focus:border-primary outline-none font-bold uppercase transition-all"
                    placeholder="e.g. METAL SHEET A-GRADE"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-surface-container-lowest p-3 border border-surface-container-high focus:border-primary outline-none"
                    placeholder="Brief technical specifications..."
                  />
                </div>

                {/* Price + Unit */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Unit Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                      className="w-full bg-surface-container-lowest p-3 border border-surface-container-high focus:border-primary outline-none font-black text-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Unit</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full bg-surface-container-lowest p-3 border border-surface-container-high focus:border-primary outline-none font-bold"
                    >
                      <option value="PCS">PCS</option>
                      <option value="KG">KG</option>
                      <option value="MTR">MTR</option>
                      <option value="SET">SET</option>
                      <option value="BOX">BOX</option>
                    </select>
                  </div>
                </div>

                {/* HSN Code */}
                <div className="grid grid-cols-2 gap-6">

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">HSN Code</label>
                    <input
                      type="text"
                      value={formData.hsnCode}
                      onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                      className="w-full bg-surface-container-lowest p-3 border border-surface-container-high focus:border-primary outline-none font-mono"
                      placeholder="8481"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Valve Size</label>
                    <input
                      type="text"
                      value={formData.valveSize}
                      onChange={(e) => setFormData({ ...formData, valveSize: e.target.value })}
                      className="w-full bg-surface-container-lowest p-3 border border-surface-container-high focus:border-primary outline-none font-mono"
                      placeholder="8481"
                    />
                  </div>
                </div>


                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-3 text-xs font-bold uppercase tracking-widest border border-surface-container-high hover:bg-surface-container-high transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-primary/90 shadow-xl active:scale-95 transition-all"
                  >
                    {editingProduct ? 'Update Item' : 'Save Item'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Image Lightbox ─── */}
      <AnimatePresence>
        {lightboxSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxSrc(null)}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md cursor-zoom-out p-6"
          >
            <motion.img
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              src={lightboxSrc}
              alt="Product preview"
              className="max-w-2xl max-h-[80vh] w-full object-contain shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setLightboxSrc(null)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Shell>
  );
}
