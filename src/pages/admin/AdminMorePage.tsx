import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import { StatusText, ThemeSwitch } from '../../components/ui/Primitives';
import { formatINR } from '../../utils/formatters';
import { IMG_EVENT, INDIAN_CITIES } from '../../data/demoData';
import { StartupEvent } from '../../types/pgfinder';

type AdminSection =
  | 'events'
  | 'subscriptions'
  | 'payments'
  | 'ads'
  | 'admob'
  | 'support'
  | 'cms'
  | 'audit'
  | 'system';

export const AdminMorePage: React.FC = () => {
  const {
    events,
    createEvent,
    toggleEventStatus,
    supportTickets,
    updateTicketStatus,
    locationRequests,
    adminReviewLocationRequest,
    propertyReviews,
    auditLogs,
    properties,
    localBusinesses,
    logout,
  } = usePGFinder();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSection = (searchParams.get('section') as AdminSection) || 'events';
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
    { id: 'subscriptions', label: 'Subscriptions' },
    { id: 'payments', label: 'Platform Payments' },
    { id: 'ads', label: 'Featured & Local Ads' },
    { id: 'admob', label: 'AdMob' },
    { id: 'support', label: 'Support & Reviews' },
    { id: 'cms', label: 'CMS & Settings' },
    { id: 'audit', label: 'Audit Logs' },
    { id: 'system', label: 'System Health' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display">Platform Operations &amp; Monetization</h1>
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
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={evtCity}
                onChange={(e) => setEvtCity(e.target.value)}
                className="h-9 px-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                {INDIAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
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
                className="h-9 px-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
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
                    {e.city} · {e.registeredCount}/{e.capacity} registered · {e.isFree ? 'Free' : formatINR(e.priceInr || 0)}
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

      {section === 'subscriptions' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3 text-xs">
          <h2 className="text-sm font-semibold">Subscription Plans &amp; Listing Entitlements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { plan: 'Basic', price: '₹0/mo', listings: '0 included (₹299/property future fee)', grace: 'N/A' },
              { plan: 'Pro', price: '₹199/mo', listings: 'Up to 5 active public listings', grace: `${graceDays} days` },
              { plan: 'Business', price: '₹499/mo', listings: 'Up to 20 active listings + Staff ops', grace: `${graceDays} days` },
            ].map((p) => (
              <div key={p.plan} className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-1">
                <div className="font-bold text-sm">{p.plan} — {p.price}</div>
                <div className="text-[#64748B]">{p.listings}</div>
                <div>Grace Period: {p.grace}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'payments' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3 text-xs">
          <h2 className="text-sm font-semibold">Platform Payments &amp; Refunds</h2>
          <p className="text-[#64748B] dark:text-[#9CA3AF]">
            Payment gateway webhook processor is abstracted and not connected in UI prototype mode. No fabricated successful transactions are generated. Future categories: ₹299 Listing Fees, Subscriptions, Featured PGs, Local Business Ads.
          </p>
        </div>
      )}

      {section === 'ads' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-2.5">
            <h2 className="text-sm font-semibold">Featured PG Packages (₹299 / ₹799 / ₹1,999)</h2>
            {properties
              .filter((p) => p.isSponsored)
              .map((p) => (
                <div key={p.id} className="p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex justify-between">
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-[#D97706] font-medium">Sponsored · Verified</span>
                </div>
              ))}
          </div>
          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-2.5">
            <h2 className="text-sm font-semibold">Local Business Campaigns (₹499 / ₹1,499 / ₹3,999)</h2>
            {localBusinesses
              .filter((b) => b.isSponsored)
              .map((b) => (
                <div key={b.id} className="p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex justify-between">
                  <div>
                    <div className="font-semibold">{b.name}</div>
                    <div className="text-[#64748B]">
                      {b.category} · {b.locality}, {b.city}
                    </div>
                  </div>
                  <span className="text-[#D97706] font-medium">Sponsored</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {section === 'admob' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3 text-xs">
          <h2 className="text-sm font-semibold">Google AdMob Architecture &amp; Placements</h2>
          <div className="p-3 rounded-xl border border-[#D97706]/30 bg-[#D97706]/10 text-[#111827] dark:text-[#F9FAFB]">
            Reporting integration not configured. Browser previews render clearly labeled test-mode placeholders on Tenant Explore, PG Finder Local, and Event Discovery only.
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

      {section === 'support' && (
        <div className="space-y-4 text-xs">
          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3">
            <h2 className="text-sm font-semibold">Location Sharing Requests (Admin Legitimacy Review)</h2>
            {locationRequests.map((lr) => (
              <div key={lr.id} className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold">
                    {lr.ownerName} → {lr.tenantName} ({lr.category})
                  </div>
                  <div className="text-[#64748B]">
                    {lr.reason} — {lr.explanation}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusText status={lr.status} />
                  {(lr.status === 'Submitted' || lr.status === 'Under Admin Review') && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          adminReviewLocationRequest(
                            lr.id,
                            'Awaiting Tenant Permission',
                            'Approved for tenant voluntary consent review.'
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-[#047857] text-white font-semibold"
                      >
                        Approve Forwarding
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          adminReviewLocationRequest(
                            lr.id,
                            'Rejected',
                            'Reason insufficient for safety location request.'
                          )
                        }
                        className="px-3 py-1.5 rounded-lg border border-[#DC2626] text-[#DC2626] font-semibold"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3">
            <h2 className="text-sm font-semibold">
              Reported PG Reviews ({propertyReviews.filter((r) => r.reportedStatus !== 'None').length})
            </h2>
            {propertyReviews.filter((r) => r.reportedStatus !== 'None').length === 0 ? (
              <p className="text-[#64748B]">No owner-reported reviews awaiting moderation.</p>
            ) : (
              propertyReviews
                .filter((r) => r.reportedStatus !== 'None')
                .map((r) => (
                  <div key={r.id} className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>{r.tenantDisplayName} ({r.overallRating} ★)</span>
                      <StatusText status={r.reportedStatus} />
                    </div>
                    <div className="text-[#64748B]">Reason: {r.reportReason}</div>
                  </div>
                ))
            )}
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3">
            <h2 className="text-sm font-semibold">Support Tickets</h2>
            {supportTickets.map((t) => (
              <div key={t.id} className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{t.subject}</span>
                  <StatusText status={t.status} />
                </div>
                <div className="text-[#64748B]">
                  {t.userName} ({t.userRole}) · {t.category} · {t.createdAt}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <select
                    value={t.status}
                    onChange={(e) => updateTicketStatus(t.id, e.target.value as typeof t.status)}
                    className="h-8 px-2 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                  >
                    {['Open', 'Assigned', 'In Progress', 'Awaiting Response', 'Resolved', 'Closed'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
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

      {section === 'audit' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-2 text-xs">
          <h2 className="text-sm font-semibold">Audit Logs</h2>
          {auditLogs.map((a) => (
            <div key={a.id} className="p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151]">
              <div className="flex justify-between font-semibold">
                <span>
                  {a.action} · {a.entityType} ({a.entityId})
                </span>
                <span className="text-[#64748B] font-mono-num">{a.timestamp.slice(0, 16).replace('T', ' ')}</span>
              </div>
              <div className="text-[#64748B] mt-0.5">
                {a.actorName} ({a.actorRole}): {a.summary}
              </div>
            </div>
          ))}
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
