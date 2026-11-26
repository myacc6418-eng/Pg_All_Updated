import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  MapPin,
  RotateCcw,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
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

function buildGoogleMapsUrl(lat?: number, lng?: number): string | null {
  if (
    typeof lat !== 'number' ||
    typeof lng !== 'number' ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
}

export const AdminApprovalsPage: React.FC<{ forcedTab?: 'property' | 'location' }> = ({
  forcedTab,
}) => {
  const {
    properties,
    users,
    adminReviewProperty,
    adminVerifyLocation,
    adminVerifyDocument,
    archiveOrDeleteProperty,
  } = usePGFinder();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const [tab, setTab] = useState<'property' | 'location'>(
    forcedTab || (urlTab === 'location' ? 'location' : 'property')
  );

  useEffect(() => {
    if (forcedTab) {
      setTab(forcedTab);
    } else if (urlTab === 'location' || urlTab === 'property') {
      setTab(urlTab);
    } else if (urlTab === 'documents') {
      navigate('/admin/documents', { replace: true });
    }
  }, [forcedTab, urlTab, navigate]);

  const [propFilters, setPropFilters] = useState<Record<string, string>>({
    approval: 'ALL',
    city: 'ALL',
    type: 'ALL',
    location: 'ALL',
  });
  const [locFilters, setLocFilters] = useState<Record<string, string>>({
    locStatus: 'ALL',
    city: 'ALL',
    hasCoords: 'ALL',
  });

  const [reviewPropId, setReviewPropId] = useState<string | null>(null);
  const [reviewTab, setReviewTab] = useState<
    'overview' | 'owner' | 'location' | 'photos' | 'documents' | 'history'
  >('overview');
  const [reviewComment, setReviewComment] = useState('');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const [locPropId, setLocPropId] = useState<string | null>(null);
  const [locNotes, setLocNotes] = useState('');
  const [toast, setToast] = useState('');

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    mode:
      | 'approve_prop'
      | 'reject_prop'
      | 'correct_prop'
      | 'delete_prop'
      | 'verify_loc'
      | 'reject_loc'
      | 'reverify_loc';
    prop: PGProperty | null;
  }>({ open: false, mode: 'approve_prop', prop: null });

  const reviewProp = useMemo(
    () => properties.find((p) => p.id === reviewPropId) || null,
    [properties, reviewPropId]
  );
  const locProp = useMemo(
    () => properties.find((p) => p.id === locPropId) || null,
    [properties, locPropId]
  );

  const switchTab = (next: 'property' | 'location') => {
    setTab(next);
    setSearchParams({ tab: next });
  };

  // Property summary counts
  const propSummary = useMemo(
    () => ({
      total: properties.length,
      pending: properties.filter(
        (p) => p.approvalStatus === 'PENDING_APPROVAL' || p.approvalStatus === 'RESUBMITTED'
      ).length,
      underReview: properties.filter((p) => p.approvalStatus === 'UNDER_REVIEW').length,
      approved: properties.filter((p) => p.approvalStatus === 'APPROVED').length,
      rejected: properties.filter((p) => p.approvalStatus === 'REJECTED').length,
      corrections: properties.filter((p) => p.approvalStatus === 'CORRECTIONS_REQUIRED').length,
    }),
    [properties]
  );

  // Location summary counts
  const locSummary = useMemo(
    () => ({
      total: properties.length,
      pending: properties.filter(
        (p) =>
          p.locationVerificationStatus === 'PENDING_VERIFICATION' ||
          p.locationVerificationStatus === 'NOT_SUBMITTED'
      ).length,
      underReview: properties.filter((p) => p.locationVerificationStatus === 'UNDER_REVIEW').length,
      verified: properties.filter((p) => p.locationVerificationStatus === 'VERIFIED').length,
      rejected: properties.filter((p) => p.locationVerificationStatus === 'REJECTED').length,
      reverify: properties.filter(
        (p) =>
          p.locationVerificationStatus === 'REVERIFICATION_REQUIRED' ||
          p.locationVerificationStatus === 'CORRECTIONS_REQUIRED'
      ).length,
    }),
    [properties]
  );

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (propFilters.approval !== 'ALL') {
        if (propFilters.approval === 'PENDING') {
          if (p.approvalStatus !== 'PENDING_APPROVAL' && p.approvalStatus !== 'RESUBMITTED') {
            return false;
          }
        } else if (p.approvalStatus !== propFilters.approval) {
          return false;
        }
      }
      if (propFilters.city !== 'ALL' && p.city !== propFilters.city) return false;
      if (propFilters.type !== 'ALL' && p.category !== propFilters.type) return false;
      if (propFilters.location !== 'ALL' && p.locationVerificationStatus !== propFilters.location) {
        return false;
      }
      return true;
    });
  }, [properties, propFilters]);

  const filteredLocations = useMemo(() => {
    return properties.filter((p) => {
      if (locFilters.locStatus !== 'ALL') {
        if (locFilters.locStatus === 'REVERIFY') {
          if (
            p.locationVerificationStatus !== 'REVERIFICATION_REQUIRED' &&
            p.locationVerificationStatus !== 'CORRECTIONS_REQUIRED'
          ) {
            return false;
          }
        } else if (locFilters.locStatus === 'PENDING') {
          if (
            p.locationVerificationStatus !== 'PENDING_VERIFICATION' &&
            p.locationVerificationStatus !== 'NOT_SUBMITTED'
          ) {
            return false;
          }
        } else if (p.locationVerificationStatus !== locFilters.locStatus) {
          return false;
        }
      }
      if (locFilters.city !== 'ALL' && p.city !== locFilters.city) return false;
      if (locFilters.hasCoords === 'YES' && !p.location) return false;
      if (locFilters.hasCoords === 'NO' && p.location) return false;
      return true;
    });
  }, [properties, locFilters]);

  const cities = useMemo(() => Array.from(new Set(properties.map((p) => p.city))), [properties]);

  const propFilterDefs: TableFilterDef[] = [
    {
      key: 'approval',
      label: 'Approval',
      options: [
        { label: 'Pending / Resubmitted', value: 'PENDING' },
        { label: 'Under Review', value: 'UNDER_REVIEW' },
        { label: 'Approved', value: 'APPROVED' },
        { label: 'Corrections Required', value: 'CORRECTIONS_REQUIRED' },
        { label: 'Rejected', value: 'REJECTED' },
        { label: 'Suspended', value: 'SUSPENDED' },
        { label: 'Draft', value: 'DRAFT' },
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
    {
      key: 'location',
      label: 'Location',
      options: [
        { label: 'Verified', value: 'VERIFIED' },
        { label: 'Pending Verification', value: 'PENDING_VERIFICATION' },
        { label: 'Corrections Required', value: 'CORRECTIONS_REQUIRED' },
        { label: 'Rejected', value: 'REJECTED' },
      ],
    },
  ];

  const locFilterDefs: TableFilterDef[] = [
    {
      key: 'locStatus',
      label: 'Status',
      options: [
        { label: 'Pending', value: 'PENDING' },
        { label: 'Under Review', value: 'UNDER_REVIEW' },
        { label: 'Verified', value: 'VERIFIED' },
        { label: 'Reverification / Corrections', value: 'REVERIFY' },
        { label: 'Rejected', value: 'REJECTED' },
      ],
    },
    {
      key: 'city',
      label: 'City',
      options: cities.map((c) => ({ label: c, value: c })),
    },
    {
      key: 'hasCoords',
      label: 'Coordinates',
      options: [
        { label: 'Coordinates Submitted', value: 'YES' },
        { label: 'Missing Coordinates', value: 'NO' },
      ],
    },
  ];

  const propColumns: TableColumn<PGProperty>[] = [
    {
      key: 'id',
      label: 'Property ID',
      sortable: true,
      sortValue: (p) => p.id,
      render: (p) => <span className="font-mono-num text-[11px] text-[#64748B]">{p.id}</span>,
    },
    {
      key: 'name',
      label: 'PG Name',
      sortable: true,
      sortValue: (p) => p.name,
      render: (p) => (
        <div className="min-w-[160px]">
          <div className="font-semibold text-[#111827] dark:text-[#F9FAFB]">{p.name}</div>
          <div className="text-[11px] text-[#64748B]">
            {p.propertyType} · {p.category}
          </div>
        </div>
      ),
    },
    {
      key: 'owner',
      label: 'Owner',
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
      key: 'city',
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
      key: 'media',
      label: 'Photos / Docs',
      align: 'right',
      sortValue: (p) => p.images.length,
      render: (p) => (
        <span className="font-mono-num">
          {p.images.length} / {p.documents.length}
        </span>
      ),
    },
    {
      key: 'locStatus',
      label: 'Location',
      sortable: true,
      sortValue: (p) => p.locationVerificationStatus,
      render: (p) => <StatusText status={p.locationVerificationStatus} />,
    },
    {
      key: 'approvalStatus',
      label: 'Approval',
      sortable: true,
      sortValue: (p) => p.approvalStatus,
      render: (p) => <StatusText status={p.approvalStatus} />,
    },
    {
      key: 'submittedAt',
      label: 'Submitted',
      sortable: true,
      sortValue: (p) => p.submittedAt || '',
      render: (p) => (
        <span className="font-mono-num text-[11px] text-[#64748B] whitespace-nowrap">
          {p.submittedAt ? p.submittedAt.slice(0, 10) : 'Draft'}
        </span>
      ),
    },
    {
      key: 'reviewedBy',
      label: 'Reviewed By',
      sortValue: (p) => p.reviewedBy || '',
      render: (p) => (
        <span className="text-[11px] text-[#64748B] whitespace-nowrap">
          {p.reviewedBy || 'Pending'}
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
            label="Review"
            onClick={() => {
              setReviewPropId(p.id);
              setReviewTab('overview');
              setReviewComment(p.adminComment || '');
            }}
          />
          {p.approvalStatus !== 'APPROVED' && (
            <ActionBtn
              kind="approve"
              compact
              title="Approve Property"
              onClick={() => setConfirmState({ open: true, mode: 'approve_prop', prop: p })}
            />
          )}
          <ActionBtn
            kind="edit"
            compact
            label="Corrections"
            title="Request Corrections"
            onClick={() => setConfirmState({ open: true, mode: 'correct_prop', prop: p })}
          />
          {p.approvalStatus !== 'REJECTED' && (
            <ActionBtn
              kind="reject"
              compact
              title="Reject Property"
              onClick={() => setConfirmState({ open: true, mode: 'reject_prop', prop: p })}
            />
          )}
          {p.approvalStatus === 'DRAFT' && (
            <ActionBtn
              kind="delete"
              compact
              title="Delete Draft"
              onClick={() => setConfirmState({ open: true, mode: 'delete_prop', prop: p })}
            />
          )}
        </div>
      ),
    },
  ];

  const locColumns: TableColumn<PGProperty>[] = [
    {
      key: 'id',
      label: 'Property ID',
      sortable: true,
      sortValue: (p) => p.id,
      render: (p) => <span className="font-mono-num text-[11px] text-[#64748B]">{p.id}</span>,
    },
    {
      key: 'name',
      label: 'PG Name',
      sortable: true,
      sortValue: (p) => p.name,
      render: (p) => (
        <div className="min-w-[150px]">
          <div className="font-semibold">{p.name}</div>
          <div className="text-[11px] text-[#64748B]">{p.ownerName}</div>
        </div>
      ),
    },
    {
      key: 'address',
      label: 'Registered Address',
      sortValue: (p) => `${p.city} ${p.address}`,
      render: (p) => (
        <div className="max-w-[220px]">
          <div className="truncate">{p.address}</div>
          <div className="text-[11px] text-[#64748B]">
            {p.locality}, {p.city} — {p.pinCode}
          </div>
        </div>
      ),
    },
    {
      key: 'lat',
      label: 'Latitude',
      align: 'right',
      sortValue: (p) => p.location?.latitude ?? 0,
      render: (p) => (
        <span className="font-mono-num">
          {p.location ? p.location.latitude.toFixed(5) : '—'}
        </span>
      ),
    },
    {
      key: 'lng',
      label: 'Longitude',
      align: 'right',
      sortValue: (p) => p.location?.longitude ?? 0,
      render: (p) => (
        <span className="font-mono-num">
          {p.location ? p.location.longitude.toFixed(5) : '—'}
        </span>
      ),
    },
    {
      key: 'accuracy',
      label: 'Accuracy',
      align: 'right',
      sortValue: (p) => p.location?.accuracy ?? 999,
      render: (p) => (
        <span className="font-mono-num">
          {p.location ? `±${p.location.accuracy}m` : 'Not submitted'}
        </span>
      ),
    },
    {
      key: 'locStatus',
      label: 'Location Status',
      sortable: true,
      sortValue: (p) => p.locationVerificationStatus,
      render: (p) => <StatusText status={p.locationVerificationStatus} />,
    },
    {
      key: 'reviewedBy',
      label: 'Verified By / Date',
      sortValue: (p) => p.locationReviewedAt || '',
      render: (p) => (
        <div className="text-[11px] text-[#64748B] whitespace-nowrap">
          <div>{p.locationReviewedBy || 'Pending'}</div>
          {p.locationReviewedAt && <div className="font-mono-num">{p.locationReviewedAt.slice(0, 10)}</div>}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (p) => {
        const mapUrl = buildGoogleMapsUrl(p.location?.latitude, p.location?.longitude);
        return (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <ActionBtn
              kind="view"
              label="Inspect"
              onClick={() => {
                setLocPropId(p.id);
                setLocNotes(p.locationNotes || p.adminComment || '');
              }}
            />
            <button
              type="button"
              disabled={!mapUrl}
              title={mapUrl ? 'Open coordinates in Google Maps' : 'Property location has not been submitted'}
              onClick={() => {
                if (mapUrl) window.open(mapUrl, '_blank', 'noopener,noreferrer');
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] dark:border-[#374151] px-2.5 py-1.5 text-xs font-medium text-[#047857] dark:text-[#34D399] hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 disabled:opacity-40 whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Maps</span>
            </button>
            <ActionBtn
              kind="approve"
              compact
              title="Verify Location"
              onClick={() => setConfirmState({ open: true, mode: 'verify_loc', prop: p })}
            />
            <ActionBtn
              kind="reject"
              compact
              title="Reject Location"
              onClick={() => setConfirmState({ open: true, mode: 'reject_loc', prop: p })}
            />
          </div>
        );
      },
    },
  ];

  const reviewOwner = reviewProp
    ? users.find((u) => u.id === reviewProp.ownerId)
    : undefined;
  const reviewMapUrl = reviewProp
    ? buildGoogleMapsUrl(reviewProp.location?.latitude, reviewProp.location?.longitude)
    : null;
  const locMapUrl = locProp
    ? buildGoogleMapsUrl(locProp.location?.latitude, locProp.location?.longitude)
    : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold font-display">
            {tab === 'property' ? 'Property Verification & Approvals' : 'Location Verification'}
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
            Property approval, GPS verification, and public ₹299/subscription listing remain strictly independent workflows. Opening Google Maps does not auto-verify coordinates.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/documents')}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] text-xs font-semibold self-start"
        >
          <FileText className="w-3.5 h-3.5 text-[#047857] dark:text-[#34D399]" />
          <span>Unified Document Center</span>
        </button>
      </div>

      {toast && (
        <div className="p-3 rounded-xl border border-[#059669]/30 bg-[#059669]/10 text-[#059669] dark:text-[#34D399] text-xs flex items-center justify-between">
          <span>{toast}</span>
          <button type="button" onClick={() => setToast('')} className="font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Sub-view Switcher */}
      <div className="flex items-center gap-1 p-1 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] w-fit">
        {[
          { id: 'property', label: 'Property Verification' },
          { id: 'location', label: 'Location Verification' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => switchTab(t.id as 'property' | 'location')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              tab === t.id
                ? 'bg-[#047857] text-white dark:bg-[#34D399] dark:text-[#0B1220]'
                : 'text-[#64748B] dark:text-[#9CA3AF]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'property' ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard
              label="Total Submissions"
              value={propSummary.total}
              onClick={() => setPropFilters((f) => ({ ...f, approval: 'ALL' }))}
            />
            <KpiCard
              label="Pending"
              value={propSummary.pending}
              tone={propSummary.pending > 0 ? 'warning' : 'neutral'}
              onClick={() => setPropFilters((f) => ({ ...f, approval: 'PENDING' }))}
            />
            <KpiCard
              label="Under Review"
              value={propSummary.underReview}
              tone="info"
              onClick={() => setPropFilters((f) => ({ ...f, approval: 'UNDER_REVIEW' }))}
            />
            <KpiCard
              label="Approved"
              value={propSummary.approved}
              tone="success"
              onClick={() => setPropFilters((f) => ({ ...f, approval: 'APPROVED' }))}
            />
            <KpiCard
              label="Rejected"
              value={propSummary.rejected}
              tone={propSummary.rejected > 0 ? 'error' : 'neutral'}
              onClick={() => setPropFilters((f) => ({ ...f, approval: 'REJECTED' }))}
            />
            <KpiCard
              label="Corrections Req."
              value={propSummary.corrections}
              tone={propSummary.corrections > 0 ? 'warning' : 'neutral'}
              onClick={() => setPropFilters((f) => ({ ...f, approval: 'CORRECTIONS_REQUIRED' }))}
            />
          </div>

          <AdminDataTable
            data={filteredProperties}
            columns={propColumns}
            rowKey={(p) => p.id}
            searchPlaceholder="Search by Property ID, PG name, owner, mobile, city, or locality..."
            searchExtractor={(p) =>
              `${p.id} ${p.name} ${p.ownerName} ${p.ownerMobile} ${p.city} ${p.locality} ${p.approvalStatus}`
            }
            filters={propFilterDefs}
            filterValues={propFilters}
            onFilterChange={(k, v) => setPropFilters((prev) => ({ ...prev, [k]: v }))}
            onClearFilters={() =>
              setPropFilters({ approval: 'ALL', city: 'ALL', type: 'ALL', location: 'ALL' })
            }
            exportFilename="pgfinder-property-approvals.csv"
            onRowClick={(p) => {
              setReviewPropId(p.id);
              setReviewTab('overview');
              setReviewComment(p.adminComment || '');
            }}
          />
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard
              label="Total Properties"
              value={locSummary.total}
              onClick={() => setLocFilters((f) => ({ ...f, locStatus: 'ALL' }))}
            />
            <KpiCard
              label="Pending GPS"
              value={locSummary.pending}
              tone={locSummary.pending > 0 ? 'warning' : 'neutral'}
              onClick={() => setLocFilters((f) => ({ ...f, locStatus: 'PENDING' }))}
            />
            <KpiCard
              label="Under Review"
              value={locSummary.underReview}
              tone="info"
              onClick={() => setLocFilters((f) => ({ ...f, locStatus: 'UNDER_REVIEW' }))}
            />
            <KpiCard
              label="Verified"
              value={locSummary.verified}
              tone="success"
              onClick={() => setLocFilters((f) => ({ ...f, locStatus: 'VERIFIED' }))}
            />
            <KpiCard
              label="Rejected"
              value={locSummary.rejected}
              tone={locSummary.rejected > 0 ? 'error' : 'neutral'}
              onClick={() => setLocFilters((f) => ({ ...f, locStatus: 'REJECTED' }))}
            />
            <KpiCard
              label="Reverification Req."
              value={locSummary.reverify}
              tone={locSummary.reverify > 0 ? 'warning' : 'neutral'}
              onClick={() => setLocFilters((f) => ({ ...f, locStatus: 'REVERIFY' }))}
            />
          </div>

          <AdminDataTable
            data={filteredLocations}
            columns={locColumns}
            rowKey={(p) => p.id}
            searchPlaceholder="Search property name, address, city, pin code, or coordinates..."
            searchExtractor={(p) =>
              `${p.id} ${p.name} ${p.ownerName} ${p.address} ${p.locality} ${p.city} ${p.pinCode} ${p.location?.latitude || ''} ${p.location?.longitude || ''}`
            }
            filters={locFilterDefs}
            filterValues={locFilters}
            onFilterChange={(k, v) => setLocFilters((prev) => ({ ...prev, [k]: v }))}
            onClearFilters={() =>
              setLocFilters({ locStatus: 'ALL', city: 'ALL', hasCoords: 'ALL' })
            }
            exportFilename="pgfinder-location-verification.csv"
            onRowClick={(p) => {
              setLocPropId(p.id);
              setLocNotes(p.locationNotes || p.adminComment || '');
            }}
          />
        </>
      )}

      {/* Tabbed Property Review Modal */}
      <ModalSheet
        open={reviewProp !== null}
        onClose={() => setReviewPropId(null)}
        title={reviewProp?.name || ''}
        subtitle={
          reviewProp
            ? `${reviewProp.id} · ${reviewProp.ownerName} · ${reviewProp.locality}, ${reviewProp.city}`
            : ''
        }
        maxWidth="max-w-3xl"
      >
        {reviewProp && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E2E8F0] dark:border-[#374151]">
              <div className="flex flex-wrap items-center gap-3">
                <StatusText status={reviewProp.approvalStatus} />
                <StatusText status={reviewProp.locationVerificationStatus} />
                <StatusText status={reviewProp.listingStatus} />
              </div>
              <span className="text-[11px] text-[#64748B]">
                Listing Entitlement: {reviewProp.listingEntitlementType || 'NONE'}
              </span>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'owner', label: 'Owner Details' },
                { id: 'location', label: 'Address & Location' },
                { id: 'photos', label: `Photographs (${reviewProp.images.length})` },
                { id: 'documents', label: `Documents (${reviewProp.documents.length})` },
                { id: 'history', label: 'Verification History' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setReviewTab(t.id as typeof reviewTab)}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap ${
                    reviewTab === t.id
                      ? 'bg-[#047857] text-white dark:bg-[#34D399] dark:text-[#0B1220]'
                      : 'border border-[#E2E8F0] dark:border-[#374151] text-[#64748B]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {reviewTab === 'overview' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-[#64748B]">Property Type:</span>{' '}
                    <span className="font-semibold">{reviewProp.propertyType}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Accommodation Category:</span>{' '}
                    <span className="font-semibold">{reviewProp.category}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Food Available:</span>{' '}
                    <span className="font-semibold">{reviewProp.foodAvailable ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Established Year:</span>{' '}
                    <span className="font-mono-num font-semibold">{reviewProp.establishedYear}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Default Monthly Rent:</span>{' '}
                    <span className="font-mono-num font-semibold">{formatINR(reviewProp.defaultRent)}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Default Deposit:</span>{' '}
                    <span className="font-mono-num font-semibold">{formatINR(reviewProp.defaultDeposit)}</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-1.5">
                  <div className="font-semibold">Description</div>
                  <p className="text-[#64748B] dark:text-[#9CA3AF]">{reviewProp.description}</p>
                  <div className="pt-1">
                    <strong>Amenities:</strong> {reviewProp.amenities.join(' · ')}
                  </div>
                  <div>
                    <strong>House Rules:</strong> {reviewProp.houseRules.join(' · ')}
                  </div>
                </div>
              </div>
            )}

            {reviewTab === 'owner' && (
              <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-2">
                <div className="font-semibold text-sm">{reviewProp.ownerName}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#64748B] dark:text-[#9CA3AF]">
                  <div>Owner ID: <span className="font-mono-num text-[#111827] dark:text-[#F9FAFB]">{reviewProp.ownerId}</span></div>
                  <div>Mobile: <span className="font-mono-num text-[#111827] dark:text-[#F9FAFB]">{reviewProp.ownerMobile}</span></div>
                  <div>Email: <span className="text-[#111827] dark:text-[#F9FAFB]">{reviewProp.ownerEmail}</span></div>
                  <div>Subscription Plan: <span className="font-semibold text-[#111827] dark:text-[#F9FAFB]">{reviewOwner?.subscriptionPlan || 'Basic'}</span></div>
                  <div>Business: <span className="text-[#111827] dark:text-[#F9FAFB]">{reviewOwner?.businessName || 'Independent'}</span></div>
                  <div>Account Status: <StatusText status={reviewOwner?.status || 'Active'} /></div>
                </div>
              </div>
            )}

            {reviewTab === 'location' && (
              <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-3">
                <div>
                  <div className="font-semibold">Registered Address</div>
                  <p className="text-[#64748B] mt-0.5">
                    {reviewProp.address}, {reviewProp.locality}, {reviewProp.city}, {reviewProp.district},{' '}
                    {reviewProp.state} — {reviewProp.pinCode}
                  </p>
                  <p className="text-[#64748B]">Landmark: {reviewProp.landmark}</p>
                </div>

                {reviewProp.location ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1F2937]/60 font-mono-num">
                    <div>Lat: {reviewProp.location.latitude}</div>
                    <div>Lng: {reviewProp.location.longitude}</div>
                    <div>Accuracy: ±{reviewProp.location.accuracy}m</div>
                    <div>Confirmed: {reviewProp.location.ownerConfirmed ? 'Yes' : 'No'}</div>
                  </div>
                ) : (
                  <div className="text-[#DC2626] font-medium">
                    Property location has not been submitted.
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={!reviewMapUrl}
                    onClick={() => reviewMapUrl && window.open(reviewMapUrl, '_blank', 'noopener,noreferrer')}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] font-semibold text-[#047857] dark:text-[#34D399] disabled:opacity-40"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open in Google Maps
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewPropId(null);
                      switchTab('location');
                      setLocPropId(reviewProp.id);
                      setLocNotes(reviewProp.locationNotes || '');
                    }}
                    className="h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] font-semibold"
                  >
                    Open Dedicated GPS Review
                  </button>
                </div>
              </div>
            )}

            {reviewTab === 'photos' && (
              <div className="space-y-2">
                {reviewProp.images.length < 4 && (
                  <div className="p-2.5 rounded-xl border border-[#D97706]/40 bg-[#D97706]/10 text-[#D97706]">
                    Minimum 4 property photos required ({reviewProp.images.length} uploaded).
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {reviewProp.images.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setLightboxUrl(img.url)}
                      className="text-left rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-[#374151] group"
                    >
                      <div className="aspect-4/3 bg-slate-100 overflow-hidden">
                        <SafeImage
                          src={img.url}
                          alt={img.category}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-2 text-[11px] font-medium truncate">
                        {img.category} {img.isCover ? '· Cover' : ''}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {reviewTab === 'documents' && (
              <div className="space-y-2">
                {reviewProp.documents.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-semibold">{d.name}</div>
                      <div className="text-[#64748B]">
                        {d.type} · Uploaded {d.uploadedAt}
                      </div>
                      {d.reviewNote && (
                        <div className="text-[#D97706] mt-0.5">Note: {d.reviewNote}</div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusText status={d.status} />
                      <ActionBtn
                        kind="approve"
                        compact
                        label="Verify"
                        onClick={() => adminVerifyDocument(reviewProp.id, d.id, 'Verified')}
                      />
                      <ActionBtn
                        kind="edit"
                        compact
                        label="Replace"
                        onClick={() =>
                          adminVerifyDocument(
                            reviewProp.id,
                            d.id,
                            'Replacement Required',
                            'Upload clearer signed scan.'
                          )
                        }
                      />
                      <ActionBtn
                        kind="reject"
                        compact
                        onClick={() =>
                          adminVerifyDocument(reviewProp.id, d.id, 'Rejected', 'Invalid or expired document.')
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {reviewTab === 'history' && (
              <div className="space-y-2">
                {(reviewProp.verificationHistory || []).length === 0 ? (
                  <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
                    Submitted on {reviewProp.submittedAt?.slice(0, 10) || 'Draft'}. Current status:{' '}
                    {reviewProp.approvalStatus}.
                  </div>
                ) : (
                  reviewProp.verificationHistory!.map((h) => (
                    <div
                      key={h.id}
                      className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex items-start justify-between gap-2"
                    >
                      <div>
                        <StatusText status={h.status} />
                        <div className="text-[#64748B] mt-1">
                          By {h.actor} {h.comment ? `· ${h.comment}` : ''}
                        </div>
                      </div>
                      <span className="font-mono-num text-[11px] text-[#64748B]">{h.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Decision Controls */}
            <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#374151] space-y-2.5">
              <label className="block font-medium">
                Verification Remarks (Shown to PG Owner on Corrections / Rejection)
              </label>
              <textarea
                rows={2}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Enter verification notes or required corrections..."
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    adminReviewProperty(reviewProp.id, 'UNDER_REVIEW', reviewComment.trim() || undefined);
                    setToast(`${reviewProp.name} moved to Under Review.`);
                  }}
                  className="h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] font-semibold"
                >
                  Mark Under Review
                </button>
                <button
                  type="button"
                  onClick={() => {
                    adminReviewProperty(
                      reviewProp.id,
                      'APPROVED',
                      reviewComment.trim() || 'Property details and photos verified.'
                    );
                    setToast(`Approved ${reviewProp.name}. Listing remains gated on GPS verification & listing entitlement.`);
                    setReviewPropId(null);
                  }}
                  className="h-9 px-4 rounded-xl bg-[#059669] text-white font-semibold"
                >
                  Approve Property
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!reviewComment.trim()) {
                      setConfirmState({ open: true, mode: 'correct_prop', prop: reviewProp });
                      return;
                    }
                    adminReviewProperty(reviewProp.id, 'CORRECTIONS_REQUIRED', reviewComment.trim());
                    setToast(`Requested corrections for ${reviewProp.name}.`);
                    setReviewPropId(null);
                  }}
                  className="h-9 px-3 rounded-xl bg-[#D97706] text-white font-semibold"
                >
                  Request Corrections
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!reviewComment.trim()) {
                      setConfirmState({ open: true, mode: 'reject_prop', prop: reviewProp });
                      return;
                    }
                    adminReviewProperty(reviewProp.id, 'REJECTED', reviewComment.trim());
                    setToast(`Rejected ${reviewProp.name}.`);
                    setReviewPropId(null);
                  }}
                  className="h-9 px-3 rounded-xl bg-[#DC2626] text-white font-semibold"
                >
                  Reject Property
                </button>
              </div>
            </div>
          </div>
        )}
      </ModalSheet>

      {/* Dedicated Location Verification Modal */}
      <ModalSheet
        open={locProp !== null}
        onClose={() => setLocPropId(null)}
        title={locProp ? `Location Verification · ${locProp.name}` : ''}
        subtitle={locProp ? `${locProp.locality}, ${locProp.city} — ${locProp.pinCode}` : ''}
        maxWidth="max-w-2xl"
      >
        {locProp && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <StatusText status={locProp.locationVerificationStatus} />
              <span className="font-mono-num text-[11px] text-[#64748B]">Property ID: {locProp.id}</span>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-2">
              <div className="font-semibold flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#047857]" /> Submitted Address &amp; Coordinates
              </div>
              <p className="text-[#64748B] dark:text-[#9CA3AF]">
                {locProp.address}, {locProp.locality}, {locProp.city} — {locProp.pinCode} (Landmark:{' '}
                {locProp.landmark})
              </p>

              {locProp.location ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1F2937]/60 font-mono-num">
                  <div>Lat: {locProp.location.latitude}</div>
                  <div>Lng: {locProp.location.longitude}</div>
                  <div>Accuracy: ±{locProp.location.accuracy}m</div>
                  <div>Confirmed: {locProp.location.ownerConfirmed ? 'Yes' : 'No'}</div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-red-50/70 dark:bg-red-950/30 text-[#DC2626]">
                  Property location has not been submitted.
                </div>
              )}

              <div className="pt-1 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!locMapUrl}
                  onClick={() => locMapUrl && window.open(locMapUrl, '_blank', 'noopener,noreferrer')}
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-[#047857] text-[#047857] dark:text-[#34D399] font-semibold disabled:opacity-40"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open in Google Maps
                </button>
                <span className="text-[11px] text-[#64748B]">
                  Opening Google Maps opens coordinates externally and never auto-verifies.
                </span>
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">
                Location Verification Notes (Required for Reject or Reverification)
              </label>
              <textarea
                rows={2}
                value={locNotes}
                onChange={(e) => setLocNotes(e.target.value)}
                placeholder="Compare submitted pin against building entrance & landmark..."
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              />
            </div>

            {(locProp.locationHistory || []).length > 0 && (
              <div className="space-y-1.5">
                <div className="font-semibold">Location Verification History</div>
                {locProp.locationHistory!.map((lh) => (
                  <div
                    key={lh.id}
                    className="p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex items-center justify-between gap-2"
                  >
                    <div>
                      <StatusText status={lh.status} />
                      <div className="text-[#64748B] mt-0.5">
                        {lh.actor} {lh.comment ? `· ${lh.comment}` : ''}
                      </div>
                    </div>
                    <span className="font-mono-num text-[11px] text-[#64748B]">{lh.timestamp}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#374151]">
              <button
                type="button"
                onClick={() => {
                  adminVerifyLocation(locProp.id, 'UNDER_REVIEW', locNotes.trim() || undefined);
                  setToast(`Started location review for ${locProp.name}.`);
                }}
                className="h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] font-semibold"
              >
                Start Review
              </button>
              <button
                type="button"
                disabled={!locProp.location}
                onClick={() => {
                  adminVerifyLocation(
                    locProp.id,
                    'VERIFIED',
                    locNotes.trim() || 'Coordinates confirmed against registered PG address.'
                  );
                  setToast(`Location verified for ${locProp.name}.`);
                  setLocPropId(null);
                }}
                className="inline-flex items-center gap-1 h-9 px-3.5 rounded-xl bg-[#059669] text-white font-semibold disabled:opacity-40"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Verify Location
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!locNotes.trim()) {
                    setConfirmState({ open: true, mode: 'reverify_loc', prop: locProp });
                    return;
                  }
                  adminVerifyLocation(locProp.id, 'REVERIFICATION_REQUIRED', locNotes.trim());
                  setToast(`Reverification requested for ${locProp.name}.`);
                  setLocPropId(null);
                }}
                className="inline-flex items-center gap-1 h-9 px-3 rounded-xl bg-[#D97706] text-white font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Request Reverification
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!locNotes.trim()) {
                    setConfirmState({ open: true, mode: 'reject_loc', prop: locProp });
                    return;
                  }
                  adminVerifyLocation(locProp.id, 'REJECTED', locNotes.trim());
                  setToast(`Location rejected for ${locProp.name}.`);
                  setLocPropId(null);
                }}
                className="inline-flex items-center gap-1 h-9 px-3 rounded-xl bg-[#DC2626] text-white font-semibold"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject Location
              </button>
            </div>
          </div>
        )}
      </ModalSheet>

      {/* Fullscreen Photo Preview */}
      <ModalSheet
        open={lightboxUrl !== null}
        onClose={() => setLightboxUrl(null)}
        title="Property Photograph Preview"
        maxWidth="max-w-3xl"
      >
        {lightboxUrl && (
          <div className="rounded-xl overflow-hidden bg-slate-900">
            <SafeImage src={lightboxUrl} alt="Property photo" className="w-full max-h-[70vh] object-contain" />
          </div>
        )}
      </ModalSheet>

      {/* Reusable Confirm / Reason Dialog */}
      <ConfirmDialog
        open={confirmState.open}
        onClose={() => setConfirmState((s) => ({ ...s, open: false }))}
        title={
          confirmState.mode === 'approve_prop'
            ? `Approve ${confirmState.prop?.name}?`
            : confirmState.mode === 'reject_prop'
            ? `Reject ${confirmState.prop?.name}?`
            : confirmState.mode === 'correct_prop'
            ? `Request Corrections for ${confirmState.prop?.name}`
            : confirmState.mode === 'delete_prop'
            ? `Delete Draft ${confirmState.prop?.name}?`
            : confirmState.mode === 'verify_loc'
            ? `Verify Location for ${confirmState.prop?.name}?`
            : confirmState.mode === 'reject_loc'
            ? `Reject Location for ${confirmState.prop?.name}?`
            : `Request Reverification for ${confirmState.prop?.name}`
        }
        description={
          confirmState.mode === 'approve_prop'
            ? 'Approving verifies property details and photos. Public listing remains gated until GPS verification and listing entitlement (₹299/subscription) are satisfied.'
            : confirmState.mode === 'verify_loc'
            ? 'Confirm that coordinates were visually checked and match the registered PG address.'
            : 'Please enter a clear reason or correction instruction for the PG owner and audit log.'
        }
        confirmLabel={
          confirmState.mode.startsWith('approve') || confirmState.mode === 'verify_loc'
            ? 'Confirm Approval'
            : confirmState.mode === 'delete_prop'
            ? 'Delete Draft'
            : 'Submit Decision'
        }
        tone={
          confirmState.mode.includes('reject') || confirmState.mode === 'delete_prop'
            ? 'danger'
            : confirmState.mode.includes('correct') || confirmState.mode === 'reverify_loc'
            ? 'warning'
            : 'primary'
        }
        requireReason={
          confirmState.mode !== 'approve_prop' &&
          confirmState.mode !== 'verify_loc' &&
          confirmState.mode !== 'delete_prop'
        }
        onConfirm={(reason) => {
          const p = confirmState.prop;
          if (!p) return;
          if (confirmState.mode === 'approve_prop') {
            adminReviewProperty(p.id, 'APPROVED', 'Property submission approved by Super Admin.');
            setToast(`Approved ${p.name}.`);
          } else if (confirmState.mode === 'reject_prop') {
            adminReviewProperty(p.id, 'REJECTED', reason);
            setToast(`Rejected ${p.name}.`);
            setReviewPropId(null);
          } else if (confirmState.mode === 'correct_prop') {
            adminReviewProperty(p.id, 'CORRECTIONS_REQUIRED', reason);
            setToast(`Requested corrections for ${p.name}.`);
            setReviewPropId(null);
          } else if (confirmState.mode === 'delete_prop') {
            const res = archiveOrDeleteProperty(p.id);
            setToast(res.message);
          } else if (confirmState.mode === 'verify_loc') {
            adminVerifyLocation(p.id, 'VERIFIED', 'Coordinates confirmed via Google Maps.');
            setToast(`Location verified for ${p.name}.`);
          } else if (confirmState.mode === 'reject_loc') {
            adminVerifyLocation(p.id, 'REJECTED', reason);
            setToast(`Location rejected for ${p.name}.`);
            setLocPropId(null);
          } else if (confirmState.mode === 'reverify_loc') {
            adminVerifyLocation(p.id, 'REVERIFICATION_REQUIRED', reason);
            setToast(`Requested GPS reverification for ${p.name}.`);
            setLocPropId(null);
          }
          setConfirmState((s) => ({ ...s, open: false }));
        }}
      />
    </div>
  );
};
