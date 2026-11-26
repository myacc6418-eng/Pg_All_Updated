import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, HelpCircle, KeyRound, LogOut, Pencil, ShieldCheck } from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import { KpiCard, ModalSheet, StatusText, ThemeSwitch } from '../../components/ui/Primitives';
import { SupportTicket, UserAccount } from '../../types/pgfinder';

const LANGUAGES: NonNullable<UserAccount['languagePreference']>[] = [
  'English',
  'Hindi',
  'Telugu',
  'Kannada',
  'Tamil',
];

export const OwnerProfilePage: React.FC = () => {
  const {
    currentUser,
    properties,
    rooms,
    beds,
    stays,
    supportTickets,
    createSupportTicket,
    updateCurrentUserProfile,
    logout,
  } = usePGFinder();

  const navigate = useNavigate();

  const ownerProps = useMemo(
    () => properties.filter((p) => p.ownerId === (currentUser?.id || 'usr-owner-1') && !p.archived),
    [properties, currentUser]
  );
  const ownerPropIds = ownerProps.map((p) => p.id);
  const ownerRooms = rooms.filter((r) => ownerPropIds.includes(r.propertyId));
  const ownerBeds = beds.filter((b) => ownerPropIds.includes(b.propertyId));
  const activeTenants = stays.filter((s) => ownerPropIds.includes(s.propertyId) && s.status === 'Active').length;

  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [mobile, setMobile] = useState(currentUser?.mobile || '');
  const [altMobile, setAltMobile] = useState(currentUser?.alternateMobile || '');
  const [city, setCity] = useState(currentUser?.city || 'Bengaluru');
  const [bizName, setBizName] = useState(currentUser?.businessName || '');
  const [bizAddr, setBizAddr] = useState(currentUser?.businessAddress || '');

  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdMsg, setPwdMsg] = useState('');
  const [notifRent, setNotifRent] = useState(true);
  const [notifJoining, setNotifJoining] = useState(true);
  const [legalOpen, setLegalOpen] = useState(false);
  const [banner, setBanner] = useState('');
  const [ticketCat, setTicketCat] = useState<SupportTicket['category']>('Property Verification');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');

  const ownerTickets = useMemo(
    () => supportTickets.filter((t) => t.userId === (currentUser?.id || 'usr-owner-1')),
    [supportTickets, currentUser]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#047857] dark:bg-[#34D399] text-white dark:text-[#0B1220] font-bold flex items-center justify-center text-base shrink-0">
            {currentUser?.avatarInitials || 'VR'}
          </div>
          <div>
            <h1 className="text-xl font-bold font-display">{currentUser?.name || 'PG Owner'}</h1>
            <p className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
              {currentUser?.businessName || 'PG Hospitality'} · {currentUser?.subscriptionPlan || 'Pro'} Plan
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setName(currentUser?.name || '');
              setEmail(currentUser?.email || '');
              setMobile(currentUser?.mobile || '');
              setAltMobile(currentUser?.alternateMobile || '');
              setCity(currentUser?.city || 'Bengaluru');
              setBizName(currentUser?.businessName || '');
              setBizAddr(currentUser?.businessAddress || '');
              setEditOpen(true);
            }}
            className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] text-xs font-semibold"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit Profile
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/auth');
            }}
            className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] text-[#DC2626] dark:text-[#F87171] bg-white dark:bg-[#111827] text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
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

      {/* Property Overview KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Properties Managed" value={ownerProps.length} onClick={() => navigate('/owner/properties')} />
        <KpiCard label="Total Rooms" value={ownerRooms.length} onClick={() => navigate('/owner/vacancies')} />
        <KpiCard label="Total Beds" value={ownerBeds.length} onClick={() => navigate('/owner/vacancies')} />
        <KpiCard label="Active Tenants" value={activeTenants} tone="primary" onClick={() => navigate('/owner/tenants')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
        {/* Personal & Business Info */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <Building2 className="w-4 h-4 text-[#047857] dark:text-[#34D399]" />
            <span>Personal &amp; Business Information</span>
          </div>
          <div className="space-y-2 divide-y divide-[#E2E8F0] dark:divide-[#374151]">
            <div className="pt-1 flex justify-between">
              <span className="text-[#64748B]">Full Name</span>
              <span className="font-medium">{currentUser?.name}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-[#64748B]">Primary Mobile</span>
              <span className="font-mono-num">{currentUser?.mobile}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-[#64748B]">Alternate Mobile</span>
              <span className="font-mono-num">{currentUser?.alternateMobile || 'Not set'}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-[#64748B]">Email</span>
              <span>{currentUser?.email}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-[#64748B]">Business / PG Group</span>
              <span className="font-medium">{currentUser?.businessName || 'Independent PG Operator'}</span>
            </div>
            <div className="pt-2 flex justify-between gap-4">
              <span className="text-[#64748B] shrink-0">Office Address</span>
              <span className="text-right">{currentUser?.businessAddress || currentUser?.city}</span>
            </div>
          </div>
        </div>

        {/* Subscription & Settings */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Subscription Plan: {currentUser?.subscriptionPlan || 'Pro'}</div>
              <div className="text-[#64748B]">Includes multi-property management &amp; public listing slots</div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/owner/more?section=subscription')}
              className="px-3 py-1.5 rounded-xl bg-[#047857] text-white font-semibold"
            >
              Manage Plan
            </button>
          </div>

          <div className="space-y-3 pt-3 border-t border-[#E2E8F0] dark:border-[#374151]">
            <div className="flex items-center justify-between">
              <span className="font-medium">Theme Appearance</span>
              <ThemeSwitch />
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">App Language Preference</span>
              <select
                value={currentUser?.languagePreference || 'English'}
                onChange={(e) => {
                  const lang = e.target.value as NonNullable<UserAccount['languagePreference']>;
                  updateCurrentUserProfile({ languagePreference: lang });
                  setBanner(`Language preference updated to ${lang}.`);
                }}
                aria-label="Language preference"
                className="h-9 px-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center justify-between">
              <span>Rent Due &amp; Overdue Alerts</span>
              <input
                type="checkbox"
                checked={notifRent}
                onChange={(e) => setNotifRent(e.target.checked)}
                className="accent-[#047857]"
              />
            </label>

            <label className="flex items-center justify-between">
              <span>New Joining Request Alerts</span>
              <input
                type="checkbox"
                checked={notifJoining}
                onChange={(e) => setNotifJoining(e.target.checked)}
                className="accent-[#047857]"
              />
            </label>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPwdMsg('');
                  setPwdOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] font-medium"
              >
                <KeyRound className="w-3.5 h-3.5" /> Change Password
              </button>
              <button
                type="button"
                onClick={() => setLegalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] font-medium"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Privacy &amp; Terms
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Owner Help & Support (Public Replies Only) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!ticketSubject.trim()) return;
            createSupportTicket({
              userId: currentUser?.id || 'usr-owner-1',
              userName: currentUser?.name || 'PG Owner',
              userRole: 'PG_OWNER',
              userMobile: currentUser?.mobile,
              userEmail: currentUser?.email,
              category: ticketCat,
              subject: ticketSubject.trim(),
              description: ticketDesc.trim() || undefined,
              priority: 'Medium',
            });
            setTicketSubject('');
            setTicketDesc('');
            setBanner('Support ticket submitted to Super Admin Help Desk.');
          }}
          className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-2.5"
        >
          <div className="flex items-center gap-2 font-semibold text-sm">
            <HelpCircle className="w-4 h-4 text-[#047857] dark:text-[#34D399]" />
            <span>Contact Platform Support</span>
          </div>
          <select
            value={ticketCat}
            onChange={(e) => setTicketCat(e.target.value as SupportTicket['category'])}
            className="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
          >
            {[
              'Property Verification',
              'Location Verification',
              'Document Verification',
              'Subscription',
              'Payment',
              'Listing',
              'Featured PG',
              'Technical Issue',
              'Other',
            ].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="text"
            required
            value={ticketSubject}
            onChange={(e) => setTicketSubject(e.target.value)}
            placeholder="Ticket subject..."
            className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
          />
          <textarea
            rows={2}
            value={ticketDesc}
            onChange={(e) => setTicketDesc(e.target.value)}
            placeholder="Describe your request for the Super Admin team..."
            className="w-full p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
          />
          <button type="submit" className="h-9 px-4 rounded-xl bg-[#047857] text-white font-semibold">
            Submit Support Ticket
          </button>
        </form>

        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-2.5">
          <div className="font-semibold text-sm">My Support Tickets ({ownerTickets.length})</div>
          {ownerTickets.length === 0 ? (
            <p className="text-[#64748B]">No support tickets raised yet.</p>
          ) : (
            ownerTickets.map((t) => (
              <div key={t.id} className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-1">
                <div className="flex justify-between font-semibold gap-2">
                  <span className="truncate">{t.subject}</span>
                  <StatusText status={t.status} />
                </div>
                <div className="text-[#64748B]">
                  {t.category} · <span className="font-mono-num">{t.createdAt}</span>
                </div>
                <div className="text-[#111827] dark:text-[#F9FAFB] pt-0.5">
                  Latest Reply: {t.lastReply}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <ModalSheet open={editOpen} onClose={() => setEditOpen(false)} title="Edit Owner Profile">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateCurrentUserProfile({
              name: name.trim() || currentUser?.name,
              email: email.trim() || currentUser?.email,
              mobile: mobile.trim() || currentUser?.mobile,
              alternateMobile: altMobile.trim(),
              city: city.trim() || currentUser?.city,
              businessName: bizName.trim(),
              businessAddress: bizAddr.trim(),
            });
            setBanner('Owner profile details updated.');
            setEditOpen(false);
          }}
          className="space-y-3 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Primary Mobile</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Alternate Mobile</label>
              <input
                type="tel"
                value={altMobile}
                onChange={(e) => setAltMobile(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Business Name</label>
              <input
                type="text"
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Business Address</label>
            <input
              type="text"
              value={bizAddr}
              onChange={(e) => setBizAddr(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            />
          </div>
          <button type="submit" className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold">
            Save Profile
          </button>
        </form>
      </ModalSheet>

      {/* Change Password Modal */}
      <ModalSheet open={pwdOpen} onClose={() => setPwdOpen(false)} title="Change Account Password">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPwdMsg('Password update confirmed for this session.');
          }}
          className="space-y-3 text-xs"
        >
          <input
            type="password"
            required
            placeholder="Current Password"
            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
          />
          <input
            type="password"
            required
            placeholder="New Password"
            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
          />
          <input
            type="password"
            required
            placeholder="Confirm New Password"
            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
          />
          {pwdMsg && <div className="text-[#059669] font-medium">{pwdMsg}</div>}
          <button type="submit" className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold">
            Update Password
          </button>
        </form>
      </ModalSheet>

      {/* Legal / Privacy Modal */}
      <ModalSheet open={legalOpen} onClose={() => setLegalOpen(false)} title="PG Finder Owner Privacy & Terms">
        <div className="space-y-2.5 text-xs text-[#64748B] dark:text-[#9CA3AF]">
          <p>
            1. Owner business accounts isolate property financials, invoices, and operating expenses from tenant personal expense trackers.
          </p>
          <p>
            2. Location sharing requests are strictly voluntary, reviewed by Super Admin, and expire automatically after the tenant-approved duration.
          </p>
          <p>
            3. Confirmed rent payments and business expenses are protected against silent deletion; corrections use audit-logged reversals.
          </p>
        </div>
      </ModalSheet>
    </div>
  );
};
