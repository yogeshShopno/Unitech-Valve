'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shell } from '@/components/Shell';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Eye,
  Calendar
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function PurchaseOrderList() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (p: number) => {
    setLoading(true);
    try {
      const res = await apiFetch(`purchase-orders?page=${p}&limit=${limit}`);
      const data = await res.json();
      setOrders(data.purchaseOrders || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this purchase order?')) return;
    try {
      await apiFetch(`purchase-orders/${id}`, {
        method: 'DELETE'
      });
      fetchOrders(page);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
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
            <h1 className="text-3xl font-black text-on-surface tracking-tight uppercase">Purchase Orders</h1>
            <p className="text-secondary font-medium mt-1 uppercase text-[10px] tracking-widest font-black">Industrial Procurement Ledger</p>
          </div>
        </div>

        <div className="bg-surface-container-low p-1 shadow-sm border border-surface-container-high">
          <div className="bg-surface-container-lowest overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-highest">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">PO Details</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">PI Ref</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Supplier</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {loading ? (
                  <tr><td colSpan={6} className="p-10 text-center text-secondary font-bold uppercase text-[10px] animate-pulse">Loading POs...</td></tr>
                ) : orders?.length === 0 ? (
                  <tr><td colSpan={6} className="p-10 text-center text-secondary font-bold uppercase text-[10px]">No purchase orders found</td></tr>
                ) : orders?.map((order) => (
                  <tr key={order._id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-on-surface text-sm uppercase">{order.poNumber}</div>
                      <div className="text-[10px] text-secondary font-bold flex items-center gap-1 mt-0.5">
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs font-bold text-secondary uppercase">{order.proformaNumber || '---'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold uppercase">{order.purchaseParty?.name || '---'}</div>
                      <div className="text-[9px] text-secondary font-mono tracking-tighter">{order.purchaseParty?.gstin || 'NO GSTIN'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-black text-primary">₹{order.total.toLocaleString()}</div>
                      <div className="text-[9px] text-secondary font-bold uppercase">Net Amount</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase border ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 isolate">
                        <button 
                          onClick={() => router.push(`/purchase-orders/${order._id}/preview`)}
                          className="w-8 h-8 flex items-center justify-center border border-surface-container-high text-secondary hover:text-primary hover:border-primary transition-all shadow-sm bg-white"
                          title="View PO"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => router.push(`/purchase-orders/edit/${order._id}`)}
                          className="w-8 h-8 flex items-center justify-center border border-surface-container-high text-secondary hover:text-primary hover:border-primary transition-all shadow-sm bg-white"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(order._id)}
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

            <div className="p-4 bg-surface-container-lowest border-t border-surface-container-high flex justify-between items-center">
              <span className="text-[10px] font-bold text-secondary uppercase">
                Total {total} Orders
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
