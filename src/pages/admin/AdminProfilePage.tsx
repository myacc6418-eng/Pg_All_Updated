import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Lock, LogOut, Pencil, ShieldCheck, UserCheck } from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import { KpiCard, ModalSheet, StatusText, ThemeSwitch } from '../../components/ui/Primitives';
import { UserAccount } from '../../types/pgfinder';

const LANGUAGES: NonNullable<UserAccount['languagePreference']>[] = [
  'English',
  'Hindi',
  'Telugu',
  'Kannada',
  'Tamil',
];

export const AdminProfilePage: React.FC = () => {
  const {
    currentUser,
    auditLogs,
    supportTickets,
    unifiedDocuments,
    adminNotifications,
    updateCurrentUserProfile,
    logout,
  } = usePGFinder();
  const navigate = useNavigate();

  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(currentUser?.name || 'Ananya Rao');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [mobile, setMobile] = useState(currentUser?.mobile || '');
  const [city, setCity] = useState(currentUser?.city || 'Bengaluru');

  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdMsg, setPwdMsg] = useState('');
  const [policyOpen, setPolicyOpen] = useState(false);
  const [notifAlerts, setNotifAlerts] = useState(true);
  const [notifSecurity, setNotifSecurity] = useState(true);
  const [banner, setBanner] = useState('');

  // Dynamic governance KPIs computed from live context arrays
  const activityKpis = useMemo(() => {
    const propsReviewed = auditLogs.filter((a) => a.action.includes('PROPERTY_REVIEW')).length;
    const locationsVerified = auditLogs.filter((a) => a.action.includes('LOCATION_VERIFY')).length;
    const docsReviewed = unifiedDocuments.filter((d) => d.verificationStatus === 'Verified').length;
    const ticketsResolved = supportTickets.filter(
      (t) => t.status === 'Resolved' || t.status === 'Closed'
    ).length;
    const noticesPublished = adminNotifications.filter((n) => n.status === 'Published').length;
    return {
      propsReviewed,
      locationsVerified,
      docsReviewed,
      ticketsResolved,
      noticesPublished,
    };
  }, [auditLogs, unifiedDocuments, supportTickets, adminNotifications]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#047857] dark:bg-[#34D399] text-white dark:text-[#0B1220] font-bold flex items-center justify-center text-base shrink-0">
            {currentUser?.avatarInitials || 'AR'}
          </div>
          <div>
            <h1 className="text-xl font-bold font-display">{currentUser?.name || 'Super Admin'}</h1>
            <p className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
              {currentUser?.assignedAdminRole || 'Platform Super Administrator'} · {currentUser?.city || 'Bengaluru'}
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
              setCity(currentUser?.city || 'Bengaluru');
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
        <div className="p-3 rounded-xl border border-[#059669]/30 bg-[#059669]/10 text-[#059669] dark:text-[#34D399] text-xs flex items-center justify-between gap-2">
          <span>{banner}</span>
          <button type="button" onClick={() => setBanner('')} className="font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Dynamic Governance Activity KPIs */}
      <section>
        <h2 className="text-sm font-semibold mb-2.5">Governance Activity Overview (Live Session State)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard label="Properties Reviewed" value={activityKpis.propsReviewed} onClick={() => navigate('/admin/approvals')} />
          <KpiCard label="Locations Verified" value={activityKpis.locationsVerified} tone="success" onClick={() => navigate('/admin/locations')} />
          <KpiCard label="Documents Verified" value={activityKpis.docsReviewed} tone="info" onClick={() => navigate('/admin/documents')} />
          <KpiCard label="Tickets Resolved" value={activityKpis.ticketsResolved} tone="primary" onClick={() => navigate('/admin/support')} />
          <KpiCard label="Notices Published" value={activityKpis.noticesPublished} onClick={() => navigate('/admin/notifications')} />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
        {/* Account & Role Scope */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <UserCheck className="w-4 h-4 text-[#047857] dark:text-[#34D399]" />
            <span>Administrator Account &amp; Access Scope</span>
          </div>
          <div className="space-y-2 divide-y divide-[#E2E8F0] dark:divide-[#374151]">
            <div className="pt-1 flex justify-between">
              <span className="text-[#64748B]">Admin ID</span>
              <span className="font-mono-num">{currentUser?.id || 'usr-admin-1'}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-[#64748B]">Full Name</span>
              <span className="font-medium">{currentUser?.name}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-[#64748B]">Email</span>
              <span>{currentUser?.email}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-[#64748B]">Mobile</span>
              <span className="font-mono-num">{currentUser?.mobile}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-[#64748B]">Assigned Governance Role</span>
              <span className="font-semibold text-[#047857] dark:text-[#34D399]">
                {currentUser?.assignedAdminRole || 'Platform Super Administrator'}
              </span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-[#64748B]">Account Status</span>
              <StatusText status={currentUser?.status || 'Active'} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-[#374151] text-[#64748B] flex items-start gap-2">
            <Lock className="w-4 h-4 text-[#047857] shrink-0 mt-0.5" />
            <span>
              Role escalation guard: Administrator role privileges cannot be modified from self-service profile forms.
            </span>
          </div>
        </div>

        {/* Security & Console Preferences */}
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-4">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4 text-[#047857] dark:text-[#34D399]" />
            <span>Security &amp; Console Preferences</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Theme Appearance</span>
              <ThemeSwitch />
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Console Language</span>
              <select
                value={currentUser?.languagePreference || 'English'}
                onChange={(e) => {
                  const lang = e.target.value as NonNullable<UserAccount['languagePreference']>;
                  updateCurrentUserProfile({ languagePreference: lang });
                  setBanner(`Console language updated to ${lang}.`);
                }}
                className="h-9 px-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center justify-between">
              <span>Pending Property &amp; Location Alerts</span>
              <input
                type="checkbox"
                checked={notifAlerts}
                onChange={(e) => setNotifAlerts(e.target.checked)}
                className="accent-[#047857]"
              />
            </label>

            <label className="flex items-center justify-between">
              <span>Security &amp; Blocked Event Digests</span>
              <input
                type="checkbox"
                checked={notifSecurity}
                onChange={(e) => setNotifSecurity(e.target.checked)}
                className="accent-[#047857]"
              />
            </label>

            <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-1">
              <div className="flex justify-between font-medium">
                <span>Active Console Session</span>
                <StatusText status="Active" />
              </div>
              <div className="text-[#64748B]">
                Two-Factor Auth (2FA): Recommended for production Admin access (UI prototype session active)
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
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
                onClick={() => setPolicyOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] font-medium"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Governance &amp; Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal (Role & Permissions strictly excluded from editability) */}
      <ModalSheet open={editOpen} onClose={() => setEditOpen(false)} title="Edit Administrator Profile">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateCurrentUserProfile({
              name: name.trim() || currentUser?.name,
              email: email.trim() || currentUser?.email,
              mobile: mobile.trim() || currentUser?.mobile,
              city: city.trim() || currentUser?.city,
            });
            setBanner('Administrator contact details updated.');
            setEditOpen(false);
          }}
          className="space-y-3 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Full Name *</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]" />
            </div>
            <div>
              <label className="block font-medium mb-1">Email *</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]" />
            </div>
            <div>
              <label className="block font-medium mb-1">Mobile *</label>
              <input type="tel" required value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num" />
            </div>
            <div>
              <label className="block font-medium mb-1">Base City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]" />
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
            Role ({currentUser?.role}) &amp; Governance Level ({currentUser?.assignedAdminRole || 'Platform Super Administrator'}) are locked.
          </div>
          <button type="submit" className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold">
            Save Contact Details
          </button>
        </form>
      </ModalSheet>

      {/* Change Password Modal */}
      <ModalSheet open={pwdOpen} onClose={() => setPwdOpen(false)} title="Change Admin Password" maxWidth="max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPwdMsg('Password rotation recorded for current prototype session.');
          }}
          className="space-y-3 text-xs"
        >
          <input type="password" required placeholder="Current Password" className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]" />
          <input type="password" required placeholder="New Strong Password" className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]" />
          <input type="password" required placeholder="Confirm New Password" className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]" />
          {pwdMsg && <div className="text-[#059669] font-medium">{pwdMsg}</div>}
          <button type="submit" className="w-full h-9 rounded-xl bg-[#047857] text-white font-semibold">
            Update Password
          </button>
        </form>
      </ModalSheet>

      {/* Legal / Security Policy Modal */}
      <ModalSheet open={policyOpen} onClose={() => setPolicyOpen(false)} title="Super Admin Governance & Privacy Policy">
        <div className="space-y-2.5 text-xs text-[#64748B] dark:text-[#9CA3AF]">
          <p>1. Property Approvals and GPS Location Verifications are independent sequential compliance checks.</p>
          <p>2. Tenant personal expenses and continuous GPS location are strictly private; Admins review only property coordinates and voluntary emergency sharing requests.</p>
          <p>3. Support Ticket Internal Notes remain hidden from Tenants and PG Owners.</p>
          <p>4. Audit logs and historical financial/stay/verification records are append-only and non-deletable.</p>
        </div>
      </ModalSheet>
    </div>
  );
};
