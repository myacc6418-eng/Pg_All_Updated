import React, { useMemo, useState } from 'react';
import { HelpCircle, Lock, MapPin, MessageSquarePlus, Send, ShieldAlert } from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import {
  ActionBtn,
  KpiCard,
  ModalSheet,
  StatusText,
} from '../../components/ui/Primitives';
import { AdminDataTable, TableColumn } from '../../components/ui/AdminDataTable';
import { SupportTicket } from '../../types/pgfinder';

export const AdminSupportPage: React.FC = () => {
  const {
    supportTickets,
    propertyReviews,
    properties,
    locationRequests,
    adminReplySupportTicket,
    adminAddSupportInternalNote,
    adminUpdateSupportTicketMeta,
    moderateReviewStatus,
    adminReviewLocationRequest,
  } = usePGFinder();

  const [tab, setTab] = useState<'tickets' | 'reviews' | 'location_requests'>('tickets');
  const [filters, setFilters] = useState<Record<string, string>>({
    status: 'ALL',
    priority: 'ALL',
    category: 'ALL',
    role: 'ALL',
  });

  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyNextStatus, setReplyNextStatus] = useState<SupportTicket['status']>('Waiting for User');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [internalNoteText, setInternalNoteText] = useState('');
  const [banner, setBanner] = useState('');

  const ticketKpis = useMemo(() => {
    const open = supportTickets.filter((t) => t.status === 'Open').length;
    const inProgress = supportTickets.filter(
      (t) => t.status === 'In Progress' || t.status === 'Under Review' || t.status === 'Assigned'
    ).length;
    const waiting = supportTickets.filter(
      (t) => t.status === 'Waiting for User' || t.status === 'Awaiting Response' || t.status === 'Waiting for Admin'
    ).length;
    const resolved = supportTickets.filter((t) => t.status === 'Resolved').length;
    const closed = supportTickets.filter((t) => t.status === 'Closed').length;
    const highUrgent = supportTickets.filter(
      (t) => (t.priority === 'High' || t.priority === 'Urgent') && t.status !== 'Closed'
    ).length;
    return {
      total: supportTickets.length,
      open,
      inProgress,
      waiting,
      resolved,
      closed,
      highUrgent,
    };
  }, [supportTickets]);

  const filteredTickets = useMemo(() => {
    return supportTickets.filter((t) => {
      if (filters.status !== 'ALL' && t.status !== filters.status) return false;
      if (filters.priority !== 'ALL' && t.priority !== filters.priority) return false;
      if (filters.category !== 'ALL' && t.category !== filters.category) return false;
      if (filters.role !== 'ALL' && t.userRole !== filters.role) return false;
      return true;
    });
  }, [supportTickets, filters]);

  const openTicketModal = (t: SupportTicket) => {
    setActiveTicket(t);
    setReplyText('');
    setReplyNextStatus(t.status === 'Resolved' || t.status === 'Closed' ? t.status : 'Waiting for User');
    setResolutionSummary(t.resolutionSummary || '');
    setInternalNoteText('');
  };

  const liveTicket = activeTicket
    ? supportTickets.find((t) => t.id === activeTicket.id) || activeTicket
    : null;

  const ticketColumns: TableColumn<SupportTicket>[] = [
    {
      key: 'ticketCode',
      label: 'Ticket ID',
      sortable: true,
      sortValue: (t) => t.ticketCode || t.id,
      csvValue: (t) => t.ticketCode || t.id,
      render: (t) => <span className="font-mono-num text-[11px] font-semibold">{t.ticketCode || t.id}</span>,
    },
    {
      key: 'userName',
      label: 'Submitted By',
      sortable: true,
      sortValue: (t) => t.userName,
      csvValue: (t) => `${t.userName} (${t.userRole})`,
      render: (t) => (
        <div>
          <div className="font-semibold">{t.userName}</div>
          <div className="text-[11px] text-[#64748B]">
            {t.userRole === 'PG_OWNER' ? 'PG Owner' : 'Tenant'}
          </div>
        </div>
      ),
    },
    {
      key: 'subject',
      label: 'Subject & Category',
      sortable: true,
      sortValue: (t) => t.subject,
      csvValue: (t) => `${t.subject} [${t.category}]`,
      render: (t) => (
        <div>
          <div className="font-medium max-w-xs truncate">{t.subject}</div>
          <div className="text-[11px] text-[#64748B]">{t.category}</div>
        </div>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      sortValue: (t) => t.priority,
      csvValue: (t) => t.priority,
      render: (t) => (
        <span
          className={`font-semibold ${
            t.priority === 'Urgent' || t.priority === 'High'
              ? 'text-[#DC2626] dark:text-[#F87171]'
              : t.priority === 'Medium'
              ? 'text-[#D97706]'
              : 'text-[#64748B]'
          }`}
        >
          {t.priority}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      sortValue: (t) => t.status,
      csvValue: (t) => t.status,
      render: (t) => <StatusText status={t.status} />,
    },
    {
      key: 'createdAt',
      label: 'Updated / Created',
      sortable: true,
      sortValue: (t) => t.updatedAt || t.createdAt,
      csvValue: (t) => t.updatedAt || t.createdAt,
      render: (t) => (
        <span className="font-mono-num text-[11px] text-[#64748B]">
          {t.updatedAt || t.createdAt}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (t) => (
        <div className="flex items-center justify-end gap-1">
          <ActionBtn kind="message" compact label="Open" title="Open Ticket & Reply" onClick={() => openTicketModal(t)} />
        </div>
      ),
    },
  ];

  const reportedReviews = useMemo(
    () => propertyReviews.filter((r) => r.reportedStatus !== 'None'),
    [propertyReviews]
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold font-display">Support Help Desk, Moderation &amp; Safety Review</h1>
        <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
          Respond to Tenant and PG Owner tickets, keep private Internal Notes separated, moderate reported reviews, and review consented location sharing requests.
        </p>
      </div>

      {banner && (
        <div className="p-3 rounded-xl border border-[#059669]/30 bg-[#059669]/10 text-[#059669] dark:text-[#34D399] text-xs flex items-center justify-between gap-2">
          <span>{banner}</span>
          <button type="button" onClick={() => setBanner('')} className="font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] w-fit">
        {[
          { id: 'tickets', label: `Support Tickets (${supportTickets.length})`, icon: <HelpCircle className="w-3.5 h-3.5" /> },
          { id: 'reviews', label: `Reported Reviews (${reportedReviews.length})`, icon: <ShieldAlert className="w-3.5 h-3.5" /> },
          { id: 'location_requests', label: `Consented Location Review (${locationRequests.length})`, icon: <MapPin className="w-3.5 h-3.5" /> },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id as typeof tab)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              tab === t.id
                ? 'bg-[#047857] text-white dark:bg-[#34D399] dark:text-[#0B1220]'
                : 'text-[#64748B] dark:text-[#9CA3AF]'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'tickets' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <KpiCard label="Total" value={ticketKpis.total} onClick={() => setFilters({ status: 'ALL', priority: 'ALL', category: 'ALL', role: 'ALL' })} />
            <KpiCard label="Open" value={ticketKpis.open} tone="warning" onClick={() => setFilters((f) => ({ ...f, status: 'Open' }))} />
            <KpiCard label="In Progress" value={ticketKpis.inProgress} tone="info" onClick={() => setFilters((f) => ({ ...f, status: 'In Progress' }))} />
            <KpiCard label="Waiting User" value={ticketKpis.waiting} tone="info" onClick={() => setFilters((f) => ({ ...f, status: 'Waiting for User' }))} />
            <KpiCard label="Resolved" value={ticketKpis.resolved} tone="success" onClick={() => setFilters((f) => ({ ...f, status: 'Resolved' }))} />
            <KpiCard label="Closed" value={ticketKpis.closed} onClick={() => setFilters((f) => ({ ...f, status: 'Closed' }))} />
            <KpiCard label="High / Urgent" value={ticketKpis.highUrgent} tone={ticketKpis.highUrgent > 0 ? 'error' : 'neutral'} onClick={() => setFilters((f) => ({ ...f, priority: 'High' }))} />
          </div>

          <AdminDataTable
            data={filteredTickets}
            columns={ticketColumns}
            rowKey={(t) => t.id}
            searchPlaceholder="Search ticket ID, subject, user name, category..."
            searchExtractor={(t) => `${t.ticketCode || t.id} ${t.subject} ${t.userName} ${t.category}`}
            filters={[
              {
                key: 'role',
                label: 'User Role',
                options: [
                  { label: 'PG Owner', value: 'PG_OWNER' },
                  { label: 'Tenant', value: 'TENANT' },
                ],
              },
              {
                key: 'priority',
                label: 'Priority',
                options: ['Low', 'Medium', 'High', 'Urgent'].map((p) => ({ label: p, value: p })),
              },
              {
                key: 'status',
                label: 'Status',
                options: [
                  'Open',
                  'Under Review',
                  'Assigned',
                  'In Progress',
                  'Waiting for User',
                  'Waiting for Admin',
                  'Resolved',
                  'Closed',
                  'Reopened',
                ].map((s) => ({ label: s, value: s })),
              },
            ]}
            filterValues={filters}
            onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
            onClearFilters={() => setFilters({ status: 'ALL', priority: 'ALL', category: 'ALL', role: 'ALL' })}
            exportFilename="support-tickets-export.csv"
          />
        </div>
      )}

      {tab === 'reviews' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3 text-xs">
          <h2 className="text-sm font-semibold">Owner-Reported Property Reviews ({reportedReviews.length})</h2>
          {reportedReviews.length === 0 ? (
            <p className="text-[#64748B]">No owner-reported reviews awaiting moderation.</p>
          ) : (
            reportedReviews.map((r) => {
              const prop = properties.find((p) => p.id === r.propertyId);
              return (
                <div key={r.id} className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold">{r.tenantDisplayName}</span> · {prop?.name || r.propertyId} ·{' '}
                      <span className="font-mono-num font-semibold">{r.overallRating} ★</span>
                    </div>
                    <StatusText status={r.reportedStatus} />
                  </div>
                  <p className="text-[#111827] dark:text-[#F9FAFB]">&ldquo;{r.message}&rdquo;</p>
                  <div className="text-[#64748B]">Report Reason: {r.reportReason || 'Flagged by owner'}</div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        moderateReviewStatus(r.id, 'Keep');
                        setBanner(`Marked review by ${r.tenantDisplayName} as Reviewed & Kept.`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#059669] text-white font-semibold"
                    >
                      Keep Review Public
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        moderateReviewStatus(r.id, 'Hide');
                        setBanner(`Moderated and archived review by ${r.tenantDisplayName}.`);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-[#DC2626] text-[#DC2626] font-semibold"
                    >
                      Hide Review
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === 'location_requests' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3 text-xs">
          <h2 className="text-sm font-semibold">Consented Location Sharing Requests (Admin Legitimacy Review)</h2>
          <p className="text-[#64748B]">
            Admins review owner safety justification before forwarding a permission prompt to the tenant. Tenants retain final approve/decline/revoke control.
          </p>
          {locationRequests.map((lr) => (
            <div key={lr.id} className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="font-semibold">
                  {lr.ownerName} → {lr.tenantName} · {lr.category}
                </div>
                <div className="text-[#64748B]">{lr.reason} — {lr.explanation}</div>
                <div className="text-[11px] font-mono-num text-[#64748B]">
                  Duration: {lr.requestedDurationHours}h · Submitted: {lr.requestedAt.slice(0, 16).replace('T', ' ')}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusText status={lr.status} />
                {(lr.status === 'Submitted' || lr.status === 'Under Admin Review') && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        adminReviewLocationRequest(lr.id, 'Awaiting Tenant Permission', 'Approved for voluntary tenant consent prompt.');
                        setBanner(`Forwarded request ${lr.id} to tenant ${lr.tenantName} for voluntary permission.`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#047857] text-white font-semibold"
                    >
                      Approve Forwarding
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        adminReviewLocationRequest(lr.id, 'Rejected', 'Justification insufficient for consented location sharing.');
                        setBanner(`Rejected location request ${lr.id}.`);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-[#DC2626] text-[#DC2626] font-semibold"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Support Ticket Conversation & Internal Notes Modal */}
      <ModalSheet
        open={Boolean(liveTicket)}
        onClose={() => setActiveTicket(null)}
        title={liveTicket ? `${liveTicket.ticketCode || liveTicket.id} · ${liveTicket.subject}` : 'Ticket Details'}
        subtitle={liveTicket ? `${liveTicket.userName} (${liveTicket.userRole}) · ${liveTicket.category}` : ''}
        maxWidth="max-w-3xl"
      >
        {liveTicket && (
          <div className="space-y-4 text-xs">
            {/* Meta controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151]">
              <div>
                <label className="block text-[11px] text-[#64748B] mb-1">Status</label>
                <select
                  value={liveTicket.status}
                  onChange={(e) => {
                    adminUpdateSupportTicketMeta(liveTicket.id, {
                      status: e.target.value as SupportTicket['status'],
                    });
                    setBanner(`Updated ticket status to ${e.target.value}.`);
                  }}
                  className="w-full h-8 px-2 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                >
                  {[
                    'Open',
                    'Under Review',
                    'Assigned',
                    'In Progress',
                    'Waiting for User',
                    'Waiting for Admin',
                    'Resolved',
                    'Closed',
                    'Reopened',
                  ].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-[#64748B] mb-1">Priority</label>
                <select
                  value={liveTicket.priority}
                  onChange={(e) => {
                    adminUpdateSupportTicketMeta(liveTicket.id, {
                      priority: e.target.value as SupportTicket['priority'],
                    });
                    setBanner(`Updated ticket priority to ${e.target.value}.`);
                  }}
                  className="w-full h-8 px-2 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                >
                  {['Low', 'Medium', 'High', 'Urgent'].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-[#64748B] mb-1">Assigned Admin</label>
                <input
                  type="text"
                  defaultValue={liveTicket.assignedAdmin || 'Super Admin'}
                  onBlur={(e) =>
                    adminUpdateSupportTicketMeta(liveTicket.id, { assignedAdmin: e.target.value })
                  }
                  className="w-full h-8 px-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                />
              </div>
            </div>

            {/* Public Conversation Thread */}
            <div className="space-y-2">
              <div className="font-semibold">Public Conversation Thread (Visible to User)</div>
              <div className="space-y-2 max-h-56 overflow-y-auto p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#0B1220]">
                {liveTicket.description && (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#374151]">
                    <div className="flex justify-between text-[11px] text-[#64748B]">
                      <span className="font-semibold text-[#111827] dark:text-[#F9FAFB]">{liveTicket.userName}</span>
                      <span className="font-mono-num">{liveTicket.createdAt}</span>
                    </div>
                    <p className="mt-1">{liveTicket.description}</p>
                  </div>
                )}
                {(liveTicket.messages || []).map((m) => (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-xl border ${
                      m.senderRole === 'SUPER_ADMIN'
                        ? 'border-[#047857]/30 bg-[#047857]/5'
                        : 'border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827]'
                    }`}
                  >
                    <div className="flex justify-between text-[11px] text-[#64748B]">
                      <span className="font-semibold text-[#111827] dark:text-[#F9FAFB]">
                        {m.senderName} ({m.senderRole === 'SUPER_ADMIN' ? 'Admin Support' : m.senderRole})
                      </span>
                      <span className="font-mono-num">{m.createdAt}</span>
                    </div>
                    <p className="mt-1">{m.body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Public Reply Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!replyText.trim()) return;
                adminReplySupportTicket(
                  liveTicket.id,
                  replyText.trim(),
                  replyNextStatus,
                  resolutionSummary.trim() || undefined
                );
                setReplyText('');
                setBanner(`Sent public reply on ${liveTicket.ticketCode || liveTicket.id} and notified user.`);
              }}
              className="space-y-2.5 p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151]"
            >
              <div className="font-semibold">Reply to {liveTicket.userName}</div>
              <textarea
                rows={3}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write clear public response visible to the tenant or PG owner..."
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={replyNextStatus}
                  onChange={(e) => setReplyNextStatus(e.target.value as SupportTicket['status'])}
                  className="h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                >
                  <option value="In Progress">Set Status: In Progress</option>
                  <option value="Waiting for User">Set Status: Waiting for User</option>
                  <option value="Resolved">Set Status: Resolved</option>
                  <option value="Closed">Set Status: Closed</option>
                </select>
                {(replyNextStatus === 'Resolved' || replyNextStatus === 'Closed') && (
                  <input
                    type="text"
                    value={resolutionSummary}
                    onChange={(e) => setResolutionSummary(e.target.value)}
                    placeholder="Resolution summary..."
                    className="h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                  />
                )}
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#047857] text-white font-semibold"
              >
                <Send className="w-3.5 h-3.5" /> Send Public Reply
              </button>
            </form>

            {/* Strictly Admin-Only Internal Notes */}
            <div className="space-y-2 p-3 rounded-xl border border-[#D97706]/40 bg-[#D97706]/5">
              <div className="flex items-center gap-1.5 font-semibold text-[#D97706] dark:text-[#FBBF24]">
                <Lock className="w-3.5 h-3.5" />
                <span>Admin-Only Internal Notes (Strictly Hidden from Tenants &amp; Owners)</span>
              </div>
              {(liveTicket.internalNotes || []).map((note) => (
                <div key={note.id} className="p-2 rounded-lg bg-white/80 dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#374151]">
                  <div className="flex justify-between text-[11px] text-[#64748B]">
                    <span className="font-semibold">{note.authorName}</span>
                    <span className="font-mono-num">{note.createdAt}</span>
                  </div>
                  <p className="mt-0.5">{note.note}</p>
                </div>
              ))}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!internalNoteText.trim()) return;
                  adminAddSupportInternalNote(liveTicket.id, internalNoteText.trim());
                  setInternalNoteText('');
                  setBanner('Saved admin-only internal note.');
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={internalNoteText}
                  onChange={(e) => setInternalNoteText(e.target.value)}
                  placeholder="Add confidential internal investigation note..."
                  className="flex-1 h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#1F2937]"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 h-9 px-3 rounded-xl border border-[#D97706] text-[#D97706] font-semibold"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" /> Add Note
                </button>
              </form>
            </div>
          </div>
        )}
      </ModalSheet>
    </div>
  );
};
