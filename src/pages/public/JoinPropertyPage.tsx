import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, MapPin, QrCode, ShieldCheck } from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import { SafeImage, StatusText, ThemeSwitch } from '../../components/ui/Primitives';
import { SharingOption } from '../../types/pgfinder';
import { formatINR } from '../../utils/formatters';

export const JoinPropertyPage: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { properties, beds, currentUser, submitJoiningRequest, switchDemoRole } = usePGFinder();

  const property = properties.find((p) => p.id === propertyId);
  const [sharing, setSharing] = useState<SharingOption>('Double');
  const [moveInDate, setMoveInDate] = useState('2026-12-01');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  if (!property) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-6 text-center">
          <h1 className="text-lg font-bold">Property Not Found</h1>
          <p className="text-sm text-[#64748B] dark:text-[#9CA3AF] mt-1">
            This QR joining link does not match an active PG property.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 rounded-xl bg-[#047857] text-white text-sm font-semibold"
          >
            Go to PG Finder
          </button>
        </div>
      </div>
    );
  }

  const eligible =
    property.approvalStatus === 'APPROVED' &&
    property.locationVerificationStatus === 'VERIFIED' &&
    property.qrEnabled;
  const availBeds = beds.filter((b) => b.propertyId === property.id && b.status === 'Available').length;
  const cover = property.images.find((i) => i.isCover)?.url || property.images[0]?.url;

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'TENANT') {
      switchDemoRole('TENANT');
    }
    const res = submitJoiningRequest({
      propertyId: property.id,
      preferredSharing: sharing,
      moveInDate,
      source: 'QR',
      notes,
    });
    setResult(res);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] text-[#111827] dark:text-[#F9FAFB]">
      <header className="h-14 border-b border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] px-4 sm:px-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/tenant/home')}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#111827] dark:hover:text-[#F9FAFB]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-bold font-display text-[#047857] dark:text-[#34D399]">PG Finder QR Onboarding</span>
        </button>
        <ThemeSwitch compact />
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] overflow-hidden">
          <div className="aspect-16/9 bg-slate-100 dark:bg-slate-800">
            <SafeImage src={cover} alt={property.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#047857] dark:text-[#34D399]">
                <QrCode className="w-3.5 h-3.5" />
                <span>Verified Property QR · {property.qrToken}</span>
              </div>
              <StatusText status={eligible ? 'Verified & Active' : 'Unavailable'} />
            </div>

            <h1 className="mt-2 text-xl font-bold font-display">{property.name}</h1>
            <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {property.address}, {property.locality}, {property.city} — {property.pinCode}
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1F2937]/60 border border-[#E2E8F0] dark:border-[#374151]">
              <div>
                <div className="text-[11px] text-[#647857] dark:text-[#9CA3AF]">Starting Rent</div>
                <div className="text-sm font-bold font-mono-num">{formatINR(property.defaultRent)}</div>
              </div>
              <div>
                <div className="text-[11px] text-[#647857] dark:text-[#9CA3AF]">Security Deposit</div>
                <div className="text-sm font-bold font-mono-num">{formatINR(property.defaultDeposit)}</div>
              </div>
              <div>
                <div className="text-[11px] text-[#647857] dark:text-[#9CA3AF]">Available Beds</div>
                <div className="text-sm font-bold font-mono-num">{availBeds}</div>
              </div>
            </div>

            {!eligible ? (
              <div className="mt-5 p-4 rounded-xl bg-[#DC2626]/10 text-[#DC2626] dark:text-[#F87171] text-sm">
                This property is currently not accepting QR onboarding requests (pending verification or QR paused by owner).
              </div>
            ) : !currentUser ? (
              <div className="mt-5 p-4 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]/50">
                <p className="text-sm font-medium">Sign in or register as a Tenant to submit your joining request.</p>
                <button
                  type="button"
                  onClick={() => navigate(`/auth?redirect=/join/${property.id}`)}
                  className="mt-3 px-4 py-2.5 rounded-xl bg-[#047857] text-white text-xs font-semibold"
                >
                  Continue to Login / Register
                </button>
              </div>
            ) : result?.ok ? (
              <div className="mt-5 p-4 rounded-xl bg-[#059669]/10 text-[#059669] dark:text-[#34D399] space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{result.message}</span>
                </div>
                <p className="text-xs">
                  The PG owner will review your request, assign an available room and bed, and share the stay agreement.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/tenant/home')}
                  className="mt-2 px-4 py-2 rounded-lg bg-[#047857] text-white text-xs font-semibold"
                >
                  Return to Tenant Home
                </button>
              </div>
            ) : (
              <form onSubmit={handleJoinSubmit} className="mt-5 space-y-3">
                {result && !result.ok && (
                  <div className="p-3 rounded-xl bg-[#DC2626]/10 text-[#DC2626] text-xs font-medium">
                    {result.message}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Preferred Sharing</label>
                    <select
                      value={sharing}
                      onChange={(e) => setSharing(e.target.value as SharingOption)}
                      className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-sm"
                    >
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Triple">Triple</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Expected Move-in Date</label>
                    <input
                      type="date"
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Notes for Owner (optional)</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Mention preferred floor, food preference, or workplace..."
                    className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-[#9CA3AF]">
                  <ShieldCheck className="w-4 h-4 text-[#047857] dark:text-[#34D399]" />
                  <span>Note: QR onboarding works even if the property is not publicly listed.</span>
                </div>
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-[#047857] hover:bg-[#065F46] dark:bg-[#34D399] dark:hover:bg-[#10B981] text-white dark:text-[#0B1220] text-sm font-semibold transition-colors"
                >
                  Submit Joining Request
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
