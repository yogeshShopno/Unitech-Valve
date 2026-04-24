'use client';

import React from 'react';
import { Shell } from '@/components/Shell';
import { 
  TrendingUp, 
  Clock, 
  CreditCard, 
  MoreVertical, 
  PlusCircle, 
  UserPlus, 
  FileDown,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';

const summaryCards = [
  {
    title: 'Total Quotations',
    value: '1,284',
    change: '+12% vs last month',
    icon: TrendingUp,
    color: 'border-primary',
    textColor: 'text-primary',
  },
  {
    title: 'Pending Approvals',
    value: '42',
    change: 'Requires immediate action',
    icon: Clock,
    color: 'border-error',
    textColor: 'text-error',
  },
  {
    title: 'Monthly Revenue',
    value: '₹8.4M',
    change: 'Forecasted: ₹12M',
    icon: CreditCard,
    color: 'border-secondary',
    textColor: 'text-secondary',
  },
];

const recentQuotations = [
  { id: 'QTN-2023-001', party: 'Reliance Engineering Ltd.', date: 'Oct 12, 2023', amount: '₹4,25,000', status: 'complete', statusColor: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'QTN-2023-002', party: 'Tata Heavy Hydraulics', date: 'Oct 11, 2023', amount: '₹12,80,000', status: 'inprogress', statusColor: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'QTN-2023-003', party: 'Bharat Valve Works', date: 'Oct 10, 2023', amount: '₹85,000', status: 'pending', statusColor: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 'QTN-2023-004', party: 'Jindal Steel Pvt Ltd.', date: 'Oct 09, 2023', amount: '₹34,50,000', status: 'inprogress', statusColor: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'QTN-2023-005', party: 'Adani Infrastructure', date: 'Oct 08, 2023', amount: '₹7,20,000', status: 'complete', statusColor: 'bg-green-100 text-green-700 border-green-200' },
];

export default function Dashboard() {
  return (
    <Shell>
      <div className="p-8 bg-surface-container-low flex-1">
        {/* Bento Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {summaryCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-surface-container-lowest p-6 flex flex-col justify-between border-b-4 ${card.color} shadow-sm`}
            >
              <div>
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">{card.title}</p>
                <h2 className="text-4xl font-black text-on-surface tracking-tighter">{card.value}</h2>
              </div>
              <div className={`mt-4 flex items-center ${card.textColor} text-xs font-bold`}>
                <card.icon className="w-4 h-4 mr-1" />
                {card.change}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Layout: Table + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Recent Quotations Table */}
          <div className="lg:w-3/4 space-y-4">
            <div className="flex justify-between items-end mb-2">
              <h3 className="text-lg font-extrabold uppercase tracking-tight text-on-surface">Recent Quotations</h3>
              <Link href="/quotations" className="text-[10px] font-bold text-primary uppercase border-b border-primary">
                View Ledger
              </Link>
            </div>
            <div className="bg-surface-container-lowest overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-highest">
                    <th className="px-4 py-3 text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Quotation No</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Party</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Date</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Status</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {recentQuotations.map((q) => (
                    <tr key={q.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-4 py-4 text-xs font-bold font-mono">{q.id}</td>
                      <td className="px-4 py-4 text-xs text-on-surface">{q.party}</td>
                      <td className="px-4 py-4 text-xs text-secondary">{q.date}</td>
                      <td className="px-4 py-4 text-xs font-bold">{q.amount}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-[9px] font-black uppercase ${q.statusColor}`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <MoreVertical className="w-4 h-4 text-secondary cursor-pointer hover:text-primary" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="lg:w-1/4 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-on-surface border-b-2 border-primary inline-block mb-2">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { name: 'Create New Quote', icon: PlusCircle, color: 'border-primary', hover: 'hover:bg-primary', href: '/quotations/new' },
                { name: 'Add Party', icon: UserPlus, color: 'border-secondary', hover: 'hover:bg-secondary', href: '/clients' },
                // { name: 'Export Reports', icon: FileDown, color: 'border-tertiary', hover: 'hover:bg-tertiary', href: '#' },
              ].map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className={`w-full group bg-surface-container-lowest p-4 flex items-center justify-between border-l-4 ${action.color} ${action.hover} hover:text-white transition-all shadow-sm`}
                >
                  <div className="flex items-center">
                    <action.icon className={`w-5 h-5 mr-3 group-hover:text-white`} />
                    <span className="text-xs font-bold uppercase tracking-wider">{action.name}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>

            {/* Technical Status Card */}
            <div className="bg-surface-container-highest p-5 mt-8 shadow-sm">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-on-surface-variant">Technical Status</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-medium text-secondary">Ledger Sync</span>
                  <span className="text-[10px] font-bold text-primary flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-1.5 animate-pulse"></span>
                    ONLINE
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-medium text-secondary">Tender DB</span>
                  <span className="text-[10px] font-bold text-primary flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-1.5 animate-pulse"></span>
                    CONNECTED
                  </span>
                </div>
                <div className="pt-4 border-t border-surface-container/50">
                  <p className="text-[9px] leading-relaxed text-on-surface-variant italic">
                    &quot;Precision is the only protocol.&quot;
                    <br />— System Log v4.2.1
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
