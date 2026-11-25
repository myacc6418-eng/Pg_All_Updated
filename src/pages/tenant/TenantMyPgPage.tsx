import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Download,
  Phone,
  ShieldAlert,
  Utensils,
} from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import { SafeImage, StatusText } from '../../components/ui/Primitives';
import { formatINR } from '../../utils/formatters';
import { ComplaintItem } from '../../types/pgfinder';

type MyPgTab = 'overview' | 'rent' | 'food' | 'complaints' | 'notices' | 'documents' | 'parcels' | 'checkout';

export const TenantMyPgPage: React.FC = () => {
  const {
    currentUser,
    tenantPreviewSearching,
    properties,
    rooms,
    beds,
    stays,
    joiningRequests,
    rentInvoices,
    rentPayments,
    foodMenu,
    complaints,
    createComplaint,
    notices,
    markNoticeRead,
    parcels,
    checkouts,
    requestCheckout,
  } = usePGFinder();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = (searchParams.get('tab') as MyPgTab) || 'overview';
  const [tab, setTab] = useState<MyPgTab>(initialTab);

  const [cmpTitle, setCmpTitle] = useState('');
  const [cmpCategory, setCmpCategory] = useState<ComplaintItem['category']>('Electrical');
  const [cmpPriority, setCmpPriority] = useState<ComplaintItem['priority']>('Medium');
  const [cmpDesc, setCmpDesc] = useState('');
  const [mealFeedback, setMealFeedback] = useState('');
  const [mealFeedbackSent, setMealFeedbackSent] = useState(false);
  const [checkoutDate, setCheckoutDate] = useState('2026-12-31');
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  const myStay = tenantPreviewSearching
    ? undefined
    : stays.find((s) => s.tenantId === currentUser?.id && s.status !== 'Completed');

  const myRequests = joiningRequests.filter((jr) => jr.tenantId === currentUser?.id);

  if (!myStay) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-8 text-center">
          <h1 className="text-lg font-bold font-display">No Active PG Stay</h1>
          <p className="text-sm text-[#64748B] dark:text-[#9CA3AF] mt-1 max-w-md mx-auto">
            Once your joining request is approved and a PG owner assigns a room &amp; bed, your stay details, rent ledger, food menu, notices, and checkout tools appear here.
          </p>
          <button
            type="button"
            onClick={() => navigate('/tenant/explore')}
            className="mt-4 px-5 py-2.5 rounded-xl bg-[#047857] dark:bg-[#34D399] text-white dark:text-[#0B1220] text-xs font-semibold"
          >
            Find a PG
          </button>
        </div>

        {myRequests.length > 0 && (
          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4">
            <h2 className="text-sm font-semibold mb-3">My Joining Requests</h2>
            <div className="space-y-2.5">
              {myRequests.map((jr) => {
                const p = properties.find((x) => x.id === jr.propertyId);
                return (
                  <div
                    key={jr.id}
                    className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-semibold">{p?.name || 'PG Property'}</div>
                      <div className="text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
                        {jr.preferredSharing} Sharing · Move-in {jr.moveInDate} · Source: {jr.source}
                      </div>
                    </div>
                    <StatusText status={jr.status} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  const property = properties.find((p) => p.id === myStay.propertyId);
  const room = rooms.find((r) => r.id === myStay.roomId);
  const bed = beds.find((b) => b.id === myStay.bedId);
  const myInvoices = rentInvoices.filter((i) => i.stayId === myStay.id);
  const myPayments = rentPayments.filter((p) => p.tenantId === myStay.tenantId && p.propertyId === myStay.propertyId);
  const myComplaints = complaints.filter((c) => c.tenantId === myStay.tenantId);
  const myNotices = notices.filter((n) => n.propertyId === myStay.propertyId);
  const myParcels = parcels.filter((p) => p.tenantId === myStay.tenantId);
  const myCheckout = checkouts.find((c) => c.stayId === myStay.id);

  const changeTab = (next: MyPgTab) => {
    setTab(next);
    setSearchParams({ tab: next });
  };

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmpTitle.trim() || !cmpDesc.trim()) return;
    createComplaint({
      propertyId: myStay.propertyId,
      tenantId: myStay.tenantId,
      tenantName: myStay.tenantName,
      roomNumber: room?.roomNumber || '101',
      title: cmpTitle.trim(),
      description: cmpDesc.trim(),
      category: cmpCategory,
      priority: cmpPriority,
    });
    setCmpTitle('');
    setCmpDesc('');
  };

  const tabs: { id: MyPgTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'rent', label: 'Rent & Receipts' },
    { id: 'food', label: 'Food Menu' },
    { id: 'complaints', label: 'Complaints' },
    { id: 'notices', label: 'Notices' },
    { id: 'documents', label: 'Documents' },
    { id: 'parcels', label: 'Parcels' },
    { id: 'checkout', label: 'Checkout' },
  ];

  const cover = property?.images.find((i) => i.isCover)?.url || property?.images[0]?.url;

  return (
    <div className="space-y-5">
      {/* Header Summary */}
      <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-44 h-36 sm:h-auto bg-slate-100 dark:bg-slate-800 shrink-0">
            <SafeImage src={cover} alt={property?.name || 'Active PG'} className="w-full h-full object-cover" />
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between gap-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h1 className="text-lg font-bold font-display">{property?.name}</h1>
                <p className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
                  {property?.address}, {property?.locality}
                </p>
              </div>
              <StatusText status={myStay.status} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#E2E8F0] dark:border-[#374151] text-xs">
              <div>
                <div className="text-[#64748B] dark:text-[#9CA3AF]">Room &amp; Bed</div>
                <div className="font-semibold font-mono-num">
                  Rm {room?.roomNumber} · {bed?.bedCode}
                </div>
              </div>
              <div>
                <div className="text-[#64748B] dark:text-[#9CA3AF]">Monthly Rent</div>
                <div className="font-semibold font-mono-num">{formatINR(myStay.monthlyRent)}</div>
              </div>
              <div>
                <div className="text-[#64748B] dark:text-[#9CA3AF]">Security Deposit</div>
                <div className="font-semibold font-mono-num">{formatINR(myStay.depositPaid)}</div>
              </div>
              <div>
                <div className="text-[#64748B] dark:text-[#9CA3AF]">Joined On</div>
                <div className="font-semibold font-mono-num">{myStay.joiningDate}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => changeTab(t.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              tab === t.id
                ? 'bg-[#047857] text-white dark:bg-[#34D399] dark:text-[#0B1220]'
                : 'bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#374151] text-[#64748B] dark:text-[#9CA3AF]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-2.5 text-xs">
            <h2 className="text-sm font-semibold">Stay Agreement &amp; Owner Contact</h2>
            <div className="flex justify-between py-1.5 border-b border-[#E2E8F0] dark:border-[#374151]">
              <span className="text-[#64748B] dark:text-[#9CA3AF]">Owner / Manager</span>
              <span className="font-medium">{property?.ownerName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#E2E8F0] dark:border-[#374151]">
              <span className="text-[#64748B] dark:text-[#9CA3AF]">Contact Number</span>
              <span className="font-mono-num font-medium">{property?.ownerMobile}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#E2E8F0] dark:border-[#374151]">
              <span className="text-[#64748B] dark:text-[#9CA3AF]">Notice Period</span>
              <span className="font-medium">{property?.noticePeriodDays} days</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#64748B] dark:text-[#9CA3AF]">Agreement Status</span>
              <StatusText status={myStay.agreementAccepted ? 'Accepted' : 'Pending'} />
            </div>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-2">
            <h2 className="text-sm font-semibold">Property Rules</h2>
            <ul className="text-xs text-[#64748B] dark:text-[#9CA3AF] space-y-1.5">
              {property?.houseRules.map((rule) => (
                <li key={rule}>• {rule}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === 'rent' && (
        <div className="space-y-4">
          {paymentNotice && (
            <div className="p-3 rounded-xl border border-[#D97706]/40 bg-[#D97706]/10 text-xs text-[#111827] dark:text-[#F9FAFB] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
              <span>{paymentNotice}</span>
            </div>
          )}

          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4">
            <h2 className="text-sm font-semibold mb-3">Monthly Rent Ledger</h2>
            <div className="space-y-2.5">
              {myInvoices.map((inv) => {
                const total = inv.rentAmount + inv.additionalCharges;
                const balance = Math.max(0, total - inv.paidAmount);
                return (
                  <div
                    key={inv.id}
                    className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-sm">{inv.monthLabel}</div>
                      <div className="text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
                        Due {inv.dueDate} · Rent {formatINR(inv.rentAmount)} + Add-on {formatINR(inv.additionalCharges)}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-right">
                        <div className="font-mono-num font-bold">{formatINR(balance)} due</div>
                        <div className="text-[11px] text-[#64748B] font-mono-num">Paid {formatINR(inv.paidAmount)}</div>
                      </div>
                      <StatusText status={inv.status} />
                      {balance > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setPaymentNotice(
                              'Online payment gateway integration is modular and disabled in UI prototype mode (no fake transactions). Ask your PG owner to record your UPI/Bank transfer in Rent Collection.'
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-[#047857] text-white font-semibold"
                        >
                          Pay Online
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4">
            <h2 className="text-sm font-semibold mb-3">Recorded Payments &amp; Receipts</h2>
            <div className="space-y-2">
              {myPayments.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="font-semibold font-mono-num">{formatINR(p.amount)} · {p.method}</div>
                    <div className="text-[#64748B] dark:text-[#9CA3AF]">
                      Ref: {p.reference} · {p.paidAt}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Download className="w-3.5 h-3.5" /> Receipt
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'food' && (
        <div className="space-y-4">
          {!property?.foodAvailable ? (
            <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-6 text-center text-sm text-[#64748B]">
              Food service is not included at this property.
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-[#047857] dark:text-[#34D399]" /> Weekly Mess Menu
                  </h2>
                  <span className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
                    B: 7:30–9:30 AM · L: 12:30–2:30 PM · D: 7:30–9:30 PM
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B] dark:text-[#9CA3AF]">
                        <th className="py-2 pr-3 font-medium">Day</th>
                        <th className="py-2 pr-3 font-medium">Breakfast</th>
                        <th className="py-2 pr-3 font-medium">Lunch</th>
                        <th className="py-2 font-medium">Dinner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
                      {foodMenu.map((d) => (
                        <tr key={d.day}>
                          <td className="py-2.5 pr-3 font-semibold whitespace-nowrap">{d.day}</td>
                          <td className="py-2.5 pr-3">{d.breakfast}</td>
                          <td className="py-2.5 pr-3">{d.lunch}</td>
                          <td className="py-2.5">{d.dinner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-2.5">
                <h3 className="text-sm font-semibold">Share Meal Feedback</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={mealFeedback}
                    onChange={(e) => {
                      setMealFeedback(e.target.value);
                      setMealFeedbackSent(false);
                    }}
                    placeholder="Comment on taste, hygiene, or portion size..."
                    className="flex-1 h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (mealFeedback.trim()) {
                        setMealFeedback('');
                        setMealFeedbackSent(true);
                      }
                    }}
                    className="px-4 h-9 rounded-xl bg-[#047857] text-white text-xs font-semibold"
                  >
                    Send
                  </button>
                </div>
                {mealFeedbackSent && (
                  <p className="text-xs text-[#059669] dark:text-[#34D399]">Feedback sent to kitchen manager.</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'complaints' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <form
            onSubmit={handleComplaintSubmit}
            className="lg:col-span-5 rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3"
          >
            <h2 className="text-sm font-semibold">Raise Complaint or Maintenance</h2>
            <input
              type="text"
              value={cmpTitle}
              onChange={(e) => setCmpTitle(e.target.value)}
              placeholder="Short title (e.g., Tap leaking in bathroom)"
              className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-xs"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={cmpCategory}
                onChange={(e) => setCmpCategory(e.target.value as ComplaintItem['category'])}
                className="h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-xs"
              >
                {['Electrical', 'Plumbing', 'Wi-Fi', 'Cleaning', 'Furniture', 'Food', 'Water', 'Security', 'Other'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={cmpPriority}
                onChange={(e) => setCmpPriority(e.target.value as ComplaintItem['priority'])}
                className="h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-xs"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>
            <textarea
              rows={3}
              value={cmpDesc}
              onChange={(e) => setCmpDesc(e.target.value)}
              placeholder="Describe the issue clearly..."
              className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-xs"
            />
            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-[#047857] text-white text-xs font-semibold"
            >
              Submit Request
            </button>

            <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#374151] text-xs text-[#64748B] dark:text-[#9CA3AF] space-y-1">
              <div className="font-semibold text-[#DC2626] dark:text-[#F87171] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> Emergency Contacts (Separate from maintenance)
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Police: 112 · Fire: 101 · Ambulance: 108 · Warden: {property?.ownerMobile}
              </div>
            </div>
          </form>

          <div className="lg:col-span-7 rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3">
            <h2 className="text-sm font-semibold">My Request History</h2>
            {myComplaints.length === 0 ? (
              <p className="text-xs text-[#64748B]">No complaints submitted yet.</p>
            ) : (
              myComplaints.map((c) => (
                <div key={c.id} className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{c.title}</span>
                    <StatusText status={c.status} />
                  </div>
                  <div className="text-[#64748B] dark:text-[#9CA3AF]">
                    {c.category} · {c.priority} Priority · {c.createdAt}
                  </div>
                  <p>{c.description}</p>
                  {c.ownerResponse && (
                    <div className="p-2 rounded-lg bg-[#F8FAFC] dark:bg-[#1F2937] text-[#047857] dark:text-[#34D399]">
                      Owner note: {c.ownerResponse}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'notices' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3">
          <h2 className="text-sm font-semibold">Property Notices &amp; Announcements</h2>
          {myNotices.map((n) => {
            const isRead = n.readByTenantIds.includes(myStay.tenantId);
            return (
              <div key={n.id} className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm">{n.title}</span>
                  <span className="text-[#64748B]">{n.publishedAt}</span>
                </div>
                <p className="text-[#64748B] dark:text-[#9CA3AF]">{n.message}</p>
                {!isRead && (
                  <button
                    type="button"
                    onClick={() => markNoticeRead(n.id, myStay.tenantId)}
                    className="text-xs font-semibold text-[#047857] dark:text-[#34D399] hover:underline"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'documents' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3 text-xs">
          <h2 className="text-sm font-semibold">Stay Documents &amp; Privacy</h2>
          <p className="text-[#64748B] dark:text-[#9CA3AF]">
            PG Finder collects only necessary stay verification details and does not require Aadhaar numbers by default.
          </p>
          <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex items-center justify-between">
            <div>
              <div className="font-semibold">Digital Stay Agreement — Room {room?.roomNumber}</div>
              <div className="text-[#64748B] mt-0.5">Accepted on {myStay.joiningDate}</div>
            </div>
            <StatusText status="Verified" />
          </div>
          <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex items-center justify-between">
            <div>
              <div className="font-semibold">College / Employment ID Proof</div>
              <div className="text-[#64748B] mt-0.5">Stored in private encrypted bucket abstraction</div>
            </div>
            <StatusText status={myStay.documentStatus} />
          </div>
        </div>
      )}

      {tab === 'parcels' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3">
          <h2 className="text-sm font-semibold">My Parcels &amp; Deliveries</h2>
          {myParcels.length === 0 ? (
            <p className="text-xs text-[#64748B]">No parcels recorded for your stay.</p>
          ) : (
            myParcels.map((prc) => (
              <div
                key={prc.id}
                className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="font-semibold">{prc.description}</div>
                  <div className="text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
                    Received: {prc.receivedAt} · {prc.instructions}
                  </div>
                </div>
                <StatusText status={prc.status} />
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'checkout' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-4">
          <h2 className="text-sm font-semibold">Checkout &amp; Security Deposit Settlement</h2>
          {myCheckout ? (
            <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">Checkout Request Submitted</span>
                <StatusText status={myCheckout.status} />
              </div>
              <div>Requested Departure Date: {myCheckout.requestedDate}</div>
              <div>Security Deposit Held: {formatINR(myCheckout.depositHeld)}</div>
              <div>Pending Rent: {formatINR(myCheckout.pendingRent)}</div>
              <div>Proposed Deductions: {formatINR(myCheckout.proposedDeductions)}</div>
              <div className="font-semibold pt-2 border-t border-[#E2E8F0] dark:border-[#374151]">
                Estimated Net Refund:{' '}
                <span className="font-mono-num">
                  {formatINR(Math.max(0, myCheckout.depositHeld - myCheckout.pendingRent - myCheckout.proposedDeductions))}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <p className="text-[#64748B] dark:text-[#9CA3AF]">
                Your property requires a {property?.noticePeriodDays}-day advance notice. Your assigned bed remains occupied until checkout settlement is completed by the owner.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                <div>
                  <label className="block font-medium mb-1">Planned Checkout Date</label>
                  <input
                    type="date"
                    value={checkoutDate}
                    onChange={(e) => setCheckoutDate(e.target.value)}
                    className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => requestCheckout(myStay.id, checkoutDate)}
                  className="h-10 px-4 rounded-xl bg-[#047857] text-white font-semibold"
                >
                  Request Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
