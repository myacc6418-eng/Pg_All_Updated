import React, { useMemo, useState } from 'react';
import { BellRing, Copy, Megaphone, Plus, Send } from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import {
  ActionBtn,
  ConfirmDialog,
  KpiCard,
  ModalSheet,
  StatusText,
} from '../../components/ui/Primitives';
import { AdminDataTable, TableColumn } from '../../components/ui/AdminDataTable';
import {
  AdminAudienceMode,
  AdminNotificationCategory,
  AdminNotificationRecord,
} from '../../types/pgfinder';
import { INDIAN_CITIES } from '../../data/demoData';

const NOTIF_CATEGORIES: AdminNotificationCategory[] = [
  'System Maintenance',
  'Policy Update',
  'Property Verification',
  'Location Verification',
  'Document Action',
  'Subscription Reminder',
  'Payment Alert',
  'Feature Update',
  'Safety Advisory',
  'Event Announcement',
  'Promotional Update',
  'Support Update',
];

const AUDIENCE_MODES: AdminAudienceMode[] = [
  'All Users',
  'All PG Owners',
  'All Tenants',
  'Specific City Users',
  'Specific Property Owners',
  'Specific Property Tenants',
  'Active Subscribers',
  'Expired Subscribers',
  'Individual User',
];

type NotifTab = 'all' | 'Published' | 'Scheduled' | 'Draft' | 'Failed' | 'Archived';

export const AdminNotificationsPage: React.FC = () => {
  const {
    users,
    properties,
    stays,
    ownerSubscriptions,
    adminNotifications,
    saveAdminNotification,
    updateAdminNotificationStatus,
    duplicateAdminNotification,
  } = usePGFinder();

  const [tab, setTab] = useState<NotifTab>('all');
  const [banner, setBanner] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [previewStep, setPreviewStep] = useState(false);
  const [withdrawTarget, setWithdrawTarget] = useState<AdminNotificationRecord | null>(null);
  const [detailTarget, setDetailTarget] = useState<AdminNotificationRecord | null>(null);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<AdminNotificationCategory>('System Maintenance');
  const [audienceMode, setAudienceMode] = useState<AdminAudienceMode>('All Users');
  const [filterVal, setFilterVal] = useState('');
  const [channels, setChannels] = useState<('In-App' | 'Push' | 'Email')[]>(['In-App']);
  const [publishMode, setPublishMode] = useState<'Published' | 'Scheduled' | 'Draft'>('Published');
  const [scheduledAt, setScheduledAt] = useState('2026-12-01T10:00');

  const kpis = useMemo(() => {
    const published = adminNotifications.filter((n) => n.status === 'Published').length;
    const scheduled = adminNotifications.filter((n) => n.status === 'Scheduled').length;
    const drafts = adminNotifications.filter((n) => n.status === 'Draft').length;
    const failed = adminNotifications.filter((n) => n.status === 'Failed').length;
    const totalReads = adminNotifications.reduce((s, n) => s + n.inAppReadCount, 0);
    return {
      total: adminNotifications.length,
      published,
      scheduled,
      drafts,
      failed,
      totalReads,
    };
  }, [adminNotifications]);

  // Dynamic recipient estimate based on live context state
  const recipientEstimate = useMemo(() => {
    const activeUsers = users.filter((u) => !u.archived && u.status === 'Active');
    if (audienceMode === 'All Users') return activeUsers.length;
    if (audienceMode === 'All PG Owners') return activeUsers.filter((u) => u.role === 'PG_OWNER').length;
    if (audienceMode === 'All Tenants') return activeUsers.filter((u) => u.role === 'TENANT').length;
    if (audienceMode === 'Specific City Users') {
      return activeUsers.filter((u) => !filterVal || u.city === filterVal).length;
    }
    if (audienceMode === 'Specific Property Owners') {
      const prop = properties.find((p) => p.id === filterVal);
      return prop ? 1 : properties.length;
    }
    if (audienceMode === 'Specific Property Tenants') {
      return stays.filter((s) => (!filterVal || s.propertyId === filterVal) && s.status === 'Active').length;
    }
    if (audienceMode === 'Active Subscribers') {
      return ownerSubscriptions.filter((s) => s.status === 'Active').length;
    }
    if (audienceMode === 'Expired Subscribers') {
      return ownerSubscriptions.filter((s) => s.status === 'Expired' || s.status === 'Cancelled').length;
    }
    return 1;
  }, [audienceMode, filterVal, users, properties, stays, ownerSubscriptions]);

  const tabRows = useMemo(() => {
    if (tab === 'all') return adminNotifications;
    return adminNotifications.filter((n) => n.status === tab);
  }, [adminNotifications, tab]);

  const openNewComposer = (linkedPrefix?: string) => {
    setTitle(linkedPrefix ? `Correction: ${linkedPrefix}` : '');
    setMessage('');
    setCategory('System Maintenance');
    setAudienceMode('All Users');
    setFilterVal('');
    setChannels(['In-App']);
    setPublishMode('Published');
    setPreviewStep(false);
    setComposeOpen(true);
  };

  const toggleChannel = (ch: 'In-App' | 'Push' | 'Email') => {
    setChannels((prev) =>
      prev.includes(ch) ? (prev.length > 1 ? prev.filter((c) => c !== ch) : prev) : [...prev, ch]
    );
  };

  const commitNotification = () => {
    saveAdminNotification({
      title: title.trim(),
      message: message.trim(),
      category,
      targetAudienceMode: audienceMode,
      targetFilterValue: filterVal || undefined,
      channels,
      status: publishMode,
      scheduledAt: publishMode === 'Scheduled' ? scheduledAt : undefined,
      recipientEstimate,
    });
    setBanner(
      publishMode === 'Published'
        ? `Published in-app notification to ~${recipientEstimate} recipients.`
        : publishMode === 'Scheduled'
        ? `Scheduled notification for ${scheduledAt} (Asia/Kolkata).`
        : 'Saved notification as Draft.'
    );
    setComposeOpen(false);
    setPreviewStep(false);
  };

  const columns: TableColumn<AdminNotificationRecord>[] = [
    {
      key: 'title',
      label: 'Title & Category',
      sortable: true,
      sortValue: (n) => n.title,
      csvValue: (n) => `${n.title} (${n.category})`,
      render: (n) => (
        <div>
          <div className="font-semibold text-[#111827] dark:text-[#F9FAFB]">{n.title}</div>
          <div className="text-[11px] text-[#64748B]">{n.category}</div>
        </div>
      ),
    },
    {
      key: 'targetAudienceMode',
      label: 'Audience & Est.',
      sortable: true,
      sortValue: (n) => n.recipientEstimate,
      csvValue: (n) => `${n.targetAudienceMode} (${n.recipientEstimate})`,
      render: (n) => (
        <div>
          <div>{n.targetAudienceMode}{n.targetFilterValue ? ` · ${n.targetFilterValue}` : ''}</div>
          <div className="text-[11px] text-[#64748B] font-mono-num">~{n.recipientEstimate} recipients · {n.inAppReadCount} reads</div>
        </div>
      ),
    },
    {
      key: 'channels',
      label: 'Channels',
      csvValue: (n) => n.channels.join(', '),
      render: (n) => <span className="text-[11px]">{n.channels.join(' · ')}</span>,
    },
    {
      key: 'publishedAt',
      label: 'Published / Scheduled (IST)',
      sortable: true,
      sortValue: (n) => n.publishedAt || n.scheduledAt || '',
      csvValue: (n) => n.publishedAt || n.scheduledAt || 'Draft',
      render: (n) => (
        <span className="font-mono-num text-[11px] text-[#64748B]">
          {n.publishedAt || n.scheduledAt || 'Draft'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      sortValue: (n) => n.status,
      csvValue: (n) => n.status,
      render: (n) => <StatusText status={n.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (n) => (
        <div className="flex items-center justify-end gap-1">
          <ActionBtn kind="view" compact onClick={() => setDetailTarget(n)} />
          <button
            type="button"
            title="Duplicate notification"
            onClick={() => {
              duplicateAdminNotification(n.id);
              setBanner(`Duplicated "${n.title}" as Draft.`);
            }}
            className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          {n.status === 'Draft' || n.status === 'Scheduled' ? (
            <ActionBtn
              kind="approve"
              compact
              title="Publish Now"
              onClick={() => {
                updateAdminNotificationStatus(n.id, 'Published');
                setBanner(`Published "${n.title}" to in-app feed.`);
              }}
            />
          ) : n.status === 'Published' ? (
            <ActionBtn
              kind="reject"
              compact
              title="Withdraw In-App Notice"
              onClick={() => setWithdrawTarget(n)}
            />
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold font-display">Platform Notifications &amp; Broadcasts</h1>
          <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
            Compose, preview, schedule (Asia/Kolkata), and manage platform announcements for Tenants and PG Owners.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openNewComposer()}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[#047857] dark:bg-[#34D399] text-white dark:text-[#0B1220] text-xs font-semibold"
        >
          <Plus className="w-3.5 h-3.5" /> Compose Notification
        </button>
      </div>

      <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] flex items-center gap-2 text-xs text-[#64748B] dark:text-[#9CA3AF]">
        <BellRing className="w-4 h-4 text-[#047857] dark:text-[#34D399] shrink-0" />
        <span>
          Prototype delivery scope: In-App notifications publish immediately into the role Notification Bell drawer. External FCM Push &amp; Email gateways require server workers in production.
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
        <KpiCard label="Total Notices" value={kpis.total} onClick={() => setTab('all')} />
        <KpiCard label="Published" value={kpis.published} tone="success" onClick={() => setTab('Published')} />
        <KpiCard label="Scheduled" value={kpis.scheduled} tone="info" onClick={() => setTab('Scheduled')} />
        <KpiCard label="Drafts" value={kpis.drafts} tone="warning" onClick={() => setTab('Draft')} />
        <KpiCard label="Failed" value={kpis.failed} tone={kpis.failed > 0 ? 'error' : 'neutral'} onClick={() => setTab('Failed')} />
        <KpiCard label="In-App Reads" value={kpis.totalReads} tone="primary" />
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {(
          [
            { id: 'all', label: 'All' },
            { id: 'Published', label: 'Published' },
            { id: 'Scheduled', label: 'Scheduled' },
            { id: 'Draft', label: 'Drafts' },
            { id: 'Failed', label: 'Failed' },
            { id: 'Archived', label: 'Archived' },
          ] as { id: NotifTab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 ${
              tab === t.id
                ? 'bg-[#047857] text-white dark:bg-[#34D399] dark:text-[#0B1220]'
                : 'bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#374151] text-[#64748B]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AdminDataTable
        data={tabRows}
        columns={columns}
        rowKey={(n) => n.id}
        searchPlaceholder="Search notification title, category, audience..."
        searchExtractor={(n) => `${n.title} ${n.message} ${n.category} ${n.targetAudienceMode}`}
        exportFilename="admin-notifications.csv"
      />

      {/* Composer + Live Preview Modal */}
      <ModalSheet
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        title={previewStep ? 'Preview & Confirm Broadcast' : 'Compose Platform Notification'}
        maxWidth="max-w-2xl"
      >
        {!previewStep ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPreviewStep(true);
            }}
            className="space-y-3 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-medium mb-1">Notification Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Clear, concise announcement headline"
                  className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AdminNotificationCategory)}
                  className="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                >
                  {NOTIF_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Target Audience</label>
                <select
                  value={audienceMode}
                  onChange={(e) => {
                    setAudienceMode(e.target.value as AdminAudienceMode);
                    setFilterVal('');
                  }}
                  className="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                >
                  {AUDIENCE_MODES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {audienceMode === 'Specific City Users' && (
              <div>
                <label className="block font-medium mb-1">Select City</label>
                <select
                  value={filterVal}
                  onChange={(e) => setFilterVal(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                >
                  <option value="">All Supported Cities</option>
                  {INDIAN_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            {(audienceMode === 'Specific Property Owners' || audienceMode === 'Specific Property Tenants') && (
              <div>
                <label className="block font-medium mb-1">Select Property</label>
                <select
                  value={filterVal}
                  onChange={(e) => setFilterVal(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                >
                  <option value="">All Properties</option>
                  {properties.filter((p) => !p.archived).map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
                  ))}
                </select>
              </div>
            )}

            {audienceMode === 'Individual User' && (
              <div>
                <label className="block font-medium mb-1">Select User</label>
                <select
                  value={filterVal}
                  onChange={(e) => setFilterVal(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                >
                  {users.filter((u) => !u.archived && u.role !== 'SUPER_ADMIN').map((u) => (
                    <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block font-medium mb-1">Message Body *</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write clear instructions or announcement details..."
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">Channels</label>
                <div className="flex flex-wrap gap-2">
                  {(['In-App', 'Push', 'Email'] as const).map((ch) => (
                    <label key={ch} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151]">
                      <input
                        type="checkbox"
                        checked={channels.includes(ch)}
                        onChange={() => toggleChannel(ch)}
                        className="accent-[#047857]"
                      />
                      <span>{ch}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Action Mode</label>
                <select
                  value={publishMode}
                  onChange={(e) => setPublishMode(e.target.value as typeof publishMode)}
                  className="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                >
                  <option value="Published">Publish Immediately</option>
                  <option value="Scheduled">Schedule (Asia/Kolkata)</option>
                  <option value="Draft">Save as Draft</option>
                </select>
              </div>
            </div>

            {publishMode === 'Scheduled' && (
              <div>
                <label className="block font-medium mb-1">Scheduled Date &amp; Time (Asia/Kolkata)</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
                />
              </div>
            )}

            <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-[#374151] flex items-center justify-between">
              <span className="text-[#64748B]">Estimated Reach:</span>
              <span className="font-bold font-mono-num text-[#047857] dark:text-[#34D399]">
                ~{recipientEstimate} recipient(s)
              </span>
            </div>

            <button type="submit" className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold">
              Continue to Live Preview
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl border border-[#047857]/30 bg-[#047857]/5 space-y-2">
              <div className="flex items-center justify-between text-[#047857] dark:text-[#34D399] font-semibold">
                <span className="inline-flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4" /> {category}
                </span>
                <span>{audienceMode} (~{recipientEstimate})</span>
              </div>
              <div className="text-sm font-bold text-[#111827] dark:text-[#F9FAFB]">{title}</div>
              <p className="text-[#64748B] dark:text-[#9CA3AF] leading-relaxed">{message}</p>
              <div className="text-[11px] text-[#64748B] pt-1">
                Channels: {channels.join(', ')} · Mode: {publishMode}
                {publishMode === 'Scheduled' ? ` (${scheduledAt} IST)` : ''}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewStep(false)}
                className="flex-1 h-10 rounded-xl border border-[#E2E8F0] dark:border-[#374151] font-semibold"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={commitNotification}
                className="flex-1 h-10 rounded-xl bg-[#047857] text-white font-semibold inline-flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {publishMode === 'Published' ? 'Confirm & Publish' : publishMode === 'Scheduled' ? 'Confirm Schedule' : 'Save Draft'}
              </button>
            </div>
          </div>
        )}
      </ModalSheet>

      {/* View Detail Modal */}
      <ModalSheet
        open={Boolean(detailTarget)}
        onClose={() => setDetailTarget(null)}
        title={detailTarget ? detailTarget.title : 'Notification Detail'}
        maxWidth="max-w-lg"
      >
        {detailTarget && (
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-semibold">{detailTarget.category}</span>
              <StatusText status={detailTarget.status} />
            </div>
            <p className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] leading-relaxed">
              {detailTarget.message}
            </p>
            <div className="grid grid-cols-2 gap-2 text-[#64748B]">
              <div>Audience: {detailTarget.targetAudienceMode}</div>
              <div className="font-mono-num">Recipients: ~{detailTarget.recipientEstimate}</div>
              <div>Channels: {detailTarget.channels.join(', ')}</div>
              <div className="font-mono-num">Reads: {detailTarget.inAppReadCount}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                const t = detailTarget.title;
                setDetailTarget(null);
                openNewComposer(t);
              }}
              className="w-full h-9 rounded-xl border border-[#E2E8F0] dark:border-[#374151] font-semibold"
            >
              Send Linked Correction Notice
            </button>
          </div>
        )}
      </ModalSheet>

      <ConfirmDialog
        open={Boolean(withdrawTarget)}
        onClose={() => setWithdrawTarget(null)}
        title="Withdraw In-App Notification"
        description="Withdrawing marks this announcement as Withdrawn in the In-App notification feed. Note: External Push/Email notifications already dispatched cannot be recalled from user devices."
        confirmLabel="Withdraw In-App Notice"
        tone="warning"
        onConfirm={() => {
          if (withdrawTarget) {
            updateAdminNotificationStatus(withdrawTarget.id, 'Withdrawn');
            setBanner(`Withdrew in-app notice "${withdrawTarget.title}".`);
          }
          setWithdrawTarget(null);
        }}
      />
    </div>
  );
};
