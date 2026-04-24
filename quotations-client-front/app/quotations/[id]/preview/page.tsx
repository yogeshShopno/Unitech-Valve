'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Download, Loader2, Edit2, Receipt } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
// import html2pdf from 'html2pdf.js';

function formatDate(dateStr: string | undefined, format = 'dd/MM/yyyy'): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return format.replace('dd', dd).replace('MM', mm).replace('yyyy', String(yyyy));
}

export default function QuotationPreview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoDownload = searchParams.get('autoDownload') === 'true';
  const [downloading, setDownloading] = useState(false);
  const [converting, setConverting] = useState(false);
  const params = useParams();
  const id = params.id;
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:5000';
  const quotationRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchQuotation = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`quotations/${id}`);
        const data = await res.json();
        setQuotation(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchQuotation();
  }, [id]);
  // Add this useEffect inside QuotationPreview(), after the existing state declarations

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'quotation-font-override';
    style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet');
    
    [data-quotation-page] * {
      font-family: 'Roboto', Georgia, serif !important;
    }
  `;
    document.head.appendChild(style);
    return () => { document.getElementById('quotation-font-override')?.remove(); };
  }, []);


  const handleDownloadPDF = async () => {
    const element = quotationRef.current;
    if (!element) return;

    const opt = {
      margin: 0,
      filename: `Quotation_${quotation?.quotationNumber || 'export'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        // FIX: html2canvas cannot parse oklch() used by Tailwind v4.
        // onclone runs on the captured clone before rendering — inject
        // explicit hex overrides for every color used in this document.
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
          .text-gray-600     { color: #4b5563 !important; }
          .text-gray-700     { color: #374151 !important; }

          .border-black      { border-color: #000000 !important; }
          .border-gray-200   { border-color: #e5e7eb !important; }

          .divide-black > * + * { border-color: #000000 !important; }
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

    // Dynamic import to avoid SSR errors
    const html2pdf = (await import('html2pdf.js')).default;
    await html2pdf().set(opt).from(element).save();
  };

  const handleConvertToProforma = async () => {
    if (!window.confirm('Convert this quotation to a Proforma Invoice?')) return;
    setConverting(true);
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
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-black uppercase tracking-widest text-black">Fetching Data...</h2>
        <p className="text-xs text-secondary mt-2 uppercase font-bold tracking-widest">Please wait a moment</p>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-black uppercase text-black">Quotation Not Found</h1>
        <Link href="/quotations" className="text-primary font-bold uppercase text-xs hover:underline mt-4">
          Back to Quotations
        </Link>
      </div>
    );
  }

  const items = quotation?.items || [];
  const MAX_ROWS = 10;
  const displayItems = items.slice(0, MAX_ROWS);

  return (
    // FIX 1: pt-20 clears the fixed toolbar; was py-10 causing content to hide under toolbar
    <div data-quotation-page className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 pb-10 selection:bg-primary selection:text-white relative">

      {downloading && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-black uppercase tracking-widest text-black">Generating PDF...</h2>
          <p className="text-xs text-secondary mt-2 uppercase font-bold tracking-widest">Your download will start shortly</p>
        </div>
      )}

      {/* TOOLBAR — FIX 2: py-2 gives the pill proper vertical breathing room; was py-0 */}
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
          <Link href={`/quotations/edit/${id}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors group" title="Edit Quotation">
            <Edit2 className="w-5 h-5 text-gray-600 group-hover:text-black" />
          </Link>
          {!quotation?.performa_invoice && (
            <>
              <div className="w-[1px] h-6 bg-gray-200" />
              <button 
                onClick={handleConvertToProforma} 
                disabled={converting}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dim transition-all active:scale-95 group shadow-lg disabled:opacity-50"
              >
                {converting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
                <span className="text-xs font-bold uppercase tracking-widest">Convert to PI</span>
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          .min-h-screen { background: white !important; display: block !important; padding: 0 !important; }
          @page { size: A4; margin: 0; }
        }
      `}</style>

      {/* 
        A4 DOCUMENT
        FIX 3: px-[10mm] py-[8mm] — uniform, slightly tighter vertical padding than before.
        Was p-[10mm] which is fine but asymmetric with content weight top vs bottom.
        h-[295mm] kept for strict A4 clip; shadow kept for screen preview.
      */}
      <div
        ref={quotationRef}
        className="w-[210mm] h-[297mm] flex flex-col bg-white px-[10mm] py-[8mm] text-black font-serif text-[10px] leading-[1.3] shadow-2xl origin-top print:shadow-none print:w-full print:h-auto overflow-hidden"
      >

        {/* ── HEADER BLOCK ── */}
        <div className="border border-black">

          {/* FIX 4: gap-3 tightens logo↔text; was gap-10 which pushed text too far right.
               p-[6px] gives compact but not cramped header row. */}
          <div className="flex items-center gap-3 px-[8px] py-[6px] border-b border-black">
            <div className="w-[62px] h-[62px] flex-shrink-0 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              {/* FIX 5: text-[22px] instead of text-3xl — proportional for A4 at 10px base */}
              <div className="mb-[3px]">
                <span className="text-[22px] font-bold leading-none">Unitech</span>
                <span className="text-[22px] font-light ml-[8px] leading-none">Valves &amp; Automation</span>
              </div>
              <p className="text-[9px] leading-[1.5]">Plot No. 6234, Road No. 62, G.I.D.C., Sachin, Surat - 394230, Gujarat, India.</p>
              <p className="text-[9px] leading-[1.5]">
                Web: www.unitechvalves.com
                <span className="ml-[16px]">Email: sales@unitechvalves.com</span>
              </p>
            </div>
          </div>

          {/* QUOTATION TITLE — p-[5px] keeps it slim but visible */}
          <div className="text-center border-b border-black py-[5px] font-bold text-[10px] tracking-widest">
            QUOTATION
          </div>

          {/* CLIENT + META GRID
              FIX 6: px-[8px] py-[6px] — consistent horizontal padding, slightly more vertical air */}
          <div className="grid grid-cols-2 border-black">
            <div className="px-[8px] py-[6px] border-r border-black text-[10px] leading-[1.6]">
              <p className="font-bold">{quotation?.client?.name}</p>
              <p>{quotation?.client?.address}</p>
              <p><span className="font-bold">Kind Attn :</span> {quotation?.client?.contact}</p>
              <p><span className="font-bold">Contact No :</span> {quotation?.client?.phone}</p>
            </div>
            <div className="px-[8px] py-[6px] text-[10px] leading-[1.7]">
              <div className="flex justify-between">
                <span>Quotation No :</span>
                <span className="font-semibold">{quotation?.quotationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date :</span>
                <span>{formatDate(quotation?.date, 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span>Enq. Ref :</span>
                <span>{quotation?.referencePerson}</span>
              </div>
              <div className="flex justify-between">
                <span>Attended by :</span>
                <span>Jitendra Kalambi</span>
              </div>
              <div className="flex justify-between">
                <span>Contact No :</span>
                <span>8970612095</span>
              </div>
            </div>
          </div>
        </div>

        {/* INTRO LINE
            FIX 7: px-[8px] py-[4px] — matches cell padding rhythm; was p-[5px] */}
        <div className="px-[8px] py-[4px] text-[10px] leading-[1.5]">
          Dear Sir, Thank you very much for your enquiry and have pleasure in quoting our offer as under for your favourable consideration.
        </div>

        {/* TABLE + FOOTER OUTER BORDER */}
        <div className="border border-black flex flex-col flex-1">

          {/* TABLE AREA */}
          <div className="flex-1 relative overflow-hidden">

            {/* Persistent vertical column dividers */}
            <div className="absolute inset-0 flex pointer-events-none z-0">
              <div className="w-[28px] border-r border-black h-full" />
              <div className="flex-1 border-r border-black h-full" />
              <div className="w-[56px] border-r border-black h-full" />
              <div className="w-[46px] border-r border-black h-full" />
              <div className="w-[70px] border-r border-black h-full" />
              <div className="w-[46px] border-r border-black h-full" />
              <div className="w-[46px] border-r border-black h-full" />
              <div className="w-[66px] h-full" />
            </div>

            <table className="w-full border-collapse table-fixed text-[10px] relative z-10">
              <thead>
                {/* FIX 8: h-[28px] — slightly reduced from 30px; tracking-wide on headers */}
                <tr className="border-b border-black">
                  <th className="h-[28px] w-[28px] font-bold">Sr</th>
                  <th className="h-[28px]  font-bold">DESCRIPTION / PART NO</th>
                  <th className="h-[28px] w-[56px] font-bold">IMAGE</th>
                  <th className="h-[28px] w-[46px] font-bold">QTY</th>
                  <th className="h-[28px] w-[70px] font-bold">VALVE SIZE</th>
                  <th className="h-[28px] w-[46px] font-bold">PRICE</th>
                  <th className="h-[28px] w-[46px] font-bold">DISC %</th>
                  <th className="h-[28px] w-[66px] font-bold">PRICE</th>
                </tr>
              </thead>
              <tbody>
                {displayItems.map((item: any, index: number) => {
                  const imageUrl = item.product?.image;
                  const quantity = item.quantity || item.qty || 0;
                  const valveSize = item.product?.valveSize || item.valveSize || 0;
                  const discount = item.discount || 0;
                  const rate = item.rate || item.unitPrice || 0;
                  const totalPrice = item.amount || (quantity * rate);
                  return (
                    // FIX 9: border-b border-black on each row — was missing, causing rows to float
                    <tr key={index} className="border-b border-black">
                      <td className="px-[5px] py-[5px] text-center align-top leading-[1.3]">
                        {index + 1}
                      </td>
                      <td className="px-[6px] py-[5px] align-top leading-[1.3]">
                        <div className="flex flex-col gap-[2px]">
                          <span className="font-bold uppercase text-[10px]">{item.product?.name}</span>
                          <span className="text-[9px] text-gray-700">{item.product?.description}</span>
                        </div>
                      </td>
                      <td className=" text-center align-top">
                        {imageUrl ? (
                          <img className="w-9 h-9 object-contain mx-auto" src={`${API_BASE}${imageUrl}`} alt="product" />
                        ) : (
                          <img className="w-9 h-9 object-contain mx-auto" src="/no-image.png" alt="no image" />
                        )}
                      </td>
                      <td className="px-[5px] py-[5px] text-center align-top leading-[1.3]">
                        {quantity} Nos.
                      </td>
                      <td className="px-[5px] py-[5px] text-center align-top leading-[1.3]">
                        {valveSize}
                      </td>
                      <td className="px-[5px] py-[5px] text-right align-top leading-[1.3]">
                        {rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-[5px] py-[5px] text-center align-top leading-[1.3]">
                        {discount} %
                      </td>
                      <td className="px-[5px] py-[5px] text-right align-top leading-[1.3]">
                        {totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* TOTALS — absolute bottom-right, width matches last 3 columns: 76+76+86=238 → 240px */}
            <div className="absolute bottom-0 right-0 w-[240px] border-t border-l border-black z-10 bg-white">
              <div className="flex justify-between px-[8px] py-[3px] border-b border-black">
                <span className="font-bold">SUB TOTAL</span>
                <span>{quotation?.subTotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between px-[8px] py-[3px] border-b border-black">
                <span className="font-bold">ADDL. DISCOUNT</span>
                <span>{quotation?.Additional_discount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between px-[8px] py-[3px] border-b border-black">
                <span className="font-bold">TAX.</span>
                <span>{quotation?.tax?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between px-[8px] py-[3px]">
                <span className="font-bold">GRAND TOTAL</span>
                <span className="font-bold">{quotation?.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* FOOTER
              FIX 10: px-[8px] py-[6px] — consistent with header cells; was p-[5px] */}
          <div className="border-t border-black grid grid-cols-2 mt-auto">
            <div className="px-[8px] py-[6px] border-r border-black text-[9.5px] leading-[1.55]">
              <p className="font-bold underline mb-[3px]">TERMS &amp; CONDITIONS OF SALES</p>
              <p dangerouslySetInnerHTML={{ __html: quotation?.terms }} />
            </div>
            <div className="px-[8px] py-[6px] text-[9.5px] flex flex-col justify-between">
              <div className="leading-[1.55]">
                <p>GSTIN No : 27AABCP7610L1ZJ</p>
                <p className="mt-[4px]">
                  Please feel free to contact us for any further techno-commercial clarification for placement of order at the earliest.
                </p>
              </div>
              <div className="text-center mt-[12px]">
                <p>Yours Faithfully</p>
                <p className="font-bold mt-[6px]">For Unitech Valves &amp; Automation.</p>
                <p className="mt-[18px] font-bold">D C Jethwani</p>
                <p>Managing Director</p>
                <p className="text-[9px] mt-[3px]">Doc No: PVLMKT04-02</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}