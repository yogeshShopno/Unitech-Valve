'use client';

import React, { useState, useEffect } from 'react';
import { Shell } from '@/components/Shell';
import { Save, Globe, Mail, MapPin, Building2, FileText, Hash, Image as ImageIcon, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function MasterSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    companyName: '',
    address: '',
    website: '',
    email: '',
    logo: '',
    termsAndConditions: '',
    hsnCode: ''
  });

  useEffect(() => {
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL}master`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.keys(settings).forEach(key => {
        if (key !== 'logo') {
          formData.append(key, settings[key as keyof typeof settings]);
        }
      });
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}master`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        alert('Settings updated successfully');
      } else {
        alert('Failed to update settings');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <section className="p-8 max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight uppercase">Master Configuration</h1>
            <p className="text-secondary font-medium mt-1">Configure global parameters for the entire application</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-white px-6 py-3 font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Basic Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-surface-container-low p-8 shadow-sm border border-surface-container-high rounded-none">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-secondary mb-6 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Company Identity
              </h2>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Company Name</label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    placeholder="Enter official company name"
                    className="w-full bg-surface-container-lowest p-4 border border-surface-container-high focus:border-primary outline-none font-bold text-on-surface transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Official Website</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                      <input
                        type="url"
                        value={settings.website}
                        onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                        placeholder="https://example.com"
                        className="w-full bg-surface-container-lowest p-4 pl-12 border border-surface-container-high focus:border-primary outline-none font-medium text-on-surface transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Business Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        placeholder="contact@company.com"
                        className="w-full bg-surface-container-lowest p-4 pl-12 border border-surface-container-high focus:border-primary outline-none font-medium text-on-surface transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Headquarters Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-secondary" />
                    <textarea
                      rows={3}
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      placeholder="Full physical address"
                      className="w-full bg-surface-container-lowest p-4 pl-12 border border-surface-container-high focus:border-primary outline-none font-medium text-on-surface transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-8 shadow-sm border border-surface-container-high rounded-none">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-secondary mb-6 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Legal & Compliance
              </h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Default HSN Code</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                    <input
                      type="text"
                      value={settings.hsnCode}
                      onChange={(e) => setSettings({ ...settings, hsnCode: e.target.value })}
                      placeholder="e.g., 8481"
                      className="w-full bg-surface-container-lowest p-4 pl-12 border border-surface-container-high focus:border-primary outline-none font-mono font-bold text-on-surface transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Terms & Conditions</label>
                  <textarea
                    rows={8}
                    value={settings.termsAndConditions}
                    onChange={(e) => setSettings({ ...settings, termsAndConditions: e.target.value })}
                    placeholder="Enter terms shown on quotations and invoices"
                    className="w-full bg-surface-container-lowest p-4 border border-surface-container-high focus:border-primary outline-none font-medium text-on-surface transition-colors text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Asset Management */}
          <div className="space-y-6">
            <div className="bg-surface-container-low p-8 shadow-sm border border-surface-container-high rounded-none">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-secondary mb-6 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Brand Assets
              </h2>
              <div className="space-y-4">
                <input
                  type="file"
                  id="logo-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setLogoFile(e.target.files[0]);
                    }
                  }}
                />
                <div
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  className="aspect-square bg-surface-container-lowest border-2 border-dashed border-surface-container-highest flex flex-col items-center justify-center p-4 text-center group hover:border-primary transition-all cursor-pointer overflow-hidden"
                >
                  {logoFile || settings.logo ? (
                    <img
                      src={logoFile ? URL.createObjectURL(logoFile) : `http://localhost:5000${settings.logo}`}
                      alt="Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                        <ImageIcon className="w-6 h-6 text-secondary group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-secondary group-hover:text-primary">Upload Logo</p>
                      <p className="text-[9px] text-on-surface-variant mt-1">Recommended: 400x400 PNG</p>
                    </>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-secondary tracking-widest text-center block">Logo Preview</label>
                  <p className="text-[9px] text-center text-on-surface-variant italic">
                    {logoFile ? `Selected: ${logoFile.name}` : settings.logo ? 'Current: logo stored in server' : 'No logo uploaded'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 p-6 border border-primary/10">
              <h3 className="text-[10px] font-black uppercase text-primary tracking-widest mb-2">Pro Tip</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                These settings are used to generate dynamic fields in **Quotations**, **Invoices**, and **System Headers**. Keep them updated for legal compliance.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
