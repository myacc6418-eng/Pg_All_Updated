import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeftRight,
  BedDouble,
  ChevronDown,
  ChevronRight,
  Lock,
  Plus,
} from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import { ActionBtn, KpiCard, ModalSheet, StatusText } from '../../components/ui/Primitives';
import { formatINR } from '../../utils/formatters';
import { BedStatus, Floor, Room, SharingOption, TenantStay, TenantTransferRecord } from '../../types/pgfinder';
import { IMG_DOUBLE, IMG_SINGLE } from '../../data/demoData';

export const OwnerVacanciesPage: React.FC = () => {
  const {
    currentUser,
    properties,
    floors,
    rooms,
    beds,
    stays,
    ownerSelectedPropertyId,
    setOwnerSelectedPropertyId,
    addFloor,
    editFloor,
    deleteOrDeactivateFloor,
    addRoom,
    editRoom,
    deleteOrDeactivateRoom,
    addBedToRoom,
    updateBedStatus,
    transferTenantBed,
  } = usePGFinder();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const pid = searchParams.get('propertyId');
    if (pid) setOwnerSelectedPropertyId(pid);
  }, [searchParams, setOwnerSelectedPropertyId]);

  const ownerProps = useMemo(
    () => properties.filter((p) => p.ownerId === (currentUser?.id || 'usr-owner-1') && !p.archived),
    [properties, currentUser]
  );

  const activeProp = useMemo(() => {
    if (ownerSelectedPropertyId !== 'ALL') {
      return ownerProps.find((p) => p.id === ownerSelectedPropertyId) || ownerProps[0];
    }
    return ownerProps.find((p) => p.approvalStatus === 'APPROVED') || ownerProps[0];
  }, [ownerProps, ownerSelectedPropertyId]);

  const unlocked =
    activeProp &&
    activeProp.approvalStatus === 'APPROVED' &&
    activeProp.locationVerificationStatus === 'VERIFIED';

  const propFloors = useMemo(
    () =>
      floors
        .filter((f) => activeProp && f.propertyId === activeProp.id)
        .sort((a, b) => a.floorNumber - b.floorNumber),
    [floors, activeProp]
  );

  const propRooms = useMemo(
    () => rooms.filter((r) => activeProp && r.propertyId === activeProp.id),
    [rooms, activeProp]
  );

  const propBeds = useMemo(
    () => beds.filter((b) => activeProp && b.propertyId === activeProp.id),
    [beds, activeProp]
  );

  const occupiedCount = propBeds.filter((b) => b.status === 'Occupied').length;
  const availableCount = propBeds.filter((b) => b.status === 'Available').length;
  const reservedCount = propBeds.filter((b) => b.status === 'Reserved').length;
  const maintenanceCount = propBeds.filter((b) => b.status === 'Under Maintenance').length;
  const occRate = propBeds.length > 0 ? Math.round((occupiedCount / propBeds.length) * 100) : 0;

  const [expandedFloorIds, setExpandedFloorIds] = useState<Record<string, boolean>>({});
  const [expandedRoomIds, setExpandedRoomIds] = useState<Record<string, boolean>>({});
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Available' | 'Occupied'>('ALL');
  const [banner, setBanner] = useState<{ ok: boolean; text: string } | null>(null);

  // Add / Edit Floor Modal
  const [floorModal, setFloorModal] = useState<{ mode: 'add' | 'edit'; floor?: Floor } | null>(null);
  const [fName, setFName] = useState('');
  const [fNumber, setFNumber] = useState('1');
  const [fDesc, setFDesc] = useState('');
  const [fOperational, setFOperational] = useState(true);

  // Add / Edit Room Modal
  const [roomModal, setRoomModal] = useState<{ mode: 'add' | 'edit'; floorId: string; room?: Room } | null>(null);
  const [rNumber, setRNumber] = useState('');
  const [rSharing, setRSharing] = useState<SharingOption>('Double');
  const [rCapacity, setRCapacity] = useState('2');
  const [rIsAc, setRIsAc] = useState(true);
  const [rBath, setRBath] = useState<'Attached' | 'Shared' | 'Common Floor'>('Attached');
  const [rRent, setRRent] = useState('12000');
  const [rDeposit, setRDeposit] = useState('24000');

  // Transfer Tenant Modal
  const [transferModalOpen, setTransferModalOpen] = useState(searchParams.get('transfer') === '1');
  const [transferStayId, setTransferStayId] = useState<string>('');
  const [toPropertyId, setToPropertyId] = useState<string>('');
  const [toFloorId, setToFloorId] = useState<string>('');
  const [toRoomId, setToRoomId] = useState<string>('');
  const [toBedId, setToBedId] = useState<string>('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().slice(0, 10));
  const [transferReason, setTransferReason] = useState<TenantTransferRecord['reason']>('Room Upgrade');
  const [transferNewRent, setTransferNewRent] = useState('');
  const [transferNotes, setTransferNotes] = useState('');

  const activeStays = stays.filter(
    (s) => s.status === 'Active' && ownerProps.some((p) => p.id === s.propertyId)
  );
  const selectedTransferStay: TenantStay | undefined =
    activeStays.find((s) => s.id === transferStayId) || activeStays[0];

  const openTransferForStay = (stay: TenantStay) => {
    setTransferStayId(stay.id);
    const eligibleProp = ownerProps.find(
      (p) => p.id === stay.propertyId && p.approvalStatus === 'APPROVED' && p.locationVerificationStatus === 'VERIFIED'
    ) || ownerProps.find((p) => p.approvalStatus === 'APPROVED');
    const pid = eligibleProp?.id || stay.propertyId;
    setToPropertyId(pid);
    const fls = floors.filter((f) => f.propertyId === pid);
    const firstFl = fls[0]?.id || '';
    setToFloorId(firstFl);
    const rms = rooms.filter((r) => r.propertyId === pid && r.floorId === firstFl);
    const firstRm = rms[0];
    setToRoomId(firstRm?.id || '');
    const availBed = beds.find((b) => b.roomId === firstRm?.id && b.status === 'Available');
    setToBedId(availBed?.id || '');
    setTransferNewRent(String(firstRm?.monthlyRent || stay.monthlyRent));
    setTransferNotes('');
    setTransferModalOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-display">Floors, Rooms &amp; Vacancies</h1>
          <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
            Property → Floor → Room → Bed → Tenant hierarchy with instant vacancy inspection and bed transfers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={activeProp?.id || ''}
            onChange={(e) => {
              setOwnerSelectedPropertyId(e.target.value);
              setSearchParams({ propertyId: e.target.value });
            }}
            aria-label="Select property"
            className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] text-xs font-medium"
          >
            {ownerProps.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {unlocked && (
            <>
              <ActionBtn
                kind="transfer"
                label="Transfer Tenant"
                onClick={() => {
                  if (activeStays[0]) openTransferForStay(activeStays[0]);
                }}
                disabled={activeStays.length === 0}
              />
              <ActionBtn
                kind="add"
                label="Add Floor"
                onClick={() => {
                  setFName(`Floor ${propFloors.length}`);
                  setFNumber(String(propFloors.length));
                  setFDesc('');
                  setFOperational(true);
                  setFloorModal({ mode: 'add' });
                }}
              />
            </>
          )}
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

      {/* 8 Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <KpiCard label="Total Floors" value={propFloors.length} />
        <KpiCard label="Total Rooms" value={propRooms.length} />
        <KpiCard label="Total Beds" value={propBeds.length} />
        <KpiCard label="Occupied" value={occupiedCount} tone="info" />
        <KpiCard label="Available" value={availableCount} tone="success" />
        <KpiCard label="Reserved" value={reservedCount} tone="info" />
        <KpiCard label="Maintenance" value={maintenanceCount} tone="warning" />
        <KpiCard label="Occupancy" value={`${occRate}%`} tone="primary" />
      </div>

      {!unlocked ? (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-6 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <Lock className="w-4 h-4 text-[#D97706]" />
            <span>Inventory Locked Until Property Approval &amp; GPS Verification</span>
          </div>
          <p className="text-[#64748B] dark:text-[#9CA3AF]">
            {activeProp?.name} currently has approval status &quot;{activeProp?.approvalStatus.replace(/_/g, ' ')}&quot; and location status &quot;{activeProp?.locationVerificationStatus.replace(/_/g, ' ')}&quot;. Floors, rooms, and beds unlock once approved.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Quick Bed Filter */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              {(['ALL', 'Available', 'Occupied'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-lg font-medium border ${
                    statusFilter === f
                      ? 'bg-[#047857] text-white border-[#047857] dark:bg-[#34D399] dark:text-[#0B1220]'
                      : 'border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] text-[#64748B]'
                  }`}
                >
                  {f === 'ALL' ? 'All Rooms' : `${f} Only`}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                const nextState: Record<string, boolean> = {};
                propFloors.forEach((f) => {
                  nextState[f.id] = true;
                });
                setExpandedFloorIds(nextState);
              }}
              className="text-[#047857] dark:text-[#34D399] font-medium"
            >
              Expand All Floors
            </button>
          </div>

          {propFloors.map((fl) => {
            const flRooms = propRooms.filter((r) => {
              if (r.floorId !== fl.id) return false;
              if (statusFilter === 'ALL') return true;
              const rBeds = propBeds.filter((b) => b.roomId === r.id);
              return rBeds.some((b) => b.status === statusFilter);
            });
            const flBeds = propBeds.filter((b) => flRooms.some((r) => r.id === b.roomId));
            const flAvail = flBeds.filter((b) => b.status === 'Available').length;
            const isOpen = expandedFloorIds[fl.id] ?? true;

            return (
              <div
                key={fl.id}
                className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] overflow-hidden"
              >
                {/* Floor Header */}
                <div className="px-4 py-3 bg-[#F8FAFC] dark:bg-[#1F2937]/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setExpandedFloorIds((p) => ({ ...p, [fl.id]: !isOpen }))}
                    className="flex items-center gap-2 text-left font-semibold text-sm"
                  >
                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <span>{fl.name}</span>
                    <span className="text-xs font-normal text-[#64748B] dark:text-[#9CA3AF] font-mono-num">
                      · {flRooms.length} rooms · {flAvail}/{flBeds.length} available
                    </span>
                    {!fl.operational && <StatusText status="Inactive" />}
                  </button>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <ActionBtn
                      kind="edit"
                      label="Edit Floor"
                      onClick={() => {
                        setFName(fl.name);
                        setFNumber(String(fl.floorNumber));
                        setFDesc(fl.description || '');
                        setFOperational(fl.operational);
                        setFloorModal({ mode: 'edit', floor: fl });
                      }}
                    />
                    <ActionBtn
                      kind="delete"
                      label={flRooms.length > 0 ? (fl.operational ? 'Deactivate' : 'Activate') : 'Delete'}
                      onClick={() => {
                        const res = deleteOrDeactivateFloor(fl.id);
                        setBanner({ ok: res.ok, text: res.message });
                      }}
                    />
                    <ActionBtn
                      kind="add"
                      label="Add Room"
                      onClick={() => {
                        setRNumber(`${fl.floorNumber}0${flRooms.length + 1}`);
                        setRSharing('Double');
                        setRCapacity('2');
                        setRIsAc(true);
                        setRBath('Attached');
                        setRRent(String(activeProp?.defaultRent || 12000));
                        setRDeposit(String(activeProp?.defaultDeposit || 24000));
                        setRoomModal({ mode: 'add', floorId: fl.id });
                      }}
                    />
                  </div>
                </div>

                {/* Rooms Table Inside Floor */}
                {isOpen && (
                  <div className="p-4 overflow-x-auto">
                    {flRooms.length === 0 ? (
                      <div className="text-xs text-[#64748B] py-4 text-center">
                        No rooms match on this floor. Click &quot;Add Room&quot; to create rooms and auto-generate beds.
                      </div>
                    ) : (
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B] dark:text-[#9CA3AF]">
                            <th className="py-2 pr-3 font-medium">Room #</th>
                            <th className="py-2 pr-3 font-medium">Sharing</th>
                            <th className="py-2 pr-3 font-medium font-mono-num">Total</th>
                            <th className="py-2 pr-3 font-medium font-mono-num">Occ</th>
                            <th className="py-2 pr-3 font-medium font-mono-num">Avail</th>
                            <th className="py-2 pr-3 font-medium font-mono-num">Res</th>
                            <th className="py-2 pr-3 font-medium">AC &amp; Bath</th>
                            <th className="py-2 pr-3 font-medium font-mono-num">Monthly Rent</th>
                            <th className="py-2 pr-3 font-medium">Status</th>
                            <th className="py-2 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
                          {flRooms.map((rm) => {
                            const rmBeds = beds.filter((b) => b.roomId === rm.id);
                            const rOcc = rmBeds.filter((b) => b.status === 'Occupied').length;
                            const rAvail = rmBeds.filter((b) => b.status === 'Available').length;
                            const rRes = rmBeds.filter((b) => b.status === 'Reserved').length;
                            const bedsExpanded = expandedRoomIds[rm.id] ?? true;

                            return (
                              <React.Fragment key={rm.id}>
                                <tr className="hover:bg-[#F8FAFC] dark:hover:bg-[#1F2937]/30">
                                  <td className="py-2.5 pr-3 font-semibold font-mono-num">
                                    Room {rm.roomNumber}
                                  </td>
                                  <td className="py-2.5 pr-3">{rm.sharing}</td>
                                  <td className="py-2.5 pr-3 font-mono-num">{rmBeds.length}</td>
                                  <td className="py-2.5 pr-3 font-mono-num text-[#2563EB] dark:text-[#60A5FA]">{rOcc}</td>
                                  <td className="py-2.5 pr-3 font-mono-num text-[#059669] dark:text-[#34D399] font-semibold">{rAvail}</td>
                                  <td className="py-2.5 pr-3 font-mono-num">{rRes}</td>
                                  <td className="py-2.5 pr-3 whitespace-nowrap">
                                    {rm.isAc ? 'AC' : 'Non-AC'} · {rm.bathroomType}
                                  </td>
                                  <td className="py-2.5 pr-3 font-mono-num font-semibold">
                                    {formatINR(rm.monthlyRent)}
                                  </td>
                                  <td className="py-2.5 pr-3">
                                    <StatusText status={rm.available ? (rAvail > 0 ? 'Available' : 'Occupied') : 'Inactive'} />
                                  </td>
                                  <td className="py-2.5 text-right">
                                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                                      <ActionBtn
                                        kind="view"
                                        label={bedsExpanded ? 'Hide Beds' : 'Expand Beds'}
                                        onClick={() =>
                                          setExpandedRoomIds((p) => ({ ...p, [rm.id]: !bedsExpanded }))
                                        }
                                      />
                                      <ActionBtn
                                        kind="edit"
                                        onClick={() => {
                                          setRNumber(rm.roomNumber);
                                          setRSharing(rm.sharing);
                                          setRCapacity(String(rm.capacity));
                                          setRIsAc(rm.isAc);
                                          setRBath(rm.bathroomType);
                                          setRRent(String(rm.monthlyRent));
                                          setRDeposit(String(rm.securityDeposit));
                                          setRoomModal({ mode: 'edit', floorId: rm.floorId, room: rm });
                                        }}
                                      />
                                      <ActionBtn
                                        kind="add"
                                        label="Bed"
                                        onClick={() => addBedToRoom(rm.id)}
                                      />
                                      <ActionBtn
                                        kind="delete"
                                        label={rOcc > 0 ? 'Delete' : 'Remove'}
                                        onClick={() => {
                                          const res = deleteOrDeactivateRoom(rm.id);
                                          setBanner({ ok: res.ok, text: res.message });
                                        }}
                                      />
                                    </div>
                                  </td>
                                </tr>

                                {bedsExpanded && (
                                  <tr>
                                    <td colSpan={10} className="pb-3 pt-1 pl-4 bg-[#F8FAFC]/70 dark:bg-[#0B1220]/30">
                                      <div className="rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] overflow-x-auto">
                                        <table className="w-full text-[11px] text-left">
                                          <thead>
                                            <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B] dark:text-[#9CA3AF]">
                                              <th className="py-1.5 px-3 font-medium">Bed</th>
                                              <th className="py-1.5 px-3 font-medium">Status</th>
                                              <th className="py-1.5 px-3 font-medium">Tenant Name</th>
                                              <th className="py-1.5 px-3 font-medium">Mobile</th>
                                              <th className="py-1.5 px-3 font-medium">Joined Date</th>
                                              <th className="py-1.5 px-3 font-medium font-mono-num">Rent</th>
                                              <th className="py-1.5 px-3 font-medium text-right">Actions</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
                                            {rmBeds.map((b) => {
                                              const occStay = stays.find(
                                                (s) => s.bedId === b.id && s.status === 'Active'
                                              );
                                              return (
                                                <tr key={b.id}>
                                                  <td className="py-2 px-3 font-mono-num font-semibold flex items-center gap-1.5">
                                                    <BedDouble className="w-3.5 h-3.5 text-[#047857] dark:text-[#34D399]" />
                                                    <span>{b.bedCode}</span>
                                                  </td>
                                                  <td className="py-2 px-3">
                                                    <StatusText status={b.status} />
                                                  </td>
                                                  <td className="py-2 px-3 font-medium">
                                                    {occStay ? occStay.tenantName : '—'}
                                                  </td>
                                                  <td className="py-2 px-3 font-mono-num text-[#64748B]">
                                                    {occStay ? occStay.tenantMobile : '—'}
                                                  </td>
                                                  <td className="py-2 px-3 font-mono-num text-[#64748B]">
                                                    {occStay ? occStay.joiningDate : '—'}
                                                  </td>
                                                  <td className="py-2 px-3 font-mono-num">
                                                    {formatINR(occStay ? occStay.monthlyRent : b.rentOverride || rm.monthlyRent)}
                                                  </td>
                                                  <td className="py-2 px-3 text-right">
                                                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                                                      {occStay ? (
                                                        <>
                                                          <ActionBtn
                                                            kind="view"
                                                            label="View Tenant"
                                                            onClick={() =>
                                                              navigate(`/owner/tenants?propertyId=${activeProp?.id}`)
                                                            }
                                                          />
                                                          <ActionBtn
                                                            kind="transfer"
                                                            label="Transfer Tenant"
                                                            onClick={() => openTransferForStay(occStay)}
                                                          />
                                                          <ActionBtn
                                                            kind="edit"
                                                            label="Checkout"
                                                            onClick={() =>
                                                              navigate(`/owner/tenants?tab=checkouts&propertyId=${activeProp?.id}`)
                                                            }
                                                          />
                                                        </>
                                                      ) : (
                                                        <>
                                                          <select
                                                            value={b.status}
                                                            onChange={(e) => {
                                                              const res = updateBedStatus(b.id, e.target.value as BedStatus);
                                                              setBanner({ ok: res.ok, text: res.message });
                                                            }}
                                                            aria-label={`Change status for ${b.bedCode}`}
                                                            className="h-8 px-2 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-[11px]"
                                                          >
                                                            <option value="Available">Available</option>
                                                            <option value="Reserved">Reserved</option>
                                                            <option value="Under Maintenance">Under Maintenance</option>
                                                            <option value="Inactive">Inactive</option>
                                                          </select>
                                                          {b.status === 'Available' && (
                                                            <ActionBtn
                                                              kind="add"
                                                              label="Assign Tenant"
                                                              onClick={() =>
                                                                navigate(`/owner/tenants?tab=requests&propertyId=${activeProp?.id}`)
                                                              }
                                                            />
                                                          )}
                                                        </>
                                                      )}
                                                    </div>
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Floor Modal */}
      <ModalSheet
        open={floorModal !== null}
        onClose={() => setFloorModal(null)}
        title={floorModal?.mode === 'edit' ? 'Edit Floor' : 'Add New Floor'}
        subtitle={activeProp?.name}
      >
        {floorModal && activeProp && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!fName.trim()) return;
              if (floorModal.mode === 'add') {
                addFloor({
                  propertyId: activeProp.id,
                  name: fName.trim(),
                  floorNumber: Number(fNumber) || 0,
                  description: fDesc.trim(),
                  operational: fOperational,
                });
                setBanner({ ok: true, text: `Added floor "${fName.trim()}".` });
              } else if (floorModal.floor) {
                editFloor(floorModal.floor.id, {
                  name: fName.trim(),
                  floorNumber: Number(fNumber) || 0,
                  description: fDesc.trim(),
                  operational: fOperational,
                });
                setBanner({ ok: true, text: `Updated floor "${fName.trim()}".` });
              }
              setFloorModal(null);
            }}
            className="space-y-3 text-xs"
          >
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block font-medium mb-1">Floor Name</label>
                <input
                  type="text"
                  required
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                  placeholder="e.g., Third Floor"
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Floor Number</label>
                <input
                  type="number"
                  value={fNumber}
                  onChange={(e) => setFNumber(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Notes / Description (optional)</label>
              <input
                type="text"
                value={fDesc}
                onChange={(e) => setFDesc(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={fOperational}
                onChange={(e) => setFOperational(e.target.checked)}
                className="accent-[#047857]"
              />
              <span>Floor Operational</span>
            </label>
            <button type="submit" className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold">
              {floorModal.mode === 'edit' ? 'Save Floor Changes' : 'Create Floor'}
            </button>
          </form>
        )}
      </ModalSheet>

      {/* Add / Edit Room Modal */}
      <ModalSheet
        open={roomModal !== null}
        onClose={() => setRoomModal(null)}
        title={roomModal?.mode === 'edit' ? `Edit Room ${roomModal.room?.roomNumber}` : 'Add New Room'}
        subtitle="Beds are generated automatically based on sharing capacity"
      >
        {roomModal && activeProp && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!rNumber.trim()) return;
              const cap = Math.max(1, Number(rCapacity) || 1);
              if (roomModal.mode === 'add') {
                addRoom({
                  propertyId: activeProp.id,
                  floorId: roomModal.floorId,
                  roomNumber: rNumber.trim(),
                  sharing: rSharing,
                  capacity: cap,
                  isAc: rIsAc,
                  bathroomType: rBath,
                  geyserAvailable: true,
                  monthlyRent: Number(rRent) || 10000,
                  securityDeposit: Number(rDeposit) || 20000,
                  amenities: ['Wardrobe', 'Study Table'],
                  imageUrl: rSharing === 'Single' ? IMG_SINGLE : IMG_DOUBLE,
                  available: true,
                });
                setBanner({ ok: true, text: `Added Room ${rNumber.trim()} with ${cap} bed(s).` });
              } else if (roomModal.room) {
                const res = editRoom(roomModal.room.id, {
                  roomNumber: rNumber.trim(),
                  sharing: rSharing,
                  capacity: cap,
                  isAc: rIsAc,
                  bathroomType: rBath,
                  monthlyRent: Number(rRent) || roomModal.room.monthlyRent,
                  securityDeposit: Number(rDeposit) || roomModal.room.securityDeposit,
                });
                setBanner({ ok: res.ok, text: res.message });
              }
              setRoomModal(null);
            }}
            className="space-y-3 text-xs"
          >
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-medium mb-1">Room Number</label>
                <input
                  type="text"
                  required
                  value={rNumber}
                  onChange={(e) => setRNumber(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Sharing Type</label>
                <select
                  value={rSharing}
                  onChange={(e) => {
                    const s = e.target.value as SharingOption;
                    setRSharing(s);
                    const mapCap: Record<SharingOption, number> = {
                      Single: 1,
                      Double: 2,
                      Triple: 3,
                      Four: 4,
                      Five: 5,
                      Six: 6,
                      Custom: Number(rCapacity) || 2,
                    };
                    setRCapacity(String(mapCap[s]));
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                >
                  {['Single', 'Double', 'Triple', 'Four', 'Five', 'Six', 'Custom'].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Total Beds</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={rCapacity}
                  onChange={(e) => setRCapacity(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-medium mb-1">Bathroom</label>
                <select
                  value={rBath}
                  onChange={(e) => setRBath(e.target.value as typeof rBath)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                >
                  <option value="Attached">Attached</option>
                  <option value="Shared">Shared</option>
                  <option value="Common Floor">Common Floor</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Monthly Rent (₹)</label>
                <input
                  type="number"
                  value={rRent}
                  onChange={(e) => setRRent(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Security Deposit (₹)</label>
                <input
                  type="number"
                  value={rDeposit}
                  onChange={(e) => setRDeposit(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
                />
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={rIsAc} onChange={(e) => setRIsAc(e.target.checked)} className="accent-[#047857]" />
              <span>Air Conditioned (AC)</span>
            </label>
            <button type="submit" className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold">
              {roomModal.mode === 'edit' ? 'Update Room Configuration' : 'Create Room & Generate Beds'}
            </button>
          </form>
        )}
      </ModalSheet>

      {/* Full Transfer Tenant Modal */}
      <ModalSheet
        open={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        title="Transfer Tenant to Another Room or PG"
        subtitle="Automatically releases previous bed, updates room occupancy, and records transfer history"
        maxWidth="max-w-2xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!selectedTransferStay) return;
            const res = transferTenantBed({
              stayId: selectedTransferStay.id,
              toPropertyId: toPropertyId || selectedTransferStay.propertyId,
              toRoomId,
              toBedId,
              transferDate,
              reason: transferReason,
              newRent: Number(transferNewRent) || selectedTransferStay.monthlyRent,
              notes: transferNotes,
            });
            setBanner({ ok: res.ok, text: res.message });
            if (res.ok) setTransferModalOpen(false);
          }}
          className="space-y-3.5 text-xs"
        >
          <div>
            <label className="block font-medium mb-1">Select Active Tenant</label>
            <select
              value={selectedTransferStay?.id || ''}
              onChange={(e) => {
                const st = activeStays.find((x) => x.id === e.target.value);
                if (st) openTransferForStay(st);
              }}
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            >
              {activeStays.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.tenantName} — Room {rooms.find((r) => r.id === s.roomId)?.roomNumber} ({beds.find((b) => b.id === s.bedId)?.bedCode})
                </option>
              ))}
            </select>
          </div>

          {selectedTransferStay && (
            <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]/40 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <div className="text-[#64748B]">Current PG</div>
                <div className="font-semibold">{properties.find((p) => p.id === selectedTransferStay.propertyId)?.name}</div>
              </div>
              <div>
                <div className="text-[#64748B]">Current Room / Bed</div>
                <div className="font-semibold font-mono-num">
                  Room {rooms.find((r) => r.id === selectedTransferStay.roomId)?.roomNumber} · {beds.find((b) => b.id === selectedTransferStay.bedId)?.bedCode}
                </div>
              </div>
              <div>
                <div className="text-[#64748B]">Current Rent</div>
                <div className="font-semibold font-mono-num">{formatINR(selectedTransferStay.monthlyRent)}</div>
              </div>
              <div>
                <div className="text-[#64748B]">Deposit Paid</div>
                <div className="font-semibold font-mono-num">{formatINR(selectedTransferStay.depositPaid)}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Destination PG</label>
              <select
                value={toPropertyId}
                onChange={(e) => {
                  const pid = e.target.value;
                  setToPropertyId(pid);
                  const fls = floors.filter((f) => f.propertyId === pid);
                  const fl = fls[0]?.id || '';
                  setToFloorId(fl);
                  const rms = rooms.filter((r) => r.floorId === fl);
                  setToRoomId(rms[0]?.id || '');
                  const av = beds.find((b) => b.roomId === rms[0]?.id && b.status === 'Available');
                  setToBedId(av?.id || '');
                  if (rms[0]) setTransferNewRent(String(rms[0].monthlyRent));
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
              <label className="block font-medium mb-1">Destination Floor</label>
              <select
                value={toFloorId}
                onChange={(e) => {
                  const fid = e.target.value;
                  setToFloorId(fid);
                  const rms = rooms.filter((r) => r.floorId === fid);
                  setToRoomId(rms[0]?.id || '');
                  const av = beds.find((b) => b.roomId === rms[0]?.id && b.status === 'Available');
                  setToBedId(av?.id || '');
                }}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                {floors
                  .filter((f) => f.propertyId === toPropertyId)
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Destination Room</label>
              <select
                value={toRoomId}
                onChange={(e) => {
                  const rid = e.target.value;
                  setToRoomId(rid);
                  const rm = rooms.find((r) => r.id === rid);
                  const av = beds.find((b) => b.roomId === rid && b.status === 'Available');
                  setToBedId(av?.id || '');
                  if (rm) setTransferNewRent(String(rm.monthlyRent));
                }}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                {rooms
                  .filter((r) => r.floorId === toFloorId)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.roomNumber} · {r.sharing} ({formatINR(r.monthlyRent)})
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Destination Available Bed</label>
              <select
                value={toBedId}
                onChange={(e) => setToBedId(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                <option value="">Select available bed</option>
                {beds
                  .filter((b) => b.roomId === toRoomId && b.status === 'Available')
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bedCode} (Available)
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium mb-1">Transfer Date</label>
              <input
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Reason for Transfer</label>
              <select
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value as TenantTransferRecord['reason'])}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                {['Tenant Request', 'Room Upgrade', 'Room Downgrade', 'Maintenance', 'Sharing Change', 'Property Transfer', 'Other'].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">New Monthly Rent (₹)</label>
              <input
                type="number"
                value={transferNewRent}
                onChange={(e) => setTransferNewRent(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Notes</label>
            <input
              type="text"
              value={transferNotes}
              onChange={(e) => setTransferNotes(e.target.value)}
              placeholder="Optional note for tenant stay history"
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            />
          </div>

          <button
            type="submit"
            disabled={!toBedId}
            className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold disabled:opacity-40 inline-flex items-center justify-center gap-1.5"
          >
            <ArrowLeftRight className="w-4 h-4" /> Confirm Tenant Transfer
          </button>
        </form>
      </ModalSheet>
    </div>
  );
};
