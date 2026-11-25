import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import { ActionBtn, KpiCard, ModalSheet, StatusText } from '../../components/ui/Primitives';
import { formatINR } from '../../utils/formatters';
import { MaintenanceRequest, PropertyRule, ScheduledMaintenance } from '../../types/pgfinder';

const RULE_CATEGORIES: PropertyRule['category'][] = [
  'Entry and Exit Timings',
  'Visitor Policy',
  'Quiet Hours',
  'Food Timings',
  'Cleaning Policy',
  'Common Area Usage',
  'Laundry Policy',
  'Parking Policy',
  'Electricity Usage',
  'Internet Usage',
  'Room Maintenance',
  'Rent Payment Policy',
  'Deposit Policy',
  'Notice Period',
  'Checkout Policy',
  'Safety Rules',
  'Emergency Procedures',
  'Other',
];

export const OwnerMaintenancePage: React.FC = () => {
  const {
    currentUser,
    properties,
    floors,
    rooms,
    beds,
    staff,
    maintenanceRequests,
    scheduledMaintenance,
    propertyRules,
    ownerSelectedPropertyId,
    setOwnerSelectedPropertyId,
    addMaintenanceRequest,
    updateMaintenanceRequest,
    addScheduledMaintenance,
    updateScheduledMaintenance,
    addPropertyRule,
    updatePropertyRule,
  } = usePGFinder();

  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = location.pathname.includes('/owner/rules')
    ? 'rules'
    : (searchParams.get('tab') as 'requests' | 'scheduled' | 'rules') || 'requests';
  const [tab, setTab] = useState<'requests' | 'scheduled' | 'rules'>(defaultTab);

  useEffect(() => {
    const pid = searchParams.get('propertyId');
    if (pid) setOwnerSelectedPropertyId(pid);
    if (location.pathname.includes('/owner/rules')) setTab('rules');
    else {
      const t = searchParams.get('tab') as typeof tab | null;
      if (t && ['requests', 'scheduled', 'rules'].includes(t)) setTab(t);
    }
  }, [searchParams, location.pathname, setOwnerSelectedPropertyId]);

  const ownerProps = useMemo(
    () => properties.filter((p) => p.ownerId === (currentUser?.id || 'usr-owner-1') && !p.archived),
    [properties, currentUser]
  );
  const scopedPropIds = useMemo(
    () => (ownerSelectedPropertyId === 'ALL' ? ownerProps.map((p) => p.id) : [ownerSelectedPropertyId]),
    [ownerSelectedPropertyId, ownerProps]
  );

  const [banner, setBanner] = useState<string>('');

  // Maintenance Request modal
  const [reqModal, setReqModal] = useState<{ mode: 'add' | 'edit'; req?: MaintenanceRequest } | null>(null);
  const [viewReq, setViewReq] = useState<MaintenanceRequest | null>(null);
  const [mPropId, setMPropId] = useState(ownerProps[0]?.id || 'prop-1');
  const [mFloorId, setMFloorId] = useState('');
  const [mRoomId, setMRoomId] = useState('');
  const [mBedId, setMBedId] = useState('');
  const [mCommon, setMCommon] = useState('');
  const [mTitle, setMTitle] = useState('');
  const [mCat, setMCat] = useState('Plumbing');
  const [mDesc, setMDesc] = useState('');
  const [mPrio, setMPrio] = useState<MaintenanceRequest['priority']>('Medium');
  const [mAssign, setMAssign] = useState('');
  const [mExpected, setMExpected] = useState(new Date().toISOString().slice(0, 10));
  const [mEstCost, setMEstCost] = useState('1000');
  const [mActCost, setMActCost] = useState('');
  const [mStatus, setMStatus] = useState<MaintenanceRequest['status']>('Reported');
  const [mMarkUnavail, setMMarkUnavail] = useState(false);
  const [mRestoreBed, setMRestoreBed] = useState(true);

  // Scheduled Maintenance modal
  const [schModal, setSchModal] = useState<{ mode: 'add' | 'edit'; item?: ScheduledMaintenance } | null>(null);
  const [sPropId, setSPropId] = useState(ownerProps[0]?.id || 'prop-1');
  const [sType, setSType] = useState('');
  const [sDate, setSDate] = useState(new Date().toISOString().slice(0, 10));
  const [sRec, setSRec] = useState<ScheduledMaintenance['recurrence']>('Monthly');
  const [sPerson, setSPerson] = useState('');
  const [sCost, setSCost] = useState('2500');
  const [sStatus, setSStatus] = useState<ScheduledMaintenance['status']>('Scheduled');

  // Rules modal
  const [ruleModal, setRuleModal] = useState<{ mode: 'add' | 'edit'; rule?: PropertyRule } | null>(null);
  const [viewRule, setViewRule] = useState<PropertyRule | null>(null);
  const [rPropId, setRPropId] = useState(ownerProps[0]?.id || 'prop-1');
  const [rTitle, setRTitle] = useState('');
  const [rCat, setRCat] = useState<PropertyRule['category']>('Entry and Exit Timings');
  const [rDesc, setRDesc] = useState('');
  const [rDate, setRDate] = useState(new Date().toISOString().slice(0, 10));
  const [rStatus, setRStatus] = useState<PropertyRule['status']>('Published');
  const [rAck, setRAck] = useState(true);

  const scopedReqs = maintenanceRequests.filter((m) => scopedPropIds.includes(m.propertyId));
  const scopedScheduled = scheduledMaintenance.filter((s) => scopedPropIds.includes(s.propertyId));
  const scopedRules = propertyRules.filter((r) => scopedPropIds.includes(r.propertyId));

  const switchTab = (next: typeof tab) => {
    setTab(next);
    setSearchParams({
      tab: next,
      ...(ownerSelectedPropertyId !== 'ALL' ? { propertyId: ownerSelectedPropertyId } : {}),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-display">Maintenance &amp; PG Rules</h1>
          <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
            Track repair jobs, schedule preventive maintenance, and publish clear house rules for tenants.
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

          {tab === 'requests' && (
            <button
              type="button"
              onClick={() => {
                setMPropId(ownerSelectedPropertyId !== 'ALL' ? ownerSelectedPropertyId : ownerProps[0]?.id || 'prop-1');
                setMFloorId('');
                setMRoomId('');
                setMBedId('');
                setMCommon('');
                setMTitle('');
                setMDesc('');
                setMAssign(staff[0]?.name || '');
                setMEstCost('1000');
                setMActCost('');
                setMStatus('Reported');
                setMMarkUnavail(false);
                setReqModal({ mode: 'add' });
              }}
              className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-[#047857] dark:bg-[#34D399] text-white dark:text-[#0B1220] text-xs font-semibold"
            >
              <Plus className="w-4 h-4" /> Add Maintenance Request
            </button>
          )}
          {tab === 'scheduled' && (
            <button
              type="button"
              onClick={() => {
                setSPropId(ownerSelectedPropertyId !== 'ALL' ? ownerSelectedPropertyId : ownerProps[0]?.id || 'prop-1');
                setSType('');
                setSPerson(staff[0]?.name || '');
                setSCost('2500');
                setSStatus('Scheduled');
                setSchModal({ mode: 'add' });
              }}
              className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-[#047857] dark:bg-[#34D399] text-white dark:text-[#0B1220] text-xs font-semibold"
            >
              <Plus className="w-4 h-4" /> Schedule Maintenance
            </button>
          )}
          {tab === 'rules' && (
            <button
              type="button"
              onClick={() => {
                setRPropId(ownerSelectedPropertyId !== 'ALL' ? ownerSelectedPropertyId : ownerProps[0]?.id || 'prop-1');
                setRTitle('');
                setRDesc('');
                setRCat('Entry and Exit Timings');
                setRStatus('Published');
                setRAck(true);
                setRuleModal({ mode: 'add' });
              }}
              className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-[#047857] dark:bg-[#34D399] text-white dark:text-[#0B1220] text-xs font-semibold"
            >
              <Plus className="w-4 h-4" /> Add PG Rule
            </button>
          )}
        </div>
      </div>

      {banner && (
        <div className="p-3 rounded-xl border border-[#059669]/30 bg-[#059669]/10 text-[#059669] dark:text-[#34D399] text-xs flex items-center justify-between">
          <span>{banner}</span>
          <button type="button" onClick={() => setBanner('')} className="font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard
          label="Open Maintenance"
          value={scopedReqs.filter((r) => !['Resolved', 'Closed'].includes(r.status)).length}
          tone="warning"
        />
        <KpiCard
          label="Resolved Requests"
          value={scopedReqs.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length}
          tone="success"
        />
        <KpiCard
          label="Scheduled Tasks"
          value={scopedScheduled.length}
          tone="info"
        />
        <KpiCard
          label="Published Rules"
          value={scopedRules.filter((r) => r.status === 'Published').length}
          tone="primary"
        />
      </div>

      {/* Strictly Separated 3 Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] w-fit max-w-full">
        {[
          { id: 'requests', label: `Maintenance Requests (${scopedReqs.length})` },
          { id: 'scheduled', label: `Scheduled Maintenance (${scopedScheduled.length})` },
          { id: 'rules', label: `PG Rules & Policies (${scopedRules.length})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => switchTab(t.id as typeof tab)}
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

      {/* TAB 1: MAINTENANCE REQUESTS */}
      {tab === 'requests' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
                <th className="py-2 pr-3 font-medium">ID</th>
                <th className="py-2 pr-3 font-medium">PG &amp; Location</th>
                <th className="py-2 pr-3 font-medium">Issue &amp; Category</th>
                <th className="py-2 pr-3 font-medium">Priority</th>
                <th className="py-2 pr-3 font-medium">Assigned To</th>
                <th className="py-2 pr-3 font-medium font-mono-num">Expected Date</th>
                <th className="py-2 pr-3 font-medium font-mono-num">Est / Act Cost</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
              {scopedReqs.map((m) => {
                const prop = properties.find((p) => p.id === m.propertyId);
                const rm = rooms.find((r) => r.id === m.roomId);
                const bd = beds.find((b) => b.id === m.bedId);
                const locLabel = rm
                  ? `Room ${rm.roomNumber}${bd ? ` (${bd.bedCode})` : ''}`
                  : m.commonArea || 'Property-wide';

                return (
                  <tr key={m.id}>
                    <td className="py-2.5 pr-3 font-mono-num text-[#64748B]">{m.id}</td>
                    <td className="py-2.5 pr-3">
                      <div className="font-medium">{prop?.name}</div>
                      <div className="text-[11px] text-[#64748B]">{locLabel}</div>
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="font-semibold">{m.title}</div>
                      <div className="text-[11px] text-[#64748B]">{m.category}</div>
                    </td>
                    <td className="py-2.5 pr-3">
                      <StatusText status={m.priority} tone={m.priority === 'Urgent' || m.priority === 'High' ? 'error' : 'warning'} />
                    </td>
                    <td className="py-2.5 pr-3">{m.assignedTo}</td>
                    <td className="py-2.5 pr-3 font-mono-num">{m.expectedResolutionDate}</td>
                    <td className="py-2.5 pr-3 font-mono-num">
                      {formatINR(m.estimatedCost)}
                      {m.actualCost !== undefined ? ` / ${formatINR(m.actualCost)}` : ''}
                    </td>
                    <td className="py-2.5 pr-3">
                      <StatusText status={m.status} />
                    </td>
                    <td className="py-2.5 text-right min-w-[160px]">
                      <div className="flex justify-end gap-1.5">
                        <ActionBtn kind="view" onClick={() => setViewReq(m)} />
                        <ActionBtn
                          kind="edit"
                          onClick={() => {
                            setMPropId(m.propertyId);
                            setMFloorId(m.floorId || '');
                            setMRoomId(m.roomId || '');
                            setMBedId(m.bedId || '');
                            setMCommon(m.commonArea || '');
                            setMTitle(m.title);
                            setMCat(m.category);
                            setMDesc(m.description);
                            setMPrio(m.priority);
                            setMAssign(m.assignedTo);
                            setMExpected(m.expectedResolutionDate);
                            setMEstCost(String(m.estimatedCost));
                            setMActCost(m.actualCost !== undefined ? String(m.actualCost) : '');
                            setMStatus(m.status);
                            setMMarkUnavail(Boolean(m.inventoryMarkedUnavailable));
                            setReqModal({ mode: 'edit', req: m });
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: SCHEDULED MAINTENANCE */}
      {tab === 'scheduled' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
                <th className="py-2 pr-3 font-medium">PG Name</th>
                <th className="py-2 pr-3 font-medium">Task Type</th>
                <th className="py-2 pr-3 font-medium font-mono-num">Scheduled Date</th>
                <th className="py-2 pr-3 font-medium">Recurrence</th>
                <th className="py-2 pr-3 font-medium">Assigned Person</th>
                <th className="py-2 pr-3 font-medium font-mono-num">Expected Cost</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
              {scopedScheduled.map((s) => (
                <tr key={s.id}>
                  <td className="py-2.5 pr-3">{properties.find((p) => p.id === s.propertyId)?.name}</td>
                  <td className="py-2.5 pr-3 font-semibold">{s.maintenanceType}</td>
                  <td className="py-2.5 pr-3 font-mono-num">{s.scheduledDate}</td>
                  <td className="py-2.5 pr-3">{s.recurrence}</td>
                  <td className="py-2.5 pr-3">{s.assignedPerson}</td>
                  <td className="py-2.5 pr-3 font-mono-num">{formatINR(s.expectedCost)}</td>
                  <td className="py-2.5 pr-3">
                    <StatusText status={s.status} />
                  </td>
                  <td className="py-2.5 text-right min-w-[200px]">
                    <div className="flex justify-end gap-1.5">
                      <ActionBtn
                        kind="edit"
                        onClick={() => {
                          setSPropId(s.propertyId);
                          setSType(s.maintenanceType);
                          setSDate(s.scheduledDate);
                          setSRec(s.recurrence);
                          setSPerson(s.assignedPerson);
                          setSCost(String(s.expectedCost));
                          setSStatus(s.status);
                          setSchModal({ mode: 'edit', item: s });
                        }}
                      />
                      {s.status !== 'Completed' && (
                        <ActionBtn
                          kind="approve"
                          label="Complete"
                          onClick={() => {
                            updateScheduledMaintenance(s.id, { status: 'Completed' });
                            setBanner(`Marked "${s.maintenanceType}" as completed.`);
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
      )}

      {/* TAB 3: PG RULES & POLICIES */}
      {tab === 'rules' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
                <th className="py-2 pr-3 font-medium">PG Name</th>
                <th className="py-2 pr-3 font-medium">Rule Title</th>
                <th className="py-2 pr-3 font-medium">Category</th>
                <th className="py-2 pr-3 font-medium font-mono-num">Effective Date</th>
                <th className="py-2 pr-3 font-medium font-mono-num">Version</th>
                <th className="py-2 pr-3 font-medium">Tenant Ack</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
              {scopedRules.map((r) => (
                <tr key={r.id}>
                  <td className="py-2.5 pr-3">{properties.find((p) => p.id === r.propertyId)?.name}</td>
                  <td className="py-2.5 pr-3 font-semibold">{r.title}</td>
                  <td className="py-2.5 pr-3">{r.category}</td>
                  <td className="py-2.5 pr-3 font-mono-num">{r.effectiveDate}</td>
                  <td className="py-2.5 pr-3 font-mono-num">v{r.version}</td>
                  <td className="py-2.5 pr-3">{r.requiresAcknowledgement ? 'Required' : 'Optional'}</td>
                  <td className="py-2.5 pr-3">
                    <StatusText status={r.status} />
                  </td>
                  <td className="py-2.5 text-right min-w-[240px]">
                    <div className="flex justify-end gap-1.5">
                      <ActionBtn kind="view" onClick={() => setViewRule(r)} />
                      <ActionBtn
                        kind="edit"
                        onClick={() => {
                          setRPropId(r.propertyId);
                          setRTitle(r.title);
                          setRCat(r.category);
                          setRDesc(r.description);
                          setRDate(r.effectiveDate);
                          setRStatus(r.status);
                          setRAck(r.requiresAcknowledgement);
                          setRuleModal({ mode: 'edit', rule: r });
                        }}
                      />
                      <ActionBtn
                        kind={r.status === 'Published' ? 'delete' : 'approve'}
                        label={r.status === 'Published' ? 'Archive' : 'Publish'}
                        onClick={() =>
                          updatePropertyRule(r.id, {
                            status: r.status === 'Published' ? 'Archived' : 'Published',
                          })
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Maintenance Request */}
      <ModalSheet open={viewReq !== null} onClose={() => setViewReq(null)} title={viewReq?.title || ''} subtitle={viewReq?.id}>
        {viewReq && (
          <div className="space-y-2 text-xs">
            <div>PG: {properties.find((p) => p.id === viewReq.propertyId)?.name}</div>
            <div>Category: {viewReq.category} · Priority: {viewReq.priority}</div>
            <div>Assigned To: {viewReq.assignedTo}</div>
            <div>Description: {viewReq.description}</div>
            <div>Status: <StatusText status={viewReq.status} /></div>
          </div>
        )}
      </ModalSheet>

      {/* Add / Edit Maintenance Request Modal */}
      <ModalSheet
        open={reqModal !== null}
        onClose={() => setReqModal(null)}
        title={reqModal?.mode === 'edit' ? 'Update Maintenance Request' : 'Add Maintenance Request'}
        maxWidth="max-w-2xl"
      >
        {reqModal && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!mTitle.trim()) return;
              if (reqModal.mode === 'add') {
                addMaintenanceRequest({
                  propertyId: mPropId,
                  floorId: mFloorId || undefined,
                  roomId: mRoomId || undefined,
                  bedId: mBedId || undefined,
                  commonArea: mCommon || undefined,
                  title: mTitle.trim(),
                  category: mCat,
                  description: mDesc.trim() || mTitle.trim(),
                  reportedDate: new Date().toISOString().slice(0, 10),
                  reportedBy: currentUser?.name || 'Owner',
                  priority: mPrio,
                  assignedTo: mAssign || 'Maintenance Staff',
                  expectedResolutionDate: mExpected,
                  estimatedCost: Number(mEstCost) || 0,
                  status: mStatus,
                  inventoryMarkedUnavailable: mMarkUnavail,
                });
                setBanner(`Created maintenance request "${mTitle.trim()}".`);
              } else if (reqModal.req) {
                updateMaintenanceRequest(
                  reqModal.req.id,
                  {
                    title: mTitle.trim(),
                    category: mCat,
                    description: mDesc.trim(),
                    priority: mPrio,
                    assignedTo: mAssign,
                    expectedResolutionDate: mExpected,
                    estimatedCost: Number(mEstCost) || 0,
                    actualCost: mActCost ? Number(mActCost) : undefined,
                    status: mStatus,
                  },
                  (mStatus === 'Resolved' || mStatus === 'Closed') && mRestoreBed
                );
                setBanner(`Updated maintenance request "${mTitle.trim()}".`);
              }
              setReqModal(null);
            }}
            className="space-y-3 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={mPropId}
                onChange={(e) => {
                  setMPropId(e.target.value);
                  setMFloorId('');
                  setMRoomId('');
                  setMBedId('');
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
                value={mRoomId}
                onChange={(e) => {
                  setMRoomId(e.target.value);
                  setMBedId('');
                }}
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                <option value="">Common Area / Building-wide</option>
                {rooms
                  .filter((r) => r.propertyId === mPropId)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.roomNumber} ({floors.find((f) => f.id === r.floorId)?.name})
                    </option>
                  ))}
              </select>
            </div>

            {mRoomId ? (
              <select
                value={mBedId}
                onChange={(e) => setMBedId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                <option value="">Whole Room (not specific bed)</option>
                {beds
                  .filter((b) => b.roomId === mRoomId)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      Bed {b.bedCode} ({b.status})
                    </option>
                  ))}
              </select>
            ) : (
              <input
                type="text"
                value={mCommon}
                onChange={(e) => setMCommon(e.target.value)}
                placeholder="Common Area (e.g., Main Staircase, Dining Hall)"
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              />
            )}

            <input
              type="text"
              required
              value={mTitle}
              onChange={(e) => setMTitle(e.target.value)}
              placeholder="Issue Title *"
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={mCat}
                onChange={(e) => setMCat(e.target.value)}
                placeholder="Category"
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              />
              <select
                value={mPrio}
                onChange={(e) => setMPrio(e.target.value as MaintenanceRequest['priority'])}
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                {['Low', 'Medium', 'High', 'Urgent'].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                value={mStatus}
                onChange={(e) => setMStatus(e.target.value as MaintenanceRequest['status'])}
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                {['Reported', 'Under Review', 'Assigned', 'In Progress', 'Waiting for Parts', 'Scheduled', 'Resolved', 'Closed', 'Reopened'].map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <input
                type="text"
                value={mAssign}
                onChange={(e) => setMAssign(e.target.value)}
                placeholder="Assigned Staff/Vendor"
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              />
              <input
                type="date"
                value={mExpected}
                onChange={(e) => setMExpected(e.target.value)}
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
              />
              <input
                type="number"
                value={mEstCost}
                onChange={(e) => setMEstCost(e.target.value)}
                placeholder="Est Cost ₹"
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
              />
              <input
                type="number"
                value={mActCost}
                onChange={(e) => setMActCost(e.target.value)}
                placeholder="Actual Cost ₹"
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
              />
            </div>

            <textarea
              rows={2}
              value={mDesc}
              onChange={(e) => setMDesc(e.target.value)}
              placeholder="Issue description..."
              className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            />

            {reqModal.mode === 'add' && mBedId && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={mMarkUnavail}
                  onChange={(e) => setMMarkUnavail(e.target.checked)}
                  className="accent-[#047857]"
                />
                <span>Mark selected available bed as &quot;Under Maintenance&quot;</span>
              </label>
            )}

            {reqModal.mode === 'edit' && (mStatus === 'Resolved' || mStatus === 'Closed') && reqModal.req?.inventoryMarkedUnavailable && (
              <label className="flex items-center gap-2 text-[#059669] dark:text-[#34D399]">
                <input
                  type="checkbox"
                  checked={mRestoreBed}
                  onChange={(e) => setMRestoreBed(e.target.checked)}
                  className="accent-[#047857]"
                />
                <span>Restore affected bed back to &quot;Available&quot; status</span>
              </label>
            )}

            <button type="submit" className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold">
              {reqModal.mode === 'edit' ? 'Save Maintenance Update' : 'Create Maintenance Request'}
            </button>
          </form>
        )}
      </ModalSheet>

      {/* Scheduled Maintenance Modal */}
      <ModalSheet
        open={schModal !== null}
        onClose={() => setSchModal(null)}
        title={schModal?.mode === 'edit' ? 'Edit Scheduled Maintenance' : 'Add Scheduled Maintenance'}
      >
        {schModal && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!sType.trim()) return;
              if (schModal.mode === 'add') {
                addScheduledMaintenance({
                  propertyId: sPropId,
                  maintenanceType: sType.trim(),
                  scheduledDate: sDate,
                  recurrence: sRec,
                  assignedPerson: sPerson.trim() || 'Maintenance Team',
                  expectedCost: Number(sCost) || 0,
                  status: sStatus,
                });
                setBanner(`Scheduled "${sType.trim()}".`);
              } else if (schModal.item) {
                updateScheduledMaintenance(schModal.item.id, {
                  propertyId: sPropId,
                  maintenanceType: sType.trim(),
                  scheduledDate: sDate,
                  recurrence: sRec,
                  assignedPerson: sPerson.trim(),
                  expectedCost: Number(sCost) || 0,
                  status: sStatus,
                });
                setBanner(`Updated scheduled task "${sType.trim()}".`);
              }
              setSchModal(null);
            }}
            className="space-y-3 text-xs"
          >
            <select
              value={sPropId}
              onChange={(e) => setSPropId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            >
              {ownerProps.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              required
              value={sType}
              onChange={(e) => setSType(e.target.value)}
              placeholder="Maintenance Task (e.g., RO Filter Replacement)"
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={sDate}
                onChange={(e) => setSDate(e.target.value)}
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
              />
              <select
                value={sRec}
                onChange={(e) => setSRec(e.target.value as ScheduledMaintenance['recurrence'])}
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                {['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly', 'Custom'].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={sPerson}
                onChange={(e) => setSPerson(e.target.value)}
                placeholder="Assigned Person"
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              />
              <input
                type="number"
                value={sCost}
                onChange={(e) => setSCost(e.target.value)}
                placeholder="Expected Cost ₹"
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
              />
            </div>
            <button type="submit" className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold">
              Save Scheduled Task
            </button>
          </form>
        )}
      </ModalSheet>

      {/* View & Add/Edit PG Rule Modals */}
      <ModalSheet open={viewRule !== null} onClose={() => setViewRule(null)} title={viewRule?.title || ''} subtitle={viewRule?.category}>
        {viewRule && (
          <div className="space-y-2 text-xs">
            <div>PG: {properties.find((p) => p.id === viewRule.propertyId)?.name}</div>
            <div>Effective Date: {viewRule.effectiveDate} · Version {viewRule.version}</div>
            <div>Status: <StatusText status={viewRule.status} /></div>
            <p className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1F2937]/40">{viewRule.description}</p>
          </div>
        )}
      </ModalSheet>

      <ModalSheet
        open={ruleModal !== null}
        onClose={() => setRuleModal(null)}
        title={ruleModal?.mode === 'edit' ? 'Edit PG Rule' : 'Add PG Rule & Policy'}
      >
        {ruleModal && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!rTitle.trim() || !rDesc.trim()) return;
              if (ruleModal.mode === 'add') {
                addPropertyRule({
                  propertyId: rPropId,
                  title: rTitle.trim(),
                  category: rCat,
                  description: rDesc.trim(),
                  effectiveDate: rDate,
                  status: rStatus,
                  requiresAcknowledgement: rAck,
                });
                setBanner(`Added PG rule "${rTitle.trim()}".`);
              } else if (ruleModal.rule) {
                updatePropertyRule(ruleModal.rule.id, {
                  propertyId: rPropId,
                  title: rTitle.trim(),
                  category: rCat,
                  description: rDesc.trim(),
                  effectiveDate: rDate,
                  status: rStatus,
                  requiresAcknowledgement: rAck,
                });
                setBanner(`Updated PG rule "${rTitle.trim()}" (version incremented).`);
              }
              setRuleModal(null);
            }}
            className="space-y-3 text-xs"
          >
            <select
              value={rPropId}
              onChange={(e) => setRPropId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            >
              {ownerProps.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              required
              value={rTitle}
              onChange={(e) => setRTitle(e.target.value)}
              placeholder="Rule Title *"
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={rCat}
                onChange={(e) => setRCat(e.target.value as PropertyRule['category'])}
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                {RULE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={rDate}
                onChange={(e) => setRDate(e.target.value)}
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
              />
            </div>
            <textarea
              rows={3}
              required
              value={rDesc}
              onChange={(e) => setRDesc(e.target.value)}
              placeholder="Rule details..."
              className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rAck}
                  onChange={(e) => setRAck(e.target.checked)}
                  className="accent-[#047857]"
                />
                <span>Require Tenant Acknowledgement</span>
              </label>
              <select
                value={rStatus}
                onChange={(e) => setRStatus(e.target.value as PropertyRule['status'])}
                className="h-9 px-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <button type="submit" className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold">
              Save PG Rule
            </button>
          </form>
        )}
      </ModalSheet>
    </div>
  );
};
