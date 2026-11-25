import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ExternalLink, MapPin, Plus, ShieldCheck } from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import { ActionBtn, KpiCard, ModalSheet, StatusText } from '../../components/ui/Primitives';
import { formatINR } from '../../utils/formatters';
import { LocationSharingRequest } from '../../types/pgfinder';

type TrackingTab =
  | 'overview'
  | 'joining'
  | 'rent'
  | 'deposits'
  | 'maintenance'
  | 'complaints'
  | 'checkouts'
  | 'documents'
  | 'approval'
  | 'location';

export const OwnerTrackingPage: React.FC = () => {
  const {
    currentUser,
    properties,
    stays,
    joiningRequests,
    rentInvoices,
    maintenanceRequests,
    complaints,
    checkouts,
    locationRequests,
    ownerSelectedPropertyId,
    setOwnerSelectedPropertyId,
    submitLocationSharingRequest,
    cancelLocationRequest,
  } = usePGFinder();

  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<TrackingTab>((searchParams.get('tab') as TrackingTab) || 'overview');

  useEffect(() => {
    const pid = searchParams.get('propertyId');
    if (pid) setOwnerSelectedPropertyId(pid);
    const t = searchParams.get('tab') as TrackingTab | null;
    if (t) setTab(t);
  }, [searchParams, setOwnerSelectedPropertyId]);

  const ownerProps = useMemo(
    () => properties.filter((p) => p.ownerId === (currentUser?.id || 'usr-owner-1') && !p.archived),
    [properties, currentUser]
  );
  const scopedPropIds = useMemo(
    () => (ownerSelectedPropertyId === 'ALL' ? ownerProps.map((p) => p.id) : [ownerSelectedPropertyId]),
    [ownerSelectedPropertyId, ownerProps]
  );

  const scopedProps = ownerProps.filter((p) => scopedPropIds.includes(p.id));
  const scopedJoining = joiningRequests.filter((j) => scopedPropIds.includes(j.propertyId));
  const scopedRent = rentInvoices.filter((i) => scopedPropIds.includes(i.propertyId));
  const scopedStays = stays.filter((s) => scopedPropIds.includes(s.propertyId));
  const scopedMaint = maintenanceRequests.filter((m) => scopedPropIds.includes(m.propertyId));
  const scopedComp = complaints.filter((c) => scopedPropIds.includes(c.propertyId));
  const scopedCheckouts = checkouts.filter((c) => scopedPropIds.includes(c.propertyId));
  const scopedLocReqs = locationRequests.filter((l) => scopedPropIds.includes(l.propertyId));

  // Location Sharing Request Modal State
  const [locModalOpen, setLocModalOpen] = useState(false);
  const [locPropId, setLocPropId] = useState(ownerProps[0]?.id || 'prop-1');
  const [locTenantId, setLocTenantId] = useState('');
  const [locCat, setLocCat] = useState<LocationSharingRequest['category']>('Safety Check');
  const [locReason, setLocReason] = useState('');
  const [locExplanation, setLocExplanation] = useState('');
  const [locHours, setLocHours] = useState('2');
  const [viewLocReq, setViewLocReq] = useState<LocationSharingRequest | null>(null);
  const [banner, setBanner] = useState('');

  const eligibleTenants = stays.filter(
    (s) => s.propertyId === locPropId && s.status === 'Active'
  );

  const switchTab = (next: TrackingTab) => {
    setTab(next);
    setSearchParams({
      tab: next,
      ...(ownerSelectedPropertyId !== 'ALL' ? { propertyId: ownerSelectedPropertyId } : {}),
    });
  };

  const tabs: { id: TrackingTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'joining', label: 'Tenant Joining' },
    { id: 'rent', label: 'Rent Tracking' },
    { id: 'deposits', label: 'Deposit Tracking' },
    { id: 'maintenance', label: 'Maintenance Tracking' },
    { id: 'complaints', label: 'Complaint Tracking' },
    { id: 'checkouts', label: 'Checkout Tracking' },
    { id: 'documents', label: 'Document Verification' },
    { id: 'approval', label: 'Property Approval' },
    { id: 'location', label: 'Location Sharing Requests' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-display">Tracking Center</h1>
          <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
            Monitor onboarding pipelines, dues, maintenance, verifications, approvals, and consented safety location requests.
          </p>
        </div>

        <select
          value={ownerSelectedPropertyId}
          onChange={(e) => setOwnerSelectedPropertyId(e.target.value)}
          aria-label="Filter by property"
          className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] text-xs font-medium self-start"
        >
          <option value="ALL">All Properties ({ownerProps.length})</option>
          {ownerProps.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {banner && (
        <div className="p-3 rounded-xl border border-[#059669]/30 bg-[#059669]/10 text-[#059669] dark:text-[#34D399] text-xs flex items-center justify-between">
          <span>{banner}</span>
          <button type="button" onClick={() => setBanner('')} className="font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* 8 Summary Clickable KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard
          label="Pending Joining"
          value={scopedJoining.filter((j) => ['New', 'Under Review', 'Awaiting Bed Assignment'].includes(j.status)).length}
          tone="warning"
          onClick={() => switchTab('joining')}
        />
        <KpiCard
          label="Due / Overdue Rent"
          value={scopedRent.filter((i) => i.status !== 'Paid').length}
          tone="error"
          onClick={() => switchTab('rent')}
        />
        <KpiCard
          label="Pending Deposits"
          value={scopedStays.filter((s) => s.depositPaid < s.securityDeposit).length}
          tone="warning"
          onClick={() => switchTab('deposits')}
        />
        <KpiCard
          label="Open Maintenance"
          value={scopedMaint.filter((m) => m.status !== 'Resolved' && m.status !== 'Closed').length}
          tone="info"
          onClick={() => switchTab('maintenance')}
        />
        <KpiCard
          label="Open Complaints"
          value={scopedComp.filter((c) => c.status !== 'Resolved' && c.status !== 'Closed').length}
          tone="warning"
          onClick={() => switchTab('complaints')}
        />
        <KpiCard
          label="Pending Checkouts"
          value={scopedCheckouts.filter((c) => c.status !== 'Completed').length}
          onClick={() => switchTab('checkouts')}
        />
        <KpiCard
          label="Unverified Tenant Docs"
          value={scopedStays.filter((s) => s.documentStatus !== 'Verified').length}
          onClick={() => switchTab('documents')}
        />
        <KpiCard
          label="Location Requests"
          value={scopedLocReqs.length}
          tone="primary"
          onClick={() => switchTab('location')}
        />
      </div>

      {/* 10 Tracking Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] max-w-full">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => switchTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              tab === t.id
                ? 'bg-[#047857] text-white dark:bg-[#34D399] dark:text-[#0B1220]'
                : 'text-[#64748B] dark:text-[#9CA3AF]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-2.5">
            <h2 className="text-sm font-semibold">Operational Pipelines</h2>
            <div className="flex justify-between py-1 border-b border-[#E2E8F0] dark:border-[#374151]">
              <span>Joining Requests Pending</span>
              <span className="font-mono-num font-bold">{scopedJoining.filter((j) => j.status !== 'Active Stay' && j.status !== 'Rejected').length}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2E8F0] dark:border-[#374151]">
              <span>Pending Rent Invoices</span>
              <span className="font-mono-num font-bold">{scopedRent.filter((r) => r.status !== 'Paid').length}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E2E8F0] dark:border-[#374151]">
              <span>Open Maintenance &amp; Complaints</span>
              <span className="font-mono-num font-bold">{scopedMaint.length + scopedComp.length}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Properties Pending Approval</span>
              <span className="font-mono-num font-bold">{scopedProps.filter((p) => p.approvalStatus !== 'APPROVED').length}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-2.5">
            <h2 className="text-sm font-semibold">Tenant Safety &amp; Privacy Guard</h2>
            <p className="text-[#64748B] dark:text-[#9CA3AF]">
              Location sharing requests require both Super Admin review and voluntary tenant acceptance. Owners cannot view silent background location or personal tenant expense tracker entries.
            </p>
            <button
              type="button"
              onClick={() => switchTab('location')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#047857] text-white font-semibold"
            >
              <MapPin className="w-3.5 h-3.5" /> Open Location Sharing Requests
            </button>
          </div>
        </div>
      )}

      {tab === 'joining' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
                <th className="py-2 pr-3 font-medium">Tenant</th>
                <th className="py-2 pr-3 font-medium">PG</th>
                <th className="py-2 pr-3 font-medium">Sharing</th>
                <th className="py-2 pr-3 font-medium font-mono-num">Move-in</th>
                <th className="py-2 pr-3 font-medium">Source</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
              {scopedJoining.map((j) => (
                <tr key={j.id}>
                  <td className="py-2.5 pr-3 font-semibold">{j.tenantName}</td>
                  <td className="py-2.5 pr-3">{properties.find((p) => p.id === j.propertyId)?.name}</td>
                  <td className="py-2.5 pr-3">{j.preferredSharing}</td>
                  <td className="py-2.5 pr-3 font-mono-num">{j.moveInDate}</td>
                  <td className="py-2.5 pr-3">{j.source}</td>
                  <td className="py-2.5"><StatusText status={j.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'rent' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
                <th className="py-2 pr-3 font-medium">Tenant</th>
                <th className="py-2 pr-3 font-medium">Month</th>
                <th className="py-2 pr-3 font-medium font-mono-num">Due Date</th>
                <th className="py-2 pr-3 font-medium font-mono-num">Pending Balance</th>
                <th className="py-2 pr-3 font-medium">Last Reminder</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
              {scopedRent.map((r) => (
                <tr key={r.id}>
                  <td className="py-2.5 pr-3 font-semibold">{r.tenantName}</td>
                  <td className="py-2.5 pr-3">{r.monthLabel}</td>
                  <td className="py-2.5 pr-3 font-mono-num">{r.dueDate}</td>
                  <td className="py-2.5 pr-3 font-mono-num font-semibold">
                    {formatINR(Math.max(0, r.rentAmount + r.additionalCharges - r.paidAmount))}
                  </td>
                  <td className="py-2.5 pr-3 font-mono-num">{r.lastReminderAt || 'None'}</td>
                  <td className="py-2.5"><StatusText status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'deposits' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
                <th className="py-2 pr-3 font-medium">Tenant</th>
                <th className="py-2 pr-3 font-medium font-mono-num">Required</th>
                <th className="py-2 pr-3 font-medium font-mono-num">Received</th>
                <th className="py-2 font-medium">Deposit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
              {scopedStays.map((s) => (
                <tr key={s.id}>
                  <td className="py-2.5 pr-3 font-semibold">{s.tenantName}</td>
                  <td className="py-2.5 pr-3 font-mono-num">{formatINR(s.securityDeposit)}</td>
                  <td className="py-2.5 pr-3 font-mono-num">{formatINR(s.depositPaid)}</td>
                  <td className="py-2.5"><StatusText status={s.depositStatus || 'Received'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'maintenance' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
                <th className="py-2 pr-3 font-medium">Issue</th>
                <th className="py-2 pr-3 font-medium">Priority</th>
                <th className="py-2 pr-3 font-medium">Assigned</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
              {scopedMaint.map((m) => (
                <tr key={m.id}>
                  <td className="py-2.5 pr-3 font-semibold">{m.title}</td>
                  <td className="py-2.5 pr-3">{m.priority}</td>
                  <td className="py-2.5 pr-3">{m.assignedTo}</td>
                  <td className="py-2.5"><StatusText status={m.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'complaints' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
                <th className="py-2 pr-3 font-medium">Complaint</th>
                <th className="py-2 pr-3 font-medium">Tenant</th>
                <th className="py-2 pr-3 font-medium">Category</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
              {scopedComp.map((c) => (
                <tr key={c.id}>
                  <td className="py-2.5 pr-3 font-semibold">{c.title}</td>
                  <td className="py-2.5 pr-3">{c.tenantName}</td>
                  <td className="py-2.5 pr-3">{c.category}</td>
                  <td className="py-2.5"><StatusText status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'checkouts' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
                <th className="py-2 pr-3 font-medium">Tenant</th>
                <th className="py-2 pr-3 font-medium">Room / Bed</th>
                <th className="py-2 pr-3 font-medium font-mono-num">Checkout Date</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
              {scopedCheckouts.map((c) => (
                <tr key={c.id}>
                  <td className="py-2.5 pr-3 font-semibold">{c.tenantName}</td>
                  <td className="py-2.5 pr-3">Room {c.roomNumber} ({c.bedCode})</td>
                  <td className="py-2.5 pr-3 font-mono-num">{c.requestedDate}</td>
                  <td className="py-2.5"><StatusText status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'documents' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
                <th className="py-2 pr-3 font-medium">Tenant</th>
                <th className="py-2 pr-3 font-medium">KYC Status</th>
                <th className="py-2 font-medium">Agreement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
              {scopedStays.map((s) => (
                <tr key={s.id}>
                  <td className="py-2.5 pr-3 font-semibold">{s.tenantName}</td>
                  <td className="py-2.5 pr-3"><StatusText status={s.documentStatus} /></td>
                  <td className="py-2.5"><StatusText status={s.agreementAccepted ? 'Accepted' : 'Pending'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'approval' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
                <th className="py-2 pr-3 font-medium">PG Property</th>
                <th className="py-2 pr-3 font-medium">Approval</th>
                <th className="py-2 pr-3 font-medium">GPS Location</th>
                <th className="py-2 pr-3 font-medium">Listing</th>
                <th className="py-2 font-medium">Admin Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
              {scopedProps.map((p) => (
                <tr key={p.id}>
                  <td className="py-2.5 pr-3 font-semibold">{p.name}</td>
                  <td className="py-2.5 pr-3"><StatusText status={p.approvalStatus} /></td>
                  <td className="py-2.5 pr-3"><StatusText status={p.locationVerificationStatus} /></td>
                  <td className="py-2.5 pr-3"><StatusText status={p.listingStatus} /></td>
                  <td className="py-2.5 text-[#64748B]">{p.adminComment || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 10: PRIVACY-PRESERVING CONSENTED LOCATION SHARING REQUESTS */}
      {tab === 'location' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5 max-w-2xl">
              <ShieldCheck className="w-5 h-5 text-[#047857] dark:text-[#34D399] shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-sm">Voluntary Location Sharing Protocol (Admin Review + Tenant Consent)</div>
                <p className="text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
                  Submitting a request never reveals a tenant&apos;s location. Requests are reviewed by a Super Admin first, and only forwarded to the tenant for voluntary, time-limited sharing in safety or handover situations.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const pid = ownerSelectedPropertyId !== 'ALL' ? ownerSelectedPropertyId : ownerProps[0]?.id || 'prop-1';
                setLocPropId(pid);
                const firstT = stays.find((s) => s.propertyId === pid && s.status === 'Active');
                setLocTenantId(firstT?.tenantId || '');
                setLocReason('');
                setLocExplanation('');
                setLocModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-[#047857] text-white font-semibold"
            >
              <Plus className="w-4 h-4" /> Request Location Sharing
            </button>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
                  <th className="py-2 pr-3 font-medium">Request ID</th>
                  <th className="py-2 pr-3 font-medium">Tenant &amp; PG</th>
                  <th className="py-2 pr-3 font-medium">Category &amp; Reason</th>
                  <th className="py-2 pr-3 font-medium font-mono-num">Requested On</th>
                  <th className="py-2 pr-3 font-medium font-mono-num">Duration</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
                {scopedLocReqs.map((lr) => (
                  <tr key={lr.id}>
                    <td className="py-2.5 pr-3 font-mono-num text-[#64748B]">{lr.id}</td>
                    <td className="py-2.5 pr-3">
                      <div className="font-semibold">{lr.tenantName}</div>
                      <div className="text-[11px] text-[#64748B]">{properties.find((p) => p.id === lr.propertyId)?.name}</div>
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="font-medium">{lr.category}</div>
                      <div className="text-[11px] text-[#64748B] line-clamp-1">{lr.reason}</div>
                    </td>
                    <td className="py-2.5 pr-3 font-mono-num">{lr.requestedAt}</td>
                    <td className="py-2.5 pr-3 font-mono-num">{lr.requestedDurationHours}h</td>
                    <td className="py-2.5 pr-3"><StatusText status={lr.status} /></td>
                    <td className="py-2.5 text-right min-w-[200px]">
                      <div className="flex justify-end gap-1.5">
                        <ActionBtn kind="view" onClick={() => setViewLocReq(lr)} />
                        {['Submitted', 'Under Admin Review', 'Awaiting Tenant Permission'].includes(lr.status) && (
                          <ActionBtn
                            kind="reject"
                            label="Cancel"
                            onClick={() => {
                              cancelLocationRequest(lr.id);
                              setBanner(`Cancelled location sharing request ${lr.id}.`);
                            }}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submit Location Sharing Request Modal */}
      <ModalSheet
        open={locModalOpen}
        onClose={() => setLocModalOpen(false)}
        title="Request Voluntary Tenant Location Sharing"
        subtitle="Reviewed by Super Admin before reaching the tenant"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!locTenantId || !locReason.trim() || !locExplanation.trim()) return;
            submitLocationSharingRequest({
              propertyId: locPropId,
              tenantId: locTenantId,
              category: locCat,
              reason: locReason.trim(),
              explanation: locExplanation.trim(),
              durationHours: Number(locHours) || 2,
            });
            setBanner('Location sharing request submitted for Super Admin review.');
            setLocModalOpen(false);
          }}
          className="space-y-3 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={locPropId}
              onChange={(e) => {
                setLocPropId(e.target.value);
                const firstT = stays.find((s) => s.propertyId === e.target.value && s.status === 'Active');
                setLocTenantId(firstT?.tenantId || '');
              }}
              className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            >
              {ownerProps.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              value={locTenantId}
              onChange={(e) => setLocTenantId(e.target.value)}
              required
              className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            >
              <option value="">Select active tenant...</option>
              {eligibleTenants.map((s) => (
                <option key={s.id} value={s.tenantId}>
                  {s.tenantName}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={locCat}
              onChange={(e) => setLocCat(e.target.value as LocationSharingRequest['category'])}
              className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            >
              <option value="Safety Check">Safety Check</option>
              <option value="Emergency Contact Unreachable">Emergency Contact Unreachable</option>
              <option value="Parcel / Key Handover Assistance">Parcel / Key Handover Assistance</option>
            </select>
            <input
              type="number"
              min={1}
              max={12}
              value={locHours}
              onChange={(e) => setLocHours(e.target.value)}
              placeholder="Sharing window (hours)"
              className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
            />
          </div>
          <input
            type="text"
            required
            value={locReason}
            onChange={(e) => setLocReason(e.target.value)}
            placeholder="Brief reason summary *"
            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
          />
          <textarea
            rows={3}
            required
            value={locExplanation}
            onChange={(e) => setLocExplanation(e.target.value)}
            placeholder="Detailed explanation for Super Admin & Tenant review *"
            className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
          />
          <button type="submit" className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold">
            Submit Request for Admin Review
          </button>
        </form>
      </ModalSheet>

      {/* View Location Sharing Request Detail Modal */}
      <ModalSheet
        open={viewLocReq !== null}
        onClose={() => setViewLocReq(null)}
        title={`Location Sharing Request — ${viewLocReq?.tenantName || ''}`}
        subtitle={viewLocReq?.id}
      >
        {viewLocReq && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{viewLocReq.category}</span>
              <StatusText status={viewLocReq.status} />
            </div>
            <div>Reason: {viewLocReq.reason}</div>
            <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1F2937]/40">{viewLocReq.explanation}</div>
            {viewLocReq.adminNote && (
              <div className="p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151]">
                Admin Review Note: {viewLocReq.adminNote}
              </div>
            )}
            {viewLocReq.status === 'Voluntarily Shared' && viewLocReq.sharedSnapshot ? (
              <div className="p-3.5 rounded-xl border border-[#059669]/30 bg-[#059669]/10 space-y-2">
                <div className="font-semibold text-[#059669] dark:text-[#34D399]">
                  Voluntarily Shared Location Snapshot (Not Live Tracking)
                </div>
                <div className="font-mono-num">
                  Coordinates: {viewLocReq.sharedSnapshot.latitude}, {viewLocReq.sharedSnapshot.longitude} (±{viewLocReq.sharedSnapshot.accuracy}m)
                </div>
                <div className="font-mono-num">
                  Shared At: {viewLocReq.sharedSnapshot.sharedAt} · Expires: {viewLocReq.sharedSnapshot.expiresAt}
                </div>
                <a
                  href={`https://maps.google.com/?q=${viewLocReq.sharedSnapshot.latitude},${viewLocReq.sharedSnapshot.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#047857] text-white font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open in Google Maps
                </a>
              </div>
            ) : (
              <div className="text-[#64748B]">
                No tenant coordinates available. Coordinates appear here only if Super Admin approves forwarding and the tenant voluntarily grants consent.
              </div>
            )}
          </div>
        )}
      </ModalSheet>
    </div>
  );
};
