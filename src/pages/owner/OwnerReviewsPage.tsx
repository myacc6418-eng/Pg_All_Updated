import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Flag, MessageSquareReply, Star } from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import { ActionBtn, ModalSheet, StatusText } from '../../components/ui/Primitives';
import { PropertyReview } from '../../types/pgfinder';

export const OwnerReviewsPage: React.FC = () => {
  const {
    currentUser,
    properties,
    propertyReviews,
    ownerSelectedPropertyId,
    setOwnerSelectedPropertyId,
    replyToReview,
    reportReviewToAdmin,
  } = usePGFinder();

  const [searchParams] = useSearchParams();
  useEffect(() => {
    const pid = searchParams.get('propertyId');
    if (pid) setOwnerSelectedPropertyId(pid);
  }, [searchParams, setOwnerSelectedPropertyId]);

  const ownerProps = useMemo(
    () => properties.filter((p) => p.ownerId === (currentUser?.id || 'usr-owner-1') && !p.archived),
    [properties, currentUser]
  );
  const scopedPropIds = useMemo(
    () => (ownerSelectedPropertyId === 'ALL' ? ownerProps.map((p) => p.id) : [ownerSelectedPropertyId]),
    [ownerSelectedPropertyId, ownerProps]
  );

  const [ratingFilter, setRatingFilter] = useState<'ALL' | '5' | '4' | '3' | 'LOW'>('ALL');
  const [replyFilter, setReplyFilter] = useState<'ALL' | 'UNANSWERED' | 'REPORTED'>('ALL');

  const [viewReview, setViewReview] = useState<PropertyReview | null>(null);
  const [replyTarget, setReplyTarget] = useState<PropertyReview | null>(null);
  const [replyText, setReplyText] = useState('');
  const [reportTarget, setReportTarget] = useState<PropertyReview | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [banner, setBanner] = useState('');

  const scopedReviews = useMemo(
    () => propertyReviews.filter((r) => scopedPropIds.includes(r.propertyId)),
    [propertyReviews, scopedPropIds]
  );

  const filteredReviews = useMemo(() => {
    return scopedReviews.filter((r) => {
      if (ratingFilter === '5' && r.overallRating !== 5) return false;
      if (ratingFilter === '4' && r.overallRating !== 4) return false;
      if (ratingFilter === '3' && r.overallRating !== 3) return false;
      if (ratingFilter === 'LOW' && r.overallRating > 2) return false;
      if (replyFilter === 'UNANSWERED' && Boolean(r.ownerReply)) return false;
      if (replyFilter === 'REPORTED' && r.reportedStatus === 'None') return false;
      return true;
    });
  }, [scopedReviews, ratingFilter, replyFilter]);

  const overallScore =
    scopedReviews.length > 0
      ? (scopedReviews.reduce((s, r) => s + r.overallRating, 0) / scopedReviews.length).toFixed(1)
      : '0.0';

  const hasFoodProps = ownerProps.some((p) => scopedPropIds.includes(p.id) && p.foodAvailable);

  const categoryAverages = useMemo(() => {
    const keys: { key: keyof PropertyReview['categoryRatings']; label: string; foodOnly?: boolean }[] = [
      { key: 'food', label: 'Food Quality & Taste', foodOnly: true },
      { key: 'hygiene', label: 'Kitchen & Dining Hygiene', foodOnly: true },
      { key: 'cleanliness', label: 'Cleanliness & Housekeeping' },
      { key: 'roomQuality', label: 'Room Quality & Comfort' },
      { key: 'bathroom', label: 'Bathroom Hygiene' },
      { key: 'maintenance', label: 'Maintenance & Repairs' },
      { key: 'service', label: 'Owner & Staff Service' },
      { key: 'safety', label: 'Safety & Security' },
      { key: 'wifi', label: 'Wi-Fi / Internet' },
      { key: 'water', label: 'Water & Electricity Supply' },
      { key: 'amenities', label: 'Amenities Availability' },
      { key: 'value', label: 'Value for Money' },
      { key: 'location', label: 'Location & Connectivity' },
    ];
    return keys
      .filter((k) => !k.foodOnly || hasFoodProps)
      .map((k) => {
        const vals = scopedReviews
          .map((r) => r.categoryRatings[k.key])
          .filter((v): v is number => typeof v === 'number');
        const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        return { label: k.label, avg };
      });
  }, [scopedReviews, hasFoodProps]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-display">PG Finder Reviews &amp; Ratings</h1>
          <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
            Authentic PG Finder tenant stay reviews. Owners can reply or report policy violations to Super Admin.
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

      {/* Overall Rating Summary & Category Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full border-4 border-[#047857] dark:border-[#34D399] flex flex-col items-center justify-center shrink-0">
              <span className="text-2xl font-bold font-mono-num">{overallScore}</span>
              <span className="text-[10px] text-[#64748B]">/ 5.0</span>
            </div>
            <div>
              <div className="text-sm font-semibold">Overall PG Finder Rating</div>
              <div className="flex items-center gap-0.5 text-[#D97706] mt-1">
                {[1, 2, 3, 4, 5].map((st) => (
                  <Star
                    key={st}
                    className={`w-4 h-4 ${st <= Math.round(Number(overallScore)) ? 'fill-current' : 'opacity-30'}`}
                  />
                ))}
              </div>
              <div className="text-xs text-[#64748B] mt-1 font-mono-num">
                Based on {scopedReviews.length} PG Finder verified stay review(s)
              </div>
            </div>
          </div>

          {/* 5★ to 1★ Distribution Bars */}
          <div className="space-y-1.5 text-xs">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = scopedReviews.filter((r) => Math.round(r.overallRating) === star).length;
              const pct = scopedReviews.length > 0 ? Math.round((count / scopedReviews.length) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 font-mono-num">
                  <span className="w-7">{star} ★</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-[#047857] dark:bg-[#34D399]" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-[#64748B]">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7 rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Category Ratings Breakdown</h2>
            <span className="text-[11px] text-[#64748B]">PG Finder Tenant Feedback</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
            {categoryAverages.map((cat) => (
              <div key={cat.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B] dark:text-[#9CA3AF] truncate">{cat.label}</span>
                  <span className="font-mono-num font-semibold">{cat.avg.toFixed(1)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-[#047857] dark:bg-[#34D399]"
                    style={{ width: `${Math.min(100, Math.round((cat.avg / 5) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <h2 className="text-sm font-semibold">Tenant Reviews ({filteredReviews.length})</h2>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value as typeof ratingFilter)}
              className="h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            >
              <option value="ALL">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="LOW">2 Stars or Below</option>
            </select>
            <select
              value={replyFilter}
              onChange={(e) => setReplyFilter(e.target.value as typeof replyFilter)}
              className="h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            >
              <option value="ALL">All Reviews</option>
              <option value="UNANSWERED">Unanswered Only</option>
              <option value="REPORTED">Reported to Admin</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
                <th className="py-2 pr-3 font-medium">Resident &amp; PG</th>
                <th className="py-2 pr-3 font-medium font-mono-num">Overall</th>
                <th className="py-2 pr-3 font-medium font-mono-num">Food / Clean / Maint / Service</th>
                <th className="py-2 pr-3 font-medium">Review</th>
                <th className="py-2 pr-3 font-medium font-mono-num">Date</th>
                <th className="py-2 pr-3 font-medium">Reply Status</th>
                <th className="py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
              {filteredReviews.map((rev) => (
                <tr key={rev.id}>
                  <td className="py-2.5 pr-3">
                    <div className="font-semibold">{rev.tenantDisplayName}</div>
                    <div className="text-[11px] text-[#64748B]">{properties.find((p) => p.id === rev.propertyId)?.name}</div>
                  </td>
                  <td className="py-2.5 pr-3 font-mono-num font-bold text-[#D97706]">{rev.overallRating} ★</td>
                  <td className="py-2.5 pr-3 font-mono-num whitespace-nowrap">
                    {rev.categoryRatings.food ?? '—'} / {rev.categoryRatings.cleanliness} / {rev.categoryRatings.maintenance} / {rev.categoryRatings.service}
                  </td>
                  <td className="py-2.5 pr-3 max-w-[260px]">
                    <p className="line-clamp-2">{rev.message}</p>
                    {rev.ownerReply && (
                      <p className="text-[11px] text-[#059669] dark:text-[#34D399] mt-0.5 line-clamp-1">
                        Owner reply: {rev.ownerReply}
                      </p>
                    )}
                  </td>
                  <td className="py-2.5 pr-3 font-mono-num">{rev.date}</td>
                  <td className="py-2.5 pr-3 space-y-1">
                    <StatusText status={rev.ownerReply ? 'Resolved' : 'Pending'} />
                    {rev.reportedStatus !== 'None' && (
                      <div>
                        <StatusText status={rev.reportedStatus} tone="warning" />
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 text-right min-w-[240px]">
                    <div className="flex justify-end gap-1.5">
                      <ActionBtn kind="view" onClick={() => setViewReview(rev)} />
                      <button
                        type="button"
                        onClick={() => {
                          setReplyTarget(rev);
                          setReplyText(rev.ownerReply || '');
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] dark:border-[#374151] px-2.5 py-1.5 text-xs font-medium text-[#047857] dark:text-[#34D399] min-h-[34px]"
                      >
                        <MessageSquareReply className="w-3.5 h-3.5" />
                        <span>{rev.ownerReply ? 'Edit Reply' : 'Reply'}</span>
                      </button>
                      {rev.reportedStatus === 'None' && (
                        <button
                          type="button"
                          onClick={() => {
                            setReportTarget(rev);
                            setReportReason('');
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] dark:border-[#374151] px-2.5 py-1.5 text-xs font-medium text-[#DC2626] min-h-[34px]"
                        >
                          <Flag className="w-3.5 h-3.5" /> Report
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Full Review Modal */}
      <ModalSheet open={viewReview !== null} onClose={() => setViewReview(null)} title={`Review from ${viewReview?.tenantDisplayName || ''}`} subtitle={viewReview?.date}>
        {viewReview && (
          <div className="space-y-3 text-xs">
            <div className="font-mono-num font-bold text-sm text-[#D97706]">Overall Rating: {viewReview.overallRating} / 5</div>
            <p className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1F2937]/40">{viewReview.message}</p>
            {viewReview.ownerReply && (
              <div className="p-3 rounded-xl border border-[#059669]/30 bg-[#059669]/10">
                <div className="font-semibold text-[#059669] dark:text-[#34D399]">Owner Response ({viewReview.ownerReplyAt})</div>
                <div className="mt-1">{viewReview.ownerReply}</div>
              </div>
            )}
          </div>
        )}
      </ModalSheet>

      {/* Reply Modal */}
      <ModalSheet open={replyTarget !== null} onClose={() => setReplyTarget(null)} title={`Reply to ${replyTarget?.tenantDisplayName || ''}`}>
        {replyTarget && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!replyText.trim()) return;
              replyToReview(replyTarget.id, replyText.trim());
              setBanner(`Published owner response to ${replyTarget.tenantDisplayName}'s review.`);
              setReplyTarget(null);
            }}
            className="space-y-3 text-xs"
          >
            <textarea
              rows={3}
              required
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a polite, clear public response..."
              className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            />
            <button type="submit" className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold">
              Publish Owner Reply
            </button>
          </form>
        )}
      </ModalSheet>

      {/* Report Review to Admin Modal */}
      <ModalSheet open={reportTarget !== null} onClose={() => setReportTarget(null)} title="Report Review to Super Admin">
        {reportTarget && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!reportReason.trim()) return;
              reportReviewToAdmin(reportTarget.id, reportReason.trim());
              setBanner('Review reported to Super Admin for moderation review.');
              setReportTarget(null);
            }}
            className="space-y-3 text-xs"
          >
            <p className="text-[#64748B]">
              Owners cannot edit or delete tenant reviews directly. Submit a moderation report if this review contains spam or abusive language.
            </p>
            <textarea
              rows={2}
              required
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Reason for reporting *"
              className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            />
            <button type="submit" className="w-full h-10 rounded-xl bg-[#DC2626] text-white font-semibold">
              Submit Moderation Report
            </button>
          </form>
        )}
      </ModalSheet>
    </div>
  );
};
