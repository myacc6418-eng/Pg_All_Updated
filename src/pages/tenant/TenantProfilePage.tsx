import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import { StatusText, ThemeSwitch } from '../../components/ui/Primitives';

export const TenantProfilePage: React.FC = () => {
  const {
    currentUser,
    stays,
    properties,
    savedPropertyIds,
    savedEventIds,
    events,
    locationRequests,
    tenantRespondLocationRequest,
    autoImportConfirmedRent,
    setAutoImportConfirmedRent,
    supportTickets,
    createSupportTicket,
    logout,
  } = usePGFinder();
  const navigate = useNavigate();

  const [rentReminders, setRentReminders] = useState(true);
  const [eventAlerts, setEventAlerts] = useState(true);
  const [subject, setSubject] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  const myStays = stays.filter((s) => s.tenantId === currentUser?.id);
  const myLocationRequests = locationRequests.filter((l) => l.tenantId === currentUser?.id);
  const myTickets = supportTickets.filter((t) => t.userId === currentUser?.id);
  const savedPgs = properties.filter((p) => savedPropertyIds.includes(p.id));
  const savedEvts = events.filter((e) => savedEventIds.includes(e.id));

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold font-display">Profile &amp; Settings</h1>

      <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#047857]/15 dark:bg-[#34D399]/15 text-[#047857] dark:text-[#34D399] font-bold flex items-center justify-center">
            {currentUser?.avatarInitials || 'AS'}
          </div>
          <div>
            <div className="text-base font-semibold">{currentUser?.name}</div>
            <div className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
              {currentUser?.email} · {currentUser?.mobile} · {currentUser?.city}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/auth');
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] text-xs font-semibold text-[#DC2626] dark:text-[#F87171] hover:bg-slate-50 dark:hover:bg-slate-800 self-start"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </div>

      {myLocationRequests.length > 0 && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-2.5 text-xs">
          <h2 className="text-sm font-semibold">Safety &amp; Handover Location Sharing Requests (Voluntary Consent)</h2>
          <p className="text-[#64748B] dark:text-[#9CA3AF]">
            PG Finder never tracks your background location. Only requests approved by Super Admin appear here for your explicit permission.
          </p>
          {myLocationRequests.map((lr) => (
            <div key={lr.id} className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-semibold">
                  {lr.ownerName} · {lr.category}
                </div>
                <div className="text-[#64748B]">
                  {lr.reason} ({lr.requestedDurationHours}h window)
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusText status={lr.status} />
                {lr.status === 'Awaiting Tenant Permission' && (
                  <>
                    <button
                      type="button"
                      onClick={() => tenantRespondLocationRequest(lr.id, 'Voluntarily Shared')}
                      className="px-3 py-1.5 rounded-lg bg-[#047857] text-white font-semibold"
                    >
                      Accept &amp; Share Location
                    </button>
                    <button
                      type="button"
                      onClick={() => tenantRespondLocationRequest(lr.id, 'Declined by Tenant')}
                      className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] text-[#DC2626] font-semibold"
                    >
                      Decline
                    </button>
                  </>
                )}
                {lr.status === 'Voluntarily Shared' && (
                  <button
                    type="button"
                    onClick={() => tenantRespondLocationRequest(lr.id, 'Revoked')}
                    className="px-3 py-1.5 rounded-lg border border-[#DC2626] text-[#DC2626] font-semibold"
                  >
                    Revoke Access
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3">
          <h2 className="text-sm font-semibold">Preferences &amp; Privacy</h2>
          <div className="flex items-center justify-between text-xs py-1.5 border-b border-[#E2E8F0] dark:border-[#374151]">
            <span>Appearance Theme</span>
            <ThemeSwitch />
          </div>
          <label className="flex items-center justify-between text-xs py-1.5 border-b border-[#E2E8F0] dark:border-[#374151]">
            <span>Import confirmed rent to personal expense tracker</span>
            <input
              type="checkbox"
              checked={autoImportConfirmedRent}
              onChange={(e) => setAutoImportConfirmedRent(e.target.checked)}
              className="accent-[#047857]"
            />
          </label>
          <label className="flex items-center justify-between text-xs py-1.5 border-b border-[#E2E8F0] dark:border-[#374151]">
            <span>Rent due reminders</span>
            <input
              type="checkbox"
              checked={rentReminders}
              onChange={(e) => setRentReminders(e.target.checked)}
              className="accent-[#047857]"
            />
          </label>
          <label className="flex items-center justify-between text-xs py-1.5">
            <span>Startup event notifications</span>
            <input
              type="checkbox"
              checked={eventAlerts}
              onChange={(e) => setEventAlerts(e.target.checked)}
              className="accent-[#047857]"
            />
          </label>
          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1F2937]/60 text-xs text-[#64748B] dark:text-[#9CA3AF] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#047857] dark:text-[#34D399] shrink-0 mt-0.5" />
            <span>
              Data minimization active: Aadhaar copies are not required by default, and users under 18 require verified guardian consent for stay agreements.
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3">
          <h2 className="text-sm font-semibold">Stay History, Saved PGs &amp; Events</h2>
          <div className="space-y-2 text-xs">
            {myStays.map((s) => {
              const p = properties.find((x) => x.id === s.propertyId);
              return (
                <div key={s.id} className="p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{p?.name}</div>
                    <div className="text-[#64748B]">Joined {s.joiningDate}</div>
                  </div>
                  <StatusText status={s.status} />
                </div>
              );
            })}
            <div className="text-[#64748B] dark:text-[#9CA3AF] pt-1">
              Saved PGs: {savedPgs.map((p) => p.name).join(', ') || 'None'}
            </div>
            <div className="text-[#64748B] dark:text-[#9CA3AF]">
              Bookmarked Events: {savedEvts.map((e) => e.title).join(', ') || 'None'}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!subject.trim() || !currentUser) return;
              createSupportTicket({
                userId: currentUser.id,
                userName: currentUser.name,
                userRole: currentUser.role,
                category: 'Account',
                subject: subject.trim(),
                priority: 'Medium',
              });
              setSubject('');
              setTicketSent(true);
            }}
            className="pt-3 border-t border-[#E2E8F0] dark:border-[#374151] space-y-2"
          >
            <div className="text-xs font-semibold">Help &amp; Support</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setTicketSent(false);
                }}
                placeholder="Describe an issue for PG Finder Support..."
                className="flex-1 h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-xs"
              />
              <button type="submit" className="px-3.5 h-9 rounded-xl bg-[#047857] text-white text-xs font-semibold">
                Submit
              </button>
            </div>
            {ticketSent && <p className="text-xs text-[#059669]">Support ticket logged for Super Admin review.</p>}
            {myTickets.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {myTickets.map((t) => (
                  <div key={t.id} className="p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold truncate">{t.subject}</span>
                      <StatusText status={t.status} />
                    </div>
                    <div className="text-[#64748B] dark:text-[#9CA3AF]">Latest reply: {t.lastReply}</div>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
