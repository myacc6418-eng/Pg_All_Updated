import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Search } from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import { ActionBtn, ModalSheet, StatusText } from '../../components/ui/Primitives';
import { exportRowsToCsv, formatINR } from '../../utils/formatters';
import { JoiningRequest, SharingOption, TenantStay, TenantTransferRecord } from '../../types/pgfinder';

export const OwnerTenantsPage: React.FC = () => {
  const {
    currentUser,
    properties,
    floors,
    rooms,
    beds,
    stays,
    transfers,
    joiningRequests,
    rentInvoices,
    rentPayments,
    depositTransactions,
    complaints,
    checkouts,
    ownerSelectedPropertyId,
    setOwnerSelectedPropertyId,
    approveJoiningRequest,
    assignBedAndActivateStay,
    rejectJoiningRequest,
    cancelJoiningRequest,
    updateTenantStayPermitted,
    archiveTenantStay,
    transferTenantBed,
    completeCheckout,
  } = usePGFinder();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab =
    (searchParams.get('tab') as 'directory' | 'requests' | 'checkouts' | 'documents') || 'directory';
  const [tab, setTab] = useState<'directory' | 'requests' | 'checkouts' | 'documents'>(initialTab);

  useEffect(() => {
    const pid = searchParams.get('propertyId');
    if (pid) setOwnerSelectedPropertyId(pid);
    const t = searchParams.get('tab') as typeof tab | null;
    if (t && ['directory', 'requests', 'checkouts', 'documents'].includes(t)) setTab(t);
  }, [searchParams, setOwnerSelectedPropertyId]);

  const ownerProps = useMemo(
    () => properties.filter((p) => p.ownerId === (currentUser?.id || 'usr-owner-1') && !p.archived),
    [properties, currentUser]
  );
  const ownerPropIds = useMemo(() => ownerProps.map((p) => p.id), [ownerProps]);
  const scopedPropIds = useMemo(
    () => (ownerSelectedPropertyId === 'ALL' ? ownerPropIds : [ownerSelectedPropertyId]),
    [ownerSelectedPropertyId, ownerPropIds]
  );

  // Directory filters
  const [search, setSearch] = useState('');
  const [floorFilter, setFloorFilter] = useState('ALL');
  const [roomFilter, setRoomFilter] = useState('ALL');
  const [sharingFilter, setSharingFilter] = useState<'ALL' | SharingOption>('ALL');
  const [stayGroup, setStayGroup] = useState<'ALL' | 'Active' | 'Previous'>('ALL');
  const [pendingOnly, setPendingOnly] = useState(false);

  const [banner, setBanner] = useState<{ ok: boolean; text: string } | null>(null);

  // Modals
  const [viewStay, setViewStay] = useState<TenantStay | null>(null);
  const [editStay, setEditStay] = useState<TenantStay | null>(null);
  const [eMobile, setEMobile] = useState('');
  const [eEmail, setEEmail] = useState('');
  const [eEmergency, setEEmergency] = useState('');
  const [eDocStatus, setEDocStatus] = useState<'Pending' | 'Verified'>('Verified');
  const [eNotes, setENotes] = useState('');

  // Transfer modal
  const [transferStay, setTransferStay] = useState<TenantStay | null>(null);
  const [tPropId, setTPropId] = useState('');
  const [tFloorId, setTFloorId] = useState('');
  const [tRoomId, setTRoomId] = useState('');
  const [tBedId, setTBedId] = useState('');
  const [tDate, setTDate] = useState(new Date().toISOString().slice(0, 10));
  const [tReason, setTReason] = useState<TenantTransferRecord['reason']>('Room Upgrade');
  const [tRent, setTRent] = useState('');
  const [tNotes, setTNotes] = useState('');

  // Joining Request View & 4-step Assign
  const [viewReq, setViewReq] = useState<JoiningRequest | null>(null);
  const [assignReq, setAssignReq] = useState<JoiningRequest | null>(null);
  const [assignPropId, setAssignPropId] = useState('');
  const [assignFloorId, setAssignFloorId] = useState('');
  const [assignRoomId, setAssignRoomId] = useState('');
  const [assignBedId, setAssignBedId] = useState('');
  const [agreedRent, setAgreedRent] = useState('12000');
  const [agreedDeposit, setAgreedDeposit] = useState('24000');
  const [assignError, setAssignError] = useState('');

  // Checkout settlement
  const [deductionAmt, setDeductionAmt] = useState<Record<string, string>>({});
  const [deductionReason, setDeductionReason] = useState<Record<string, string>>({});

  const getPendingRent = (stayId: string) =>
    rentInvoices
      .filter((i) => i.stayId === stayId)
      .reduce((sum, i) => sum + Math.max(0, i.rentAmount + i.additionalCharges - i.paidAmount), 0);

  const filteredStays = useMemo(() => {
    return stays.filter((s) => {
      if (!scopedPropIds.includes(s.propertyId)) return false;
      if (floorFilter !== 'ALL' && s.floorId !== floorFilter) return false;
      if (roomFilter !== 'ALL' && s.roomId !== roomFilter) return false;
      const rm = rooms.find((r) => r.id === s.roomId);
      if (sharingFilter !== 'ALL' && rm?.sharing !== sharingFilter) return false;
      if (stayGroup === 'Active' && s.status !== 'Active' && s.status !== 'Checkout Requested') return false;
      if (stayGroup === 'Previous' && s.status !== 'Completed' && s.status !== 'Archived') return false;
      if (pendingOnly && getPendingRent(s.id) <= 0) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const bd = beds.find((b) => b.id === s.bedId);
        return (
          s.tenantName.toLowerCase().includes(q) ||
          s.tenantMobile.toLowerCase().includes(q) ||
          s.tenantId.toLowerCase().includes(q) ||
          (rm?.roomNumber || '').toLowerCase().includes(q) ||
          (bd?.bedCode || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [stays, scopedPropIds, floorFilter, roomFilter, sharingFilter, stayGroup, pendingOnly, search, rooms, beds, rentInvoices]);

  const ownerRequests = joiningRequests.filter((jr) => scopedPropIds.includes(jr.propertyId));
  const ownerCheckouts = checkouts.filter((c) => scopedPropIds.includes(c.propertyId));

  const switchTab = (next: typeof tab) => {
    setTab(next);
    const params: Record<string, string> = { tab: next };
    if (ownerSelectedPropertyId !== 'ALL') params.propertyId = ownerSelectedPropertyId;
    setSearchParams(params);
  };

  const openAssign = (req: JoiningRequest) => {
    const pid = req.propertyId;
    const pFloors = floors.filter((f) => f.propertyId === pid);
    const firstFl = pFloors[0]?.id || '';
    const pRooms = rooms.filter((r) => r.propertyId === pid && r.floorId === firstFl);
    const firstRm = pRooms[0] || rooms.find((r) => r.propertyId === pid);
    const firstAvailBed = beds.find((b) => b.roomId === firstRm?.id && b.status === 'Available');
    setAssignReq(req);
    setAssignPropId(pid);
    setAssignFloorId(firstRm?.floorId || firstFl);
    setAssignRoomId(firstRm?.id || '');
    setAssignBedId(firstAvailBed?.id || '');
    setAgreedRent(String(firstRm?.monthlyRent || 10000));
    setAgreedDeposit(String(firstRm?.securityDeposit || 20000));
    setAssignError('');
  };

  const openTransfer = (s: TenantStay) => {
    setTransferStay(s);
    const pid = s.propertyId;
    setTPropId(pid);
    const fls = floors.filter((f) => f.propertyId === pid);
    const fl = fls[0]?.id || '';
    setTFloorId(fl);
    const rms = rooms.filter((r) => r.floorId === fl);
    const rm = rms[0];
    setTRoomId(rm?.id || '');
    const bd = beds.find((b) => b.roomId === rm?.id && b.status === 'Available');
    setTBedId(bd?.id || '');
    setTRent(String(rm?.monthlyRent || s.monthlyRent));
    setTNotes('');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-display">Tenants &amp; Onboarding</h1>
          <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
            Manage all tenants, joining requests, room/bed assignments, transfers, documents, and checkouts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={ownerSelectedPropertyId}
            onChange={(e) => setOwnerSelectedPropertyId(e.target.value)}
            aria-label="Filter by property"
            className="h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] text-xs font-medium"
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
            onClick={() =>
              exportRowsToCsv(
                'pg-finder-tenants.csv',
                ['Tenant ID', 'Name', 'Mobile', 'Property', 'Room', 'Bed', 'Rent', 'Pending Rent', 'Deposit Paid', 'Status'],
                filteredStays.map((s) => [
                  s.tenantId,
                  s.tenantName,
                  s.tenantMobile,
                  properties.find((p) => p.id === s.propertyId)?.name || '',
                  rooms.find((r) => r.id === s.roomId)?.roomNumber || '',
                  beds.find((b) => b.id === s.bedId)?.bedCode || '',
                  s.monthlyRent,
                  getPendingRent(s.id),
                  s.depositPaid,
                  s.status,
                ])
              )
            }
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {banner && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            banner.ok
              ? 'border-[#059669]/30 bg-[#059669]/10 text-[#059669] dark:text-[#34D399]'
              : 'border-[#DC2626]/30 bg-[#DC2626]/10 text-[#DC2626] dark:text-[#F87171]'
          }`}
        >
          <span>{banner.text}</span>
          <button type="button" onClick={() => setBanner(null)} className="font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] w-fit max-w-full">
        {[
          { id: 'directory', label: `All Tenants (${filteredStays.length})` },
          {
            id: 'requests',
            label: `Joining Requests (${ownerRequests.filter((r) => ['New', 'Under Review', 'Awaiting Bed Assignment'].includes(r.status)).length})`,
          },
          { id: 'checkouts', label: `Checkouts (${ownerCheckouts.length})` },
          { id: 'documents', label: `Tenant Documents (${stays.filter((s) => scopedPropIds.includes(s.propertyId)).length})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => switchTab(t.id as typeof tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              tab === t.id
                ? 'bg-[#047857] text-white dark:bg-[#34D399] dark:text-[#0B1220]'
                : 'text-[#64748B] dark:text-[#9CA3AF]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ALL TENANTS TABLE */}
      {tab === 'directory' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, mobile, ID, room, bed..."
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-xs"
              />
            </div>
            <select
              value={floorFilter}
              onChange={(e) => {
                setFloorFilter(e.target.value);
                setRoomFilter('ALL');
              }}
              className="h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-xs"
            >
              <option value="ALL">All Floors</option>
              {floors
                .filter((f) => scopedPropIds.includes(f.propertyId))
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
            </select>
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-xs"
            >
              <option value="ALL">All Rooms</option>
              {rooms
                .filter((r) => scopedPropIds.includes(r.propertyId) && (floorFilter === 'ALL' || r.floorId === floorFilter))
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.roomNumber}
                  </option>
                ))}
            </select>
            <select
              value={sharingFilter}
              onChange={(e) => setSharingFilter(e.target.value as 'ALL' | SharingOption)}
              className="h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-xs"
            >
              <option value="ALL">All Sharing</option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Triple">Triple</option>
              <option value="Four">Four</option>
            </select>
            <select
              value={stayGroup}
              onChange={(e) => setStayGroup(e.target.value as 'ALL' | 'Active' | 'Previous')}
              className="h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-xs"
            >
              <option value="ALL">All Stays</option>
              <option value="Active">Active Tenants</option>
              <option value="Previous">Previous Tenants</option>
            </select>
            <label className="inline-flex items-center gap-1.5 text-xs">
              <input
                type="checkbox"
                checked={pendingOnly}
                onChange={(e) => setPendingOnly(e.target.checked)}
                className="accent-[#047857]"
              />
              <span>Pending Rent Only</span>
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B] dark:text-[#9CA3AF]">
                  <th className="py-2 pr-3 font-medium">Tenant</th>
                  <th className="py-2 pr-3 font-medium">Mobile</th>
                  <th className="py-2 pr-3 font-medium">PG / Floor / Room / Bed</th>
                  <th className="py-2 pr-3 font-medium font-mono-num">Joined</th>
                  <th className="py-2 pr-3 font-medium font-mono-num">Rent</th>
                  <th className="py-2 pr-3 font-medium font-mono-num">Pending Rent</th>
                  <th className="py-2 pr-3 font-medium font-mono-num">Deposit Paid</th>
                  <th className="py-2 pr-3 font-medium">Docs</th>
                  <th className="py-2 pr-3 font-medium">Stay Status</th>
                  <th className="py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
                {filteredStays.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-[#64748B]">
                      No tenant stays match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredStays.map((s) => {
                    const prop = properties.find((p) => p.id === s.propertyId);
                    const fl = floors.find((f) => f.id === s.floorId);
                    const rm = rooms.find((r) => r.id === s.roomId);
                    const bd = beds.find((b) => b.id === s.bedId);
                    const pending = getPendingRent(s.id);

                    return (
                      <tr key={s.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1F2937]/40">
                        <td className="py-2.5 pr-3 whitespace-nowrap">
                          <div className="font-semibold">{s.tenantName}</div>
                          <div className="text-[11px] text-[#64748B] font-mono-num">{s.tenantId}</div>
                        </td>
                        <td className="py-2.5 pr-3 font-mono-num whitespace-nowrap">{s.tenantMobile}</td>
                        <td className="py-2.5 pr-3 whitespace-nowrap">
                          <div className="font-medium">{prop?.name}</div>
                          <div className="text-[11px] text-[#64748B] font-mono-num">
                            {fl?.name || 'Floor'} · Room {rm?.roomNumber} · {bd?.bedCode}
                          </div>
                        </td>
                        <td className="py-2.5 pr-3 font-mono-num whitespace-nowrap">{s.joiningDate}</td>
                        <td className="py-2.5 pr-3 font-mono-num font-semibold">{formatINR(s.monthlyRent)}</td>
                        <td className="py-2.5 pr-3 font-mono-num font-semibold">
                          <span className={pending > 0 ? 'text-[#D97706] dark:text-[#FBBF24]' : 'text-[#059669] dark:text-[#34D399]'}>
                            {formatINR(pending)}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 font-mono-num">{formatINR(s.depositPaid)}</td>
                        <td className="py-2.5 pr-3">
                          <StatusText status={s.documentStatus} />
                        </td>
                        <td className="py-2.5 pr-3">
                          <StatusText status={s.status} />
                        </td>
                        <td className="py-2.5 text-right min-w-[260px]">
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            <ActionBtn kind="view" onClick={() => setViewStay(s)} />
                            <ActionBtn
                              kind="edit"
                              onClick={() => {
                                setEditStay(s);
                                setEMobile(s.tenantMobile);
                                setEEmail(s.tenantEmail);
                                setEEmergency(s.emergencyContact || '');
                                setEDocStatus(s.documentStatus);
                                setENotes(s.ownerNotes || '');
                              }}
                            />
                            {s.status === 'Active' ? (
                              <ActionBtn kind="transfer" onClick={() => openTransfer(s)} />
                            ) : (
                              s.status === 'Completed' && (
                                <ActionBtn
                                  kind="delete"
                                  label="Archive"
                                  onClick={() => {
                                    const res = archiveTenantStay(s.id);
                                    setBanner({ ok: res.ok, text: res.message });
                                  }}
                                />
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* JOINING REQUESTS TABLE */}
      {tab === 'requests' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B] dark:text-[#9CA3AF]">
                <th className="py-2 pr-3 font-medium">Request ID</th>
                <th className="py-2 pr-3 font-medium">Tenant</th>
                <th className="py-2 pr-3 font-medium">Requested PG</th>
                <th className="py-2 pr-3 font-medium">Preferred Room</th>
                <th className="py-2 pr-3 font-medium font-mono-num">Move-in Date</th>
                <th className="py-2 pr-3 font-medium font-mono-num">Requested On</th>
                <th className="py-2 pr-3 font-medium">Source</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
              {ownerRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#64748B]">
                    No joining requests found.
                  </td>
                </tr>
              ) : (
                ownerRequests.map((req) => {
                  const prop = properties.find((p) => p.id === req.propertyId);
                  const canAction = ['New', 'Under Review', 'Awaiting Bed Assignment'].includes(req.status);
                  return (
                    <tr key={req.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1F2937]/40">
                      <td className="py-2.5 pr-3 font-mono-num text-[#64748B]">{req.id}</td>
                      <td className="py-2.5 pr-3">
                        <div className="font-semibold">{req.tenantName}</div>
                        <div className="text-[11px] text-[#64748B] font-mono-num">{req.tenantMobile}</div>
                      </td>
                      <td className="py-2.5 pr-3">{prop?.name}</td>
                      <td className="py-2.5 pr-3">{req.preferredSharing} Sharing</td>
                      <td className="py-2.5 pr-3 font-mono-num">{req.moveInDate}</td>
                      <td className="py-2.5 pr-3 font-mono-num">{req.createdAt}</td>
                      <td className="py-2.5 pr-3">{req.source}</td>
                      <td className="py-2.5 pr-3">
                        <StatusText status={req.status} />
                      </td>
                      <td className="py-2.5 text-right min-w-[280px]">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <ActionBtn kind="view" onClick={() => setViewReq(req)} />
                          {canAction && (
                            <>
                              {(req.status === 'New' || req.status === 'Under Review') && (
                                <ActionBtn
                                  kind="approve"
                                  label="Approve"
                                  onClick={() => approveJoiningRequest(req.id)}
                                />
                              )}
                              <ActionBtn
                                kind="add"
                                label="Assign Bed"
                                onClick={() => openAssign(req)}
                              />
                              <ActionBtn
                                kind="reject"
                                label="Reject"
                                onClick={() => rejectJoiningRequest(req.id)}
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CHECKOUTS TABLE */}
      {tab === 'checkouts' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B] dark:text-[#9CA3AF]">
                <th className="py-2 pr-3 font-medium">Tenant</th>
                <th className="py-2 pr-3 font-medium">PG &amp; Bed</th>
                <th className="py-2 pr-3 font-medium font-mono-num">Checkout Date</th>
                <th className="py-2 pr-3 font-medium font-mono-num">Deposit Held</th>
                <th className="py-2 pr-3 font-medium font-mono-num">Pending Rent</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 font-medium text-right">Settlement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
              {ownerCheckouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#64748B]">
                    No checkout requests right now.
                  </td>
                </tr>
              ) : (
                ownerCheckouts.map((chk) => (
                  <tr key={chk.id}>
                    <td className="py-3 pr-3 font-semibold">{chk.tenantName}</td>
                    <td className="py-3 pr-3">
                      {properties.find((p) => p.id === chk.propertyId)?.name} · Room {chk.roomNumber} ({chk.bedCode})
                    </td>
                    <td className="py-3 pr-3 font-mono-num">{chk.requestedDate}</td>
                    <td className="py-3 pr-3 font-mono-num">{formatINR(chk.depositHeld)}</td>
                    <td className="py-3 pr-3 font-mono-num">{formatINR(chk.pendingRent)}</td>
                    <td className="py-3 pr-3">
                      <StatusText status={chk.status} />
                    </td>
                    <td className="py-3 text-right">
                      {chk.status !== 'Completed' ? (
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <input
                            type="number"
                            value={deductionAmt[chk.id] ?? '0'}
                            onChange={(e) => setDeductionAmt((p) => ({ ...p, [chk.id]: e.target.value }))}
                            placeholder="Deduction ₹"
                            className="w-24 h-8 px-2 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
                          />
                          <input
                            type="text"
                            value={deductionReason[chk.id] ?? ''}
                            onChange={(e) => setDeductionReason((p) => ({ ...p, [chk.id]: e.target.value }))}
                            placeholder="Reason (optional)"
                            className="w-36 h-8 px-2 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                          />
                          <ActionBtn
                            kind="approve"
                            label="Complete & Release Bed"
                            onClick={() =>
                              completeCheckout(
                                chk.id,
                                Number(deductionAmt[chk.id] || 0),
                                deductionReason[chk.id] || 'Standard inspection'
                              )
                            }
                          />
                        </div>
                      ) : (
                        <span className="text-[#059669] dark:text-[#34D399] font-medium">Bed Released</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TENANT DOCUMENTS TAB */}
      {tab === 'documents' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B] dark:text-[#9CA3AF]">
                <th className="py-2 pr-3 font-medium">Tenant</th>
                <th className="py-2 pr-3 font-medium">PG &amp; Room</th>
                <th className="py-2 pr-3 font-medium">ID / KYC Verification</th>
                <th className="py-2 pr-3 font-medium">Agreement</th>
                <th className="py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
              {stays
                .filter((s) => scopedPropIds.includes(s.propertyId))
                .map((s) => (
                  <tr key={s.id}>
                    <td className="py-2.5 pr-3">
                      <div className="font-semibold">{s.tenantName}</div>
                      <div className="text-[11px] text-[#64748B] font-mono-num">{s.tenantMobile}</div>
                    </td>
                    <td className="py-2.5 pr-3">
                      {properties.find((p) => p.id === s.propertyId)?.name} · Room{' '}
                      {rooms.find((r) => r.id === s.roomId)?.roomNumber}
                    </td>
                    <td className="py-2.5 pr-3">
                      <StatusText status={s.documentStatus} />
                    </td>
                    <td className="py-2.5 pr-3">
                      <StatusText status={s.agreementAccepted ? 'Accepted' : 'Pending'} />
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        {s.documentStatus !== 'Verified' ? (
                          <ActionBtn
                            kind="approve"
                            label="Mark Verified"
                            onClick={() => updateTenantStayPermitted(s.id, { documentStatus: 'Verified' })}
                          />
                        ) : (
                          <ActionBtn
                            kind="edit"
                            label="Mark Pending"
                            onClick={() => updateTenantStayPermitted(s.id, { documentStatus: 'Pending' })}
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

      {/* VIEW TENANT 4-SECTION MODAL (Personal, Accommodation, Financial, Additional — NO Personal Expense Tracker) */}
      <ModalSheet
        open={viewStay !== null}
        onClose={() => setViewStay(null)}
        title={`Tenant Profile — ${viewStay?.tenantName || ''}`}
        subtitle={viewStay ? `${viewStay.tenantId} · Stay ${viewStay.status}` : ''}
        maxWidth="max-w-3xl"
      >
        {viewStay && (
          <div className="space-y-4 text-xs">
            {/* Section 1: Personal */}
            <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-1.5">
              <div className="font-semibold text-[#047857] dark:text-[#34D399]">1. Personal Information</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>Name: <span className="font-medium">{viewStay.tenantName}</span></div>
                <div>Mobile: <span className="font-mono-num">{viewStay.tenantMobile}</span></div>
                <div>Email: {viewStay.tenantEmail}</div>
                <div>Emergency Contact: <span className="font-mono-num">{viewStay.emergencyContact || 'Not provided'}</span></div>
                <div>KYC Document Status: <StatusText status={viewStay.documentStatus} /></div>
                <div>Agreement: <StatusText status={viewStay.agreementAccepted ? 'Accepted' : 'Pending'} /></div>
              </div>
            </div>

            {/* Section 2: Accommodation */}
            {(() => {
              const prop = properties.find((p) => p.id === viewStay.propertyId);
              const fl = floors.find((f) => f.id === viewStay.floorId);
              const rm = rooms.find((r) => r.id === viewStay.roomId);
              const bd = beds.find((b) => b.id === viewStay.bedId);
              return (
                <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-1.5">
                  <div className="font-semibold text-[#047857] dark:text-[#34D399]">2. Accommodation Details</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>PG Name: <span className="font-medium">{prop?.name}</span></div>
                    <div>Floor: {fl?.name || '—'}</div>
                    <div>Room: Room {rm?.roomNumber} ({rm?.sharing} · {rm?.isAc ? 'AC' : 'Non-AC'})</div>
                    <div>Bathroom: {rm?.bathroomType}</div>
                    <div>Bed Code: <span className="font-mono-num font-semibold">{bd?.bedCode}</span></div>
                    <div>Joined Date: <span className="font-mono-num">{viewStay.joiningDate}</span></div>
                  </div>
                </div>
              );
            })()}

            {/* Section 3: Financial (Rent & Deposits only; NO private personal expense tracker) */}
            <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-2">
              <div className="font-semibold text-[#047857] dark:text-[#34D399]">3. Financial Ledger (PG Stay)</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono-num">
                <div>Monthly Rent: {formatINR(viewStay.monthlyRent)}</div>
                <div>Due Day: {viewStay.rentDueDay || 5}th</div>
                <div>Pending Rent: {formatINR(getPendingRent(viewStay.id))}</div>
                <div>Deposit Held: {formatINR(viewStay.depositPaid)}</div>
              </div>
              <div className="pt-1 border-t border-[#E2E8F0] dark:border-[#374151]">
                <div className="font-medium mb-1">Recent Rent Payments:</div>
                {rentPayments.filter((p) => p.tenantId === viewStay.tenantId && p.propertyId === viewStay.propertyId).length === 0 ? (
                  <div className="text-[#64748B]">No rent payments recorded yet.</div>
                ) : (
                  rentPayments
                    .filter((p) => p.tenantId === viewStay.tenantId && p.propertyId === viewStay.propertyId)
                    .map((p) => (
                      <div key={p.id} className="flex justify-between py-0.5 font-mono-num">
                        <span>{p.paidAt} · {p.method} ({p.reference})</span>
                        <span className={p.reversed ? 'line-through text-[#DC2626]' : 'font-semibold'}>
                          {formatINR(p.amount)} {p.reversed ? '(Reversed)' : ''}
                        </span>
                      </div>
                    ))
                )}
              </div>
              <div className="pt-1 border-t border-[#E2E8F0] dark:border-[#374151]">
                <div className="font-medium mb-1">Deposit Transactions:</div>
                {depositTransactions.filter((d) => d.stayId === viewStay.id).length === 0 ? (
                  <div className="text-[#64748B]">No deposit transactions recorded.</div>
                ) : (
                  depositTransactions
                    .filter((d) => d.stayId === viewStay.id)
                    .map((d) => (
                      <div key={d.id} className="flex justify-between py-0.5 font-mono-num">
                        <span>{d.date} · {d.type} — {d.note}</span>
                        <span>{formatINR(d.amount)}</span>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Section 4: Additional (Transfers, Complaints, Owner Notes) */}
            <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-2">
              <div className="font-semibold text-[#047857] dark:text-[#34D399]">4. Transfers, Complaints &amp; Notes</div>
              <div>Owner Notes: {viewStay.ownerNotes || 'None'}</div>
              <div>
                Transfers:{' '}
                {transfers.filter((t) => t.stayId === viewStay.id).length === 0
                  ? 'No room/PG transfers recorded.'
                  : transfers
                      .filter((t) => t.stayId === viewStay.id)
                      .map((t) => `${t.transferDate} (${t.reason})`)
                      .join(', ')}
              </div>
              <div>
                PG Complaints:{' '}
                {complaints.filter((c) => c.tenantId === viewStay.tenantId && c.propertyId === viewStay.propertyId).length} ticket(s)
              </div>
            </div>
          </div>
        )}
      </ModalSheet>

      {/* EDIT TENANT PERMITTED FIELDS MODAL */}
      <ModalSheet
        open={editStay !== null}
        onClose={() => setEditStay(null)}
        title={`Edit Tenant — ${editStay?.tenantName || ''}`}
        subtitle="Update contact, emergency contact, KYC status, or owner notes"
      >
        {editStay && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateTenantStayPermitted(editStay.id, {
                tenantMobile: eMobile.trim() || editStay.tenantMobile,
                tenantEmail: eEmail.trim() || editStay.tenantEmail,
                emergencyContact: eEmergency.trim(),
                documentStatus: eDocStatus,
                ownerNotes: eNotes.trim(),
              });
              setBanner({ ok: true, text: `Updated permitted records for ${editStay.tenantName}.` });
              setEditStay(null);
            }}
            className="space-y-3 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={eMobile}
                  onChange={(e) => setEMobile(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={eEmail}
                  onChange={(e) => setEEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={eEmergency}
                  onChange={(e) => setEEmergency(e.target.value)}
                  placeholder="Name & phone"
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">KYC Document Status</label>
                <select
                  value={eDocStatus}
                  onChange={(e) => setEDocStatus(e.target.value as 'Pending' | 'Verified')}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                >
                  <option value="Verified">Verified</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Owner Notes</label>
              <textarea
                rows={2}
                value={eNotes}
                onChange={(e) => setENotes(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              />
            </div>
            <button type="submit" className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold">
              Save Tenant Details
            </button>
          </form>
        )}
      </ModalSheet>

      {/* TRANSFER TENANT MODAL (4-STEP DESTINATION PICKER) */}
      <ModalSheet
        open={transferStay !== null}
        onClose={() => setTransferStay(null)}
        title={`Transfer Tenant — ${transferStay?.tenantName || ''}`}
        subtitle="Automatically updates beds, room availability, and stay history"
        maxWidth="max-w-2xl"
      >
        {transferStay && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const res = transferTenantBed({
                stayId: transferStay.id,
                toPropertyId: tPropId,
                toRoomId: tRoomId,
                toBedId: tBedId,
                transferDate: tDate,
                reason: tReason,
                newRent: Number(tRent) || transferStay.monthlyRent,
                notes: tNotes,
              });
              setBanner({ ok: res.ok, text: res.message });
              if (res.ok) setTransferStay(null);
            }}
            className="space-y-3 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">1. Destination PG</label>
                <select
                  value={tPropId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    setTPropId(pid);
                    const fls = floors.filter((f) => f.propertyId === pid);
                    const fl = fls[0]?.id || '';
                    setTFloorId(fl);
                    const rms = rooms.filter((r) => r.floorId === fl);
                    setTRoomId(rms[0]?.id || '');
                    const bd = beds.find((b) => b.roomId === rms[0]?.id && b.status === 'Available');
                    setTBedId(bd?.id || '');
                    if (rms[0]) setTRent(String(rms[0].monthlyRent));
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                >
                  {ownerProps
                    .filter((p) => p.approvalStatus === 'APPROVED' && p.locationVerificationStatus === 'VERIFIED')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">2. Destination Floor</label>
                <select
                  value={tFloorId}
                  onChange={(e) => {
                    const fid = e.target.value;
                    setTFloorId(fid);
                    const rms = rooms.filter((r) => r.floorId === fid);
                    setTRoomId(rms[0]?.id || '');
                    const bd = beds.find((b) => b.roomId === rms[0]?.id && b.status === 'Available');
                    setTBedId(bd?.id || '');
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                >
                  {floors
                    .filter((f) => f.propertyId === tPropId)
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">3. Destination Room</label>
                <select
                  value={tRoomId}
                  onChange={(e) => {
                    const rid = e.target.value;
                    setTRoomId(rid);
                    const rm = rooms.find((r) => r.id === rid);
                    const bd = beds.find((b) => b.roomId === rid && b.status === 'Available');
                    setTBedId(bd?.id || '');
                    if (rm) setTRent(String(rm.monthlyRent));
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                >
                  {rooms
                    .filter((r) => r.floorId === tFloorId)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        Room {r.roomNumber} · {r.sharing} ({formatINR(r.monthlyRent)})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">4. Available Bed</label>
                <select
                  value={tBedId}
                  onChange={(e) => setTBedId(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                >
                  <option value="">Select available bed</option>
                  {beds
                    .filter((b) => b.roomId === tRoomId && b.status === 'Available')
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bedCode}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="date"
                value={tDate}
                onChange={(e) => setTDate(e.target.value)}
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
              />
              <select
                value={tReason}
                onChange={(e) => setTReason(e.target.value as TenantTransferRecord['reason'])}
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                {['Tenant Request', 'Room Upgrade', 'Room Downgrade', 'Maintenance', 'Sharing Change', 'Property Transfer', 'Other'].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={tRent}
                onChange={(e) => setTRent(e.target.value)}
                placeholder="New Rent ₹"
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
              />
            </div>
            <input
              type="text"
              value={tNotes}
              onChange={(e) => setTNotes(e.target.value)}
              placeholder="Transfer notes (optional)"
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            />
            <button
              type="submit"
              disabled={!tBedId}
              className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold disabled:opacity-40"
            >
              Confirm Tenant Transfer
            </button>
          </form>
        )}
      </ModalSheet>

      {/* VIEW JOINING REQUEST MODAL */}
      <ModalSheet
        open={viewReq !== null}
        onClose={() => setViewReq(null)}
        title={`Joining Request — ${viewReq?.tenantName || ''}`}
        subtitle={viewReq ? `${viewReq.id} · ${viewReq.source}` : ''}
      >
        {viewReq && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151]">
              <div>Mobile: <span className="font-mono-num">{viewReq.tenantMobile}</span></div>
              <div>Email: {viewReq.tenantEmail}</div>
              <div>Property: {properties.find((p) => p.id === viewReq.propertyId)?.name}</div>
              <div>Preferred Sharing: {viewReq.preferredSharing}</div>
              <div>Move-in Date: <span className="font-mono-num">{viewReq.moveInDate}</span></div>
              <div>Status: <StatusText status={viewReq.status} /></div>
            </div>
            {viewReq.notes && (
              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1F2937]/50">
                Tenant Note: {viewReq.notes}
              </div>
            )}
            {['New', 'Under Review', 'Awaiting Bed Assignment'].includes(viewReq.status) && (
              <div className="flex flex-wrap gap-2">
                <ActionBtn
                  kind="add"
                  label="Assign Room & Bed"
                  onClick={() => {
                    const r = viewReq;
                    setViewReq(null);
                    openAssign(r);
                  }}
                />
                <ActionBtn
                  kind="reject"
                  label="Cancel Request"
                  onClick={() => {
                    cancelJoiningRequest(viewReq.id);
                    setViewReq(null);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </ModalSheet>

      {/* ASSIGN ROOM & BED 4-STEP MODAL */}
      <ModalSheet
        open={assignReq !== null}
        onClose={() => setAssignReq(null)}
        title="Assign Room & Bed (4-Step)"
        subtitle={assignReq ? `${assignReq.tenantName} · ${assignReq.preferredSharing} preferred` : ''}
      >
        {assignReq && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">1. PG Property</label>
                <select
                  value={assignPropId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    setAssignPropId(pid);
                    const fl = floors.find((f) => f.propertyId === pid)?.id || '';
                    setAssignFloorId(fl);
                    const rm = rooms.find((r) => r.floorId === fl);
                    setAssignRoomId(rm?.id || '');
                    const av = beds.find((b) => b.roomId === rm?.id && b.status === 'Available');
                    setAssignBedId(av?.id || '');
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                >
                  {ownerProps
                    .filter((p) => p.approvalStatus === 'APPROVED')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">2. Floor</label>
                <select
                  value={assignFloorId}
                  onChange={(e) => {
                    const fid = e.target.value;
                    setAssignFloorId(fid);
                    const rm = rooms.find((r) => r.floorId === fid);
                    setAssignRoomId(rm?.id || '');
                    const av = beds.find((b) => b.roomId === rm?.id && b.status === 'Available');
                    setAssignBedId(av?.id || '');
                    if (rm) {
                      setAgreedRent(String(rm.monthlyRent));
                      setAgreedDeposit(String(rm.securityDeposit));
                    }
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                >
                  {floors
                    .filter((f) => f.propertyId === assignPropId)
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">3. Room</label>
                <select
                  value={assignRoomId}
                  onChange={(e) => {
                    const rId = e.target.value;
                    setAssignRoomId(rId);
                    const rm = rooms.find((r) => r.id === rId);
                    const avail = beds.find((b) => b.roomId === rId && b.status === 'Available');
                    setAssignBedId(avail?.id || '');
                    if (rm) {
                      setAgreedRent(String(rm.monthlyRent));
                      setAgreedDeposit(String(rm.securityDeposit));
                    }
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                >
                  {rooms
                    .filter((r) => r.floorId === assignFloorId)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        Room {r.roomNumber} · {r.sharing} ({formatINR(r.monthlyRent)})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">4. Available Bed</label>
                <select
                  value={assignBedId}
                  onChange={(e) => setAssignBedId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                >
                  <option value="">Select available bed</option>
                  {beds
                    .filter((b) => b.roomId === assignRoomId && b.status === 'Available')
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bedCode} (Available)
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">Agreed Monthly Rent (₹)</label>
                <input
                  type="number"
                  value={agreedRent}
                  onChange={(e) => setAgreedRent(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Security Deposit (₹)</label>
                <input
                  type="number"
                  value={agreedDeposit}
                  onChange={(e) => setAgreedDeposit(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
                />
              </div>
            </div>
            {assignError && <div className="text-[#DC2626] font-medium">{assignError}</div>}
            <button
              type="button"
              onClick={() => {
                const res = assignBedAndActivateStay(
                  assignReq.id,
                  assignRoomId,
                  assignBedId,
                  Number(agreedRent) || 10000,
                  Number(agreedDeposit) || 20000
                );
                if (res.ok) {
                  setBanner({ ok: true, text: res.message });
                  setAssignReq(null);
                } else {
                  setAssignError(res.message);
                }
              }}
              className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold"
            >
              Confirm Bed Assignment &amp; Activate Stay
            </button>
          </div>
        )}
      </ModalSheet>
    </div>
  );
};
