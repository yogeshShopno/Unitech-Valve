'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shell } from '@/components/Shell';
import {
  FileText,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Download,
  Eye,
  Calendar,
  ShoppingCart,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '@/lib/api';

export default function ProformaInvoiceList() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  const fetchInvoices = async (p: number) => {
    setLoading(true);
    try {
      const res = await apiFetch(`proforma-invoices?page=${p}&limit=${limit}`);
      const data = await res.json();
      setInvoices(data.proformaInvoices || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(page);
  }, [page]);

  const fetchSuppliers = async () => {
    try {
      const res = await apiFetch('purchase-parties?limit=100');
      const data = await res.json();
      setSuppliers(data.clients || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertClick = (invoice: any) => {
    setSelectedInvoice(invoice);
    fetchSuppliers();
    setIsConvertModalOpen(true);
  };

  const handleConvertConfirm = async () => {
    if (!selectedSupplierId) return;
    setIsConverting(true);
    try {
      const res = await apiFetch(`purchase-orders/convert/${selectedInvoice._id}`, {
        method: 'POST',
        body: JSON.stringify({ purchasePartyId: selectedSupplierId })
      });
      if (res.ok) {
        setIsConvertModalOpen(false);
        fetchInvoices(page);
        router.push('/purchase-orders');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this proforma invoice?')) return;
    try {
      await apiFetch(`proforma-invoices/${id}`, {
        method: 'DELETE'
      });
      fetchInvoices(page);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Shell>
      <section className="p-8 space-y-8 flex-1">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight uppercase tracking-tighter">Proforma Invoices</h1>
            <p className="text-secondary font-medium mt-1 uppercase text-[10px] tracking-widest font-black">Industrial Ledger Billing System</p>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="bg-surface-container-low p-1 shadow-sm border border-surface-container-high">
          <div className="bg-surface-container-lowest overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-highest">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Invoice Details</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Quote Ref</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Party</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {loading ? (
                  <tr><td colSpan={6} className="p-10 text-center text-secondary font-bold uppercase text-[10px] animate-pulse">Loading Records...</td></tr>
                ) : invoices?.length === 0 ? (
                  <tr><td colSpan={6} className="p-10 text-center text-secondary font-bold uppercase text-[10px]">No proforma invoices found</td></tr>
                ) : invoices?.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-on-surface text-sm uppercase">{invoice.proformaNumber}</div>
                      <div className="text-[10px] text-secondary font-bold flex items-center gap-1 mt-0.5">
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(invoice.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs font-bold text-secondary uppercase">{invoice.quotationNumber || '---'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold uppercase">{invoice.client?.name || '---'}</div>
                      <div className="text-[9px] text-secondary font-mono tracking-tighter">{invoice.client?.gstin || 'NO GSTIN'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-black text-primary">₹{invoice.total.toLocaleString()}</div>
                      <div className="text-[9px] text-secondary font-bold uppercase">Incl. Taxes</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase border ${getStatusStyle(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 isolate">
                        {!invoice.po_created ? (
                          <button 
                            onClick={() => handleConvertClick(invoice)}
                            className="w-8 h-8 flex items-center justify-center border border-surface-container-high text-secondary hover:text-primary hover:border-primary transition-all shadow-sm bg-white"
                            title="Convert to PO"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => router.push(`/purchase-orders/${invoice.po_id}/preview`)}
                            className="w-8 h-8 flex items-center justify-center border border-green-100 bg-green-50 text-green-600 hover:bg-green-100 transition-colors" 
                            title="View PO"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          onClick={() => router.push(`/proforma-invoices/${invoice._id}/preview?autoDownload=true`)}
                          className="w-8 h-8 flex items-center justify-center border border-surface-container-high text-secondary hover:text-primary hover:border-primary transition-all shadow-sm bg-white"
                          title="View PDF"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => router.push(`/proforma-invoices/edit/${invoice._id}`)}
                          className="w-8 h-8 flex items-center justify-center border border-surface-container-high text-secondary hover:text-primary hover:border-primary transition-all shadow-sm bg-white"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(invoice._id)}
                          className="w-8 h-8 flex items-center justify-center border border-surface-container-high text-secondary hover:text-red-500 hover:border-red-500 transition-all shadow-sm bg-white"
                          title="Delete"
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
                Total {total} Invoices
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
                  Page {page} of {Math.ceil(total / limit) || 1}
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

      <AnimatePresence>
        {isConvertModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConvertModalOpen(false)}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-surface-container-low w-full max-w-md shadow-2xl border border-surface-container-high"
            >
              <div className="p-6 border-b border-surface-container-high flex justify-between items-center">
                <h2 className="text-xl font-black uppercase tracking-tight">Convert to PO</h2>
                <button onClick={() => setIsConvertModalOpen(false)} className="text-secondary hover:text-on-surface">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <p className="text-xs text-secondary font-bold uppercase tracking-widest">
                    Select a purchase party (supplier) to create a PO for invoice <span className="text-primary">{selectedInvoice?.proformaNumber}</span>.
                  </p>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Purchase Party</label>
                    <select
                      value={selectedSupplierId}
                      onChange={(e) => setSelectedSupplierId(e.target.value)}
                      className="w-full bg-surface-container-lowest p-3 border border-surface-container-high focus:border-primary outline-none font-bold appearance-none cursor-pointer"
                    >
                      <option value="">Choose a Supplier...</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier._id} value={supplier._id}>
                          {supplier.name} ({supplier.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-surface-container-high">
                  <button
                    onClick={() => setIsConvertModalOpen(false)}
                    className="px-6 py-3 text-xs font-bold uppercase tracking-widest border border-surface-container-high hover:bg-surface-container-high"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConvertConfirm}
                    disabled={!selectedSupplierId || isConverting}
                    className="bg-primary text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-primary/90 shadow-lg active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isConverting ? 'Converting...' : 'Generate PO'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Shell>
  );
}
