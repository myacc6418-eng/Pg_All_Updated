import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, MapPin, ShieldAlert, XCircle } from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import { ModalSheet, SafeImage, StatusText } from '../../components/ui/Primitives';
import { PGProperty } from '../../types/pgfinder';

export const AdminApprovalsPage: React.FC = () => {
  const { properties, adminReviewProperty, adminVerifyLocation, adminVerifyDocument } = usePGFinder();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'property' | 'location' | 'documents') || 'property';
  const [tab, setTab] = useState<'property' | 'location' | 'documents'>(initialTab);

  const [reviewProp, setReviewProp] = useState<PGProperty | null>(null);
  const [comment, setComment] = useState('');
  const [err, setErr] = useState('');

  const switchTab = (next: 'property' | 'location' | 'documents') => {
    setTab(next);
    setSearchParams({ tab: next });
  };

  const handleDecision = (
    propId: string,
    decision: 'UNDER_REVIEW' | 'APPROVED' | 'CORRECTIONS_REQUIRED' | 'REJECTED' | 'SUSPENDED'
  ) => {
    setErr('');
    if (
      (decision === 'CORRECTIONS_REQUIRED' || decision === 'REJECTED' || decision === 'SUSPENDED') &&
      !comment.trim()
    ) {
      setErr('Review comment is required when requesting corrections, rejecting, or suspending.');
      return;
    }
    adminReviewProperty(propId, decision, comment.trim() || undefined);
    setReviewProp(null);
    setComment('');
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold font-display">Property &amp; Location Verification</h1>
        <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
          Approval and GPS location verification are independent checks. GPS capture alone never auto-verifies a property.
        </p>
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] w-fit">
        {[
          { id: 'property', label: 'Property Approvals' },
          { id: 'location', label: 'Location Verification' },
          { id: 'documents', label: 'Property Documents' },
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

      {tab === 'property' && (
        <div className="space-y-3">
          {properties.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{p.name}</span>
                  <StatusText status={p.approvalStatus} />
                </div>
                <div className="text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
                  Owner: {p.ownerName} · {p.locality}, {p.city} · Photos: {p.images.length} · Docs: {p.documents.length}
                </div>
                {p.adminComment && (
                  <div className="text-[#D97706] dark:text-[#FBBF24] mt-1">Last comment: {p.adminComment}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setReviewProp(p);
                  setComment(p.adminComment || '');
                  setErr('');
                }}
                className="px-3.5 py-2 rounded-xl bg-[#047857] text-white font-semibold shrink-0 self-start sm:self-center"
              >
                Review Submission
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'location' && (
        <div className="space-y-3">
          {properties.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#047857]" /> {p.name}
                  </div>
                  <div className="text-[#64748B]">
                    {p.address}, {p.locality}, {p.city} — {p.pinCode}
                  </div>
                </div>
                <StatusText status={p.locationVerificationStatus} />
              </div>

              {p.location ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1F2937]/60 font-mono-num">
                  <div>Lat: {p.location.latitude}</div>
                  <div>Lng: {p.location.longitude}</div>
                  <div>Accuracy: ±{p.location.accuracy}m</div>
                  <div>Confirmed: {p.location.ownerConfirmed ? 'Yes' : 'No'}</div>
                </div>
              ) : (
                <div className="text-[#DC2626]">No GPS coordinates captured yet.</div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => adminVerifyLocation(p.id, 'UNDER_REVIEW')}
                  className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] font-medium"
                >
                  Start Review
                </button>
                <button
                  type="button"
                  onClick={() => adminVerifyLocation(p.id, 'VERIFIED', 'GPS coordinates verified against submitted address.')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#059669] text-white font-semibold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verify Location
                </button>
                <button
                  type="button"
                  onClick={() =>
                    adminVerifyLocation(
                      p.id,
                      'CORRECTIONS_REQUIRED',
                      'Please recapture GPS coordinates closer to the main entrance.'
                    )
                  }
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#D97706] text-white font-semibold"
                >
                  <ShieldAlert className="w-3.5 h-3.5" /> Request Recapture
                </button>
                <button
                  type="button"
                  onClick={() => adminVerifyLocation(p.id, 'REJECTED', 'Coordinates do not match property address.')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#DC2626] text-white font-semibold"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'documents' && (
        <div className="space-y-3">
          {properties.map((p) => (
            <div key={p.id} className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-2.5 text-xs">
              <div className="text-sm font-semibold">
                {p.name} <span className="text-xs font-normal text-[#64748B]">(Private Admin-Only Access)</span>
              </div>
              {p.documents.map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex flex-wrap items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-semibold">{d.name}</div>
                    <div className="text-[#64748B]">
                      {d.type} · Uploaded {d.uploadedAt}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusText status={d.status} />
                    <button
                      type="button"
                      onClick={() => adminVerifyDocument(p.id, d.id, 'Verified')}
                      className="px-2.5 py-1 rounded-lg bg-[#059669] text-white font-semibold"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => adminVerifyDocument(p.id, d.id, 'Replacement Required', 'Upload clearer scan')}
                      className="px-2.5 py-1 rounded-lg border border-[#D97706] text-[#D97706] font-semibold"
                    >
                      Replace
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Full Property Review Modal */}
      <ModalSheet
        open={reviewProp !== null}
        onClose={() => setReviewProp(null)}
        title={reviewProp?.name || ''}
        subtitle={reviewProp ? `${reviewProp.ownerName} · ${reviewProp.address}` : ''}
        maxWidth="max-w-3xl"
      >
        {reviewProp && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {reviewProp.images.map((img) => (
                <div key={img.id} className="aspect-4/3 rounded-xl overflow-hidden bg-slate-100">
                  <SafeImage src={img.url} alt={img.category} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-1">
              <div>
                <strong>Category:</strong> {reviewProp.propertyType} · {reviewProp.category}
              </div>
              <div>
                <strong>Amenities:</strong> {reviewProp.amenities.join(', ')}
              </div>
              <div>
                <strong>GPS Coordinates:</strong>{' '}
                {reviewProp.location
                  ? `${reviewProp.location.latitude}, ${reviewProp.location.longitude} (±${reviewProp.location.accuracy}m)`
                  : 'Not provided'}
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">
                Review Comment (Required for Corrections, Rejection, or Suspension)
              </label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter review notes for the PG owner..."
                className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              />
              {err && <div className="text-[#DC2626] mt-1 font-medium">{err}</div>}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleDecision(reviewProp.id, 'UNDER_REVIEW')}
                className="px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] font-semibold"
              >
                Start Review
              </button>
              <button
                type="button"
                onClick={() => handleDecision(reviewProp.id, 'APPROVED')}
                className="px-4 py-2 rounded-xl bg-[#059669] text-white font-semibold"
              >
                Approve Property
              </button>
              <button
                type="button"
                onClick={() => handleDecision(reviewProp.id, 'CORRECTIONS_REQUIRED')}
                className="px-3 py-2 rounded-xl bg-[#D97706] text-white font-semibold"
              >
                Request Corrections
              </button>
              <button
                type="button"
                onClick={() => handleDecision(reviewProp.id, 'REJECTED')}
                className="px-3 py-2 rounded-xl bg-[#DC2626] text-white font-semibold"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => handleDecision(reviewProp.id, 'SUSPENDED')}
                className="px-3 py-2 rounded-xl border border-[#DC2626] text-[#DC2626] font-semibold"
              >
                Suspend
              </button>
            </div>
          </div>
        )}
      </ModalSheet>
    </div>
  );
};
