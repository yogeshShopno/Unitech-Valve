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
  Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '@/lib/api';

export default function QuotationList() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);

  const fetchQuotations = async (p: number) => {
    setLoading(true);
    try {
      const res = await apiFetch(`quotations?page=${p}&limit=${limit}`);
      const data = await res.json();
      setQuotations(data.quotations);
      setTotal(data.total);
      setPage(data.page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations(page);
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this quotation?')) return;
    try {
      await apiFetch(`quotations/${id}`, {
        method: 'DELETE'
      });
      fetchQuotations(page);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertToProforma = async (id: string) => {
    if (!window.confirm('Convert this quotation to a Proforma Invoice?')) return;
    try {
      const res = await apiFetch(`proforma-invoices/convert/${id}`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        alert('Successfully converted to Proforma Invoice!');
        router.push(`/proforma-invoices/${data._id}/preview`);
      } else {
        const error = await res.json();
        alert(error.message || 'Conversion failed');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during conversion');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'received': return 'bg-green-100 text-green-700 border-green-200';
      case 'Not received': return 'bg-red-100 text-red-700 border-red-200';
      case 'inprogress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Shell>
      <section className="p-8 space-y-8 flex-1">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight uppercase tracking-tighter">Quotations</h1>
            <p className="text-secondary font-medium mt-1 uppercase text-[10px] tracking-widest font-black">Industrial Ledger Billing System</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/quotations/new')}
              className="bg-primary text-white px-6 py-3 text-xs font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg uppercase tracking-widest"
            >
              <Plus className="w-4 h-4" />
              Generate Quotation
            </button>
          </div>
        </div>

        {/* Quotation Table */}
        <div className="bg-surface-container-low p-1 shadow-sm border border-surface-container-high">
          <div className="bg-surface-container-lowest overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-highest">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Quote Details</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Party</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {loading ? (
                  <tr><td colSpan={5} className="p-10 text-center text-secondary font-bold uppercase text-[10px] animate-pulse">Loading Records...</td></tr>
                ) : quotations?.length === 0 ? (
                  <tr><td colSpan={5} className="p-10 text-center text-secondary font-bold uppercase text-[10px]">No quotations found</td></tr>
                ) : quotations?.map((quote) => (
                  <tr key={quote._id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-on-surface text-sm uppercase">{quote.quotationNumber}</div>
                      <div className="text-[10px] text-secondary font-bold flex items-center gap-1 mt-0.5">
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(quote.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold uppercase">{quote.client?.name || '---'}</div>
                      <div className="text-[9px] text-secondary font-mono tracking-tighter">{quote.client?.gstin || 'NO GSTIN'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-black text-primary">₹{quote.total.toLocaleString()}</div>
                      <div className="text-[9px] text-secondary font-bold uppercase">Incl. Taxes</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase border ${getStatusStyle(quote.status)} w-fit`}>
                          {quote.status}
                        </span>
                        {quote.performa_invoice && (
                          <span className="px-2 py-0.5 text-[9px] font-black uppercase border bg-purple-100 text-purple-700 border-purple-200 w-fit">
                            Converted to PI
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 isolate">
                        <button
                          onClick={() => router.push(`/quotations/${quote._id}/preview?autoDownload=true`)}
                          className="w-8 h-8 flex items-center justify-center border border-surface-container-high text-secondary hover:text-primary hover:border-primary transition-all shadow-sm bg-white"
                          title="Download Quotation PDF"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => router.push(`/quotations/edit/${quote._id}`)}
                          className="w-8 h-8 flex items-center justify-center border border-surface-container-high text-secondary hover:text-primary hover:border-primary transition-all shadow-sm bg-white"
                          title="Edit Quotation"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {!quote.performa_invoice && (
                          <button
                            onClick={() => handleConvertToProforma(quote._id)}
                            className="w-8 h-8 flex items-center justify-center border border-surface-container-high text-secondary hover:text-green-600 hover:border-green-600 transition-all shadow-sm bg-white"
                            title="Convert to Proforma Invoice"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(quote._id)}
                          className="w-8 h-8 flex items-center justify-center border border-surface-container-high text-secondary hover:text-red-500 hover:border-red-500 transition-all shadow-sm bg-white"
                          title="Delete Quotation"
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
                Total {total} Quotations
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
    </Shell>
  );
}
