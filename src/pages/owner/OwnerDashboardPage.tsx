import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowLeftRight,
  BedDouble,
  BookOpen,
  Building2,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  Compass,
  CreditCard,
  FileBarChart,
  History,
  Layers,
  LogOut,
  MapPin,
  Megaphone,
  MessageSquareWarning,
  Package,
  Plus,
  QrCode,
  ReceiptIndianRupee,
  ShieldCheck,
  Star,
  UserPlus,
  Users,
  Utensils,
  Wallet,
  Wrench,
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

export const OwnerDashboardPage: React.FC = () => {
  const {
    currentUser,
    properties,
    rooms,
    beds,
    stays,
    joiningRequests,
    rentInvoices,
    ownerExpenses,
    complaints,
    maintenanceRequests,
    parcels,
    checkouts,
    locationRequests,
    ownerSelectedPropertyId,
    setOwnerSelectedPropertyId,
  } = usePGFinder();
  const navigate = useNavigate();

  const ownerProps = useMemo(
    () => properties.filter((p) => p.ownerId === (currentUser?.id || 'usr-owner-1') && !p.archived),
    [properties, currentUser]
  );

  const scopedPropIds = useMemo(
    () =>
      ownerSelectedPropertyId === 'ALL'
        ? ownerProps.map((p) => p.id)
        : [ownerSelectedPropertyId],
    [ownerSelectedPropertyId, ownerProps]
  );

  const propQuery = ownerSelectedPropertyId !== 'ALL' ? `&propertyId=${ownerSelectedPropertyId}` : '';
  const propQueryFirst = ownerSelectedPropertyId !== 'ALL' ? `?propertyId=${ownerSelectedPropertyId}` : '';

  const scopedProps = ownerProps.filter((p) => scopedPropIds.includes(p.id));
  const scopedRooms = rooms.filter((r) => scopedPropIds.includes(r.propertyId));
  const scopedBeds = beds.filter((b) => scopedPropIds.includes(b.propertyId));
  const occupiedBeds = scopedBeds.filter((b) => b.status === 'Occupied').length;
  const vacantBeds = scopedBeds.filter((b) => b.status === 'Available').length;
  const occupancyRate = scopedBeds.length > 0 ? Math.round((occupiedBeds / scopedBeds.length) * 100) : 0;

  const activeTenants = stays.filter((s) => scopedPropIds.includes(s.propertyId) && s.status === 'Active').length;
  const pendingRequests = joiningRequests.filter(
    (jr) => scopedPropIds.includes(jr.propertyId) && (jr.status === 'New' || jr.status === 'Under Review' || jr.status === 'Awaiting Bed Assignment')
  ).length;

  const scopedInvoices = rentInvoices.filter((i) => scopedPropIds.includes(i.propertyId));
  const rentCollected = scopedInvoices.reduce((s, i) => s + i.paidAmount, 0);
  const pendingRent = scopedInvoices.reduce(
    (s, i) => s + Math.max(0, i.rentAmount + i.additionalCharges - i.paidAmount),
    0
  );
  const monthlyExpenses = ownerExpenses
    .filter((e) => scopedPropIds.includes(e.propertyId) && !e.reversed)
    .reduce((s, e) => s + e.amount, 0);
  const openComplaints = complaints.filter(
    (c) => scopedPropIds.includes(c.propertyId) && c.status !== 'Resolved' && c.status !== 'Closed'
  ).length;
  const openMaintenance = maintenanceRequests.filter(
    (m) => scopedPropIds.includes(m.propertyId) && m.status !== 'Resolved' && m.status !== 'Closed'
  ).length;

  const pendingParcels = parcels.filter(
    (p) => scopedPropIds.includes(p.propertyId) && p.status !== 'Collected'
  );
  const pendingCheckouts = checkouts.filter(
    (c) => scopedPropIds.includes(c.propertyId) && c.status !== 'Completed'
  );
  const activeLocationReqs = locationRequests.filter(
    (lr) => scopedPropIds.includes(lr.propertyId) && (lr.status === 'Submitted' || lr.status === 'Under Admin Review' || lr.status === 'Awaiting Tenant Permission')
  ).length;

  const chartData = scopedProps.map((p) => {
    const pCollected = rentInvoices
      .filter((i) => i.propertyId === p.id)
      .reduce((s, i) => s + i.paidAmount, 0);
    const pExp = ownerExpenses
      .filter((e) => e.propertyId === p.id && !e.reversed)
      .reduce((s, e) => s + e.amount, 0);
    return {
      name: p.name.split(' ').slice(0, 2).join(' '),
      income: pCollected,
      expenses: pExp,
    };
  });

  const quickLinkGroups = [
    {
      title: 'Property Management',
      items: [
        { icon: <Plus className="w-5 h-5" />, label: 'Add PG', to: '/owner/properties?wizard=1' },
        { icon: <Building2 className="w-5 h-5" />, label: 'My Properties', to: '/owner/properties' },
        { icon: <Layers className="w-5 h-5" />, label: 'Floors & Vacancies', to: `/owner/vacancies${propQueryFirst}` },
        { icon: <BedDouble className="w-5 h-5" />, label: 'Rooms & Beds', to: `/owner/vacancies${propQueryFirst}` },
        { icon: <QrCode className="w-5 h-5" />, label: 'QR Onboarding', to: '/owner/properties?qr=open' },
      ],
    },
    {
      title: 'Tenant Management',
      items: [
        { icon: <Users className="w-5 h-5" />, label: 'All Tenants', to: `/owner/tenants${propQueryFirst}` },
        { icon: <UserPlus className="w-5 h-5" />, label: 'Joining Requests', count: pendingRequests, to: `/owner/tenants?tab=requests${propQuery}` },
        { icon: <ArrowLeftRight className="w-5 h-5" />, label: 'Transfer Tenant', to: `/owner/vacancies?transfer=1${propQuery}` },
        { icon: <LogOut className="w-5 h-5" />, label: 'Checkouts', count: pendingCheckouts.length, to: `/owner/tenants?tab=checkouts${propQuery}` },
        { icon: <ClipboardCheck className="w-5 h-5" />, label: 'Tenant Documents', to: `/owner/tenants?tab=documents${propQuery}` },
      ],
    },
    {
      title: 'Finance',
      items: [
        { icon: <CreditCard className="w-5 h-5" />, label: 'Rent Collection', to: `/owner/finance?tab=rent${propQuery}` },
        { icon: <History className="w-5 h-5" />, label: 'Payment History', to: `/owner/finance?tab=history${propQuery}` },
        { icon: <Wallet className="w-5 h-5" />, label: 'Security Deposits', to: `/owner/finance?tab=deposits${propQuery}` },
        { icon: <ReceiptIndianRupee className="w-5 h-5" />, label: 'Business Expenses', to: `/owner/expenses${propQueryFirst}` },
      ],
    },
    {
      title: 'Daily Operations',
      items: [
        { icon: <Wrench className="w-5 h-5" />, label: 'Maintenance', count: openMaintenance, to: `/owner/maintenance?tab=requests${propQuery}` },
        { icon: <CalendarClock className="w-5 h-5" />, label: 'Scheduled Tasks', to: `/owner/maintenance?tab=scheduled${propQuery}` },
        { icon: <BookOpen className="w-5 h-5" />, label: 'PG Rules & Policies', to: `/owner/maintenance?tab=rules${propQuery}` },
        { icon: <MessageSquareWarning className="w-5 h-5" />, label: 'Complaints', count: openComplaints, to: `/owner/more?section=complaints${propQuery}` },
        { icon: <Utensils className="w-5 h-5" />, label: 'Food & Mess Menu', to: `/owner/more?section=food${propQuery}` },
        { icon: <Megaphone className="w-5 h-5" />, label: 'Notices', to: `/owner/more?section=notices${propQuery}` },
        { icon: <Package className="w-5 h-5" />, label: 'Parcels', count: pendingParcels.length, to: `/owner/more?section=parcels${propQuery}` },
        { icon: <ShieldCheck className="w-5 h-5" />, label: 'Staff Management', to: `/owner/more?section=staff${propQuery}` },
      ],
    },
    {
      title: 'Analytics and Administration',
      items: [
        { icon: <Activity className="w-5 h-5" />, label: 'Tracking Center', count: activeLocationReqs, to: `/owner/tracking${propQueryFirst}` },
        { icon: <FileBarChart className="w-5 h-5" />, label: 'Reports & Analytics', to: `/owner/reports${propQueryFirst}` },
        { icon: <Star className="w-5 h-5" />, label: 'Reviews & Ratings', to: `/owner/reviews${propQueryFirst}` },
        { icon: <MapPin className="w-5 h-5" />, label: 'Location Requests', to: `/owner/tracking?tab=location${propQuery}` },
        { icon: <ClipboardCheck className="w-5 h-5" />, label: 'Subscription & Plans', to: '/owner/more?section=subscription' },
        { icon: <CalendarDays className="w-5 h-5" />, label: 'Startup Events', to: '/owner/events' },
        { icon: <Compass className="w-5 h-5" />, label: 'PG Finder Local', to: '/owner/local' },
      ],
    },
  ];

  const pendingProp = scopedProps.find((p) => p.approvalStatus !== 'APPROVED');

  return (
    <div className="space-y-6">
      {/* Header with Shared Property Selector and Add Property */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display">Owner Dashboard</h1>
          <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
            {currentUser?.name} · {currentUser?.subscriptionPlan || 'Pro'} Plan · All amounts in INR (₹)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={ownerSelectedPropertyId}
            onChange={(e) => setOwnerSelectedPropertyId(e.target.value)}
            aria-label="Filter by property"
            className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] text-xs font-medium"
          >
            <option value="ALL">All Properties ({ownerProps.length})</option>
            {ownerProps.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => navigate('/owner/properties?wizard=1')}
            className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-[#047857] hover:bg-[#065F46] dark:bg-[#34D399] dark:text-[#0B1220] text-white text-xs font-semibold whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Property
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Properties"
          value={scopedProps.length}
          subtext={`${scopedProps.filter((p) => p.approvalStatus === 'APPROVED').length} approved · ${
            scopedProps.filter((p) => p.approvalStatus === 'PENDING_APPROVAL' || p.approvalStatus === 'CORRECTIONS_REQUIRED').length
          } pending`}
          onClick={() => navigate('/owner/properties')}
        />
        <KpiCard
          label="Rooms & Beds"
          value={`${scopedRooms.length} / ${scopedBeds.length}`}
          subtext={`${occupiedBeds} occupied · ${vacantBeds} available`}
          onClick={() => navigate(`/owner/vacancies${propQueryFirst}`)}
        />
        <KpiCard
          label="Occupancy Rate"
          value={`${occupancyRate}%`}
          tone="primary"
          subtext={`${activeTenants} active tenants`}
          onClick={() => navigate(`/owner/tenants${propQueryFirst}`)}
        />
        <KpiCard
          label="Joining Requests"
          value={pendingRequests}
          tone={pendingRequests > 0 ? 'warning' : 'neutral'}
          subtext="Awaiting bed assignment"
          onClick={() => navigate(`/owner/tenants?tab=requests${propQuery}`)}
        />
        <KpiCard
          label="Rent Collected"
          value={formatINR(rentCollected)}
          tone="success"
          subtext="Excludes security deposits"
          onClick={() => navigate(`/owner/finance?tab=history${propQuery}`)}
        />
        <KpiCard
          label="Pending Rent"
          value={formatINR(pendingRent)}
          tone={pendingRent > 0 ? 'warning' : 'success'}
          subtext="Due & overdue rent"
          onClick={() => navigate(`/owner/finance?tab=rent${propQuery}`)}
        />
        <KpiCard
          label="Business Expenses"
          value={formatINR(monthlyExpenses)}
          subtext="Property operating costs"
          onClick={() => navigate(`/owner/expenses${propQueryFirst}`)}
        />
        <KpiCard
          label="Open Complaints"
          value={openComplaints}
          tone={openComplaints > 0 ? 'error' : 'success'}
          subtext={`${openMaintenance} open maintenance`}
          onClick={() => navigate(`/owner/more?section=complaints${propQuery}`)}
        />
      </div>

      {/* All Owner Quick Links Directly Visible in 5 Labeled Operational Groups */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">All Operations &amp; Quick Links</h2>
          <span className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
            Tap any module to open directly
          </span>
        </div>

        <div className="space-y-4">
          {quickLinkGroups.map((grp) => (
            <div key={grp.title} className="space-y-2">
              <div className="text-xs font-semibold text-[#64748B] dark:text-[#9CA3AF]">
                {grp.title}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                {grp.items.map((item) => (
                  <QuickLinkTile
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    count={item.count}
                    onClick={() => navigate(item.to)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Charts + Today's Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Property Income vs Expenses (INR)</h2>
            <span className="text-xs text-[#64748B] dark:text-[#9CA3AF]">Deposits excluded</span>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => `₹${Number(val ?? 0).toLocaleString('en-IN')}`} />
                <Bar dataKey="income" name="Rent Collected" fill="#047857" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" name="Operating Expenses" fill="#D97706" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3">
          <h2 className="text-sm font-semibold">Today&apos;s Operations</h2>
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex items-center justify-between">
              <div>
                <div className="font-semibold">Pending Joining Requests</div>
                <div className="text-[#64748B]">Assign available rooms &amp; beds</div>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/owner/tenants?tab=requests${propQuery}`)}
                className="font-mono-num font-bold text-[#047857] dark:text-[#34D399]"
              >
                {pendingRequests} open
              </button>
            </div>
            <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex items-center justify-between">
              <div>
                <div className="font-semibold">Parcels Awaiting Collection</div>
                <div className="text-[#64748B]">Reception desk handovers</div>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/owner/more?section=parcels${propQuery}`)}
                className="font-mono-num font-bold text-[#047857] dark:text-[#34D399]"
              >
                {pendingParcels.length} waiting
              </button>
            </div>
            <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex items-center justify-between">
              <div>
                <div className="font-semibold">Open Maintenance Jobs</div>
                <div className="text-[#64748B]">Repairs, plumbing &amp; electrical</div>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/owner/maintenance?tab=requests${propQuery}`)}
                className="font-mono-num font-bold text-[#EA580C] dark:text-[#FB923C]"
              >
                {openMaintenance} open
              </button>
            </div>
            <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex items-center justify-between">
              <div>
                <div className="font-semibold">Property Approval Tracker</div>
                <div className="text-[#64748B]">
                  {pendingProp ? pendingProp.name : 'All active PGs approved'}
                </div>
              </div>
              <StatusText status={pendingProp ? pendingProp.approvalStatus : 'APPROVED'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
