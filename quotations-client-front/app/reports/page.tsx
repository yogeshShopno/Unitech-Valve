'use client';

import React, { useState, useEffect } from 'react';
import { Shell } from '@/components/Shell';
import {
  BarChart,
  Filter,
  Download,
  Users,
  Calendar,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';

export default function ReportsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [status, setStatus] = useState('');
  const [clientId, setClientId] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await apiFetch('clients');
        const data = await res.json();
        setClients(data.clients || []);
      } catch (err) {
        console.error('Error fetching clients:', err);
      }
    };
    fetchClients();
  }, []);

  const fetchFilteredQuotations = async () => {
    setLoading(true);
    try {
      let url = `quotations?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;
      if (clientId) url += `&client=${clientId}`;

      const res = await apiFetch(url);
      const data = await res.json();
      setQuotations(data.quotations || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredQuotations();
  }, [status, clientId, page]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'received': return 'bg-green-100 text-green-700 border-green-200';
      case 'Not received': return 'bg-red-100 text-red-700 border-red-200';
      case 'inprogress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const calculateReportSummary = () => {
    const summary = {
      totalAmount: 0,
      count: quotations.length,
      statusBreakdown: {
        pending: 0,
        inprogress: 0,
        received: 0,
        Notreceived: 0
      }
    };

    quotations.forEach(q => {
      summary.totalAmount += q.total || 0;
      if (q.status in summary.statusBreakdown) {
        summary.statusBreakdown[q.status as keyof typeof summary.statusBreakdown]++;
      }
    });

    return summary;
  };

  const summary = calculateReportSummary();

  return (
    <Shell>
      <div className="p-8 bg-surface-container-low flex-1 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-on-surface tracking-tighter uppercase">Quotation Reports</h1>
            <p className="text-[10px] font-black text-secondary uppercase tracking-widest mt-1">  </p>
          </div>
          {/* <button
            onClick={() => window.print()}
            className="bg-on-surface text-white px-6 py-3 text-xs font-bold flex items-center gap-2 hover:bg-on-surface/90 transition-all shadow-lg uppercase tracking-widest print:hidden"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button> */}
        </div>

        {/* Filter Bar */}
        <div className="bg-surface-container-lowest p-6 border border-surface-container-high shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-secondary tracking-widest flex items-center gap-2">
              <Users className="w-3 h-3 text-primary" /> Filter by Party
            </label>
            <select
              value={clientId}
              onChange={(e) => { setClientId(e.target.value); setPage(1); }}
              className="w-full bg-surface-container-low p-3 border border-surface-container-high outline-none font-bold text-xs uppercase focus:border-primary transition-colors"
            >
              <option value="">All Parties</option>
              {clients.map(client => (
                <option key={client._id} value={client._id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-secondary tracking-widest flex items-center gap-2">
              <Filter className="w-3 h-3 text-primary" /> Status Wise
            </label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full bg-surface-container-low p-3 border border-surface-container-high outline-none font-bold text-xs uppercase focus:border-primary transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="inprogress">In Progress</option>
              <option value="received">received</option>
              <option value="Not received">Not received</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => { setStatus(''); setClientId(''); setPage(1); }}
              className="w-full border border-surface-container-high p-3 text-[10px] font-black uppercase hover:bg-surface-container-high transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-container-lowest p-6 border-b-4 border-primary shadow-sm">
            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Total Value</p>
            <h2 className="text-2xl font-black text-on-surface">₹{total > 0 ? quotations.reduce((acc, q) => acc + (q.total || 0), 0).toLocaleString() : '0'}</h2>
            <p className="text-[9px] text-secondary mt-2 font-bold uppercase italic">Filtered Result Set</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface-container-lowest p-6 border-b-4 border-secondary shadow-sm">
            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Quote Count</p>
            <h2 className="text-2xl font-black text-on-surface">{total}</h2>
            <p className="text-[9px] text-secondary mt-2 font-bold uppercase italic">In Current Filter</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface-container-lowest p-6 border-b-4 border-green-500 shadow-sm">
            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Completion Rate</p>
            <h2 className="text-2xl font-black text-on-surface">
              {total > 0 ? Math.round((quotations.filter(q => q.status === 'received').length / quotations.length) * 100) : 0}%
            </h2>
            <p className="text-[9px] text-secondary mt-2 font-bold uppercase italic">Based on status</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-surface-container-lowest p-6 border-b-4 border-red-500 shadow-sm">
            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Not receivedion Rate</p>
            <h2 className="text-2xl font-black text-on-surface">
              {total > 0 ? Math.round((quotations.filter(q => q.status === 'Not received').length / quotations.length) * 100) : 0}%
            </h2>
            <p className="text-[9px] text-secondary mt-2 font-bold uppercase italic">Risk Indicator</p>
          </motion.div>
        </div>

        {/* Report Table */}
        <div className="bg-surface-container-low p-1 shadow-sm border border-surface-container-high">
          <div className="bg-surface-container-lowest overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-highest">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Quotation</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Party Name</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right print:hidden">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {loading ? (
                  <tr><td colSpan={6} className="p-20 text-center text-secondary font-black uppercase text-xs animate-pulse">Scanning Industrial Ledger...</td></tr>
                ) : quotations.length === 0 ? (
                  <tr><td colSpan={6} className="p-20 text-center text-secondary font-black uppercase text-xs">No records matching selected criteria</td></tr>
                ) : quotations.map((quote) => (
                  <tr key={quote._id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-black text-on-surface text-sm uppercase">{quote.quotationNumber}</div>
                      <div className="text-[9px] text-secondary font-mono tracking-tighter">REF: {quote.referencePerson || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs font-bold uppercase">{quote.client?.name || 'Unknown Party'}</div>
                      <div className="text-[9px] text-secondary font-mono">{quote.client?.gstin || 'No GSTIN'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs font-bold text-secondary flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(quote.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-black text-primary">₹{quote.total.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase border ${getStatusStyle(quote.status)}`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right print:hidden">
                      <button
                        onClick={() => router.push(`/quotations/${quote._id}/preview`)}
                        className="p-2 border border-surface-container-high text-secondary hover:text-primary hover:border-primary transition-all bg-white"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="p-4 bg-surface-container-lowest border-t border-surface-container-high flex justify-between items-center print:hidden">
              <span className="text-[10px] font-black text-secondary uppercase">
                Showing {quotations.length} of {total} Records
              </span>
              <div className="flex gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="w-8 h-8 flex items-center justify-center border border-surface-container-high hover:bg-surface-container-high disabled:opacity-20 transition-all font-bold"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center px-4 text-[10px] font-black uppercase text-primary bg-primary/5">
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
      </div>
    </Shell>
  );
}
