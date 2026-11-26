import React, { useMemo, useState } from 'react';
import { FileCheck2, ShieldAlert } from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import {
  ActionBtn,
  ConfirmDialog,
  KpiCard,
  ModalSheet,
  StatusText,
} from '../../components/ui/Primitives';
import { AdminDataTable, TableColumn } from '../../components/ui/AdminDataTable';
import { UnifiedDocumentRecord } from '../../types/pgfinder';

type DocTab =
  | 'all'
  | 'Owner'
  | 'Property'
  | 'Tenant'
  | 'pending'
  | 'verified'
  | 'rejected';

export const AdminDocumentsPage: React.FC = () => {
  const {
    unifiedDocuments,
    logDocumentAccess,
    adminReviewUnifiedDocument,
    archiveOrDeleteUnifiedDocument,
  } = usePGFinder();

  const [tab, setTab] = useState<DocTab>('all');
  const [filters, setFilters] = useState<Record<string, string>>({
    category: 'ALL',
    status: 'ALL',
  });
  const [previewDoc, setPreviewDoc] = useState<UnifiedDocumentRecord | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [actionConfirm, setActionConfirm] = useState<{
    doc: UnifiedDocumentRecord;
    nextStatus: UnifiedDocumentRecord['verificationStatus'];
  } | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<UnifiedDocumentRecord | null>(null);
  const [banner, setBanner] = useState('');

  const activeDocs = useMemo(
    () => unifiedDocuments.filter((d) => !d.archived),
    [unifiedDocuments]
  );

  const counts = useMemo(() => {
    return {
      total: activeDocs.length,
      pending: activeDocs.filter((d) => d.verificationStatus === 'Pending').length,
      underReview: activeDocs.filter((d) => d.verificationStatus === 'Under Review').length,
      verified: activeDocs.filter((d) => d.verificationStatus === 'Verified').length,
      rejected: activeDocs.filter((d) => d.verificationStatus === 'Rejected').length,
      replacement: activeDocs.filter((d) => d.verificationStatus === 'Replacement Required').length,
    };
  }, [activeDocs]);

  const tabFiltered = useMemo(() => {
    return activeDocs.filter((d) => {
      if (tab === 'Owner' || tab === 'Property' || tab === 'Tenant') {
        if (d.category !== tab) return false;
      } else if (tab === 'pending') {
        if (d.verificationStatus !== 'Pending' && d.verificationStatus !== 'Under Review') return false;
      } else if (tab === 'verified') {
        if (d.verificationStatus !== 'Verified') return false;
      } else if (tab === 'rejected') {
        if (d.verificationStatus !== 'Rejected' && d.verificationStatus !== 'Replacement Required') return false;
      }
      if (filters.category !== 'ALL' && d.category !== filters.category) return false;
      if (filters.status !== 'ALL' && d.verificationStatus !== filters.status) return false;
      return true;
    });
  }, [activeDocs, tab, filters]);

  const openPreview = (doc: UnifiedDocumentRecord) => {
    logDocumentAccess(doc.id);
    setReviewRemarks(doc.rejectionOrReplacementNote || '');
    setPreviewDoc(doc);
  };

  const columns: TableColumn<UnifiedDocumentRecord>[] = [
    {
      key: 'id',
      label: 'Doc ID',
      sortable: true,
      sortValue: (d) => d.id,
      csvValue: (d) => d.id,
      render: (d) => <span className="font-mono-num text-[11px] text-[#64748B]">{d.id}</span>,
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      sortValue: (d) => d.category,
      csvValue: (d) => d.category,
      render: (d) => <span className="font-medium">{d.category}</span>,
    },
    {
      key: 'ownerOrTenantName',
      label: 'Submitted By / Property',
      sortable: true,
      sortValue: (d) => d.ownerOrTenantName,
      csvValue: (d) => `${d.ownerOrTenantName}${d.propertyName ? ` (${d.propertyName})` : ''}`,
      render: (d) => (
        <div>
          <div className="font-semibold text-[#111827] dark:text-[#F9FAFB]">{d.ownerOrTenantName}</div>
          {d.propertyName && <div className="text-[11px] text-[#64748B]">{d.propertyName}</div>}
        </div>
      ),
    },
    {
      key: 'documentType',
      label: 'Document Type & File',
      sortable: true,
      sortValue: (d) => d.documentType,
      csvValue: (d) => `${d.documentType} (${d.fileName})`,
      render: (d) => (
        <div>
          <div className="font-medium">{d.documentType}</div>
          <div className="text-[11px] text-[#64748B] font-mono-num">{d.fileName}</div>
        </div>
      ),
    },
    {
      key: 'uploadedAt',
      label: 'Uploaded Date',
      sortable: true,
      sortValue: (d) => d.uploadedAt,
      csvValue: (d) => d.uploadedAt,
      render: (d) => <span className="font-mono-num text-[#64748B]">{d.uploadedAt}</span>,
    },
    {
      key: 'verificationStatus',
      label: 'Status',
      sortable: true,
      sortValue: (d) => d.verificationStatus,
      csvValue: (d) => d.verificationStatus,
      render: (d) => <StatusText status={d.verificationStatus} />,
    },
    {
      key: 'verifiedBy',
      label: 'Reviewed By',
      sortable: true,
      sortValue: (d) => d.verifiedBy || '—',
      csvValue: (d) => d.verifiedBy || '—',
      render: (d) => (
        <div className="text-[11px] text-[#64748B]">
          <div>{d.verifiedBy || 'Unreviewed'}</div>
          {d.verifiedAt && <div className="font-mono-num">{d.verifiedAt}</div>}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (d) => (
        <div className="flex items-center justify-end gap-1">
          <ActionBtn kind="view" compact title="Inspect Document (Logs Audit Access)" onClick={() => openPreview(d)} />
          {d.verificationStatus !== 'Verified' && (
            <ActionBtn
              kind="approve"
              compact
              title="Verify Document"
              onClick={() => setActionConfirm({ doc: d, nextStatus: 'Verified' })}
            />
          )}
          {d.verificationStatus !== 'Rejected' && (
            <ActionBtn
              kind="reject"
              compact
              title="Reject / Request Replacement"
              onClick={() => setActionConfirm({ doc: d, nextStatus: 'Replacement Required' })}
            />
          )}
          <ActionBtn kind="delete" compact title="Archive Document" onClick={() => setArchiveTarget(d)} />
        </div>
      ),
    },
  ];

  const activePreview = previewDoc
    ? unifiedDocuments.find((d) => d.id === previewDoc.id) || previewDoc
    : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold font-display">Unified Verification Document Center</h1>
          <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
            Verify owner KYC, property authorizations, and tenant ID proofs. Every inspection creates an immutable Document Access audit entry.
          </p>
        </div>
      </div>

      <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] flex items-center gap-2 text-xs text-[#64748B] dark:text-[#9CA3AF]">
        <ShieldAlert className="w-4 h-4 text-[#047857] dark:text-[#34D399] shrink-0" />
        <span>
          Private document handling: Raw Aadhaar/PAN strings are redacted; documents are retained in private object storage buckets and linked property records remain non-deletable once verified.
        </span>
      </div>

      {banner && (
        <div className="p-3 rounded-xl border border-[#059669]/30 bg-[#059669]/10 text-[#059669] dark:text-[#34D399] text-xs flex items-center justify-between gap-2">
          <span>{banner}</span>
          <button type="button" onClick={() => setBanner('')} className="font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Total Documents" value={counts.total} onClick={() => setTab('all')} />
        <KpiCard label="Pending" value={counts.pending} tone="warning" onClick={() => setTab('pending')} />
        <KpiCard label="Under Review" value={counts.underReview} tone="info" onClick={() => setTab('pending')} />
        <KpiCard label="Verified" value={counts.verified} tone="success" onClick={() => setTab('verified')} />
        <KpiCard label="Rejected" value={counts.rejected} tone="error" onClick={() => setTab('rejected')} />
        <KpiCard label="Replacement Req" value={counts.replacement} tone="warning" onClick={() => setTab('rejected')} />
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {(
          [
            { id: 'all', label: 'All Documents' },
            { id: 'Owner', label: 'Owner Documents' },
            { id: 'Property', label: 'Property Documents' },
            { id: 'Tenant', label: 'Tenant Documents' },
            { id: 'pending', label: 'Pending Verification' },
            { id: 'verified', label: 'Verified Documents' },
            { id: 'rejected', label: 'Rejected / Replacement' },
          ] as { id: DocTab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 ${
              tab === t.id
                ? 'bg-[#047857] text-white dark:bg-[#34D399] dark:text-[#0B1220]'
                : 'bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#374151] text-[#64748B] dark:text-[#9CA3AF]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AdminDataTable
        data={tabFiltered}
        columns={columns}
        rowKey={(d) => d.id}
        searchPlaceholder="Search document ID, owner/tenant name, property, document type..."
        searchExtractor={(d) => `${d.id} ${d.ownerOrTenantName} ${d.propertyName || ''} ${d.documentType} ${d.fileName}`}
        filters={[
          {
            key: 'category',
            label: 'Category',
            options: [
              { label: 'Owner', value: 'Owner' },
              { label: 'Property', value: 'Property' },
              { label: 'Tenant', value: 'Tenant' },
            ],
          },
          {
            key: 'status',
            label: 'Verification Status',
            options: [
              { label: 'Pending', value: 'Pending' },
              { label: 'Under Review', value: 'Under Review' },
              { label: 'Verified', value: 'Verified' },
              { label: 'Rejected', value: 'Rejected' },
              { label: 'Replacement Required', value: 'Replacement Required' },
            ],
          },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearFilters={() => setFilters({ category: 'ALL', status: 'ALL' })}
        exportFilename="unified-documents-export.csv"
      />

      {/* View / Review Document Modal */}
      <ModalSheet
        open={Boolean(activePreview)}
        onClose={() => setPreviewDoc(null)}
        title={activePreview ? `Document Review · ${activePreview.documentType}` : 'Document Preview'}
        subtitle={activePreview ? `${activePreview.id} · ${activePreview.ownerOrTenantName}` : ''}
      >
        {activePreview && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl border border-dashed border-[#CBD5E1] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#0B1220] text-center space-y-2">
              <FileCheck2 className="w-9 h-9 mx-auto text-[#047857] dark:text-[#34D399]" />
              <div className="font-semibold text-sm">{activePreview.fileName}</div>
              <div className="text-[#64748B]">
                Private Document Preview Card · Access logged for Super Admin audit trail
              </div>
              <StatusText status={activePreview.verificationStatus} />
            </div>

            <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151]">
              <div><span className="text-[#64748B]">Category:</span> {activePreview.category}</div>
              <div><span className="text-[#64748B]">Uploaded:</span> <span className="font-mono-num">{activePreview.uploadedAt}</span></div>
              <div><span className="text-[#64748B]">Submitted By:</span> {activePreview.ownerOrTenantName}</div>
              <div><span className="text-[#64748B]">Property:</span> {activePreview.propertyName || 'N/A'}</div>
              {activePreview.verifiedBy && (
                <div className="col-span-2">
                  <span className="text-[#64748B]">Last Reviewed:</span> {activePreview.verifiedBy} ({activePreview.verifiedAt})
                </div>
              )}
            </div>

            <div>
              <label className="block font-medium mb-1">Verification Remarks / Reason</label>
              <textarea
                rows={3}
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                placeholder="Add reviewer comments (required for rejection or replacement request)..."
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  adminReviewUnifiedDocument(activePreview.id, 'Under Review', reviewRemarks.trim() || undefined);
                  setBanner(`Marked ${activePreview.documentType} as Under Review.`);
                }}
                className="px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] font-semibold"
              >
                Mark Under Review
              </button>
              <button
                type="button"
                onClick={() => {
                  adminReviewUnifiedDocument(activePreview.id, 'Verified', reviewRemarks.trim() || 'Verified by Super Admin.');
                  setBanner(`Verified ${activePreview.documentType} for ${activePreview.ownerOrTenantName}.`);
                  setPreviewDoc(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#059669] text-white font-semibold"
              >
                Verify Document
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!reviewRemarks.trim()) {
                    setBanner('Enter remarks before requesting replacement.');
                    return;
                  }
                  adminReviewUnifiedDocument(activePreview.id, 'Replacement Required', reviewRemarks.trim());
                  setBanner(`Requested replacement for ${activePreview.documentType}.`);
                  setPreviewDoc(null);
                }}
                className="px-3 py-2 rounded-xl border border-[#D97706] text-[#D97706] font-semibold"
              >
                Request Replacement
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!reviewRemarks.trim()) {
                    setBanner('Enter rejection reason before rejecting.');
                    return;
                  }
                  adminReviewUnifiedDocument(activePreview.id, 'Rejected', reviewRemarks.trim());
                  setBanner(`Rejected ${activePreview.documentType}.`);
                  setPreviewDoc(null);
                }}
                className="px-3 py-2 rounded-xl border border-[#DC2626] text-[#DC2626] font-semibold"
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </ModalSheet>

      <ConfirmDialog
        open={Boolean(actionConfirm)}
        onClose={() => setActionConfirm(null)}
        title={
          actionConfirm?.nextStatus === 'Verified'
            ? `Verify ${actionConfirm.doc.documentType}`
            : `Request Replacement for ${actionConfirm?.doc.documentType || 'Document'}`
        }
        description={
          actionConfirm?.nextStatus === 'Verified'
            ? `Confirm verification of ${actionConfirm.doc.fileName} submitted by ${actionConfirm.doc.ownerOrTenantName}.`
            : `Notify ${actionConfirm?.doc.ownerOrTenantName} that a clearer or updated document upload is required.`
        }
        confirmLabel={actionConfirm?.nextStatus === 'Verified' ? 'Verify Document' : 'Request Replacement'}
        tone={actionConfirm?.nextStatus === 'Verified' ? 'primary' : 'warning'}
        requireReason={actionConfirm?.nextStatus !== 'Verified'}
        onConfirm={(reason) => {
          if (actionConfirm) {
            adminReviewUnifiedDocument(
              actionConfirm.doc.id,
              actionConfirm.nextStatus,
              reason || 'Verified by Super Admin.'
            );
            setBanner(`Updated ${actionConfirm.doc.documentType} to ${actionConfirm.nextStatus}.`);
          }
          setActionConfirm(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        title="Archive Document"
        description="Verified or property-linked documents are archived for compliance retention rather than permanently deleted."
        confirmLabel="Confirm Archive"
        tone="warning"
        onConfirm={() => {
          if (archiveTarget) {
            const res = archiveOrDeleteUnifiedDocument(archiveTarget.id);
            setBanner(res.message);
          }
          setArchiveTarget(null);
        }}
      />
    </div>
  );
};
