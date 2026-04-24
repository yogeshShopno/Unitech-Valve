'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Shell } from '@/components/Shell';
import {
  Plus,
  Trash2,
  ChevronLeft,
  Save,
  Calculator,
  User,
  Package,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '@/lib/api';

interface QuotationFormProps {
  id?: string;
  type?: 'quotation' | 'proforma' | 'po';
}

export default function QuotationForm({ id, type = 'quotation' }: QuotationFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialClientId = searchParams.get('clientId');

  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    client: initialClientId || '',
    date: new Date().toISOString().split('T')[0],
    items: [] as any[],
    subTotal: 0,
    tax: 0,
    Additional_discount: 0,
    total: 0,
    referencePerson: '', // Changed from referencePerson to referencePerson to match model/edit page
    terms: '',
    delivery: '',
    validity: '',
    payment: '',
    warranty: '',
    status: 'pending',
    proformaNumber: '', // Added for proforma
    quotationNumber: '' // Added for proforma reference
  });

  const [searchClient, setSearchClient] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [activeItemSearch, setActiveItemSearch] = useState<number | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Refs for dropdowns
  const clientInputRef = useRef<HTMLInputElement>(null);
  const clientDropdownRef = useRef<HTMLDivElement>(null);
  const productInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const productDropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/', '') ?? 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientRes, productRes] = await Promise.all([
          apiFetch(type === 'po' ? 'purchase-parties' : 'clients'),
          apiFetch('products')
        ]);
        const clientsData = await clientRes.json();
        const productsData = await productRes.json();
        setClients(clientsData.clients || []);
        setProducts(productsData.products || []);

        if (id) {
          let endpoint = '';
          if (type === 'proforma') endpoint = `proforma-invoices/${id}`;
          else if (type === 'po') endpoint = `purchase-orders/${id}`;
          else endpoint = `quotations/${id}`;
          
          const quoteRes = await apiFetch(endpoint);
          const quoteData = await quoteRes.json();
          if (quoteRes.ok) {
            setFormData({
              ...quoteData, // Spread all fields
              client: type === 'po' ? (quoteData.purchaseParty?._id || quoteData.purchaseParty || '') : (quoteData.client?._id || quoteData.client || ''),
              date: quoteData.date ? new Date(quoteData.date).toISOString().split('T')[0] : '',
              items: quoteData.items || [],
              subTotal: quoteData.subTotal || 0,
              tax: quoteData.tax || 0,
              Additional_discount: quoteData.Additional_discount || 0,
              total: quoteData.total || 0,
              referencePerson: quoteData.referencePerson || '',
              terms: quoteData.terms || '',
              delivery: quoteData.delivery || '',
              validity: quoteData.validity || '',
              payment: quoteData.payment || '',
              warranty: quoteData.warranty || '',
              status: quoteData.status || 'pending'
            });
            const party = type === 'po' ? quoteData.purchaseParty : quoteData.client;
            if (party) {
              setSearchClient(party.name);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Handle click outside for client dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        clientInputRef.current &&
        !clientInputRef.current.contains(event.target as Node) &&
        clientDropdownRef.current &&
        !clientDropdownRef.current.contains(event.target as Node)
      ) {
        setShowClientDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle click outside for product dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeItemSearch !== null) {
        const input = productInputRefs.current[activeItemSearch];
        const dropdown = productDropdownRefs.current[activeItemSearch];

        if (
          input &&
          !input.contains(event.target as Node) &&
          dropdown &&
          !dropdown.contains(event.target as Node)
        ) {
          setActiveItemSearch(null);
          setProductSearchQuery('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeItemSearch]);

  const calculateTotals = (items: any[], globalDiscount: number = formData.Additional_discount) => {
    const subTotal = items.reduce((acc, item) => {
      const itemAmount = item.quantity * item.rate;
      const itemDiscount = (itemAmount * (item.discount || 0)) / 100;
      return acc + (itemAmount - itemDiscount);
    }, 0);

    const tax = subTotal * 0.18;
    const total = subTotal + tax - globalDiscount;

    setFormData(prev => ({ ...prev, items, subTotal, tax, total, Additional_discount: globalDiscount }));
  };

  const addNewLine = () => {
    const newItem = {
      product: '',
      description: '',
      hsnCode: '',
      quantity: 1,
      rate: 0,
      discount: 0,
      amount: 0
    };
    calculateTotals([...formData.items, newItem]);
  };

  const selectProductForItem = (index: number, product: any) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      product: product._id,
      description: product.name,
      hsnCode: product.hsnCode || '',
      rate: product.unitPrice,
      image: product.image,
      valveSize: product.valveSize,
      unit: product.unit,
      discount: 0,
      amount: newItems[index].quantity * product.unitPrice
    };
    calculateTotals(newItems);
    setActiveItemSearch(null);
    setProductSearchQuery('');
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    calculateTotals(newItems);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    const itemAmount = newItems[index].quantity * newItems[index].rate;
    const itemDiscount = (itemAmount * (newItems[index].discount || 0)) / 100;
    newItems[index].amount = itemAmount - itemDiscount;

    calculateTotals(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client) return alert('Please select a party');
    if (formData.items.length === 0) return alert('Please add at least one item');

    const compiledTerms = `1. Price: Ex-Works, Thane <br/>
                        (A) Packing & Forwarding: @3% Extra <br/>
                        (B) GST: @18% Extra <br/>
                        (C) Freight: To Pay Basis <br/>
                        (D) Insurance: To be arranged by you <br/>
                        2. Delivery: ${formData.delivery} Weeks from the date of receipt of Technically & Commercially Clear Order <br/>
                        3. Validity: ${formData.validity} Days from the date of quotation <br/>
                        4. Payment: ${formData.payment} % against Proforma Invoice before dispatch through RTGS <br/>
                        5. Warranty: ${formData.warranty}  Months from the date of supply or 12 months from the date of commissioning, whichever is earlier <br/>
                        HSN Code: 84818030`;
    try {
      const method = id ? 'PUT' : 'POST';
      let baseEndpoint = 'quotations';
      if (type === 'proforma') baseEndpoint = 'proforma-invoices';
      else if (type === 'po') baseEndpoint = 'purchase-orders';

      const endpoint = id ? `${baseEndpoint}/${id}` : baseEndpoint;
      
      const submissionData = { ...formData, terms: compiledTerms };
      if (type === 'po') {
        // @ts-ignore
        submissionData.purchaseParty = formData.client;
        // @ts-ignore
        delete submissionData.client;
      }

      const res = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(submissionData)
      });
      if (res.ok) {
        let redirectPath = '/quotations';
        if (type === 'proforma') redirectPath = '/proforma-invoices';
        else if (type === 'po') redirectPath = '/purchase-orders';
        router.push(redirectPath);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  const filteredClients = clients.filter(c =>
    !searchClient || c.name.toLowerCase().includes(searchClient.toLowerCase())
  );

  const selectedClient = clients.find(c => c._id === formData.client) || null;

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-container flex items-center justify-center">
        <div className="text-secondary font-black uppercase text-[10px] animate-pulse">Establishing Secure Connection...</div>
      </div>
    );
  }

  return (
    <Shell>
      <section className="p-8 space-y-8 flex-1 w-full mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-surface-container-high pb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-surface-container-high transition-colors border border-surface-container-high group">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">
                {id 
                  ? `Edit ${type === 'proforma' ? 'Proforma Invoice' : type === 'po' ? 'Purchase Order' : 'Quotation'}` 
                  : `Generate ${type === 'proforma' ? 'Proforma Invoice' : type === 'po' ? 'Purchase Order' : 'Quotation'}`}
              </h1>
              <p className="text-[10px] font-black text-secondary uppercase tracking-widest flex items-center gap-2">
                <Check className="w-3 h-3 text-primary" /> Integrated {type === 'po' ? 'Procurement' : 'Billing'} System
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            {type === 'quotation' ? (
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="bg-surface-container-lowest p-3 border border-surface-container-high outline-none font-bold text-xs uppercase"
              >
                <option value="pending">Pending</option>
                <option value="inprogress">In Progress</option>
                <option value="complete">Complete</option>
                <option value="reject">Reject</option>
              </select>
            ) : (
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="bg-surface-container-lowest p-3 border border-surface-container-high outline-none font-bold text-xs uppercase"
              >
                <option value="pending">Pending</option>
                <option value={type === 'po' ? 'completed' : 'paid'}>{type === 'po' ? 'Completed' : 'Paid'}</option>
                <option value="cancelled">Cancelled</option>
              </select>
            )}
            <button
              onClick={handleSubmit}
              className="bg-primary text-white px-8 py-4 text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-primary/90 shadow-2xl transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              {id 
                ? `Update ${type === 'proforma' ? 'Invoice' : type === 'po' ? 'Order' : 'Quotation'}` 
                : `Save ${type === 'proforma' ? 'Invoice' : type === 'po' ? 'Order' : 'Quotation'}`}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Main Form Area */}
          <div className="col-span-12 lg:col-span-9 space-y-8">
            {/* 1. Party & Meta Info */}
            <div className="bg-surface-container-low border border-surface-container-high p-8 shadow-sm">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest flex items-center gap-2">
                    <User className="w-3 h-3 text-primary" /> Select Party
                  </label>
                  <div className="relative">
                    <input
                      ref={clientInputRef}
                      type="text"
                      placeholder="Search Party Name..."
                      value={searchClient}
                      onChange={(e) => {
                        setSearchClient(e.target.value);
                        setShowClientDropdown(true);
                      }}
                      onFocus={() => {
                        setShowClientDropdown(true);
                      }}
                      className="w-full bg-surface-container-lowest p-4 border border-surface-container-high focus:border-primary outline-none font-bold text-sm uppercase"
                    />
                    <AnimatePresence>
                      {showClientDropdown && (
                        <motion.div
                          ref={clientDropdownRef}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 right-0 z-50 bg-white border border-surface-container-high shadow-2xl max-h-60 overflow-y-auto mt-1"
                        >
                          {filteredClients.length > 0 ? (
                            filteredClients.map(client => (
                              <div
                                key={client._id}
                                onClick={() => {
                                  setFormData({ ...formData, client: client._id });
                                  setSearchClient(client.name);
                                  setShowClientDropdown(false);
                                }}
                                className="p-4 hover:bg-primary/5 cursor-pointer border-b border-surface-container border-dashed last:border-0 transition-colors"
                              >
                                <div className="font-black text-xs uppercase text-on-surface">{client.name}</div>
                                <div className="text-[9px] text-secondary font-mono mt-1">GSTIN: {client.gstin}</div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-[10px] text-secondary italic">
                              No parties found
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Quotation Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-surface-container-lowest p-4 border border-surface-container-high outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Enquiry Reference</label>
                  <input
                    type="text"
                    placeholder="Enter Enquiry Ref..."
                    value={selectedClient?.referencePerson}
                    onChange={(e) => setFormData({ ...formData, referencePerson: e.target.value })}
                    className="w-full bg-surface-container-lowest p-4 border border-surface-container-high outline-none font-bold text-sm uppercase"
                  />
                </div>
              </div>

              {selectedClient && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 bg-primary/5 p-4 border border-primary/20 flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase text-primary tracking-tighter">Billing To</div>
                    <div className="font-black text-sm uppercase">{selectedClient.name}</div>
                    <div className="text-[10px] text-secondary font-medium">{selectedClient.address}</div>
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => {
                        setFormData({ ...formData, client: '' });
                        setSearchClient('');
                      }}
                      className="p-2 text-secondary hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="text-xs font-mono font-black text-on-surface">{selectedClient.gstin}</div>
                    <div className="text-[10px] text-secondary font-bold">{selectedClient.phone}</div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* 2. Items Table with Integrated Search */}
            <div className="bg-surface-container-low border border-surface-container-high shadow-sm">
              <div className="p-6 border-b border-surface-container-high flex justify-between items-center bg-surface-container-lowest">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  <h2 className="text-xs font-black uppercase tracking-widest text-on-surface">Line Items</h2>
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={addNewLine}
                    className="text-white bg-primary hover:bg-primary/10 font-bold hover:text-primary px-4 py-2 text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all border border-primary"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add New Item
                  </button>
                </div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-highest border-b border-surface-container-high">
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-secondary w-16">#</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-secondary">Particulars / Description</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-secondary w-28 text-right">Qty</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-secondary w-36 text-right">Unit Price (₹)</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-secondary w-36 text-right">Discount %</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-secondary w-36 text-right">Total (₹)</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-secondary w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {formData.items.map((item: any, index: number) => (
                    <tr key={index} className="group hover:bg-surface-container-lowest transition-colors">
                      <td className="px-6 py-6 text-xs font-black text-secondary">{index + 1}</td>
                      <td className="">
                        <div className="flex items-center justify-between space-y-1 p-1 ">
                          <div className={`relative ${activeItemSearch === index ? 'z-50' : 'z-10'}`} >
                            <input
                              ref={(el) => {
                                productInputRefs.current[index] = el;
                              }}
                              type="text"
                              value={item.description}
                              onChange={(e) => {
                                updateItem(index, 'description', e.target.value);
                                setProductSearchQuery(e.target.value);
                                setActiveItemSearch(index);
                              }}
                              onFocus={() => {
                                setActiveItemSearch(index);
                                setProductSearchQuery('');
                              }}
                              placeholder="Type to search item from Master..."
                              className="w-full bg-transparent outline-none font-bold text-xs uppercase placeholder:text-secondary/40"
                            />

                            <AnimatePresence>
                              {activeItemSearch === index && (
                                <motion.div
                                  ref={(el) => {
                                    productDropdownRefs.current[index] = el;
                                  }}
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 5 }}
                                  className="absolute top-full left-0 right-0 z-[60] bg-white border border-surface-container-high shadow-2xl max-h-48 overflow-y-auto mt-2"
                                >
                                  {filteredProducts.length > 0 ? (
                                    filteredProducts.map(p => (
                                      <div
                                        key={p._id}
                                        onClick={() => selectProductForItem(index, p)}
                                        className="p-3 hover:bg-primary/5 cursor-pointer border-b border-surface-container border-dashed last:border-0"
                                      >
                                        <div className="flex justify-between items-center">
                                          <div className="font-bold text-[10px] uppercase text-primary">{p.name}</div>
                                          <div className="text-[9px] font-black">₹{p.unitPrice.toLocaleString()}</div>
                                        </div>
                                        <div className="text-[8px] text-secondary font-mono mt-0.5">HSN: {p.hsnCode || 'N/A'} | {p.unitPrice} / {p.unit || 'Unit'}</div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="p-3 text-[10px] text-secondary italic">No matching item in Master. Use custom text.</div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                            <div className="flex gap-4">
                              <span className="text-[9px] text-secondary font-mono">HSN: {item?.hsnCode || '---'}</span>
                              <span className="text-[9px] text-secondary font-mono">Valve Size: {item?.valveSize || '---'}</span>
                            </div>
                          </div>
                          {item.image && (<img className='w-20 h-20' src={`${API_BASE}${item.image}`} alt="product image" />)}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                          className="w-20 bg-surface-container-lowest p-2 border border-surface-container-high text-right font-black text-xs outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-6 py-6 text-right">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => updateItem(index, 'rate', Number(e.target.value))}
                          className="w-28 bg-surface-container-lowest p-2 border border-surface-container-high text-right font-black text-xs outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-6 py-6 text-right">
                        <input
                          type="number"
                          value={item.discount}
                          onChange={(e) => updateItem(index, 'discount', Number(e.target.value))}
                          className="w-28 bg-surface-container-lowest p-2 border border-surface-container-high text-right font-black text-xs outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-6 py-6 text-right text-xs font-black text-on-surface">
                        ₹{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-6 text-right">
                        <button
                          onClick={() => removeItem(index)}
                          className="p-2 text-secondary hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {formData.items.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-20 text-center space-y-4">
                        <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center mx-auto">
                          <Package className="w-6 h-6 text-secondary/30" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] font-black uppercase text-secondary tracking-widest">No Items Added</div>
                          <button onClick={addNewLine} className="text-primary text-[10px] font-black uppercase hover:underline">Start by adding a line</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="p-4 bg-surface-container-lowest flex justify-center border-t border-surface-container-high">
                <button
                  onClick={addNewLine}
                  className="flex items-center gap-2 text-[10px] font-black uppercase text-secondary hover:text-primary transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Insert Another Line
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="bg-surface-container-low border border-surface-container-high p-8 space-y-4 shadow-sm">
              <label className="text-[10px] font-black uppercase text-secondary tracking-widest flex items-center gap-2">
                Conditions & Terms
              </label>

              <div className="space-y-4">
                <p className="text-[10px] leading-relaxed text-secondary font-black uppercase">
                  TERMS & CONDITIONS OF SALES <br />
                  1. Price: Ex-Works, Thane   <br />
                  (A) Packing & Forwarding: @3% Extra  <br />
                  (B) GST: @18% Extra  <br />
                  (C) Freight: To Pay Basis  <br />
                  (D) Insurance: To be arranged by you  <br />
                  2. Delivery: <input className='w-20 bg-surface-container-lowest p-1 my-1 border border-surface-container-high text-right font-black text-[10px] outline-none focus:border-primary' type="text" value={formData.delivery} onChange={(e) => setFormData({ ...formData, delivery: e.target.value })} /> Weeks from the date of receipt of Technically & Commercially Clear Order<br />
                  3. Validity: <input className='w-20 bg-surface-container-lowest p-1 my-1 border border-surface-container-high text-right font-black text-[10px] outline-none focus:border-primary' type="text" value={formData.validity} onChange={(e) => setFormData({ ...formData, validity: e.target.value })} /> Days from the date of quotation. <br />
                  4. Payment: <input className='w-20 bg-surface-container-lowest p-1 my-1 border border-surface-container-high text-right font-black text-[10px] outline-none focus:border-primary' type="text" value={formData.payment} onChange={(e) => setFormData({ ...formData, payment: e.target.value })} /> % against proforma invoice before dispatch through RTGS. <br />
                  5. Warranty: <input className='w-20 bg-surface-container-lowest p-1 my-1 border border-surface-container-high text-right font-black text-[10px] outline-none focus:border-primary' type="text" value={formData.warranty} onChange={(e) => setFormData({ ...formData, warranty: e.target.value })} /> Months from the date of supply or 12 months from the date of commissioning, whichever is earlier <br />
                  HSN Code: 84818030
                </p>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Totals */}
          <div className="col-span-12 lg:col-span-3 text-white space-y-6">
            <div className="bg-primary p-8 shadow-2xl sticky top-8">
              <div className="flex items-center gap-2 border-b border-surface-container border-opacity-10 pb-6 mb-8">
                <Calculator className="w-4 h-4 text-white" />
                <h2 className="text-[11px] font-black uppercase tracking-widest text-surface-container-low">Financial Overview</h2>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center group">
                  <span className="text-[10px] font-bold text-white uppercase ">Taxable Value</span>
                  <span className="text-sm font-black text-white">₹{formData.subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-[10px] font-bold text-white uppercase ">GST (18%)</span>
                  <span className="text-sm font-black text-white">₹{formData.tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                {formData.status === 'complete' && (
                  <div className="flex justify-between items-center group pt-4 border-t border-white/10">
                    <span className="text-[10px] font-bold text-white uppercase ">Additional Discount (₹)</span>
                    <input
                      type="number"
                      value={formData.Additional_discount}
                      onChange={(e) => calculateTotals(formData.items, Number(e.target.value))}
                      className="w-24 p-2 bg-white/10 border border-white/20 text-right font-black text-xs text-white outline-none focus:border-white"
                    />
                  </div>)
                }

                <div className="pt-8 border-t border-surface-container border-opacity-10">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black text-white uppercase tracking-widest">Grand Total</span>
                    <div className="text-right">
                      <div className="text-2xl font-black text-white leading-none">₹{formData.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      <div className="text-[8px] font-black text-white uppercase mt-2 italic">Including all applicable taxes</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-surface-container border-opacity-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Pricing Strategy Applied</span>
                </div>
                <div className="text-[8px] text-surface-container-highest leading-relaxed font-bold uppercase italic opacity-60">
                  * Values are based on Standard Industrial Tariff for Engineering services.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
