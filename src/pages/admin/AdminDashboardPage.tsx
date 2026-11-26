import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  BadgeIndianRupee,
  Building2,
  CalendarPlus,
  ClipboardCheck,
  CreditCard,
  FileBarChart,
  FileCheck2,
  HelpCircle,
  Layers,
  MapPin,
  Megaphone,
  Radio,
  Settings,
  Sliders,
  Sparkles,
  Store,
  UserRound,
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
    unifiedDocuments,
    ownerSubscriptions,
    platformPayments,
    featuredCampaigns,
    localAdCampaigns,
  } = usePGFinder();
  const navigate = useNavigate();

  const owners = users.filter((u) => u.role === 'PG_OWNER' && !u.archived);
  const tenants = users.filter((u) => u.role === 'TENANT' && !u.archived);
  const activeProps = properties.filter((p) => !p.archived);
  const pendingApprovals = activeProps.filter(
    (p) =>
      p.approvalStatus === 'PENDING_APPROVAL' ||
      p.approvalStatus === 'UNDER_REVIEW' ||
      p.approvalStatus === 'RESUBMITTED'
  );
  const pendingLocations = activeProps.filter(
    (p) =>
      p.locationVerificationStatus === 'PENDING_VERIFICATION' ||
      p.locationVerificationStatus === 'UNDER_REVIEW' ||
      p.locationVerificationStatus === 'REVERIFICATION_REQUIRED'
  );
  const pendingDocs = unifiedDocuments.filter(
    (d) =>
      !d.archived &&
      (d.verificationStatus === 'Pending' || d.verificationStatus === 'Under Review')
  ).length;
  const approvedProps = activeProps.filter((p) => p.approvalStatus === 'APPROVED');
  const publishedProps = activeProps.filter((p) => p.listingStatus === 'PUBLISHED');
  const occupiedBeds = beds.filter((b) => b.status === 'Occupied').length;
  const vacantBeds = beds.filter((b) => b.status === 'Available').length;
  const activeSubs = ownerSubscriptions.filter(
    (s) => s.status === 'Active' || s.status === 'Grace Period'
  ).length;
  const openTickets = supportTickets.filter(
    (t) => t.status !== 'Resolved' && t.status !== 'Closed'
  ).length;
  const upcomingEvents = events.filter((e) => e.status === 'Published').length;
  const activePromotions =
    featuredCampaigns.filter((f) => f.status === 'Active').length +
    localAdCampaigns.filter((a) => a.status === 'Active').length;

  const platformRevenue = platformPayments
    .filter((p) => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amountInr, 0);

  const citySummary = ['Bengaluru', 'Pune'].map((city) => ({
    city,
    properties: activeProps.filter((p) => p.city === city).length,
    occupied: beds.filter(
      (b) =>
        b.status === 'Occupied' &&
        activeProps.find((p) => p.id === b.propertyId)?.city === city
    ).length,
    vacant: beds.filter(
      (b) =>
        b.status === 'Available' &&
        activeProps.find((p) => p.id === b.propertyId)?.city === city
    ).length,
  }));

  const quickLinks = [
    { label: 'Property Approvals', icon: <ClipboardCheck />, count: pendingApprovals.length, to: '/admin/approvals' },
    { label: 'Location Verification', icon: <MapPin />, count: pendingLocations.length, to: '/admin/locations' },
    { label: 'PG Owners', icon: <Users />, to: '/admin/users?tab=owners' },
    { label: 'Tenants', icon: <Users />, to: '/admin/users?tab=tenants' },
    { label: 'All Properties', icon: <Building2 />, to: '/admin/properties' },
    { label: 'Documents', icon: <FileCheck2 />, count: pendingDocs, to: '/admin/documents' },
    { label: 'Subscriptions', icon: <CreditCard />, to: '/admin/subscriptions' },
    { label: 'Plan Features', icon: <Layers />, to: '/admin/subscriptions?tab=features' },
    { label: 'Featured PGs', icon: <Sparkles />, to: '/admin/featured' },
    { label: 'Local Ads', icon: <Store />, to: '/admin/local-ads' },
    { label: 'Advertisers', icon: <Store />, to: '/admin/local-ads' },
    { label: 'AdMob', icon: <Radio />, to: '/admin/more?section=admob' },
    { label: 'Startup Events', icon: <CalendarPlus />, to: '/admin/more?section=events' },
    { label: 'Notifications', icon: <Megaphone />, to: '/admin/notifications' },
    { label: 'Support Desk', icon: <HelpCircle />, count: openTickets, to: '/admin/support' },
    { label: 'Audit Logs', icon: <Activity />, to: '/admin/audit' },
    { label: 'Platform Payments', icon: <BadgeIndianRupee />, to: '/admin/subscriptions?tab=payments' },
    { label: 'CMS & Settings', icon: <Sliders />, to: '/admin/more?section=cms' },
    { label: 'System Health', icon: <Settings />, to: '/admin/more?section=system' },
    { label: 'Admin Profile', icon: <UserRound />, to: '/admin/profile' },
  ];

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
        <KpiCard
          label="Total Users"
          value={owners.length + tenants.length + 1}
          subtext={`${owners.length} owners · ${tenants.length} tenants`}
          onClick={() => navigate('/admin/users')}
        />
        <KpiCard
          label="Total Properties"
          value={activeProps.length}
          subtext={`${approvedProps.length} approved · ${publishedProps.length} published`}
          onClick={() => navigate('/admin/properties')}
        />
        <KpiCard
          label="Pending Approvals"
          value={pendingApprovals.length}
          tone={pendingApprovals.length > 0 ? 'warning' : 'success'}
          onClick={() => navigate('/admin/approvals')}
        />
        <KpiCard
          label="Pending GPS Reviews"
          value={pendingLocations.length}
          tone={pendingLocations.length > 0 ? 'warning' : 'success'}
          onClick={() => navigate('/admin/locations')}
        />
        <KpiCard
          label="Beds (Occ / Vac)"
          value={`${occupiedBeds} / ${vacantBeds}`}
          subtext={`${beds.length} total beds`}
          onClick={() => navigate('/admin/properties')}
        />
        <KpiCard
          label="Active Subscriptions"
          value={activeSubs}
          subtext={`Platform rev: ${formatINR(platformRevenue)} (demo)`}
          onClick={() => navigate('/admin/subscriptions')}
        />
        <KpiCard
          label="Active Promotions"
          value={activePromotions}
          subtext="Featured PGs + Local Ads"
          onClick={() => navigate('/admin/featured')}
        />
        <KpiCard
          label="Open Support & Events"
          value={`${openTickets} / ${upcomingEvents}`}
          subtext="Tickets / Published events"
          onClick={() => navigate('/admin/support')}
        />
      </div>

      {/* Super Admin Quick Links */}
      <section>
        <h2 className="text-sm font-semibold mb-2.5">Administration Quick Links</h2>
        <div className="grid grid-cols-3 min-[400px]:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
          {quickLinks.map((ql) => (
            <QuickLinkTile
              key={ql.label}
              icon={ql.icon}
              label={ql.label}
              count={ql.count}
              onClick={() => navigate(ql.to)}
            />
          ))}
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
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Pending Reviews &amp; Recent Audit Activity</h2>
            <button
              type="button"
              onClick={() => navigate('/admin/audit')}
              className="text-xs font-semibold text-[#047857] dark:text-[#34D399]"
            >
              View All Logs →
            </button>
          </div>
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
              <div
                key={log.id}
                onClick={() => navigate('/admin/audit')}
                className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1F2937]/50 cursor-pointer hover:bg-[#F1F5F9] dark:hover:bg-[#1F2937]"
              >
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
