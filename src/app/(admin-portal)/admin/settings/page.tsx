'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { api, ApiError } from '@/lib/apiClient';
import {
  Sliders, Image as ImageIcon, Monitor, BellRing, Settings2,
  Loader2, Save, Plus, X, Palette, Type, Video, CheckCircle2,
  Circle, Shield, ShieldCheck, FileJson, FileText, Copy, RefreshCcw, Database
} from 'lucide-react';

type Tab = 'media' | 'site' | 'general' | 'notifications' | 'pages';

interface PageSection { title: string; content: string; }
interface PageContent { badge?: string; title: string; subtitle?: string; sections: PageSection[]; }

const PAGE_SLUGS = [
  { slug: 'privacy_policy', label: 'Privacy Policy' },
  { slug: 'terms_of_service', label: 'Terms of Service' },
  { slug: 'financial_disclosures', label: 'Financial Disclosures' },
  { slug: 'wealth_management', label: 'Wealth Management' },
  { slug: 'personal_banking', label: 'Personal Banking' },
  { slug: 'investment', label: 'Investment' },
  { slug: 'careers', label: 'Careers' },
  { slug: 'security', label: 'Security' },
  { slug: 'help_center', label: 'Help Center' },
  { slug: 'status', label: 'System Status' },
];

interface BannerCompany { name: string; color?: string; }

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>('media');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const load = useCallback(async (isInitial = false) => {
    try {
      if (!isInitial) setLoading(true);
      const res = await api.admin.settings();
      setSettings(res.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(true); }, [load]);

  const save = async (data: Record<string, string | boolean | undefined>) => {
    setSaving(true);
    try {
      await api.admin.updateSettings(data as Record<string, string | boolean>);
      setToast('Settings saved');
      setTimeout(() => setToast(''), 2500);
      await load();
    } catch (err) {
      setToast(err instanceof ApiError ? err.message : 'Save failed');
      setTimeout(() => setToast(''), 3000);
    } finally { setSaving(false); }
  };

  const set = (key: string, value: string) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleFileUpload = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) set(key, ev.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const [editingPage, setEditingPage] = useState(PAGE_SLUGS[0].slug);
  const [pageContent, setPageContent] = useState<PageContent>({ title: '', sections: [] });

  // Load page content when editing page changes
  useEffect(() => {
    const raw = settings[`page_${editingPage}`];
    if (raw) {
      try { setPageContent(JSON.parse(raw)); } catch { setPageContent({ title: '', sections: [] }); }
    } else {
      setPageContent({ title: '', sections: [] });
    }
  }, [editingPage, settings]);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'media', label: 'Global Media', icon: ImageIcon },
    { id: 'site', label: 'Site Controls', icon: Monitor },
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'general', label: 'General', icon: Settings2 },
    { id: 'notifications', label: 'Notifications', icon: BellRing },
  ];

  // Banner companies
  const bannerCompanies: BannerCompany[] = (() => {
    try { return JSON.parse(settings.bannerCompanies || '[]'); } catch { return []; }
  })();

  const setBannerCompanies = (companies: BannerCompany[]) =>
    set('bannerCompanies', JSON.stringify(companies));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <header className="mb-8">
        <h2 className="text-[36px] font-extrabold text-gray-900 tracking-tight">Global Settings</h2>
        <p className="text-gray-500 mt-2">Manage media, branding, site controls, and platform configuration.</p>
      </header>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-bold animate-bounce">
          {toast}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-white rounded-2xl p-2 border border-gray-100 shadow-sm w-fit">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                tab === t.id
                  ? 'bg-orange-50 text-orange-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab: Global Media */}
      {tab === 'media' && (
        <div className="space-y-8">
          {/* Hero Media */}
          <div className="bg-white rounded-[2rem] p-10 border border-gray-50 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl sun-gradient flex items-center justify-center text-white shadow-lg shadow-orange-200">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Hero Section Media</h3>
                <p className="text-gray-500 text-sm">Control the main visual on the landing page hero section.</p>
              </div>
            </div>

            {/* Media type toggle */}
            <div className="mb-8">
              <label className="text-sm font-bold text-gray-700 mb-3 block">Media Type</label>
              <div className="flex gap-3">
                {(['image', 'video'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => set('heroMediaType', type)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                      (settings.heroMediaType || 'image') === type
                        ? 'border-orange-400 bg-orange-50 text-orange-600'
                        : 'border-gray-100 text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    {type === 'image' ? <ImageIcon className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    {type === 'image' ? 'Image' : 'YouTube Video'}
                  </button>
                ))}
              </div>
            </div>

            {/* Image URL */}
            {(settings.heroMediaType || 'image') === 'image' && (
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 ml-1">Image Source (URL or Upload)</label>
                <div className="flex gap-3">
                  <input
                    className="flex-1 bg-[#F8F9FB] border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-2xl px-6 py-4 transition-all outline-none font-medium text-sm"
                    type="url"
                    placeholder="https://example.com/hero-image.jpg"
                    value={settings.heroImageUrl || ''}
                    onChange={e => set('heroImageUrl', e.target.value)}
                  />
                  <label className="flex items-center justify-center bg-[#F8F9FB] border-2 border-dashed border-gray-300 hover:border-orange-400 rounded-2xl px-6 py-4 cursor-pointer transition-all">
                    <span className="text-sm font-bold text-gray-500">Upload File</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload('heroImageUrl', e)} />
                  </label>
                </div>
                {settings.heroImageUrl && (
                    <div className="mt-4 relative w-full h-64 rounded-2xl overflow-hidden border border-gray-100">
                      <Image src={settings.heroImageUrl} alt="Hero preview" fill className="object-cover" unoptimized />
                    </div>
                )}
              </div>
            )}

            {/* YouTube URL */}
            {settings.heroMediaType === 'video' && (
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 ml-1">YouTube URL</label>
                <input
                  className="w-full bg-[#F8F9FB] border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-2xl px-6 py-4 transition-all outline-none font-medium text-sm"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... or embed URL"
                  value={settings.heroVideoUrl || ''}
                  onChange={e => set('heroVideoUrl', e.target.value)}
                />
                {settings.heroVideoUrl && (
                  <div className="mt-4 rounded-2xl overflow-hidden border border-gray-100 aspect-video max-w-lg">
                    <iframe
                      src={settings.heroVideoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Video preview"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => save({ heroMediaType: settings.heroMediaType, heroImageUrl: settings.heroImageUrl, heroVideoUrl: settings.heroVideoUrl })}
                disabled={saving}
                className="sun-gradient text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-orange-100 hover:scale-[1.02] transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Hero Media
              </button>
            </div>
          </div>

          {/* Logo Settings */}
          <div className="bg-white rounded-[2rem] p-10 border border-gray-50 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Type className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Logo</h3>
                <p className="text-gray-500 text-sm">Switch between text logo and SVG image logo.</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-sm font-bold text-gray-700 mb-3 block">Logo Type</label>
              <div className="flex gap-3">
                {(['text', 'svg'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => set('logoType', type)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                      (settings.logoType || 'text') === type
                        ? 'border-orange-400 bg-orange-50 text-orange-600'
                        : 'border-gray-100 text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    {type === 'text' ? <Type className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                    {type === 'text' ? 'Text Logo' : 'SVG Logo'}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="p-6 bg-[#F8F9FB] rounded-2xl mb-6">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Preview</p>
              {(settings.logoType || 'text') === 'text' ? (
                <span className="text-2xl font-black text-orange-600 tracking-tight">CAFT Financial</span>
              ) : settings.logoSvgUrl ? (
                <Image src={settings.logoSvgUrl} alt="Logo" width={160} height={40} className="h-10 w-auto object-contain" unoptimized />
              ) : (
                <span className="text-gray-400 italic text-sm">No SVG URL set</span>
              )}
            </div>

            {(settings.logoType) === 'svg' && (
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 ml-1">SVG Logo Source (URL or Upload)</label>
                <div className="flex gap-3">
                  <input
                    className="flex-1 bg-[#F8F9FB] border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-2xl px-6 py-4 transition-all outline-none font-medium text-sm"
                    type="url"
                    placeholder="https://example.com/logo.svg"
                    value={settings.logoSvgUrl || ''}
                    onChange={e => set('logoSvgUrl', e.target.value)}
                  />
                  <label className="flex items-center justify-center bg-[#F8F9FB] border-2 border-dashed border-gray-300 hover:border-orange-400 rounded-2xl px-6 py-4 cursor-pointer transition-all">
                    <span className="text-sm font-bold text-gray-500">Upload SVG</span>
                    <input type="file" accept=".svg,image/svg+xml" className="hidden" onChange={e => handleFileUpload('logoSvgUrl', e)} />
                  </label>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => save({ logoType: settings.logoType, logoSvgUrl: settings.logoSvgUrl })}
                disabled={saving}
                className="sun-gradient text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-orange-100 hover:scale-[1.02] transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Logo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Site Controls */}
      {tab === 'site' && (
        <div className="space-y-8">
          <div className="bg-white rounded-[2rem] p-10 border border-gray-50 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Trusted Companies Banner</h3>
                <p className="text-gray-500 text-sm">Manage the social proof section below the hero.</p>
              </div>
            </div>

            {/* Company names editor */}
            <div className="mb-8">
              <label className="text-sm font-bold text-gray-700 mb-3 block">Company Names</label>
              <div className="space-y-3">
                {bannerCompanies.map((company, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input
                      className="flex-1 bg-[#F8F9FB] border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                      value={company.name}
                      onChange={e => {
                        const arr = [...bannerCompanies];
                        arr[i] = { ...arr[i], name: e.target.value };
                        setBannerCompanies(arr);
                      }}
                      placeholder="Company name"
                    />
                    {(settings.bannerColorMode || 'same') === 'random' && (
                      <input
                        type="color"
                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                        value={company.color || '#000000'}
                        onChange={e => {
                          const arr = [...bannerCompanies];
                          arr[i] = { ...arr[i], color: e.target.value };
                          setBannerCompanies(arr);
                        }}
                      />
                    )}
                    <button
                      onClick={() => setBannerCompanies(bannerCompanies.filter((_, j) => j !== i))}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setBannerCompanies([...bannerCompanies, { name: '' }])}
                  className="flex items-center gap-2 text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Company
                </button>
              </div>
            </div>

            {/* Color mode */}
            <div className="mb-8">
              <label className="text-sm font-bold text-gray-700 mb-3 block">Color Mode</label>
              <div className="flex gap-3">
                {(['same', 'random'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => set('bannerColorMode', mode)}
                    className={`px-6 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                      (settings.bannerColorMode || 'same') === mode
                        ? 'border-orange-400 bg-orange-50 text-orange-600'
                        : 'border-gray-100 text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    {mode === 'same' ? 'Same Color for All' : 'Random Colors'}
                  </button>
                ))}
              </div>
            </div>

            {/* Default color */}
            {(settings.bannerColorMode || 'same') === 'same' && (
              <div className="mb-8">
                <label className="text-sm font-bold text-gray-700 mb-3 block">Default Text Color</label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer"
                    value={settings.bannerDefaultColor || '#000000'}
                    onChange={e => set('bannerDefaultColor', e.target.value)}
                  />
                  <input
                    className="bg-[#F8F9FB] border-2 border-transparent focus:border-orange-100 rounded-xl px-4 py-3 text-sm font-mono w-32 outline-none"
                    value={settings.bannerDefaultColor || '#000000'}
                    onChange={e => set('bannerDefaultColor', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Text size & font */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 ml-1">Text Size</label>
                <select
                  className="w-full bg-[#F8F9FB] border-2 border-transparent focus:border-orange-100 rounded-xl px-4 py-3 text-sm font-medium outline-none appearance-none"
                  value={settings.bannerTextSize || '2xl'}
                  onChange={e => set('bannerTextSize', e.target.value)}
                >
                  <option value="lg">Large (lg)</option>
                  <option value="xl">Extra Large (xl)</option>
                  <option value="2xl">2XL (default)</option>
                  <option value="3xl">3XL</option>
                  <option value="4xl">4XL</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 ml-1">Font Family</label>
                <select
                  className="w-full bg-[#F8F9FB] border-2 border-transparent focus:border-orange-100 rounded-xl px-4 py-3 text-sm font-medium outline-none appearance-none"
                  value={settings.bannerFontFamily || 'inherit'}
                  onChange={e => set('bannerFontFamily', e.target.value)}
                >
                  <option value="inherit">Default (System)</option>
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Outfit">Outfit</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Merriweather">Merriweather</option>
                  <option value="Nunito">Nunito</option>
                  <option value="monospace">Monospace</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => save({
                  bannerCompanies: JSON.stringify(bannerCompanies),
                  bannerColorMode: settings.bannerColorMode,
                  bannerDefaultColor: settings.bannerDefaultColor,
                  bannerTextSize: settings.bannerTextSize,
                  bannerFontFamily: settings.bannerFontFamily,
                })}
                disabled={saving}
                className="sun-gradient text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-orange-100 hover:scale-[1.02] transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Banner Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: General */}
      {tab === 'general' && (
        <div className="bg-white rounded-[2rem] p-10 border border-gray-50 shadow-sm">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-2xl sun-gradient flex items-center justify-center text-white shadow-lg shadow-orange-200">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">General Settings</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 ml-1">App Name</label>
              <input
                className="w-full bg-[#F8F9FB] border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-2xl px-6 py-4 transition-all outline-none font-medium"
                value={settings.appName || 'CAFT Financial'}
                onChange={e => set('appName', e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 ml-1">Support Email</label>
              <input
                className="w-full bg-[#F8F9FB] border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-2xl px-6 py-4 transition-all outline-none font-medium"
                type="email"
                value={settings.supportEmail || ''}
                onChange={e => set('supportEmail', e.target.value)}
              />
            </div>
          </div>
          <div className="mt-8 space-y-4">
            <h4 className="text-lg font-bold text-gray-900">Developer & Testing</h4>
            <div className="flex items-center justify-between p-6 bg-[#F8F9FB] rounded-2xl border border-orange-100">
              <div>
                <p className="font-bold text-gray-900 text-lg">Enable Test Account</p>
                <p className="text-gray-500">Allow users to log in using the test account credentials without OTP verification.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.testAccountEnabled === 'true'}
                  onChange={e => set('testAccountEnabled', String(e.target.checked))}
                />
                <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#E67E22]"></div>
              </label>
            </div>
          </div>
          <div className="mt-10 flex justify-end">
            <button
              onClick={() => save({ appName: settings.appName, supportEmail: settings.supportEmail, testAccountEnabled: settings.testAccountEnabled })}
              disabled={saving}
              className="sun-gradient text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-orange-100 hover:scale-[1.02] transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Tab: Notifications */}
      {tab === 'notifications' && (
        <div className="bg-white rounded-[2rem] p-10 border border-gray-50 shadow-sm">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <BellRing className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Notification Preferences</h3>
          </div>
          <div className="space-y-4">
            {[
              { key: 'systemAlerts', label: 'System Alerts', desc: 'Receive critical updates about system performance.', defaultOn: true },
              { key: 'securityNotifications', label: 'Security Notifications', desc: 'Notify admin on multiple failed login attempts.', defaultOn: true },
              { key: 'userActivityReports', label: 'User Activity Reports', desc: 'Weekly summaries of user transaction volume.', defaultOn: false },
            ].map(item => (
              <div key={item.key} className={`flex items-center justify-between p-6 bg-[#F8F9FB] rounded-2xl ${settings[item.key] === 'false' ? 'opacity-60' : ''}`}>
                <div>
                  <p className="font-bold text-gray-900 text-lg">{item.label}</p>
                  <p className="text-gray-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings[item.key] !== undefined ? settings[item.key] === 'true' : item.defaultOn}
                    onChange={e => set(item.key, String(e.target.checked))}
                  />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#E67E22]"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Pages */}
      {tab === 'pages' && (
        <div className="space-y-8">
          <div className="bg-white rounded-[2rem] p-10 border border-gray-50 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Page Content Editor</h3>
                <p className="text-gray-500 text-sm">Edit the content of footer link pages. Changes apply immediately.</p>
              </div>
            </div>

            {/* Page selector */}
            <div className="mb-8">
              <label className="text-sm font-bold text-gray-700 mb-3 block">Select Page</label>
              <div className="flex flex-wrap gap-2">
                {PAGE_SLUGS.map(p => (
                  <button
                    key={p.slug}
                    onClick={() => setEditingPage(p.slug)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      editingPage === p.slug
                        ? 'bg-violet-50 text-violet-600 border-2 border-violet-300'
                        : 'bg-gray-50 text-gray-500 border-2 border-transparent hover:border-gray-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Page metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Badge</label>
                <input
                  className="w-full bg-[#F8F9FB] border-2 border-transparent focus:border-violet-100 rounded-xl px-4 py-3 text-sm font-medium outline-none"
                  placeholder="e.g. Legal, Platform"
                  value={pageContent.badge || ''}
                  onChange={e => setPageContent({ ...pageContent, badge: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Title</label>
                <input
                  className="w-full bg-[#F8F9FB] border-2 border-transparent focus:border-violet-100 rounded-xl px-4 py-3 text-sm font-medium outline-none"
                  placeholder="Page title"
                  value={pageContent.title}
                  onChange={e => setPageContent({ ...pageContent, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Subtitle</label>
                <input
                  className="w-full bg-[#F8F9FB] border-2 border-transparent focus:border-violet-100 rounded-xl px-4 py-3 text-sm font-medium outline-none"
                  placeholder="Optional subtitle"
                  value={pageContent.subtitle || ''}
                  onChange={e => setPageContent({ ...pageContent, subtitle: e.target.value })}
                />
              </div>
            </div>

            {/* Sections editor */}
            <div className="mb-8">
              <label className="text-sm font-bold text-gray-700 mb-3 block">Sections</label>
              <div className="space-y-4">
                {pageContent.sections.map((section, i) => (
                  <div key={i} className="bg-[#F8F9FB] rounded-2xl p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Section {i + 1}</span>
                      <button
                        onClick={() => setPageContent({ ...pageContent, sections: pageContent.sections.filter((_, j) => j !== i) })}
                        className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-violet-200"
                      placeholder="Section title"
                      value={section.title}
                      onChange={e => {
                        const arr = [...pageContent.sections];
                        arr[i] = { ...arr[i], title: e.target.value };
                        setPageContent({ ...pageContent, sections: arr });
                      }}
                    />
                    <textarea
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-200 min-h-[100px] resize-y"
                      placeholder="Section content..."
                      value={section.content}
                      onChange={e => {
                        const arr = [...pageContent.sections];
                        arr[i] = { ...arr[i], content: e.target.value };
                        setPageContent({ ...pageContent, sections: arr });
                      }}
                    />
                  </div>
                ))}
                <button
                  onClick={() => setPageContent({ ...pageContent, sections: [...pageContent.sections, { title: '', content: '' }] })}
                  className="flex items-center gap-2 text-sm font-bold text-violet-500 hover:text-violet-600 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Section
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => save({ [`page_${editingPage}`]: JSON.stringify(pageContent) })}
                disabled={saving}
                className="sun-gradient text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-orange-100 hover:scale-[1.02] transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Page Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Health */}
      <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-[2rem] bg-white border border-gray-50 flex items-center gap-5 shadow-sm">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Server Status</p>
            <p className="text-lg font-bold text-gray-900">Operational • 99.9%</p>
          </div>
        </div>
        <div className="p-8 rounded-[2rem] bg-white border border-gray-50 flex items-center gap-5 shadow-sm">
          <RefreshCcw className="text-orange-500 w-8 h-8" />
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Deployment</p>
            <p className="text-lg font-bold text-gray-900">Active • v2.5.0</p>
          </div>
        </div>
        <div className="p-8 rounded-[2rem] bg-white border border-gray-50 flex items-center gap-5 shadow-sm">
          <Database className="text-blue-500 w-8 h-8" />
          <div className="flex-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Storage Usage</p>
            <div className="w-full h-3 bg-gray-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
