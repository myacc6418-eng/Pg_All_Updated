import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, LogOut } from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import { StatusText, ThemeSwitch } from '../../components/ui/Primitives';
import { formatINR } from '../../utils/formatters';
import { IMG_EVENT, INDIAN_CITIES } from '../../data/demoData';
import { StartupEvent } from '../../types/pgfinder';

type AdminSection = 'events' | 'admob' | 'cms' | 'system';

export const AdminMorePage: React.FC = () => {
  const {
    events,
    createEvent,
    toggleEventStatus,
    logout,
  } = usePGFinder();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawSection = searchParams.get('section') || 'events';

  // Redirect legacy ?section= links cleanly to the dedicated full-page modules
  useEffect(() => {
    if (rawSection === 'subscriptions') navigate('/admin/subscriptions', { replace: true });
    else if (rawSection === 'payments') navigate('/admin/subscriptions?tab=payments', { replace: true });
    else if (rawSection === 'ads') navigate('/admin/featured', { replace: true });
    else if (rawSection === 'support') navigate('/admin/support', { replace: true });
    else if (rawSection === 'audit') navigate('/admin/audit', { replace: true });
  }, [rawSection, navigate]);

  const initialSection: AdminSection =
    rawSection === 'admob' || rawSection === 'cms' || rawSection === 'system'
      ? rawSection
      : 'events';
  const [section, setSection] = useState<AdminSection>(initialSection);

  const [evtTitle, setEvtTitle] = useState('');
  const [evtCat, setEvtCat] = useState<StartupEvent['category']>('Founder Meetups');
  const [evtCity, setEvtCity] = useState('Bengaluru');
  const [evtVenue, setEvtVenue] = useState('');
  const [evtOrganizer, setEvtOrganizer] = useState('');
  const [evtDate, setEvtDate] = useState('2026-12-18T18:00');
  const [evtFree, setEvtFree] = useState(true);
  const [evtPrice, setEvtPrice] = useState('499');
  const [evtExternal, setEvtExternal] = useState('');

  const [photoMin, setPhotoMin] = useState('4');
  const [graceDays, setGraceDays] = useState('7');

  const switchSection = (s: AdminSection) => {
    setSection(s);
    setSearchParams({ section: s });
  };

  const navButtons: { id: AdminSection; label: string }[] = [
    { id: 'events', label: 'Startup Events' },
    { id: 'admob', label: 'AdMob Architecture' },
    { id: 'cms', label: 'CMS & Settings' },
    { id: 'system', label: 'System Health' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold font-display">Events, AdMob, CMS &amp; System Operations</h1>
          <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
            Manage Startup Connect events, Google AdMob placement boundaries, CMS rules, and environment readiness.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/auth');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] text-xs font-semibold text-[#DC2626]"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </div>

      {/* Quick shortcut bar to dedicated Admin modules */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {[
          { label: 'Subscriptions & Plans', to: '/admin/subscriptions' },
          { label: 'Featured & Local Ads', to: '/admin/featured' },
          { label: 'Notifications Broadcast', to: '/admin/notifications' },
          { label: 'Support & Audit Logs', to: '/admin/support' },
        ].map((link) => (
          <button
            key={link.to}
            type="button"
            onClick={() => navigate(link.to)}
            className="p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] flex items-center justify-between font-medium hover:border-[#047857]/40"
          >
            <span className="truncate">{link.label}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#047857] shrink-0" />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {navButtons.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => switchSection(b.id)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 ${
              section === b.id
                ? 'bg-[#047857] text-white dark:bg-[#34D399] dark:text-[#0B1220]'
                : 'bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#374151] text-[#64748B] dark:text-[#9CA3AF]'
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {section === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!evtTitle.trim() || !evtVenue.trim()) return;
              createEvent({
                title: evtTitle.trim(),
                category: evtCat,
                organizer: evtOrganizer.trim() || 'PG Finder Community',
                dateTime: evtDate,
                venue: evtVenue.trim(),
                city: evtCity,
                mode: 'Offline',
                isFree: evtFree,
                priceInr: evtFree ? undefined : Number(evtPrice) || 499,
                capacity: 150,
                externalUrl: evtFree ? undefined : evtExternal.trim() || 'https://lu.ma/example',
                imageUrl: IMG_EVENT,
                description: 'Published via PG Finder Super Admin Events console.',
                speakers: ['Guest Founder Speaker'],
                agenda: ['Registration & Networking', 'Main Session'],
                status: 'Published',
              });
              setEvtTitle('');
              setEvtVenue('');
            }}
            className="lg:col-span-5 rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3"
          >
            <h2 className="text-sm font-semibold">Create &amp; Publish Startup Event</h2>
            <input
              type="text"
              required
              value={evtTitle}
              onChange={(e) => setEvtTitle(e.target.value)}
              placeholder="Event title"
              className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={evtCat}
                onChange={(e) => setEvtCat(e.target.value as StartupEvent['category'])}
                className="h-9 px-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                {['Startup Networking', 'Entrepreneurship', 'Technology', 'AI and Innovation', 'Founder Meetups', 'Investor Events', 'Workshops', 'Hackathons'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={evtCity}
                onChange={(e) => setEvtCity(e.target.value)}
                className="h-9 px-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                {INDIAN_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <input
              type="text"
              required
              value={evtVenue}
              onChange={(e) => setEvtVenue(e.target.value)}
              placeholder="Venue address"
              className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={evtOrganizer}
                onChange={(e) => setEvtOrganizer(e.target.value)}
                placeholder="Organizer"
                className="h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              />
              <input
                type="datetime-local"
                value={evtDate}
                onChange={(e) => setEvtDate(e.target.value)}
                className="h-9 px-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
              />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={evtFree} onChange={(e) => setEvtFree(e.target.checked)} className="accent-[#047857]" />
              <span>Free RSVP event (uncheck for external paid link)</span>
            </label>
            {!evtFree && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={evtPrice}
                  onChange={(e) => setEvtPrice(e.target.value)}
                  placeholder="INR Price"
                  className="h-9 px-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
                />
                <input
                  type="url"
                  value={evtExternal}
                  onChange={(e) => setEvtExternal(e.target.value)}
                  placeholder="Official external link"
                  className="h-9 px-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                />
              </div>
            )}
            <button type="submit" className="w-full h-9 rounded-xl bg-[#047857] text-white font-semibold">
              Publish Event to Connect
            </button>
          </form>

          <div className="lg:col-span-7 rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-2.5">
            <h2 className="text-sm font-semibold">Managed Events ({events.length})</h2>
            {events.map((e) => (
              <div key={e.id} className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex items-center justify-between gap-2">
                <div>
                  <div className="font-semibold">{e.title}</div>
                  <div className="text-[#64748B]">
                    {e.city} · <span className="font-mono-num">{e.registeredCount}/{e.capacity}</span> registered · {e.isFree ? 'Free' : formatINR(e.priceInr || 0)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusText status={e.status} />
                  <button
                    type="button"
                    onClick={() => toggleEventStatus(e.id, e.status === 'Published' ? 'Cancelled' : 'Published')}
                    className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] dark:border-[#374151] font-medium"
                  >
                    {e.status === 'Published' ? 'Cancel' : 'Publish'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'admob' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3 text-xs">
          <h2 className="text-sm font-semibold">Google AdMob Architecture &amp; Placements</h2>
          <div className="p-3 rounded-xl border border-[#D97706]/30 bg-[#D97706]/10 text-[#111827] dark:text-[#F9FAFB]">
            Reporting integration not configured. Browser previews render clearly labeled test-mode placeholders on Tenant Explore, PG Finder Local, and Event Discovery only — strictly separate from Featured PGs and Local Business Ads.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151]">
              <div className="font-semibold">Allowed Placements</div>
              <div className="text-[#64748B] mt-1">Explore PGs, PG Finder Local, Event Discovery</div>
            </div>
            <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151]">
              <div className="font-semibold">Blocked Sensitive Screens</div>
              <div className="text-[#64748B] mt-1">Admin, Auth, Rent, Documents, Complaints, Personal Expenses</div>
            </div>
            <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151]">
              <div className="font-semibold">Mode &amp; Safeguards</div>
              <div className="text-[#64748B] mt-1">Test Ad Units · Frequency Capped · Age-Appropriate</div>
            </div>
          </div>
        </div>
      )}

      {section === 'cms' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3 text-xs">
          <h2 className="text-sm font-semibold">Platform Settings &amp; CMS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium mb-1">Minimum Property Photos</label>
              <input
                type="number"
                value={photoMin}
                onChange={(e) => setPhotoMin(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Subscription Grace Days</label>
              <input
                type="number"
                value={graceDays}
                onChange={(e) => setGraceDays(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Theme Preference</label>
              <ThemeSwitch />
            </div>
          </div>
          <div className="text-[#64748B]">Currency: INR (₹) · Business Timezone: Asia/Kolkata</div>
        </div>
      )}

      {section === 'system' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-2.5 text-xs">
          <h2 className="text-sm font-semibold">Integration &amp; Environment Status</h2>
          <p className="text-[#64748B]">
            Honest status of external services in this UI prototype (no fabricated live backend indicators):
          </p>
          {[
            { name: 'Frontend UI State Store', state: 'Active (In-Memory Demo Mode)' },
            { name: 'PostgreSQL / Prisma Database', state: 'Not connected in UI-only preview' },
            { name: 'Object Storage (Cloudflare R2)', state: 'Abstraction ready · Local preview URLs' },
            { name: 'Payment Gateway (₹299 / Subscriptions)', state: 'Not configured' },
            { name: 'Google AdMob Reporting', state: 'Reporting integration not configured' },
          ].map((row) => (
            <div key={row.name} className="p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex justify-between">
              <span className="font-medium">{row.name}</span>
              <span className="text-[#64748B]">{row.state}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
