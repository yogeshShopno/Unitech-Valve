'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Download, Loader2, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { apiFetch } from '@/lib/api';

function formatDate(dateStr: string | undefined, format = 'dd/MM/yyyy'): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return format.replace('dd', dd).replace('MM', mm).replace('yyyy', String(yyyy));
}

export default function PurchaseOrderPreviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PurchaseOrderPreview />
    </Suspense>
  );
}

function PurchaseOrderPreview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const id = params.id;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const orderRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`purchase-orders/${id}`);
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'order-font-override';
    style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet');
    
    [data-order-page] * {
      font-family: 'Roboto', Georgia, serif !important;
    }
  `;
    document.head.appendChild(style);
    return () => { document.getElementById('order-font-override')?.remove(); };
  }, []);

  const handleDownloadPDF = async () => {
    const element = orderRef.current;
    if (!element) return;

    const opt = {
      margin: 0,
      filename: `Purchase_Order_${order?.poNumber || 'export'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        onclone: (clonedDoc: Document) => {
          const fix = clonedDoc.createElement('style');
          fix.textContent = `
          * {
          font-family: 'Roboto', Georgia, serif !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }
          .bg-white          { background-color: #ffffff !important; }
          .bg-black          { background-color: #000000 !important; }
          .bg-gray-100       { background-color: #f3f4f6 !important; }
          .bg-gray-800       { background-color: #1f2937 !important; }
          .text-black        { color: #000000 !important; }
          .text-white        { color: #ffffff !important; }
          .border-black      { border-color: #000000 !important; }
        `;
          clonedDoc.head.appendChild(fix);
        },
      },
      jsPDF: {
        unit: 'mm' as const,
        format: 'a4' as const,
        orientation: 'portrait' as const,
      },
    };

    const html2pdf = (await import('html2pdf.js')).default;
    await html2pdf().set(opt).from(element).save();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-black uppercase tracking-widest text-black">Fetching Order Data...</h2>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-black uppercase text-black">Order Not Found</h1>
        <Link href="/purchase-orders" className="text-primary font-bold uppercase text-xs hover:underline mt-4">
          Back to Orders
        </Link>
      </div>
    );
  }

  const items = order?.items || [];
  const displayItems = items; // Show all items for now

  return (
    <div data-order-page className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 pb-10 selection:bg-primary selection:text-white relative">
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center no-print">
        <div className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-2xl rounded-full px-6 py-2 flex items-center gap-6 mt-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors group" title="Go Back">
            <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-black" />
          </button>
          <div className="w-[1px] h-6 bg-gray-200" />

          <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-all active:scale-95 group shadow-lg">
            <Download className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">PDF</span>
          </button>
          <div className="w-[1px] h-6 bg-gray-200" />
          <Link href={`/purchase-orders/edit/${id}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors group" title="Edit Order">
            <Edit2 className="w-5 h-5 text-gray-600 group-hover:text-black" />
          </Link>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          @page { size: A4; margin: 0; }
        }
      `}</style>

      <div
        ref={orderRef}
        className="w-[210mm] min-h-[297mm] flex flex-col bg-white px-[10mm] py-[8mm] text-black font-serif text-[10px] leading-[1.3] shadow-2xl origin-top print:shadow-none print:w-full print:h-auto overflow-hidden"
      >
        <div className="border border-black">
          <div className="flex items-center gap-3 px-[8px] py-[6px] border-b border-black">
            <div className="w-[62px] h-[62px] flex-shrink-0 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="mb-[3px]">
                <span className="text-[22px] font-bold leading-none">Unitech</span>
                <span className="text-[22px] font-light ml-[8px] leading-none">Valves &amp; Automation</span>
              </div>
              <p className="text-[9px] leading-[1.5]">Plot No. 6234, Road No. 62, G.I.D.C., Sachin, Surat - 394230, Gujarat, India.</p>
            </div>
          </div>

          <div className="text-center border-b border-black py-[5px] font-bold text-[12px] tracking-widest uppercase bg-gray-50">
            Purchase Order
          </div>

          <div className="grid grid-cols-2 border-black">
            <div className="px-[8px] py-[6px] border-r border-black text-[10px] leading-[1.6]">
              <p className="font-bold text-[8px] uppercase text-gray-500 mb-1 tracking-widest">Supplier</p>
              <p className="font-bold text-sm uppercase">{order?.purchaseParty?.name}</p>
              <p>{order?.purchaseParty?.address}</p>
              <p><span className="font-bold">Contact :</span> {order?.purchaseParty?.contact}</p>
              <p><span className="font-bold">GSTIN :</span> {order?.purchaseParty?.gstin}</p>
            </div>
            <div className="px-[8px] py-[6px] text-[10px] leading-[1.7]">
              <div className="flex justify-between">
                <span>PO No :</span>
                <span className="font-black">{order?.poNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date :</span>
                <span>{formatDate(order?.date, 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span>PI Ref :</span>
                <span>{order?.proformaNumber || '---'}</span>
              </div>
              <div className="flex justify-between">
                <span>Ref Person :</span>
                <span>{order?.referencePerson}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-[8px] py-[10px] text-[11px] leading-[1.5] font-bold italic">
          Please supply the following items as per the terms and conditions mentioned below.
        </div>

        <div className="border border-black flex flex-col flex-1">
          <table className="w-full border-collapse table-fixed text-[10px]">
            <thead>
              <tr className="bg-gray-100 border-b border-black">
                <th className="px-2 py-2 w-[30px] font-bold border-r border-black">Sr</th>
                <th className="px-2 py-2 font-bold border-r border-black">DESCRIPTION / PART NO</th>
                <th className="px-2 py-2 w-[50px] font-bold border-r border-black text-center">QTY</th>
                <th className="px-2 py-2 w-[80px] font-bold border-r border-black text-right">RATE (₹)</th>
                <th className="px-2 py-2 w-[80px] font-bold text-right">TOTAL (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black">
              {displayItems.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="px-2 py-3 text-center align-top border-r border-black">{index + 1}</td>
                  <td className="px-2 py-3 align-top border-r border-black">
                    <div className="font-bold uppercase mb-1">{item.description}</div>
                    <div className="text-[8px] text-gray-600">HSN: {item.hsnCode}</div>
                  </td>
                  <td className="px-2 py-3 text-center align-top border-r border-black">{item.quantity}</td>
                  <td className="px-2 py-3 text-right align-top border-r border-black">{item.rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-2 py-3 text-right align-top">{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-auto border-t border-black bg-gray-50 p-4">
            <div className="flex justify-end gap-12">
              <div className="space-y-2">
                <div className="flex justify-between w-[240px]">
                  <span className="font-bold">SUB TOTAL</span>
                  <span>₹{order?.subTotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between w-[240px]">
                  <span className="font-bold">GST (18%)</span>
                  <span>₹{order?.tax?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between w-[240px] border-t border-black pt-2">
                  <span className="font-black text-lg">GRAND TOTAL</span>
                  <span className="font-black text-lg">₹{order?.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-black grid grid-cols-2">
            <div className="px-4 py-4 border-r border-black space-y-2">
              <p className="font-black uppercase text-[8px] tracking-widest text-gray-400 underline">Terms & Conditions</p>
              <div className="text-[9px] leading-relaxed" dangerouslySetInnerHTML={{ __html: order?.terms }} />
            </div>
            <div className="px-4 py-10 text-center flex flex-col justify-between">
              <div className="space-y-1">
                <p className="text-[10px]">For</p>
                <p className="font-black text-sm uppercase">Unitech Valves & Automation</p>
              </div>
              <div className="pt-12">
                <div className="w-32 h-[1px] bg-black mx-auto mb-2" />
                <p className="font-bold text-[10px] uppercase">Authorized Signatory</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
