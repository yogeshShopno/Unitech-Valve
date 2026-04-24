'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shell } from '@/components/Shell';
import {
  Filter,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  X,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '@/lib/api';

export default function ClientDirectory() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [formData, setFormData] = useState({
    id: '', name: '', contact: '', address: '', gstin: '', phone: '', email: '', status: 'Active', referencePerson: ''
  });

  const fetchClients = async (p: number) => {
    setLoading(true);
    try {
      const res = await apiFetch(`clients?page=${p}&limit=${limit}`);
      const data = await res.json();
      setClients(data.clients);
      setTotal(data.total);
      setPage(data.page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients(page);
  }, [page]);

  const handleOpenModal = (party: any = null) => {
    if (party) {
      setEditingClient(party);
      setFormData({
        id: party.id,
        name: party.name,
        contact: party.contact || '',
        address: party.address || '',
        gstin: party.gstin || '',
        phone: party.phone || '',
        email: party.email || '',
        status: party.status || 'Active',
        referencePerson: party.referencePerson || ''
      });
    } else {
      setEditingClient(null);
      setFormData({ id: "Party_" + ((Math.random() * 100000).toFixed(0)).toString(), name: '', contact: '', address: '', gstin: '', phone: '', email: '', status: 'Active', referencePerson: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingClient
      ? `${process.env.NEXT_PUBLIC_API_URL}clients/${editingClient._id}`
      : `${process.env.NEXT_PUBLIC_API_URL}clients`;
    const method = editingClient ? 'PUT' : 'POST';

    try {
      const res = await apiFetch(editingClient ? `clients/${editingClient._id}` : 'clients', {
        method,
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const result = await res.json();
        setIsModalOpen(false);
        fetchClients(page);

        if (!editingClient && window.confirm('Party added! Create a quotation for this party?')) {
          router.push(`/quotations/new?clientId=${result._id}`);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this party?')) return;
    try {
      await apiFetch(`clients/${id}`, {
        method: 'DELETE'
      });
      fetchClients(page);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Shell>
      <section className="p-8 space-y-8 flex-1">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight uppercase">Party Directory</h1>
            <p className="text-secondary font-medium mt-1">Managing {total} Engineering Partners</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleOpenModal()}
              className="bg-primary text-white px-6 py-3 text-xs font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg uppercase tracking-widest"
            >
              <Plus className="w-4 h-4" />
              Add New Party
            </button>
        
          </div>
        </div>

        {/* Party Table */}
        <div className="bg-surface-container-low p-1 shadow-sm border border-surface-container-high">
          <div className="bg-surface-container-lowest overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-highest">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Company Info</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Contact Details</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Location</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {loading ? (
                  <tr><td colSpan={5} className="p-10 text-center text-secondary font-bold uppercase text-[10px] animate-pulse">Loading Parties...</td></tr>
                ) : clients.length === 0 ? (
                  <tr><td colSpan={5} className="p-10 text-center text-secondary font-bold uppercase text-[10px]">No parties found</td></tr>
                ) : clients.map((party) => (
                  <tr key={party._id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-on-surface text-sm uppercase">{party.name}</div>
                      <div className="text-[9px] text-secondary font-black uppercase tracking-tighter mt-0.5">ID: {party.id}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-medium">{party.contact}</div>
                      <div className="text-[10px] text-secondary font-mono">{party.phone}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs max-w-[200px] truncate">{party.address}</div>
                      <div className="text-[9px] font-black text-primary uppercase">{party.gstin}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-none ${party.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {party.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 isolate">
                        <button
                          onClick={() => handleOpenModal(party)}
                          className="w-8 h-8 flex items-center justify-center border border-surface-container-high text-secondary hover:text-primary hover:border-primary transition-all shadow-sm"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(party._id)}
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

            {/* Pagination Controls */}
            <div className="p-4 bg-surface-container-lowest border-t border-surface-container-high flex justify-between items-center">
              <span className="text-[10px] font-bold text-secondary uppercase">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} entries
              </span>
              <div className="flex gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="w-8 h-8 flex items-center justify-center border border-surface-container-high hover:bg-surface-container-high disabled:opacity-20 transition-all font-bold"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center px-4 text-xs font-black uppercase text-primary bg-primary/5">
                  Page {page} of {Math.ceil(total / limit)}
                </div>
                <button
                  disabled={page >= Math.ceil(total / limit)}
                  onClick={() => setPage(page + 1)}
                  className="w-8 h-8 flex items-center justify-center border border-surface-container-high hover:bg-surface-container-high disabled:opacity-20 transition-all font-bold"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Party Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-surface-container-low w-full max-w-2xl shadow-2xl border border-surface-container-high"
            >
              <div className="p-6 border-b border-surface-container-high flex justify-between items-center">
                <h2 className="text-xl font-black uppercase tracking-tight">
                  {editingClient ? 'Edit Party Record' : 'Create New Party'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-secondary hover:text-on-surface">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Company Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-surface-container-lowest p-3 border border-surface-container-high focus:border-primary outline-none font-bold"
                      placeholder="Engineering Co. Ltd"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Primary Contact</label>
                    <input
                      type="text"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      className="w-full bg-surface-container-lowest p-3 border border-surface-container-high focus:border-primary outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Primary Email</label>
                    <input
                      type="text"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-surface-container-lowest p-3 border border-surface-container-high focus:border-primary outline-none"
                      placeholder="johndoe@gmail.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-surface-container-lowest p-3 border border-surface-container-high focus:border-primary outline-none"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">GSTIN Number</label>
                    <input
                      type="text"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                      className="w-full bg-surface-container-lowest p-3 border border-surface-container-high focus:border-primary outline-none font-mono"
                      placeholder="22AAAAA0000A1Z5"
                    />
                  </div>
                     <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Reference Person</label>
                    <input
                      type="text"
                      value={formData.referencePerson}
                      onChange={(e) => setFormData({ ...formData, referencePerson: e.target.value })}
                      className="w-full bg-surface-container-lowest p-3 border border-surface-container-high focus:border-primary outline-none font-mono"
                      placeholder="John Doe"
                    />  
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Business Address</label>
                  <textarea
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-surface-container-lowest p-3 border border-surface-container-high focus:border-primary outline-none"
                    placeholder="Physical location of the company"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 text-xs font-bold uppercase tracking-widest border border-surface-container-high hover:bg-surface-container-high"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-primary/90 shadow-lg active:scale-95 transition-all"
                  >
                    {editingClient ? 'Update Party' : 'Save Party'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Shell>
  );
}
