import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, MapPin, ShieldAlert } from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import { AdminDataTable, TableColumn, TableFilterDef } from '../../components/ui/AdminDataTable';
import {
  ActionBtn,
  ConfirmDialog,
  KpiCard,
  ModalSheet,
  SafeImage,
  StatusText,
} from '../../components/ui/Primitives';
import { PGProperty } from '../../types/pgfinder';
import { formatINR } from '../../utils/formatters';

const SUSPENSION_CATEGORIES = [
  'Policy Violation',
  'Safety Hazard',
  'Document Discrepancy',
  'Location Mismatch',
  'Owner Request',
  'Repeated Complaints',
  'Fraud / Misleading Listing',
  'Other',
];

export const AdminPropertiesPage: React.FC = () => {
  const {
    properties,
    floors,
    rooms,
    beds,
    stays,
    propertyReviews,
    featuredCampaigns,
    adminSuspendProperty,
    adminRestoreProperty,
    archiveOrDeleteProperty,
  } = usePGFinder();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<Record<string, string>>({
    approval: 'ALL',
    location: 'ALL',
    listing: 'ALL',
    city: 'ALL',
    type: 'ALL',
  });

  const [selectedPropId, setSelectedPropId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<
    | 'overview'
    | 'inventory'
    | 'occupancy'
    | 'tenants'
    | 'reviews'
    | 'documents'
    | 'location'
    | 'listing'
    | 'history'
  >('overview');

  const [suspendProp, setSuspendProp] = useState<PGProperty | null>(null);
  const [suspCat, setSuspCat] = useState(SUSPENSION_CATEGORIES[0]);
  const [suspReason, setSuspReason] = useState('');
  const [suspEffective, setSuspEffective] = useState(new Date().toISOString().slice(0, 10));
  const [suspReview, setSuspReview] = useState('');
  const [suspNotify, setSuspNotify] = useState(true);
  const [suspErr, setSuspErr] = useState('');

  const [restoreProp, setRestoreProp] = useState<PGProperty | null>(null);
  const [archiveProp, setArchiveProp] = useState<PGProperty | null>(null);
  const [toast, setToast] = useState('');

  const selectedProp = useMemo(
    () => properties.find((p) => p.id === selectedPropId) || null,
    [properties, selectedPropId]
  );

  const summary = useMemo(() => {
    const occupied = beds.filter((b) => b.status === 'Occupied').length;
    return {
      total: properties.length,
      approved: properties.filter((p) => p.approvalStatus === 'APPROVED').length,
      pending: properties.filter(
        (p) =>
          p.approvalStatus === 'PENDING_APPROVAL' ||
          p.approvalStatus === 'UNDER_REVIEW' ||
          p.approvalStatus === 'CORRECTIONS_REQUIRED' ||
          p.approvalStatus === 'RESUBMITTED'
      ).length,
      published: properties.filter((p) => p.listingStatus === 'PUBLISHED').length,
      unpublished: properties.filter(
        (p) =>
          p.listingStatus === 'UNPUBLISHED' ||
          p.listingStatus === 'NOT_LISTED' ||
          p.listingStatus === 'ELIGIBLE_FOR_LISTING'
      ).length,
      suspended: properties.filter((p) => p.approvalStatus === 'SUSPENDED' || p.listingStatus === 'SUSPENDED').length,
      totalBeds: beds.length,
      occupiedBeds: occupied,
    };
  }, [properties, beds]);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (filters.approval !== 'ALL') {
        if (filters.approval === 'PENDING') {
          if (
            p.approvalStatus !== 'PENDING_APPROVAL' &&
            p.approvalStatus !== 'UNDER_REVIEW' &&
            p.approvalStatus !== 'CORRECTIONS_REQUIRED' &&
            p.approvalStatus !== 'RESUBMITTED'
          ) {
            return false;
          }
        } else if (p.approvalStatus !== filters.approval) {
          return false;
        }
      }
      if (filters.location !== 'ALL' && p.locationVerificationStatus !== filters.location) return false;
      if (filters.listing !== 'ALL') {
        if (filters.listing === 'UNPUBLISHED_GROUP') {
          if (
            p.listingStatus !== 'UNPUBLISHED' &&
            p.listingStatus !== 'NOT_LISTED' &&
            p.listingStatus !== 'ELIGIBLE_FOR_LISTING'
          ) {
            return false;
          }
        } else if (p.listingStatus !== filters.listing) {
          return false;
        }
      }
      if (filters.city !== 'ALL' && p.city !== filters.city) return false;
      if (filters.type !== 'ALL' && p.category !== filters.type) return false;
      return true;
    });
  }, [properties, filters]);

  const cities = useMemo(() => Array.from(new Set(properties.map((p) => p.city))), [properties]);

  const filterDefs: TableFilterDef[] = [
    {
      key: 'approval',
      label: 'Approval',
      options: [
        { label: 'Approved', value: 'APPROVED' },
        { label: 'Pending / Review', value: 'PENDING' },
        { label: 'Rejected', value: 'REJECTED' },
        { label: 'Suspended', value: 'SUSPENDED' },
      ],
    },
    {
      key: 'location',
      label: 'Location',
      options: [
        { label: 'Verified', value: 'VERIFIED' },
        { label: 'Pending', value: 'PENDING_VERIFICATION' },
        { label: 'Corrections Required', value: 'CORRECTIONS_REQUIRED' },
        { label: 'Rejected', value: 'REJECTED' },
      ],
    },
    {
      key: 'listing',
      label: 'Listing',
      options: [
        { label: 'Published', value: 'PUBLISHED' },
        { label: 'Eligible / Not Listed', value: 'UNPUBLISHED_GROUP' },
        { label: 'Suspended', value: 'SUSPENDED' },
      ],
    },
    {
      key: 'city',
      label: 'City',
      options: cities.map((c) => ({ label: c, value: c })),
    },
    {
      key: 'type',
      label: 'Category',
      options: [
        { label: "Men's PG", value: "Men's PG" },
        { label: "Women's PG", value: "Women's PG" },
        { label: 'Co-living PG', value: 'Co-living PG' },
      ],
    },
  ];

  const columns: TableColumn<PGProperty>[] = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      sortValue: (p) => p.id,
      render: (p) => <span className="font-mono-num text-[11px] text-[#64748B]">{p.id}</span>,
    },
    {
      key: 'cover',
      label: 'Cover',
      render: (p) => (
        <div className="w-10 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0">
          <SafeImage src={p.images[0]?.url} alt={p.name} className="w-full h-full object-cover" />
        </div>
      ),
    },
    {
      key: 'name',
      label: 'PG Name',
      sortable: true,
      sortValue: (p) => p.name,
      render: (p) => (
        <div className="min-w-[155px]">
          <div className="font-semibold">{p.name}</div>
          <div className="text-[11px] text-[#64748B]">
            {p.propertyType} · {p.category}
          </div>
        </div>
      ),
    },
    {
      key: 'owner',
      label: 'Owner & Mobile',
      sortable: true,
      sortValue: (p) => p.ownerName,
      render: (p) => (
        <div className="whitespace-nowrap">
          <div className="font-medium">{p.ownerName}</div>
          <div className="text-[11px] text-[#64748B] font-mono-num">{p.ownerMobile}</div>
        </div>
      ),
    },
    {
      key: 'locationLabel',
      label: 'City / Locality',
      sortable: true,
      sortValue: (p) => `${p.city} ${p.locality}`,
      render: (p) => (
        <div className="whitespace-nowrap">
          <div>{p.city}</div>
          <div className="text-[11px] text-[#64748B]">{p.locality}</div>
        </div>
      ),
    },
    {
      key: 'inventory',
      label: 'Flr / Rm / Bed',
      align: 'right',
      sortValue: (p) => beds.filter((b) => b.propertyId === p.id).length,
      render: (p) => {
        const fCount = floors.filter((f) => f.propertyId === p.id).length;
        const rCount = rooms.filter((r) => r.propertyId === p.id).length;
        const bCount = beds.filter((b) => b.propertyId === p.id).length;
        return (
          <span className="font-mono-num whitespace-nowrap">
            {fCount} / {rCount} / {bCount}
          </span>
        );
      },
    },
    {
      key: 'occupancy',
      label: 'Occ / Avail',
      align: 'right',
      sortValue: (p) => beds.filter((b) => b.propertyId === p.id && b.status === 'Occupied').length,
      render: (p) => {
        const pBeds = beds.filter((b) => b.propertyId === p.id);
        const occ = pBeds.filter((b) => b.status === 'Occupied').length;
        const avail = pBeds.filter((b) => b.status === 'Available').length;
        return (
          <span className="font-mono-num whitespace-nowrap">
            {occ} / {avail}
          </span>
        );
      },
    },
    {
      key: 'approval',
      label: 'Approval',
      sortable: true,
      sortValue: (p) => p.approvalStatus,
      render: (p) => <StatusText status={p.approvalStatus} />,
    },
    {
      key: 'locStatus',
      label: 'GPS Status',
      sortable: true,
      sortValue: (p) => p.locationVerificationStatus,
      render: (p) => <StatusText status={p.locationVerificationStatus} />,
    },
    {
      key: 'listing',
      label: 'Listing',
      sortable: true,
      sortValue: (p) => p.listingStatus,
      render: (p) => <StatusText status={p.listingStatus} />,
    },
    {
      key: 'rating',
      label: 'Rating',
      align: 'right',
      sortValue: (p) => p.rating ?? 0,
      render: (p) => (
        <span className="font-mono-num whitespace-nowrap">
          {p.rating ? `${p.rating} ★ (${p.reviewCount})` : '—'}
        </span>
      ),
    },
    {
      key: 'regDate',
      label: 'Reg Date',
      sortable: true,
      sortValue: (p) => p.submittedAt || '',
      render: (p) => (
        <span className="font-mono-num text-[11px] text-[#64748B] whitespace-nowrap">
          {p.submittedAt ? p.submittedAt.slice(0, 10) : 'Draft'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (p) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <ActionBtn
            kind="view"
            onClick={() => {
              setSelectedPropId(p.id);
              setDetailTab('overview');
            }}
          />
          {p.approvalStatus === 'SUSPENDED' ? (
            <ActionBtn kind="restore" compact onClick={() => setRestoreProp(p)} />
          ) : (
            <ActionBtn
              kind="suspend"
              compact
              onClick={() => {
                setSuspendProp(p);
                setSuspReason('');
                setSuspErr('');
              }}
            />
          )}
          <ActionBtn kind="delete" compact label="Archive" onClick={() => setArchiveProp(p)} />
        </div>
      ),
    },
  ];

  const propFloors = selectedProp ? floors.filter((f) => f.propertyId === selectedProp.id) : [];
  const propRooms = selectedProp ? rooms.filter((r) => r.propertyId === selectedProp.id) : [];
  const propBeds = selectedProp ? beds.filter((b) => b.propertyId === selectedProp.id) : [];
  const propStays = selectedProp ? stays.filter((s) => s.propertyId === selectedProp.id) : [];
  const propReviews = selectedProp ? propertyReviews.filter((r) => r.propertyId === selectedProp.id) : [];
  const propCampaigns = selectedProp ? featuredCampaigns.filter((c) => c.propertyId === selectedProp.id) : [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold font-display">All Properties &amp; Inventory Oversight</h1>
        <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
          Platform-wide inventory oversight, independent approval/GPS/listing statuses, and safe suspension controls (room/bed assignments stay owner-managed).
        </p>
      </div>

      {toast && (
        <div className="p-3 rounded-xl border border-[#059669]/30 bg-[#059669]/10 text-[#059669] dark:text-[#34D399] text-xs flex items-center justify-between">
          <span>{toast}</span>
          <button type="button" onClick={() => setToast('')} className="font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <KpiCard
          label="Total Properties"
          value={summary.total}
          onClick={() => setFilters((f) => ({ ...f, approval: 'ALL', listing: 'ALL' }))}
        />
        <KpiCard
          label="Approved"
          value={summary.approved}
          tone="success"
          onClick={() => setFilters((f) => ({ ...f, approval: 'APPROVED', listing: 'ALL' }))}
        />
        <KpiCard
          label="Pending"
          value={summary.pending}
          tone={summary.pending > 0 ? 'warning' : 'neutral'}
          onClick={() => setFilters((f) => ({ ...f, approval: 'PENDING', listing: 'ALL' }))}
        />
        <KpiCard
          label="Published"
          value={summary.published}
          tone="primary"
          onClick={() => setFilters((f) => ({ ...f, listing: 'PUBLISHED', approval: 'ALL' }))}
        />
        <KpiCard
          label="Unpublished"
          value={summary.unpublished}
          onClick={() => setFilters((f) => ({ ...f, listing: 'UNPUBLISHED_GROUP', approval: 'ALL' }))}
        />
        <KpiCard
          label="Suspended"
          value={summary.suspended}
          tone={summary.suspended > 0 ? 'error' : 'neutral'}
          onClick={() => setFilters((f) => ({ ...f, approval: 'SUSPENDED', listing: 'ALL' }))}
        />
        <KpiCard
          label="Beds (Occ / Total)"
          value={`${summary.occupiedBeds} / ${summary.totalBeds}`}
          subtext={`${summary.totalBeds - summary.occupiedBeds} vacant`}
        />
      </div>

      <AdminDataTable
        data={filtered}
        columns={columns}
        rowKey={(p) => p.id}
        searchPlaceholder="Search property ID, PG name, owner, mobile, city, locality..."
        searchExtractor={(p) =>
          `${p.id} ${p.name} ${p.ownerName} ${p.ownerMobile} ${p.city} ${p.locality} ${p.approvalStatus} ${p.listingStatus}`
        }
        filters={filterDefs}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((prev) => ({ ...prev, [k]: v }))}
        onClearFilters={() =>
          setFilters({ approval: 'ALL', location: 'ALL', listing: 'ALL', city: 'ALL', type: 'ALL' })
        }
        exportFilename="pgfinder-all-properties.csv"
        onRowClick={(p) => {
          setSelectedPropId(p.id);
          setDetailTab('overview');
        }}
      />

      {/* Detailed Property Admin View Modal */}
      <ModalSheet
        open={selectedProp !== null}
        onClose={() => setSelectedPropId(null)}
        title={selectedProp?.name || ''}
        subtitle={selectedProp ? `${selectedProp.id} · ${selectedProp.locality}, ${selectedProp.city}` : ''}
        maxWidth="max-w-4xl"
      >
        {selectedProp && (
          <div className="space-y-4 text-xs">
            {selectedProp.suspensionDetails && (
              <div className="p-3 rounded-xl border border-[#DC2626]/30 bg-red-50/60 dark:bg-red-950/30 text-[#DC2626] dark:text-[#F87171]">
                <div className="font-semibold">
                  Suspended: {selectedProp.suspensionDetails.category} (Effective{' '}
                  {selectedProp.suspensionDetails.effectiveDate})
                </div>
                <div className="mt-0.5">{selectedProp.suspensionDetails.reason}</div>
              </div>
            )}

            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'inventory', label: `Inventory (${propRooms.length})` },
                { id: 'occupancy', label: `Occupancy (${propBeds.length})` },
                { id: 'tenants', label: `Tenants (${propStays.length})` },
                { id: 'reviews', label: `Reviews (${propReviews.length})` },
                { id: 'documents', label: `Documents (${selectedProp.documents.length})` },
                { id: 'location', label: 'Location' },
                { id: 'listing', label: 'Listing / Promotion' },
                { id: 'history', label: 'Admin History' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDetailTab(t.id as typeof detailTab)}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap ${
                    detailTab === t.id
                      ? 'bg-[#047857] text-white dark:bg-[#34D399] dark:text-[#0B1220]'
                      : 'border border-[#E2E8F0] dark:border-[#374151] text-[#64748B]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {detailTab === 'overview' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151]">
                  <div>Approval: <StatusText status={selectedProp.approvalStatus} /></div>
                  <div>Location: <StatusText status={selectedProp.locationVerificationStatus} /></div>
                  <div>Listing: <StatusText status={selectedProp.listingStatus} /></div>
                  <div>Owner: <strong>{selectedProp.ownerName}</strong></div>
                  <div>Mobile: <span className="font-mono-num">{selectedProp.ownerMobile}</span></div>
                  <div>QR Onboarding: <strong>{selectedProp.qrEnabled ? selectedProp.qrToken : 'Disabled'}</strong></div>
                </div>
                <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-1">
                  <div className="font-semibold">Address &amp; Overview</div>
                  <p className="text-[#64748B]">
                    {selectedProp.address}, {selectedProp.locality}, {selectedProp.city} — {selectedProp.pinCode}
                  </p>
                  <p>{selectedProp.description}</p>
                </div>
              </div>
            )}

            {detailTab === 'inventory' && (
              <div className="space-y-2">
                <div className="text-[#64748B]">
                  {propFloors.length} floors · {propRooms.length} rooms · {propBeds.length} total beds (Owner-managed)
                </div>
                {propRooms.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-semibold">
                        Room {r.roomNumber} {r.roomName ? `— ${r.roomName}` : ''} ({r.sharing})
                      </div>
                      <div className="text-[#64748B]">
                        {r.bathroomType} Bathroom · {r.isAc ? 'AC' : 'Non-AC'} · Geyser:{' '}
                        {r.geyserAvailable ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div className="text-right font-mono-num">
                      <div>{formatINR(r.monthlyRent)}/mo</div>
                      <div className="text-[11px] text-[#64748B]">
                        Deposit {formatINR(r.securityDeposit)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {detailTab === 'occupancy' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {propBeds.map((b) => (
                  <div
                    key={b.id}
                    className="p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex items-center justify-between"
                  >
                    <span className="font-mono-num font-semibold">{b.bedCode}</span>
                    <StatusText status={b.status} />
                  </div>
                ))}
              </div>
            )}

            {detailTab === 'tenants' && (
              <div className="space-y-2">
                {propStays.length === 0 ? (
                  <div className="p-4 text-center text-[#64748B]">No stays recorded for this property yet.</div>
                ) : (
                  propStays.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-semibold">{s.tenantName}</div>
                        <div className="text-[#64748B] font-mono-num">
                          {s.tenantMobile} · Joined {s.joiningDate} · Rent {formatINR(s.monthlyRent)}
                        </div>
                      </div>
                      <StatusText status={s.status} />
                    </div>
                  ))
                )}
              </div>
            )}

            {detailTab === 'reviews' && (
              <div className="space-y-2">
                {propReviews.length === 0 ? (
                  <div className="p-4 text-center text-[#64748B]">No tenant reviews yet.</div>
                ) : (
                  propReviews.map((rv) => (
                    <div key={rv.id} className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>{rv.tenantDisplayName} · {rv.overallRating} ★</span>
                        <span className="text-[#64748B] font-mono-num">{rv.date}</span>
                      </div>
                      <p className="text-[#64748B]">{rv.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {detailTab === 'documents' && (
              <div className="space-y-2">
                {selectedProp.documents.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold">{d.name}</div>
                      <div className="text-[#64748B]">{d.type} · {d.uploadedAt}</div>
                    </div>
                    <StatusText status={d.status} />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => navigate('/admin/documents')}
                  className="text-[#047857] dark:text-[#34D399] font-semibold underline"
                >
                  Open in Unified Document Management
                </button>
              </div>
            )}

            {detailTab === 'location' && (
              <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-2">
                <div className="flex items-center gap-1.5 font-semibold">
                  <MapPin className="w-4 h-4 text-[#047857]" /> Registered Property Coordinates
                </div>
                {selectedProp.location ? (
                  <div className="font-mono-num">
                    {selectedProp.location.latitude}, {selectedProp.location.longitude} (±
                    {selectedProp.location.accuracy}m)
                  </div>
                ) : (
                  <div className="text-[#DC2626]">Not submitted</div>
                )}
                <div className="flex gap-2">
                  {selectedProp.location && (
                    <button
                      type="button"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${selectedProp.location!.latitude},${selectedProp.location!.longitude}`,
                          '_blank',
                          'noopener,noreferrer'
                        )
                      }
                      className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#374151] font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open Google Maps
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate('/admin/approvals?tab=location')}
                    className="h-8 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#374151] font-semibold"
                  >
                    Go to Location Verification
                  </button>
                </div>
              </div>
            )}

            {detailTab === 'listing' && (
              <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-2">
                <div>Listing Status: <StatusText status={selectedProp.listingStatus} /></div>
                <div>Entitlement: <strong>{selectedProp.listingEntitlementType || 'NONE'}</strong></div>
                <div>Featured Campaigns: {propCampaigns.length}</div>
                {propCampaigns.map((c) => (
                  <div key={c.id} className="p-2 rounded-lg bg-[#F8FAFC] dark:bg-[#1F2937]/60 flex justify-between">
                    <span>{c.packageName} · {c.placement}</span>
                    <StatusText status={c.status} />
                  </div>
                ))}
              </div>
            )}

            {detailTab === 'history' && (
              <div className="space-y-2">
                {(selectedProp.verificationHistory || []).length === 0 ? (
                  <div className="p-3 text-[#64748B]">No admin override history logged yet for this property.</div>
                ) : (
                  selectedProp.verificationHistory!.map((h) => (
                    <div key={h.id} className="p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex justify-between">
                      <div>
                        <StatusText status={h.status} />
                        <div className="text-[#64748B] mt-0.5">{h.actor} {h.comment ? `· ${h.comment}` : ''}</div>
                      </div>
                      <span className="font-mono-num text-[11px] text-[#64748B]">{h.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </ModalSheet>

      {/* Suspend Property Modal */}
      <ModalSheet
        open={suspendProp !== null}
        onClose={() => setSuspendProp(null)}
        title={`Suspend Property · ${suspendProp?.name || ''}`}
        subtitle="Hides public discovery listing & pauses featured campaigns while preserving active stays & ledgers."
        maxWidth="max-w-lg"
      >
        {suspendProp && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!suspReason.trim()) {
                setSuspErr('Suspension reason is required.');
                return;
              }
              adminSuspendProperty(suspendProp.id, {
                category: suspCat,
                reason: suspReason.trim(),
                effectiveDate: suspEffective,
                reviewDate: suspReview || undefined,
                notifyOwner: suspNotify,
              });
              setToast(`Suspended ${suspendProp.name}. Tenant records & payment history remain preserved.`);
              setSuspendProp(null);
            }}
            className="space-y-3 text-xs"
          >
            <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-[#D97706]/30 flex items-start gap-2 text-[#D97706]">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Existing active tenant stays, rent invoices, and deposit ledgers remain safely accessible and intact.
              </span>
            </div>

            <div>
              <label className="block font-medium mb-1">Suspension Category *</label>
              <select
                value={suspCat}
                onChange={(e) => setSuspCat(e.target.value)}
                className="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                {SUSPENSION_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-medium mb-1">Effective Date *</label>
                <input
                  type="date"
                  required
                  value={suspEffective}
                  onChange={(e) => setSuspEffective(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Expected Review Date</label>
                <input
                  type="date"
                  value={suspReview}
                  onChange={(e) => setSuspReview(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Reason for Suspension *</label>
              <textarea
                rows={3}
                value={suspReason}
                onChange={(e) => {
                  setSuspReason(e.target.value);
                  setSuspErr('');
                }}
                placeholder="Provide clear audit reason..."
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              />
              {suspErr && <div className="text-[#DC2626] mt-1 font-medium">{suspErr}</div>}
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={suspNotify}
                onChange={(e) => setSuspNotify(e.target.checked)}
                className="accent-[#047857]"
              />
              <span>Notify PG owner immediately in-app</span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSuspendProp(null)}
                className="h-9 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] font-medium"
              >
                Cancel
              </button>
              <button type="submit" className="h-9 px-4 rounded-xl bg-[#DC2626] text-white font-semibold">
                Confirm Suspension
              </button>
            </div>
          </form>
        )}
      </ModalSheet>

      {/* Restore Property Dialog */}
      <ConfirmDialog
        open={restoreProp !== null}
        onClose={() => setRestoreProp(null)}
        title={`Restore Property · ${restoreProp?.name || ''}`}
        description="Restoring returns approval status to Approved and restores listing eligibility (if GPS verified). Requires audit reason."
        confirmLabel="Restore Property"
        requireReason
        onConfirm={(reason) => {
          if (restoreProp) {
            adminRestoreProperty(restoreProp.id, reason);
            setToast(`Restored ${restoreProp.name}.`);
          }
          setRestoreProp(null);
        }}
      />

      {/* Archive / Delete Property Dialog */}
      <ConfirmDialog
        open={archiveProp !== null}
        onClose={() => setArchiveProp(null)}
        title={`Archive / Remove · ${archiveProp?.name || ''}`}
        description="Properties with active stays cannot be deleted or archived. Draft properties without history are deleted; others are archived."
        confirmLabel="Proceed"
        tone="danger"
        onConfirm={() => {
          if (archiveProp) {
            const res = archiveOrDeleteProperty(archiveProp.id);
            setToast(res.message);
          }
          setArchiveProp(null);
        }}
      />
    </div>
  );
};
