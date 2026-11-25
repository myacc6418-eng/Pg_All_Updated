import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  BadgeIndianRupee,
  Building2,
  CalendarPlus,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  FileBarChart,
  HelpCircle,
  MapPin,
  Megaphone,
  Radio,
  Settings,
  Sparkles,
  Store,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { usePGFinder } from '../../context/PGFinderContext';
import { KpiCard, QuickLinkTile, StatusText } from '../../components/ui/Primitives';
import { formatINR } from '../../utils/formatters';

export const AdminDashboardPage: React.FC = () => {
  const {
    users,
    properties,
    beds,
    events,
    supportTickets,
    auditLogs,
    localBusinesses,
  } = usePGFinder();
  const navigate = useNavigate();

  const owners = users.filter((u) => u.role === 'PG_OWNER');
  const tenants = users.filter((u) => u.role === 'TENANT');
  const pendingApprovals = properties.filter(
    (p) => p.approvalStatus === 'PENDING_APPROVAL' || p.approvalStatus === 'UNDER_REVIEW' || p.approvalStatus === 'RESUBMITTED'
  );
  const pendingLocations = properties.filter(
    (p) => p.locationVerificationStatus === 'PENDING_VERIFICATION' || p.locationVerificationStatus === 'UNDER_REVIEW'
  );
  const approvedProps = properties.filter((p) => p.approvalStatus === 'APPROVED');
  const publishedProps = properties.filter((p) => p.listingStatus === 'PUBLISHED');
  const occupiedBeds = beds.filter((b) => b.status === 'Occupied').length;
  const vacantBeds = beds.filter((b) => b.status === 'Available').length;
  const activeSubs = owners.filter((o) => o.subscriptionPlan && o.subscriptionPlan !== 'Basic').length;
  const openTickets = supportTickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Closed').length;
  const upcomingEvents = events.filter((e) => e.status === 'Published').length;
  const sponsoredAds = localBusinesses.filter((b) => b.isSponsored).length + properties.filter((p) => p.isSponsored).length;

  // Platform subscription + sponsored revenue (strictly separate from owner rent collection)
  const platformRevenueEstimate = owners.reduce(
    (sum, o) => sum + (o.subscriptionPlan === 'Business' ? 499 : o.subscriptionPlan === 'Pro' ? 199 : 0),
    0
  );

  const citySummary = ['Bengaluru', 'Pune'].map((city) => ({
    city,
    properties: properties.filter((p) => p.city === city).length,
    occupied: beds.filter(
      (b) => b.status === 'Occupied' && properties.find((p) => p.id === b.propertyId)?.city === city
    ).length,
    vacant: beds.filter(
      (b) => b.status === 'Available' && properties.find((p) => p.id === b.propertyId)?.city === city
    ).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display">Super Admin Dashboard</h1>
          <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
            Platform governance, independent property &amp; GPS verification, and monetization oversight.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/approvals')}
          className="px-4 py-2 rounded-xl bg-[#047857] dark:bg-[#34D399] text-white dark:text-[#0B1220] text-xs font-semibold self-start"
        >
          Review Pending Queue ({pendingApprovals.length})
        </button>
      </div>

      {/* Platform KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Users" value={users.length} subtext={`${owners.length} owners · ${tenants.length} tenants`} onClick={() => navigate('/admin/users')} />
        <KpiCard label="Total Properties" value={properties.length} subtext={`${approvedProps.length} approved · ${publishedProps.length} published`} onClick={() => navigate('/admin/properties')} />
        <KpiCard label="Pending Approvals" value={pendingApprovals.length} tone={pendingApprovals.length > 0 ? 'warning' : 'success'} onClick={() => navigate('/admin/approvals')} />
        <KpiCard label="Pending GPS Reviews" value={pendingLocations.length} tone={pendingLocations.length > 0 ? 'warning' : 'success'} onClick={() => navigate('/admin/approvals?tab=location')} />
        <KpiCard label="Beds (Occ / Vac)" value={`${occupiedBeds} / ${vacantBeds}`} subtext={`${beds.length} total beds`} onClick={() => navigate('/admin/properties')} />
        <KpiCard label="Active Subscriptions" value={activeSubs} subtext={`Platform rev: ${formatINR(platformRevenueEstimate)}/mo (demo)`} onClick={() => navigate('/admin/more?section=subscriptions')} />
        <KpiCard label="Active Ads / Featured" value={sponsoredAds} onClick={() => navigate('/admin/more?section=ads')} />
        <KpiCard label="Open Support & Events" value={`${openTickets} / ${upcomingEvents}`} subtext="Tickets / Published events" onClick={() => navigate('/admin/more?section=support')} />
      </div>

      {/* 16 Admin Quick Links */}
      <section>
        <h2 className="text-sm font-semibold mb-2.5">Administration Quick Links</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          <QuickLinkTile icon={<ClipboardCheck className="w-5 h-5" />} label="Property Approvals" count={pendingApprovals.length} onClick={() => navigate('/admin/approvals')} />
          <QuickLinkTile icon={<MapPin className="w-5 h-5" />} label="GPS Verification" count={pendingLocations.length} onClick={() => navigate('/admin/approvals?tab=location')} />
          <QuickLinkTile icon={<Users className="w-5 h-5" />} label="PG Owners" onClick={() => navigate('/admin/users')} />
          <QuickLinkTile icon={<Users className="w-5 h-5" />} label="Tenants" onClick={() => navigate('/admin/users?tab=tenants')} />
          <QuickLinkTile icon={<Building2 className="w-5 h-5" />} label="All Properties" onClick={() => navigate('/admin/properties')} />
          <QuickLinkTile icon={<FileCheck2 className="w-5 h-5" />} label="Documents" onClick={() => navigate('/admin/approvals?tab=documents')} />
          <QuickLinkTile icon={<CreditCard className="w-5 h-5" />} label="Subscriptions" onClick={() => navigate('/admin/more?section=subscriptions')} />
          <QuickLinkTile icon={<BadgeIndianRupee className="w-5 h-5" />} label="Platform Payments" onClick={() => navigate('/admin/more?section=payments')} />
          <QuickLinkTile icon={<Sparkles className="w-5 h-5" />} label="Featured PGs" onClick={() => navigate('/admin/more?section=ads')} />
          <QuickLinkTile icon={<Store className="w-5 h-5" />} label="Local Ads" onClick={() => navigate('/admin/more?section=ads')} />
          <QuickLinkTile icon={<Radio className="w-5 h-5" />} label="AdMob" onClick={() => navigate('/admin/more?section=admob')} />
          <QuickLinkTile icon={<CalendarPlus className="w-5 h-5" />} label="Create Event" onClick={() => navigate('/admin/more?section=events')} />
          <QuickLinkTile icon={<Megaphone className="w-5 h-5" />} label="Notifications" onClick={() => navigate('/admin/more?section=cms')} />
          <QuickLinkTile icon={<HelpCircle className="w-5 h-5" />} label="Support" count={openTickets} onClick={() => navigate('/admin/more?section=support')} />
          <QuickLinkTile icon={<Activity className="w-5 h-5" />} label="Audit Logs" onClick={() => navigate('/admin/more?section=audit')} />
          <QuickLinkTile icon={<Settings className="w-5 h-5" />} label="System & Settings" onClick={() => navigate('/admin/more?section=system')} />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6 rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">City Bed Occupancy Overview</h2>
            <FileBarChart className="w-4 h-4 text-[#64748B]" />
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={citySummary} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                <XAxis dataKey="city" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="occupied" name="Occupied Beds" fill="#047857" radius={[6, 6, 0, 0]} />
                <Bar dataKey="vacant" name="Vacant Beds" fill="#64748B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-6 rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3">
          <h2 className="text-sm font-semibold">Pending Reviews &amp; Recent Audit Activity</h2>
          <div className="space-y-2 text-xs">
            {pendingApprovals.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate('/admin/approvals')}
                className="p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex items-center justify-between cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-[#1F2937]"
              >
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-[#64748B]">
                    {p.ownerName} · {p.locality}, {p.city}
                  </div>
                </div>
                <StatusText status={p.approvalStatus} />
              </div>
            ))}
            {auditLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1F2937]/50">
                <div className="font-medium">{log.action.replace(/_/g, ' ')}</div>
                <div className="text-[#64748B] mt-0.5">{log.summary}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
