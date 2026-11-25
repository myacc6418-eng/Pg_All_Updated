import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Building2,
  CalendarDays,
  Compass,
  CreditCard,
  FileText,
  HelpCircle,
  LogOut,
  MapPin,
  Megaphone,
  MessageSquareWarning,
  Package,
  QrCode,
  ReceiptIndianRupee,
  Search,
  Sparkles,
  Users,
  Utensils,
  Wrench,
} from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import { KpiCard, ModalSheet, QuickLinkTile, SafeImage, StatusText } from '../../components/ui/Primitives';
import { formatINR, formatPaiseToINR } from '../../utils/formatters';
import { INDIAN_CITIES } from '../../data/demoData';

export const TenantHomePage: React.FC = () => {
  const {
    currentUser,
    selectedCity,
    setSelectedCity,
    tenantPreviewSearching,
    setTenantPreviewSearching,
    properties,
    rooms,
    beds,
    stays,
    rentInvoices,
    tenantExpenses,
    foodMenu,
    notices,
    complaints,
    events,
    localBusinesses,
    savedPropertyIds,
    recentlyViewedIds,
    joiningRequests,
  } = usePGFinder();
  const navigate = useNavigate();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrInput, setQrInput] = useState('prop-3');
  const [searchQuery, setSearchQuery] = useState('');

  const myStay = tenantPreviewSearching
    ? undefined
    : stays.find((s) => s.tenantId === currentUser?.id && s.status !== 'Completed');

  const myProperty = myStay ? properties.find((p) => p.id === myStay.propertyId) : undefined;
  const myRoom = myStay ? rooms.find((r) => r.id === myStay.roomId) : undefined;
  const myBed = myStay ? beds.find((b) => b.id === myStay.bedId) : undefined;

  const myInvoices = myStay ? rentInvoices.filter((i) => i.stayId === myStay.id) : [];
  const pendingDues = myInvoices.reduce(
    (sum, i) => sum + Math.max(0, i.rentAmount + i.additionalCharges - i.paidAmount),
    0
  );

  const monthPrefix = '2026-11';
  const monthPersonalPaise = tenantExpenses
    .filter((e) => e.isConfirmed !== false && !e.excludedFromAnalytics && e.date.startsWith(monthPrefix))
    .reduce((sum, e) => sum + e.amountPaise, 0);

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayMenu = foodMenu.find((f) => f.day === todayName) || foodMenu[0];

  const publishedPgs = properties.filter((p) => p.listingStatus === 'PUBLISHED');
  const cityPgs = publishedPgs.filter((p) => p.city === selectedCity);
  const recommendedPgs = (cityPgs.length > 0 ? cityPgs : publishedPgs).slice(0, 3);
  const savedPgs = publishedPgs.filter((p) => savedPropertyIds.includes(p.id));
  const recentPgs = publishedPgs.filter((p) => recentlyViewedIds.includes(p.id));
  const publishedEvents = events.filter((e) => e.status === 'Published');
  const myNotices = myStay ? notices.filter((n) => n.propertyId === myStay.propertyId) : [];
  const unreadNotices = myNotices.filter((n) => !n.readByTenantIds.includes(currentUser?.id || '')).length;
  const myComplaints = myStay ? complaints.filter((c) => c.tenantId === currentUser?.id) : [];
  const myRequests = joiningRequests.filter((jr) => jr.tenantId === currentUser?.id);

  return (
    <div className="space-y-6">
      {/* Compact Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-[#111827] dark:text-[#F9FAFB]">
            Welcome, {currentUser?.name.split(' ')[0] || 'Tenant'}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#64748B] dark:text-[#9CA3AF]">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#047857] dark:text-[#34D399]" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                aria-label="Current city"
                className="bg-transparent font-medium text-[#111827] dark:text-[#F9FAFB] focus:outline-none cursor-pointer"
              >
                {INDIAN_CITIES.map((c) => (
                  <option key={c} value={c} className="dark:bg-[#111827]">
                    {c}
                  </option>
                ))}
              </select>
            </span>
            <span aria-hidden="true">·</span>
            <span>{myStay ? `${myProperty?.name} · Room ${myRoom?.roomNumber}` : 'No active PG stay'}</span>
          </div>
        </div>

        {/* Prototype toggle between State A (no active PG) and State B (active PG stay) */}
        <div className="inline-flex items-center rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-0.5 self-start">
          <button
            type="button"
            onClick={() => setTenantPreviewSearching(false)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              !tenantPreviewSearching
                ? 'bg-[#047857] text-white dark:bg-[#34D399] dark:text-[#0B1220]'
                : 'text-[#64748B] dark:text-[#9CA3AF]'
            }`}
          >
            Active Stay
          </button>
          <button
            type="button"
            onClick={() => setTenantPreviewSearching(true)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              tenantPreviewSearching
                ? 'bg-[#047857] text-white dark:bg-[#34D399] dark:text-[#0B1220]'
                : 'text-[#64748B] dark:text-[#9CA3AF]'
            }`}
          >
            Searching (No Stay)
          </button>
        </div>
      </div>

      {!myStay ? (
        /* STATE A — TENANT WITHOUT ACTIVE PG STAY */
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/tenant/explore?city=${encodeURIComponent(selectedCity)}&q=${encodeURIComponent(searchQuery)}`);
            }}
            className="p-2 rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search verified PGs in ${selectedCity}...`}
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1F2937] text-sm focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 h-10 rounded-xl bg-[#047857] hover:bg-[#065F46] dark:bg-[#34D399] dark:text-[#0B1220] text-white text-xs font-semibold whitespace-nowrap shrink-0"
            >
              Find PG
            </button>
          </form>

          {/* State A Quick Links */}
          <section>
            <h2 className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB] mb-2.5">Quick Links</h2>
            <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              <QuickLinkTile icon={<Search className="w-5 h-5" />} label="Find PG" onClick={() => navigate('/tenant/explore')} />
              <QuickLinkTile
                icon={<Bookmark className="w-5 h-5" />}
                label="Saved PGs"
                count={savedPgs.length}
                onClick={() => navigate('/tenant/explore?saved=1')}
              />
              <QuickLinkTile icon={<QrCode className="w-5 h-5" />} label="Scan QR" onClick={() => setQrModalOpen(true)} />
              <QuickLinkTile
                icon={<Building2 className="w-5 h-5" />}
                label="My Requests"
                count={myRequests.length}
                onClick={() => navigate('/tenant/my-pg')}
              />
              <QuickLinkTile
                icon={<ReceiptIndianRupee className="w-5 h-5" />}
                label="Expense Tracker"
                onClick={() => navigate('/tenant/expenses')}
              />
              <QuickLinkTile
                icon={<CalendarDays className="w-5 h-5" />}
                label="Startup Events"
                count={publishedEvents.length}
                onClick={() => navigate('/tenant/events')}
              />
              <QuickLinkTile icon={<Compass className="w-5 h-5" />} label="Local Services" onClick={() => navigate('/tenant/local')} />
              <QuickLinkTile icon={<HelpCircle className="w-5 h-5" />} label="Support" onClick={() => navigate('/tenant/profile')} />
            </div>
          </section>

          {/* Recommended & Featured Verified PGs */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Recommended &amp; Featured PGs in {selectedCity}</h2>
              <button
                type="button"
                onClick={() => navigate('/tenant/explore')}
                className="text-xs font-semibold text-[#047857] dark:text-[#34D399] hover:underline"
              >
                Explore all
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedPgs.map((prop) => {
                const avail = beds.filter((b) => b.propertyId === prop.id && b.status === 'Available').length;
                const cover = prop.images.find((i) => i.isCover)?.url || prop.images[0]?.url;
                return (
                  <button
                    key={prop.id}
                    type="button"
                    onClick={() => navigate(`/tenant/explore?property=${prop.id}`)}
                    className="text-left rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] overflow-hidden hover:border-[#047857]/50 transition-colors"
                  >
                    <div className="aspect-4/3 bg-slate-100 dark:bg-slate-800">
                      <SafeImage src={cover} alt={prop.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3.5">
                      <div className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
                        {prop.category} · {prop.locality}
                      </div>
                      <div className="text-sm font-semibold mt-0.5 truncate">{prop.name}</div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="font-bold font-mono-num text-[#047857] dark:text-[#34D399]">
                          {formatINR(prop.defaultRent)}/mo
                        </span>
                        <span className="text-[#64748B] dark:text-[#9CA3AF] font-mono-num">{avail} beds open</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Recently Viewed & Saved */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4">
              <h3 className="text-sm font-semibold mb-3">Recently Viewed &amp; Saved</h3>
              <div className="space-y-2.5">
                {[...savedPgs, ...recentPgs]
                  .filter((p, idx, arr) => arr.findIndex((x) => x.id === p.id) === idx)
                  .slice(0, 3)
                  .map((p) => (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/tenant/explore?property=${p.id}`)}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-[#1F2937]"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">{p.name}</div>
                        <div className="text-[11px] text-[#64748B] dark:text-[#9CA3AF] truncate">
                          {p.locality}, {p.city}
                        </div>
                      </div>
                      <div className="text-xs font-bold font-mono-num shrink-0">{formatINR(p.defaultRent)}</div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Startup Events &amp; Local Services</h3>
                <button
                  type="button"
                  onClick={() => navigate('/tenant/events')}
                  className="text-xs font-semibold text-[#047857] dark:text-[#34D399]"
                >
                  Connect
                </button>
              </div>
              <div className="space-y-2.5">
                {publishedEvents.slice(0, 2).map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => navigate('/tenant/events')}
                    className="p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-[#1F2937]"
                  >
                    <div className="text-xs font-semibold truncate">{evt.title}</div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
                      {evt.city} · {evt.mode} · {evt.isFree ? 'Free RSVP' : formatINR(evt.priceInr || 0)}
                    </div>
                  </div>
                ))}
                {localBusinesses.slice(0, 1).map((loc) => (
                  <div
                    key={loc.id}
                    onClick={() => navigate('/tenant/local')}
                    className="p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-[#1F2937]"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="truncate">{loc.name}</span>
                      {loc.isSponsored && <span className="text-[11px] text-[#D97706]">Sponsored</span>}
                    </div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
                      {loc.category} · {loc.locality}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* STATE B — TENANT WITH ACTIVE PG STAY */
        <>
          {/* Compact Active Stay Banner */}
          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-bold font-display">{myProperty?.name}</span>
                <StatusText status={myStay.status} />
              </div>
              <div className="mt-1 text-xs text-[#64748B] dark:text-[#9CA3AF]">
                Room {myRoom?.roomNumber} · Bed {myBed?.bedCode} · {myRoom?.sharing} Sharing ({myRoom?.isAc ? 'AC' : 'Non-AC'})
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => navigate('/tenant/my-pg')}
                className="px-3.5 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Open My PG
              </button>
              <button
                type="button"
                onClick={() => navigate('/tenant/expenses')}
                className="px-3.5 py-2 rounded-xl bg-[#047857] dark:bg-[#34D399] text-white dark:text-[#0B1220] text-xs font-semibold"
              >
                Add Expense
              </button>
            </div>
          </div>

          {/* 4 Compact KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <KpiCard
              label="Monthly Rent"
              value={formatINR(myStay.monthlyRent)}
              subtext="Due on 5th of month"
              onClick={() => navigate('/tenant/my-pg?tab=rent')}
            />
            <KpiCard
              label="Pending Dues"
              value={formatINR(pendingDues)}
              tone={pendingDues > 0 ? 'warning' : 'success'}
              subtext={pendingDues > 0 ? 'Partial/open invoice' : 'All settled'}
              onClick={() => navigate('/tenant/my-pg?tab=rent')}
            />
            <KpiCard
              label="Nov Personal Expenses"
              value={formatPaiseToINR(monthPersonalPaise)}
              tone="primary"
              subtext="Private to your account"
              onClick={() => navigate('/tenant/expenses')}
            />
            <KpiCard
              label="Days Until Rent Due"
              value="10 days"
              subtext="Next cycle: 05 Dec"
              onClick={() => navigate('/tenant/my-pg?tab=rent')}
            />
          </div>

          {/* State B 12 Quick Links */}
          <section>
            <h2 className="text-sm font-semibold mb-2.5">Quick Actions</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
              <QuickLinkTile icon={<CreditCard className="w-5 h-5" />} label="Pay Rent" onClick={() => navigate('/tenant/my-pg?tab=rent')} />
              <QuickLinkTile
                icon={<ReceiptIndianRupee className="w-5 h-5" />}
                label="Expense Tracker"
                onClick={() => navigate('/tenant/expenses')}
              />
              <QuickLinkTile icon={<Utensils className="w-5 h-5" />} label="Food Menu" onClick={() => navigate('/tenant/my-pg?tab=food')} />
              <QuickLinkTile
                icon={<MessageSquareWarning className="w-5 h-5" />}
                label="Raise Complaint"
                count={myComplaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Closed').length}
                onClick={() => navigate('/tenant/my-pg?tab=complaints')}
              />
              <QuickLinkTile icon={<Wrench className="w-5 h-5" />} label="Maintenance" onClick={() => navigate('/tenant/my-pg?tab=complaints')} />
              <QuickLinkTile
                icon={<Megaphone className="w-5 h-5" />}
                label="Notices"
                count={unreadNotices}
                onClick={() => navigate('/tenant/my-pg?tab=notices')}
              />
              <QuickLinkTile icon={<Package className="w-5 h-5" />} label="Parcels" onClick={() => navigate('/tenant/my-pg?tab=parcels')} />
              <QuickLinkTile
                icon={<Users className="w-5 h-5" />}
                label="Roommate Splits"
                onClick={() => navigate('/tenant/expenses?tab=shared')}
              />
              <QuickLinkTile icon={<FileText className="w-5 h-5" />} label="Receipts" onClick={() => navigate('/tenant/my-pg?tab=rent')} />
              <QuickLinkTile icon={<Compass className="w-5 h-5" />} label="Local Services" onClick={() => navigate('/tenant/local')} />
              <QuickLinkTile icon={<Sparkles className="w-5 h-5" />} label="Startup Events" onClick={() => navigate('/tenant/events')} />
              <QuickLinkTile icon={<LogOut className="w-5 h-5" />} label="Checkout" onClick={() => navigate('/tenant/my-pg?tab=checkout')} />
            </div>
          </section>

          {/* Today's Menu, Notices, Complaints & Events */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Today&apos;s Food Menu ({todayMenu.day})</h3>
                <button
                  type="button"
                  onClick={() => navigate('/tenant/my-pg?tab=food')}
                  className="text-xs font-medium text-[#047857] dark:text-[#34D399]"
                >
                  Full week
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-medium text-[#64748B] dark:text-[#9CA3AF]">Breakfast: </span>
                  <span>{todayMenu.breakfast}</span>
                </div>
                <div>
                  <span className="font-medium text-[#64748B] dark:text-[#9CA3AF]">Lunch: </span>
                  <span>{todayMenu.lunch}</span>
                </div>
                <div>
                  <span className="font-medium text-[#64748B] dark:text-[#9CA3AF]">Dinner: </span>
                  <span>{todayMenu.dinner}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Recent Notices &amp; Complaints</h3>
                <button
                  type="button"
                  onClick={() => navigate('/tenant/my-pg?tab=notices')}
                  className="text-xs font-medium text-[#047857] dark:text-[#34D399]"
                >
                  View all
                </button>
              </div>
              <div className="space-y-2.5 text-xs">
                {myNotices.slice(0, 2).map((n) => (
                  <div key={n.id} className="pb-2 border-b border-[#E2E8F0] dark:border-[#374151] last:border-0 last:pb-0">
                    <div className="font-medium truncate">{n.title}</div>
                    <div className="text-[#64748B] dark:text-[#9CA3AF] mt-0.5">{n.publishedAt}</div>
                  </div>
                ))}
                {myComplaints.slice(0, 1).map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-2 pt-1">
                    <span className="truncate font-medium">{c.title}</span>
                    <StatusText status={c.status} />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Upcoming Events</h3>
                <button
                  type="button"
                  onClick={() => navigate('/tenant/events')}
                  className="text-xs font-medium text-[#047857] dark:text-[#34D399]"
                >
                  Connect
                </button>
              </div>
              <div className="space-y-2.5">
                {publishedEvents.slice(0, 2).map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => navigate('/tenant/events')}
                    className="p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-[#1F2937]"
                  >
                    <div className="text-xs font-semibold truncate">{evt.title}</div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
                      {evt.city} · {evt.category}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* QR Scan Simulator Modal */}
      <ModalSheet
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="Scan PG Onboarding QR"
        subtitle="Open a verified property's /join/:propertyId onboarding route"
      >
        <div className="space-y-3">
          <p className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
            In the browser preview, choose a verified property below to simulate scanning its reception QR code:
          </p>
          <select
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-sm"
          >
            {properties
              .filter((p) => p.approvalStatus === 'APPROVED' && p.locationVerificationStatus === 'VERIFIED')
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.locality}, {p.city}) — {p.listingStatus === 'PUBLISHED' ? 'Published' : 'QR-Only'}
                </option>
              ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setQrModalOpen(false);
              navigate(`/join/${qrInput}`);
            }}
            className="w-full h-10 rounded-xl bg-[#047857] text-white text-xs font-semibold"
          >
            Open QR Joining Page (/join/{qrInput})
          </button>
        </div>
      </ModalSheet>
    </div>
  );
};
