import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, MapPin, ShieldCheck } from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import { ActionBtn, KpiCard, ModalSheet, StatusText } from '../../components/ui/Primitives';
import { AdminDataTable, TableColumn } from '../../components/ui/AdminDataTable';
import { AuditCategory, AuditLogEntry } from '../../types/pgfinder';

const AUDIT_TABS: { id: 'ALL' | AuditCategory; label: string }[] = [
  { id: 'ALL', label: 'All Activity' },
  { id: 'Auth', label: 'Auth' },
  { id: 'PG Owner', label: 'PG Owner' },
  { id: 'Tenant', label: 'Tenant' },
  { id: 'Property', label: 'Property' },
  { id: 'Administrator', label: 'Administrator' },
  { id: 'Financial', label: 'Financial' },
  { id: 'Document Access', label: 'Document Access' },
  { id: 'Location Verification', label: 'Location Verification' },
  { id: 'Location Sharing Requests', label: 'Location Sharing Requests' },
  { id: 'Security Events', label: 'Security Events' },
];

export const AdminAuditPage: React.FC = () => {
  const { auditLogs } = usePGFinder();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'ALL' | AuditCategory>('ALL');
  const [filters, setFilters] = useState<Record<string, string>>({
    actorRole: 'ALL',
    status: 'ALL',
  });
  const [detailLog, setDetailLog] = useState<AuditLogEntry | null>(null);
  const [showTechMeta, setShowTechMeta] = useState(false);

  const inferCategory = (a: AuditLogEntry): AuditCategory => {
    if (a.category) return a.category;
    const act = a.action.toUpperCase();
    if (act.includes('DOCUMENT')) return 'Document Access';
    if (act.includes('LOCATION_SHARE') || act.includes('LOCATION_REQUEST')) return 'Location Sharing Requests';
    if (act.includes('LOCATION')) return 'Location Verification';
    if (act.includes('PROPERTY') || act.includes('LISTING') || act.includes('REVIEW')) return 'Property';
    if (act.includes('SUBSCRIPTION') || act.includes('PAYMENT') || act.includes('FEATURED') || act.includes('LOCAL_AD')) return 'Financial';
    if (act.includes('LOGIN') || act.includes('AUTH')) return 'Auth';
    if (act.includes('SECURITY') || act.includes('BLOCKED')) return 'Security Events';
    if (a.actorRole === 'PG_OWNER') return 'PG Owner';
    if (a.actorRole === 'TENANT') return 'Tenant';
    return 'Administrator';
  };

  const kpis = useMemo(() => {
    const adminActions = auditLogs.filter((l) => l.actorRole === 'SUPER_ADMIN').length;
    const securityBlocked = auditLogs.filter(
      (l) => l.status === 'Blocked' || l.status === 'Failed' || inferCategory(l) === 'Security Events'
    ).length;
    const docAccess = auditLogs.filter((l) => inferCategory(l) === 'Document Access').length;
    const locEvents = auditLogs.filter(
      (l) =>
        inferCategory(l) === 'Location Verification' ||
        inferCategory(l) === 'Location Sharing Requests'
    ).length;
    return {
      total: auditLogs.length,
      adminActions,
      securityBlocked,
      docAccess,
      locEvents,
    };
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((l) => {
      if (tab !== 'ALL' && inferCategory(l) !== tab) return false;
      if (filters.actorRole !== 'ALL' && l.actorRole !== filters.actorRole) return false;
      const st = l.status || 'Success';
      if (filters.status !== 'ALL' && st !== filters.status) return false;
      return true;
    });
  }, [auditLogs, tab, filters]);

  const columns: TableColumn<AuditLogEntry>[] = [
    {
      key: 'timestamp',
      label: 'Timestamp (UTC)',
      sortable: true,
      sortValue: (a) => a.timestamp,
      csvValue: (a) => a.timestamp,
      render: (a) => (
        <span className="font-mono-num text-[11px] text-[#64748B]">
          {a.timestamp.slice(0, 19).replace('T', ' ')}
        </span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      sortValue: (a) => inferCategory(a),
      csvValue: (a) => inferCategory(a),
      render: (a) => <span className="font-medium">{inferCategory(a)}</span>,
    },
    {
      key: 'actorName',
      label: 'Actor',
      sortable: true,
      sortValue: (a) => a.actorName,
      csvValue: (a) => `${a.actorName} (${a.actorRole})`,
      render: (a) => (
        <div>
          <div className="font-semibold">{a.actorName}</div>
          <div className="text-[11px] text-[#64748B]">{a.actorRole}</div>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action & Target',
      sortable: true,
      sortValue: (a) => a.action,
      csvValue: (a) => `${a.action} · ${a.entityType} (${a.entityId})`,
      render: (a) => (
        <div>
          <div className="font-mono-num text-[11px] font-semibold">{a.action}</div>
          <div className="text-[11px] text-[#64748B]">
            {a.entityType} · {a.entityId}
          </div>
        </div>
      ),
    },
    {
      key: 'summary',
      label: 'Summary',
      csvValue: (a) => a.summary,
      render: (a) => <div className="max-w-xs truncate text-[#111827] dark:text-[#F9FAFB]">{a.summary}</div>,
    },
    {
      key: 'status',
      label: 'Outcome',
      sortable: true,
      sortValue: (a) => a.status || 'Success',
      csvValue: (a) => a.status || 'Success',
      render: (a) => <StatusText status={a.status || 'Success'} />,
    },
    {
      key: 'actions',
      label: 'Inspect',
      align: 'right',
      render: (a) => (
        <ActionBtn
          kind="view"
          compact
          title="View Immutable Event Detail"
          onClick={() => {
            setShowTechMeta(false);
            setDetailLog(a);
          }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold font-display">Append-Only Governance Audit Logs</h1>
          <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
            Immutable chronological record across platform governance, document access, location reviews, and security events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/admin/locations')}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] text-xs font-medium"
          >
            <MapPin className="w-3.5 h-3.5 text-[#047857]" /> Property Location Queue
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/support')}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] text-xs font-medium"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#047857]" /> Location Consent Review
          </button>
        </div>
      </div>

      <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] flex items-center gap-2 text-xs text-[#64748B] dark:text-[#9CA3AF]">
        <Lock className="w-4 h-4 text-[#047857] dark:text-[#34D399] shrink-0" />
        <span>
          Append-only integrity: Audit log entries cannot be edited or deleted from the dashboard. Passwords, OTPs, session tokens, and private tenant GPS coordinates are never stored in audit records.
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard label="Total Audit Events" value={kpis.total} onClick={() => setTab('ALL')} />
        <KpiCard label="Super Admin Actions" value={kpis.adminActions} tone="primary" onClick={() => setTab('Administrator')} />
        <KpiCard label="Document Inspections" value={kpis.docAccess} tone="info" onClick={() => setTab('Document Access')} />
        <KpiCard label="Location Audits" value={kpis.locEvents} tone="success" onClick={() => setTab('Location Verification')} />
        <KpiCard label="Security / Blocked" value={kpis.securityBlocked} tone={kpis.securityBlocked > 0 ? 'warning' : 'neutral'} onClick={() => setTab('Security Events')} />
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {AUDIT_TABS.map((t) => (
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
        data={filteredLogs}
        columns={columns}
        rowKey={(a) => a.id}
        searchPlaceholder="Search actor, action, entity ID, summary..."
        searchExtractor={(a) => `${a.id} ${a.actorName} ${a.action} ${a.entityType} ${a.entityId} ${a.summary}`}
        filters={[
          {
            key: 'actorRole',
            label: 'Actor Role',
            options: [
              { label: 'Super Admin', value: 'SUPER_ADMIN' },
              { label: 'PG Owner', value: 'PG_OWNER' },
              { label: 'Tenant', value: 'TENANT' },
            ],
          },
          {
            key: 'status',
            label: 'Outcome',
            options: [
              { label: 'Success', value: 'Success' },
              { label: 'Failed', value: 'Failed' },
              { label: 'Blocked', value: 'Blocked' },
            ],
          },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClearFilters={() => setFilters({ actorRole: 'ALL', status: 'ALL' })}
        exportFilename="pgfinder-audit-logs.csv"
      />

      {/* Event Details Modal */}
      <ModalSheet
        open={Boolean(detailLog)}
        onClose={() => setDetailLog(null)}
        title={detailLog ? `Audit Event · ${detailLog.action}` : 'Audit Detail'}
        subtitle={detailLog ? `${detailLog.id} · ${detailLog.timestamp}` : ''}
      >
        {detailLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151]">
              <div><span className="text-[#64748B]">Category:</span> <span className="font-semibold">{inferCategory(detailLog)}</span></div>
              <div><span className="text-[#64748B]">Outcome:</span> <StatusText status={detailLog.status || 'Success'} /></div>
              <div><span className="text-[#64748B]">Actor:</span> {detailLog.actorName} ({detailLog.actorRole})</div>
              <div><span className="text-[#64748B]">Target:</span> <span className="font-mono-num">{detailLog.entityType} · {detailLog.entityId}</span></div>
            </div>

            <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151]">
              <div className="font-semibold mb-1 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#047857]" /> Human-Readable Summary
              </div>
              <p className="text-[#111827] dark:text-[#F9FAFB]">{detailLog.summary}</p>
              {detailLog.reason && (
                <p className="text-[#64748B] mt-1">Reason: {detailLog.reason}</p>
              )}
            </div>

            {(detailLog.beforeValue || detailLog.afterValue) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151]">
                  <div className="text-[11px] font-semibold text-[#64748B] mb-1">Before State</div>
                  <div className="font-mono-num break-words">{detailLog.beforeValue || '—'}</div>
                </div>
                <div className="p-3 rounded-xl border border-[#047857]/30 bg-[#047857]/5">
                  <div className="text-[11px] font-semibold text-[#047857] dark:text-[#34D399] mb-1">After State</div>
                  <div className="font-mono-num break-words">{detailLog.afterValue || '—'}</div>
                </div>
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={() => setShowTechMeta((v) => !v)}
                className="text-[#047857] dark:text-[#34D399] font-semibold underline"
              >
                {showTechMeta ? 'Hide Technical Metadata' : 'Show Redacted Technical Metadata'}
              </button>
              {showTechMeta && (
                <pre className="mt-2 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-[#374151] font-mono-num text-[11px] overflow-x-auto">
                  {JSON.stringify(
                    {
                      eventId: detailLog.id,
                      timestamp: detailLog.timestamp,
                      actorRole: detailLog.actorRole,
                      entityType: detailLog.entityType,
                      entityId: detailLog.entityId,
                      ipOrDeviceSummary: detailLog.ipOrDeviceSummary || 'Admin Console Session (Redacted)',
                      secretsStored: false,
                    },
                    null,
                    2
                  )}
                </pre>
              )}
            </div>
          </div>
        )}
      </ModalSheet>
    </div>
  );
};
