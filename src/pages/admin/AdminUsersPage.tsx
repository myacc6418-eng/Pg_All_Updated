import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ExternalLink, Lock, MapPin, ShieldCheck } from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import {
  ActionBtn,
  ConfirmDialog,
  KpiCard,
  ModalSheet,
  StatusText,
} from '../../components/ui/Primitives';
import { AdminDataTable, TableColumn } from '../../components/ui/AdminDataTable';
import { UserAccount } from '../../types/pgfinder';
import { formatINR } from '../../utils/formatters';

export const AdminUsersPage: React.FC = () => {
  const {
    users,
    properties,
    rooms,
    beds,
    stays,
    rentInvoices,
    rentPayments,
    depositTransactions,
    complaints,
    tenantExpenses,
    unifiedDocuments,
    ownerSubscriptions,
    supportTickets,
    auditLogs,
    locationRequests,
    adminUpdateUser,
    adminSuspendUser,
    adminRestoreUser,
    adminArchiveUser,
  } = usePGFinder();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'owners' | 'tenants' | 'roles') || 'owners';
  const [tab, setTab] = useState<'owners' | 'tenants' | 'roles'>(initialTab);
  const [banner, setBanner] = useState('');

  // Filters
  const [ownerFilters, setOwnerFilters] = useState<Record<string, string>>({
    status: 'ALL',
    plan: 'ALL',
    city: 'ALL',
    subStatus: 'ALL',
  });
  const [tenantFilters, setTenantFilters] = useState<Record<string, string>>({
    status: 'ALL',
    stayStatus: 'ALL',
    city: 'ALL',
    docStatus: 'ALL',
  });

  // Modals
  const [detailOwner, setDetailOwner] = useState<UserAccount | null>(null);
  const [ownerModalTab, setOwnerModalTab] = useState<
    'overview' | 'properties' | 'subscription' | 'documents' | 'support' | 'activity'
  >('overview');

  const [detailTenant, setDetailTenant] = useState<UserAccount | null>(null);
  const [tenantModalTab, setTenantModalTab] = useState<
    'personal' | 'accommodation' | 'pg_location' | 'documents' | 'stays' | 'finance' | 'complaints' | 'consent'
  >('personal');

  const [editUser, setEditUser] = useState<UserAccount | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editBizName, setEditBizName] = useState('');
  const [editBizAddr, setEditBizAddr] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const [suspendTarget, setSuspendTarget] = useState<UserAccount | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<UserAccount | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<UserAccount | null>(null);

  const owners = useMemo(() => users.filter((u) => u.role === 'PG_OWNER' && !u.archived), [users]);
  const tenants = useMemo(() => users.filter((u) => u.role === 'TENANT' && !u.archived), [users]);

  const ownerCities = useMemo(() => Array.from(new Set(owners.map((o) => o.city))), [owners]);
  const tenantCities = useMemo(() => Array.from(new Set(tenants.map((t) => t.city))), [tenants]);

  const switchTab = (next: 'owners' | 'tenants' | 'roles') => {
    setTab(next);
    setSearchParams({ tab: next });
  };

  // Owner KPIs
  const ownerKpis = useMemo(() => {
    const active = owners.filter((o) => o.status === 'Active').length;
    const suspended = owners.filter((o) => o.status === 'Suspended').length;
    const subscribed = owners.filter((o) =>
      ownerSubscriptions.some((s) => s.ownerId === o.id && s.status === 'Active')
    ).length;
    const pendingPropsOwners = owners.filter((o) =>
      properties.some(
        (p) =>
          p.ownerId === o.id &&
          (p.approvalStatus === 'PENDING_APPROVAL' ||
            p.approvalStatus === 'UNDER_REVIEW' ||
            p.approvalStatus === 'RESUBMITTED')
      )
    ).length;
    const newThisMonth = owners.filter((o) => o.registeredAt >= '2026-01-01').length;
    return { total: owners.length, active, suspended, subscribed, pendingPropsOwners, newThisMonth };
  }, [owners, ownerSubscriptions, properties]);

  // Tenant KPIs
  const tenantKpis = useMemo(() => {
    const active = tenants.filter((t) => t.status === 'Active').length;
    const suspended = tenants.filter((t) => t.status === 'Suspended').length;
    const activeStayCount = tenants.filter((t) =>
      stays.some((s) => s.tenantId === t.id && s.status === 'Active')
    ).length;
    const noStayCount = tenants.length - activeStayCount;
    const newThisMonth = tenants.filter((t) => t.registeredAt >= '2026-01-01').length;
    return { total: tenants.length, active, suspended, activeStayCount, noStayCount, newThisMonth };
  }, [tenants, stays]);

  const filteredOwners = useMemo(() => {
    return owners.filter((o) => {
      if (ownerFilters.status !== 'ALL' && o.status !== ownerFilters.status) return false;
      if (ownerFilters.plan !== 'ALL' && (o.subscriptionPlan || 'Basic') !== ownerFilters.plan) return false;
      if (ownerFilters.city !== 'ALL' && o.city !== ownerFilters.city) return false;
      const sub = ownerSubscriptions.find((s) => s.ownerId === o.id);
      const subStatus = sub?.status || 'None';
      if (ownerFilters.subStatus !== 'ALL' && subStatus !== ownerFilters.subStatus) return false;
      return true;
    });
  }, [owners, ownerFilters, ownerSubscriptions]);

  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      if (tenantFilters.status !== 'ALL' && t.status !== tenantFilters.status) return false;
      if (tenantFilters.city !== 'ALL' && t.city !== tenantFilters.city) return false;
      const activeStay = stays.find((s) => s.tenantId === t.id && s.status === 'Active');
      const stayLabel = activeStay ? 'Active' : 'No Active Stay';
      if (tenantFilters.stayStatus !== 'ALL' && stayLabel !== tenantFilters.stayStatus) return false;
      const tDocs = unifiedDocuments.filter((d) => d.tenantId === t.id && !d.archived);
      const docStatus =
        tDocs.length === 0
          ? 'Pending'
          : tDocs.some((d) => d.verificationStatus === 'Verified')
          ? 'Verified'
          : tDocs[0].verificationStatus;
      if (tenantFilters.docStatus !== 'ALL' && docStatus !== tenantFilters.docStatus) return false;
      return true;
    });
  }, [tenants, tenantFilters, stays, unifiedDocuments]);

  const openEditModal = (u: UserAccount) => {
    setEditUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditMobile(u.mobile);
    setEditCity(u.city);
    setEditBizName(u.businessName || '');
    setEditBizAddr(u.businessAddress || '');
    setEditNotes(u.adminNotes || '');
  };

  const ownerColumns: TableColumn<UserAccount>[] = [
    {
      key: 'id',
      label: 'Owner ID',
      sortable: true,
      sortValue: (o) => o.id,
      csvValue: (o) => o.id,
      render: (o) => <span className="font-mono-num text-[11px] text-[#64748B]">{o.id}</span>,
    },
    {
      key: 'name',
      label: 'Full Name',
      sortable: true,
      sortValue: (o) => o.name,
      csvValue: (o) => o.name,
      render: (o) => (
        <div>
          <div className="font-semibold text-[#111827] dark:text-[#F9FAFB]">{o.name}</div>
          {o.businessName && <div className="text-[11px] text-[#64748B]">{o.businessName}</div>}
        </div>
      ),
    },
    {
      key: 'mobile',
      label: 'Mobile & Email',
      sortable: true,
      sortValue: (o) => o.email,
      csvValue: (o) => `${o.mobile} | ${o.email}`,
      render: (o) => (
        <div>
          <div className="font-mono-num">{o.mobile}</div>
          <div className="text-[11px] text-[#64748B]">{o.email}</div>
        </div>
      ),
    },
    {
      key: 'city',
      label: 'City',
      sortable: true,
      sortValue: (o) => o.city,
      csvValue: (o) => o.city,
      render: (o) => <span>{o.city}</span>,
    },
    {
      key: 'properties',
      label: 'Properties / Published',
      sortable: true,
      sortValue: (o) => properties.filter((p) => p.ownerId === o.id && !p.archived).length,
      csvValue: (o) => {
        const list = properties.filter((p) => p.ownerId === o.id && !p.archived);
        const app = list.filter((p) => p.approvalStatus === 'APPROVED').length;
        const pub = list.filter((p) => p.listingStatus === 'PUBLISHED').length;
        return `${list.length} total / ${app} approved / ${pub} published`;
      },
      render: (o) => {
        const list = properties.filter((p) => p.ownerId === o.id && !p.archived);
        const app = list.filter((p) => p.approvalStatus === 'APPROVED').length;
        const pub = list.filter((p) => p.listingStatus === 'PUBLISHED').length;
        return (
          <div className="font-mono-num">
            <span>{list.length} total · {app} app</span>
            <div className="text-[11px] text-[#64748B]">{pub} published</div>
          </div>
        );
      },
    },
    {
      key: 'plan',
      label: 'Subscription',
      sortable: true,
      sortValue: (o) => o.subscriptionPlan || 'Basic',
      csvValue: (o) => o.subscriptionPlan || 'Basic',
      render: (o) => {
        const sub = ownerSubscriptions.find((s) => s.ownerId === o.id);
        return (
          <div>
            <div className="font-semibold">{sub?.planName || o.subscriptionPlan || 'Basic'}</div>
            <StatusText status={sub?.status || 'Inactive'} />
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Account Status',
      sortable: true,
      sortValue: (o) => o.status,
      csvValue: (o) => o.status,
      render: (o) => <StatusText status={o.status} />,
    },
    {
      key: 'registeredAt',
      label: 'Registered',
      sortable: true,
      sortValue: (o) => o.registeredAt,
      csvValue: (o) => o.registeredAt,
      render: (o) => <span className="font-mono-num text-[#64748B]">{o.registeredAt}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (o) => (
        <div className="flex items-center justify-end gap-1">
          <ActionBtn
            kind="view"
            compact
            title="View Owner 360° Details"
            onClick={() => {
              setDetailOwner(o);
              setOwnerModalTab('overview');
            }}
          />
          <ActionBtn kind="edit" compact title="Edit Owner Profile" onClick={() => openEditModal(o)} />
          {o.status === 'Active' ? (
            <ActionBtn kind="suspend" compact title="Suspend Owner" onClick={() => setSuspendTarget(o)} />
          ) : (
            <ActionBtn kind="restore" compact title="Restore Owner" onClick={() => setRestoreTarget(o)} />
          )}
          <ActionBtn kind="delete" compact title="Archive Owner" onClick={() => setArchiveTarget(o)} />
        </div>
      ),
    },
  ];

  const tenantColumns: TableColumn<UserAccount>[] = [
    {
      key: 'id',
      label: 'Tenant ID',
      sortable: true,
      sortValue: (t) => t.id,
      csvValue: (t) => t.id,
      render: (t) => <span className="font-mono-num text-[11px] text-[#64748B]">{t.id}</span>,
    },
    {
      key: 'name',
      label: 'Full Name',
      sortable: true,
      sortValue: (t) => t.name,
      csvValue: (t) => t.name,
      render: (t) => <span className="font-semibold text-[#111827] dark:text-[#F9FAFB]">{t.name}</span>,
    },
    {
      key: 'mobile',
      label: 'Mobile & Email',
      sortable: true,
      sortValue: (t) => t.email,
      csvValue: (t) => `${t.mobile} | ${t.email}`,
      render: (t) => (
        <div>
          <div className="font-mono-num">{t.mobile}</div>
          <div className="text-[11px] text-[#64748B]">{t.email}</div>
        </div>
      ),
    },
    {
      key: 'city',
      label: 'City',
      sortable: true,
      sortValue: (t) => t.city,
      csvValue: (t) => t.city,
      render: (t) => <span>{t.city}</span>,
    },
    {
      key: 'activePg',
      label: 'Active PG / Room & Bed',
      sortable: true,
      sortValue: (t) => {
        const s = stays.find((st) => st.tenantId === t.id && st.status === 'Active');
        return s ? properties.find((p) => p.id === s.propertyId)?.name || '' : 'No active stay';
      },
      csvValue: (t) => {
        const s = stays.find((st) => st.tenantId === t.id && st.status === 'Active');
        if (!s) return 'No active stay';
        const p = properties.find((pr) => pr.id === s.propertyId);
        const r = rooms.find((rm) => rm.id === s.roomId);
        const b = beds.find((bd) => bd.id === s.bedId);
        return `${p?.name || 'PG'} (${r?.roomNumber || ''} / ${b?.bedCode || ''})`;
      },
      render: (t) => {
        const s = stays.find((st) => st.tenantId === t.id && st.status === 'Active');
        if (!s) return <span className="text-[#64748B]">No active stay</span>;
        const p = properties.find((pr) => pr.id === s.propertyId);
        const r = rooms.find((rm) => rm.id === s.roomId);
        const b = beds.find((bd) => bd.id === s.bedId);
        return (
          <div>
            <div className="font-medium">{p?.name || 'PG'}</div>
            <div className="text-[11px] text-[#64748B] font-mono-num">
              Room {r?.roomNumber || '—'} · Bed {b?.bedCode || '—'}
            </div>
          </div>
        );
      },
    },
    {
      key: 'stayStatus',
      label: 'Stay Status',
      sortable: true,
      sortValue: (t) => (stays.some((s) => s.tenantId === t.id && s.status === 'Active') ? 'Active' : 'Inactive'),
      csvValue: (t) => (stays.some((s) => s.tenantId === t.id && s.status === 'Active') ? 'Active Stay' : 'No Active Stay'),
      render: (t) => {
        const activeStay = stays.find((s) => s.tenantId === t.id && s.status === 'Active');
        return <StatusText status={activeStay ? 'Active Stay' : 'Inactive'} />;
      },
    },
    {
      key: 'docStatus',
      label: 'Documents',
      sortable: true,
      sortValue: (t) => {
        const d = unifiedDocuments.find((doc) => doc.tenantId === t.id && !doc.archived);
        return d?.verificationStatus || 'Pending';
      },
      csvValue: (t) => {
        const d = unifiedDocuments.find((doc) => doc.tenantId === t.id && !doc.archived);
        return d?.verificationStatus || 'Pending';
      },
      render: (t) => {
        const d = unifiedDocuments.find((doc) => doc.tenantId === t.id && !doc.archived);
        return <StatusText status={d?.verificationStatus || 'Pending'} />;
      },
    },
    {
      key: 'status',
      label: 'Account Status',
      sortable: true,
      sortValue: (t) => t.status,
      csvValue: (t) => t.status,
      render: (t) => <StatusText status={t.status} />,
    },
    {
      key: 'registeredAt',
      label: 'Registered',
      sortable: true,
      sortValue: (t) => t.registeredAt,
      csvValue: (t) => t.registeredAt,
      render: (t) => <span className="font-mono-num text-[#64748B]">{t.registeredAt}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (t) => (
        <div className="flex items-center justify-end gap-1">
          <ActionBtn
            kind="view"
            compact
            title="View Tenant 360° Details"
            onClick={() => {
              setDetailTenant(t);
              setTenantModalTab('personal');
            }}
          />
          <ActionBtn kind="edit" compact title="Edit Tenant Profile" onClick={() => openEditModal(t)} />
          {t.status === 'Active' ? (
            <ActionBtn kind="suspend" compact title="Suspend Tenant" onClick={() => setSuspendTarget(t)} />
          ) : (
            <ActionBtn kind="restore" compact title="Restore Tenant" onClick={() => setRestoreTarget(t)} />
          )}
          <ActionBtn kind="delete" compact title="Archive Tenant" onClick={() => setArchiveTarget(t)} />
        </div>
      ),
    },
  ];

  // Live synced detail objects
  const activeDetailOwner = detailOwner
    ? users.find((u) => u.id === detailOwner.id) || detailOwner
    : null;
  const activeDetailTenant = detailTenant
    ? users.find((u) => u.id === detailTenant.id) || detailTenant
    : null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold font-display">User &amp; Role Administration</h1>
        <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
          Manage PG owner accounts, tenant accounts, privacy-compliant accommodation visibility, and governance sub-roles.
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
          { id: 'owners', label: `PG Owners (${owners.length})` },
          { id: 'tenants', label: `Tenants (${tenants.length})` },
          { id: 'roles', label: 'Admin Sub-Roles' },
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

      {tab === 'owners' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard
              label="Total PG Owners"
              value={ownerKpis.total}
              onClick={() => setOwnerFilters({ status: 'ALL', plan: 'ALL', city: 'ALL', subStatus: 'ALL' })}
            />
            <KpiCard
              label="Active Owners"
              value={ownerKpis.active}
              tone="success"
              onClick={() => setOwnerFilters((f) => ({ ...f, status: 'Active' }))}
            />
            <KpiCard
              label="Suspended Owners"
              value={ownerKpis.suspended}
              tone={ownerKpis.suspended > 0 ? 'error' : 'neutral'}
              onClick={() => setOwnerFilters((f) => ({ ...f, status: 'Suspended' }))}
            />
            <KpiCard
              label="Subscribed Owners"
              value={ownerKpis.subscribed}
              tone="primary"
              onClick={() => setOwnerFilters((f) => ({ ...f, subStatus: 'Active' }))}
            />
            <KpiCard
              label="Pending Verification"
              value={ownerKpis.pendingPropsOwners}
              tone={ownerKpis.pendingPropsOwners > 0 ? 'warning' : 'neutral'}
            />
            <KpiCard label="New Recent" value={ownerKpis.newThisMonth} tone="info" />
          </div>

          <AdminDataTable
            data={filteredOwners}
            columns={ownerColumns}
            rowKey={(o) => o.id}
            searchPlaceholder="Search owner ID, name, mobile, email, business, city..."
            searchExtractor={(o) => `${o.id} ${o.name} ${o.mobile} ${o.email} ${o.businessName || ''} ${o.city}`}
            filters={[
              {
                key: 'status',
                label: 'Account Status',
                options: [
                  { label: 'Active', value: 'Active' },
                  { label: 'Suspended', value: 'Suspended' },
                ],
              },
              {
                key: 'plan',
                label: 'Plan',
                options: [
                  { label: 'Basic', value: 'Basic' },
                  { label: 'Pro', value: 'Pro' },
                  { label: 'Business', value: 'Business' },
                ],
              },
              {
                key: 'subStatus',
                label: 'Subscription',
                options: [
                  { label: 'Active', value: 'Active' },
                  { label: 'Grace Period', value: 'Grace Period' },
                  { label: 'Expired', value: 'Expired' },
                ],
              },
              {
                key: 'city',
                label: 'City',
                options: ownerCities.map((c) => ({ label: c, value: c })),
              },
            ]}
            filterValues={ownerFilters}
            onFilterChange={(k, v) => setOwnerFilters((prev) => ({ ...prev, [k]: v }))}
            onClearFilters={() => setOwnerFilters({ status: 'ALL', plan: 'ALL', city: 'ALL', subStatus: 'ALL' })}
            exportFilename="pg-owners-export.csv"
          />
        </div>
      )}

      {tab === 'tenants' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#64748B] dark:text-[#9CA3AF]">
              <Lock className="w-4 h-4 text-[#047857] dark:text-[#34D399] shrink-0" />
              <span>
                Strict privacy rules active: Personal live GPS coordinates are never tracked or listed in Tenant Management. Private tenant expense tracker entries ({tenantExpenses.length} platform entries aggregate only) remain hidden from Admins &amp; Owners.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard
              label="Total Tenants"
              value={tenantKpis.total}
              onClick={() => setTenantFilters({ status: 'ALL', stayStatus: 'ALL', city: 'ALL', docStatus: 'ALL' })}
            />
            <KpiCard
              label="Active Accounts"
              value={tenantKpis.active}
              tone="success"
              onClick={() => setTenantFilters((f) => ({ ...f, status: 'Active' }))}
            />
            <KpiCard
              label="Suspended"
              value={tenantKpis.suspended}
              tone={tenantKpis.suspended > 0 ? 'error' : 'neutral'}
              onClick={() => setTenantFilters((f) => ({ ...f, status: 'Suspended' }))}
            />
            <KpiCard
              label="Active PG Stays"
              value={tenantKpis.activeStayCount}
              tone="primary"
              onClick={() => setTenantFilters((f) => ({ ...f, stayStatus: 'Active' }))}
            />
            <KpiCard
              label="No Active Stay"
              value={tenantKpis.noStayCount}
              onClick={() => setTenantFilters((f) => ({ ...f, stayStatus: 'No Active Stay' }))}
            />
            <KpiCard label="New Recent" value={tenantKpis.newThisMonth} tone="info" />
          </div>

          <AdminDataTable
            data={filteredTenants}
            columns={tenantColumns}
            rowKey={(t) => t.id}
            searchPlaceholder="Search tenant ID, name, mobile, email, city..."
            searchExtractor={(t) => `${t.id} ${t.name} ${t.mobile} ${t.email} ${t.city}`}
            filters={[
              {
                key: 'status',
                label: 'Account Status',
                options: [
                  { label: 'Active', value: 'Active' },
                  { label: 'Suspended', value: 'Suspended' },
                ],
              },
              {
                key: 'stayStatus',
                label: 'Stay Status',
                options: [
                  { label: 'Active', value: 'Active' },
                  { label: 'No Active Stay', value: 'No Active Stay' },
                ],
              },
              {
                key: 'docStatus',
                label: 'Document Status',
                options: [
                  { label: 'Pending', value: 'Pending' },
                  { label: 'Verified', value: 'Verified' },
                  { label: 'Rejected', value: 'Rejected' },
                  { label: 'Replacement Required', value: 'Replacement Required' },
                ],
              },
              {
                key: 'city',
                label: 'City',
                options: tenantCities.map((c) => ({ label: c, value: c })),
              },
            ]}
            filterValues={tenantFilters}
            onFilterChange={(k, v) => setTenantFilters((prev) => ({ ...prev, [k]: v }))}
            onClearFilters={() => setTenantFilters({ status: 'ALL', stayStatus: 'ALL', city: 'ALL', docStatus: 'ALL' })}
            exportFilename="tenants-export.csv"
          />
        </div>
      )}

      {tab === 'roles' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] flex items-center gap-2 text-xs text-[#64748B] dark:text-[#9CA3AF]">
            <ShieldCheck className="w-4 h-4 text-[#047857] dark:text-[#34D399] shrink-0" />
            <span>
              Governance sub-roles define scoped operational duties. Role escalation is protected server-side and disabled from profile self-edit endpoints.
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {[
              { name: 'Operations Admin', scope: 'Inventory oversight, stays, room/bed capacity & checkout settlement monitoring' },
              { name: 'Verification Admin', scope: 'Independent PG property approvals, GPS coordinate verification & private document review' },
              { name: 'Support Admin', scope: 'Support help desk, internal moderation notes, dispute tickets & review moderation' },
              { name: 'Finance Admin', scope: 'Subscription plans, listing entitlements, featured PG campaigns & platform payment records' },
              { name: 'Events Admin', scope: 'Create, publish & manage Startup Events in Connect discovery feed' },
              { name: 'Content Admin', scope: 'Platform announcements, CMS copy, FAQs, policies & city rollout switches' },
            ].map((role) => (
              <div key={role.name} className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4">
                <div className="font-semibold text-sm">{role.name}</div>
                <p className="text-[#64748B] dark:text-[#9CA3AF] mt-1 leading-relaxed">{role.scope}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Owner 360 Detail Modal */}
      <ModalSheet
        open={Boolean(activeDetailOwner)}
        onClose={() => setDetailOwner(null)}
        title={activeDetailOwner ? `PG Owner · ${activeDetailOwner.name}` : 'Owner Details'}
        subtitle={activeDetailOwner ? `${activeDetailOwner.id} · ${activeDetailOwner.city}` : ''}
        maxWidth="max-w-3xl"
      >
        {activeDetailOwner && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-[#E2E8F0] dark:border-[#374151]">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'properties', label: 'Properties' },
                { id: 'subscription', label: 'Subscription' },
                { id: 'documents', label: 'Documents' },
                { id: 'support', label: 'Support' },
                { id: 'activity', label: 'Activity' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setOwnerModalTab(t.id as typeof ownerModalTab)}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap ${
                    ownerModalTab === t.id
                      ? 'bg-[#047857] text-white dark:bg-[#34D399] dark:text-[#0B1220]'
                      : 'text-[#64748B] dark:text-[#9CA3AF]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {ownerModalTab === 'overview' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151]">
                  <div><span className="text-[#64748B]">Full Name:</span> <span className="font-semibold">{activeDetailOwner.name}</span></div>
                  <div><span className="text-[#64748B]">Account Status:</span> <StatusText status={activeDetailOwner.status} /></div>
                  <div><span className="text-[#64748B]">Mobile:</span> <span className="font-mono-num">{activeDetailOwner.mobile}</span></div>
                  <div><span className="text-[#64748B]">Email:</span> <span>{activeDetailOwner.email}</span></div>
                  <div><span className="text-[#64748B]">Business Name:</span> <span>{activeDetailOwner.businessName || '—'}</span></div>
                  <div><span className="text-[#64748B]">City:</span> <span>{activeDetailOwner.city}</span></div>
                  <div className="sm:col-span-2"><span className="text-[#64748B]">Business Address:</span> <span>{activeDetailOwner.businessAddress || '—'}</span></div>
                  <div><span className="text-[#64748B]">Registered At:</span> <span className="font-mono-num">{activeDetailOwner.registeredAt}</span></div>
                  <div><span className="text-[#64748B]">Last Login:</span> <span className="font-mono-num">{activeDetailOwner.lastLoginAt || 'Recent'}</span></div>
                </div>
                {activeDetailOwner.suspendedReason && (
                  <div className="p-3 rounded-xl border border-[#DC2626]/30 bg-[#DC2626]/5 text-[#DC2626]">
                    Suspended ({activeDetailOwner.suspendedAt}): {activeDetailOwner.suspendedReason}
                  </div>
                )}
                {activeDetailOwner.adminNotes && (
                  <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151]">
                    <div className="font-semibold mb-0.5">Admin Notes</div>
                    <p className="text-[#64748B]">{activeDetailOwner.adminNotes}</p>
                  </div>
                )}
              </div>
            )}

            {ownerModalTab === 'properties' && (
              <div className="space-y-2">
                {properties.filter((p) => p.ownerId === activeDetailOwner.id && !p.archived).map((p) => (
                  <div key={p.id} className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-[#64748B]">{p.locality}, {p.city} · {p.category}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusText status={p.approvalStatus} />
                      <StatusText status={p.locationVerificationStatus} />
                      <StatusText status={p.listingStatus} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {ownerModalTab === 'subscription' && (
              <div className="space-y-2">
                {ownerSubscriptions.filter((s) => s.ownerId === activeDetailOwner.id).length === 0 ? (
                  <p className="text-[#64748B]">No paid subscription assigned (Basic entitlement).</p>
                ) : (
                  ownerSubscriptions
                    .filter((s) => s.ownerId === activeDetailOwner.id)
                    .map((s) => (
                      <div key={s.id} className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span>{s.planName} ({formatINR(s.amountInr)})</span>
                          <StatusText status={s.status} />
                        </div>
                        <div className="text-[#64748B] font-mono-num">
                          Period: {s.startDate} to {s.endDate} · Renewal: {s.renewalMode} · Payment: {s.paymentStatus}
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}

            {ownerModalTab === 'documents' && (
              <div className="space-y-2">
                {unifiedDocuments.filter((d) => d.ownerId === activeDetailOwner.id && !d.archived).length === 0 ? (
                  <p className="text-[#64748B]">No owner/property documents uploaded.</p>
                ) : (
                  unifiedDocuments
                    .filter((d) => d.ownerId === activeDetailOwner.id && !d.archived)
                    .map((d) => (
                      <div key={d.id} className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex items-center justify-between gap-2">
                        <div>
                          <div className="font-semibold">{d.documentType} ({d.category})</div>
                          <div className="text-[#64748B] font-mono-num">{d.fileName} · {d.uploadedAt}</div>
                        </div>
                        <StatusText status={d.verificationStatus} />
                      </div>
                    ))
                )}
              </div>
            )}

            {ownerModalTab === 'support' && (
              <div className="space-y-2">
                {supportTickets.filter((t) => t.userId === activeDetailOwner.id).length === 0 ? (
                  <p className="text-[#64748B]">No support tickets from this owner.</p>
                ) : (
                  supportTickets
                    .filter((t) => t.userId === activeDetailOwner.id)
                    .map((t) => (
                      <div key={t.id} className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{t.subject}</div>
                          <div className="text-[#64748B]">{t.category} · {t.createdAt}</div>
                        </div>
                        <StatusText status={t.status} />
                      </div>
                    ))
                )}
              </div>
            )}

            {ownerModalTab === 'activity' && (
              <div className="space-y-2">
                {auditLogs
                  .filter((a) => a.entityId === activeDetailOwner.id || a.summary.includes(activeDetailOwner.name))
                  .slice(0, 12)
                  .map((a) => (
                    <div key={a.id} className="p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151]">
                      <div className="flex justify-between font-medium">
                        <span>{a.action}</span>
                        <span className="font-mono-num text-[#64748B]">{a.timestamp.slice(0, 16).replace('T', ' ')}</span>
                      </div>
                      <p className="text-[#64748B] mt-0.5">{a.summary}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </ModalSheet>

      {/* Tenant 360 Detail Modal */}
      <ModalSheet
        open={Boolean(activeDetailTenant)}
        onClose={() => setDetailTenant(null)}
        title={activeDetailTenant ? `Tenant · ${activeDetailTenant.name}` : 'Tenant Details'}
        subtitle={activeDetailTenant ? `${activeDetailTenant.id} · ${activeDetailTenant.city}` : ''}
        maxWidth="max-w-3xl"
      >
        {activeDetailTenant && (() => {
          const activeStay = stays.find((s) => s.tenantId === activeDetailTenant.id && s.status === 'Active');
          const activeProp = activeStay ? properties.find((p) => p.id === activeStay.propertyId) : undefined;
          const activeRoom = activeStay ? rooms.find((r) => r.id === activeStay.roomId) : undefined;
          const activeBed = activeStay ? beds.find((b) => b.id === activeStay.bedId) : undefined;
          const tenantInvoices = rentInvoices.filter((i) => i.tenantId === activeDetailTenant.id);
          const tenantPays = rentPayments.filter((p) => p.tenantId === activeDetailTenant.id && !p.reversed);
          const tenantDeps = depositTransactions.filter((d) => d.tenantId === activeDetailTenant.id);
          const tenantComplaints = complaints.filter((c) => c.tenantId === activeDetailTenant.id);
          const tenantTickets = supportTickets.filter((t) => t.userId === activeDetailTenant.id);
          const tenantConsentReqs = locationRequests.filter((lr) => lr.tenantId === activeDetailTenant.id);

          return (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-[#E2E8F0] dark:border-[#374151]">
                {[
                  { id: 'personal', label: 'Personal' },
                  { id: 'accommodation', label: 'Accommodation' },
                  { id: 'pg_location', label: 'PG Location' },
                  { id: 'documents', label: 'Documents' },
                  { id: 'stays', label: 'Stay History' },
                  { id: 'finance', label: 'Rent & Deposit' },
                  { id: 'complaints', label: 'Complaints & Support' },
                  { id: 'consent', label: 'Consented Location' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTenantModalTab(t.id as typeof tenantModalTab)}
                    className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap ${
                      tenantModalTab === t.id
                        ? 'bg-[#047857] text-white dark:bg-[#34D399] dark:text-[#0B1220]'
                        : 'text-[#64748B] dark:text-[#9CA3AF]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {tenantModalTab === 'personal' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151]">
                  <div><span className="text-[#64748B]">Full Name:</span> <span className="font-semibold">{activeDetailTenant.name}</span></div>
                  <div><span className="text-[#64748B]">Account Status:</span> <StatusText status={activeDetailTenant.status} /></div>
                  <div><span className="text-[#64748B]">Mobile:</span> <span className="font-mono-num">{activeDetailTenant.mobile}</span></div>
                  <div><span className="text-[#64748B]">Email:</span> <span>{activeDetailTenant.email}</span></div>
                  <div><span className="text-[#64748B]">City:</span> <span>{activeDetailTenant.city}</span></div>
                  <div><span className="text-[#64748B]">Emergency Contact:</span> <span className="font-mono-num">{activeStay?.emergencyContact || 'On file with stay'}</span></div>
                  <div><span className="text-[#64748B]">Registered:</span> <span className="font-mono-num">{activeDetailTenant.registeredAt}</span></div>
                  <div><span className="text-[#64748B]">Language:</span> <span>{activeDetailTenant.languagePreference || 'English'}</span></div>
                </div>
              )}

              {tenantModalTab === 'accommodation' && (
                activeStay && activeProp ? (
                  <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-2">
                    <div className="flex justify-between font-semibold text-sm">
                      <span>{activeProp.name}</span>
                      <StatusText status={activeStay.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-[#64748B]">Owner:</span> {activeProp.ownerName} ({activeProp.ownerMobile})</div>
                      <div><span className="text-[#64748B]">Room / Bed:</span> <span className="font-mono-num">{activeRoom?.roomNumber || '—'} / {activeBed?.bedCode || '—'}</span></div>
                      <div><span className="text-[#64748B]">Joining Date:</span> <span className="font-mono-num">{activeStay.joiningDate}</span></div>
                      <div><span className="text-[#64748B]">Monthly Rent:</span> <span className="font-mono-num">{formatINR(activeStay.monthlyRent)}</span></div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[#64748B]">No active PG accommodation assigned to this tenant.</p>
                )
              )}

              {tenantModalTab === 'pg_location' && (
                activeProp ? (
                  <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-2">
                    <div className="font-semibold flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#047857]" /> Registered PG Property Location (Not Personal Tenant GPS)
                    </div>
                    <div className="text-[#64748B]">
                      {activeProp.address}, {activeProp.locality}, {activeProp.city} — {activeProp.pinCode}
                    </div>
                    {activeProp.location ? (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <span className="font-mono-num">
                          PG Coordinates: {activeProp.location.latitude.toFixed(6)}, {activeProp.location.longitude.toFixed(6)}
                        </span>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${activeProp.location.latitude},${activeProp.location.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] font-semibold text-[#047857] dark:text-[#34D399]"
                        >
                          Open PG in Google Maps <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ) : (
                      <div className="text-[#D97706]">PG property coordinates not submitted yet.</div>
                    )}
                  </div>
                ) : (
                  <p className="text-[#64748B]">Tenant has no active PG property address.</p>
                )
              )}

              {tenantModalTab === 'documents' && (
                <div className="space-y-2">
                  {unifiedDocuments.filter((d) => d.tenantId === activeDetailTenant.id && !d.archived).length === 0 ? (
                    <p className="text-[#64748B]">No verification documents on file.</p>
                  ) : (
                    unifiedDocuments
                      .filter((d) => d.tenantId === activeDetailTenant.id && !d.archived)
                      .map((d) => (
                        <div key={d.id} className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{d.documentType}</div>
                            <div className="text-[#64748B] font-mono-num">{d.fileName} · {d.uploadedAt}</div>
                          </div>
                          <StatusText status={d.verificationStatus} />
                        </div>
                      ))
                  )}
                </div>
              )}

              {tenantModalTab === 'stays' && (
                <div className="space-y-2">
                  {stays.filter((s) => s.tenantId === activeDetailTenant.id).length === 0 ? (
                    <p className="text-[#64748B]">No stay history records.</p>
                  ) : (
                    stays
                      .filter((s) => s.tenantId === activeDetailTenant.id)
                      .map((s) => {
                        const p = properties.find((pr) => pr.id === s.propertyId);
                        return (
                          <div key={s.id} className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex items-center justify-between">
                            <div>
                              <div className="font-semibold">{p?.name || s.propertyId}</div>
                              <div className="text-[#64748B] font-mono-num">Joined {s.joiningDate} · Rent {formatINR(s.monthlyRent)}</div>
                            </div>
                            <StatusText status={s.status} />
                          </div>
                        );
                      })
                  )}
                </div>
              )}

              {tenantModalTab === 'finance' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]/40 text-[#64748B]">
                    Only PG accommodation rent &amp; deposit ledgers are displayed. Tenant private personal expense entries remain strictly private.
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151]">
                      <div className="text-[#64748B]">Invoices</div>
                      <div className="font-bold font-mono-num">{tenantInvoices.length}</div>
                    </div>
                    <div className="p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151]">
                      <div className="text-[#64748B]">Rent Paid</div>
                      <div className="font-bold font-mono-num">{formatINR(tenantPays.reduce((s, p) => s + p.amount, 0))}</div>
                    </div>
                    <div className="p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151]">
                      <div className="text-[#64748B]">Deposit Events</div>
                      <div className="font-bold font-mono-num">{tenantDeps.length}</div>
                    </div>
                  </div>
                </div>
              )}

              {tenantModalTab === 'complaints' && (
                <div className="space-y-2">
                  {tenantComplaints.map((c) => (
                    <div key={c.id} className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex justify-between">
                      <div>
                        <div className="font-semibold">{c.title}</div>
                        <div className="text-[#64748B]">{c.category} · Priority: {c.priority}</div>
                      </div>
                      <StatusText status={c.status} />
                    </div>
                  ))}
                  {tenantTickets.map((t) => (
                    <div key={t.id} className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex justify-between">
                      <div>
                        <div className="font-semibold">{t.subject}</div>
                        <div className="text-[#64748B]">Support Ticket · {t.createdAt}</div>
                      </div>
                      <StatusText status={t.status} />
                    </div>
                  ))}
                  {tenantComplaints.length === 0 && tenantTickets.length === 0 && (
                    <p className="text-[#64748B]">No complaints or support tickets recorded.</p>
                  )}
                </div>
              )}

              {tenantModalTab === 'consent' && (
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]/40 text-[#64748B]">
                    Automatic or hidden tracking is forbidden. Only explicit Admin-reviewed, Tenant-consented, time-limited location sharing requests appear here.
                  </div>
                  {tenantConsentReqs.length === 0 ? (
                    <p className="text-[#64748B]">No location sharing requests associated with this tenant.</p>
                  ) : (
                    tenantConsentReqs.map((lr) => (
                      <div key={lr.id} className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span>{lr.category} · Requested by {lr.ownerName}</span>
                          <StatusText status={lr.status} />
                        </div>
                        <div className="text-[#64748B]">{lr.reason} — {lr.explanation}</div>
                        <div className="text-[#64748B] font-mono-num">
                          Duration: {lr.requestedDurationHours}h · Requested: {lr.requestedAt.slice(0, 16).replace('T', ' ')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })()}
      </ModalSheet>

      {/* Edit User Modal (Permitted Fields Only) */}
      <ModalSheet
        open={Boolean(editUser)}
        onClose={() => setEditUser(null)}
        title={editUser ? `Edit ${editUser.role === 'PG_OWNER' ? 'PG Owner' : 'Tenant'} Profile` : 'Edit User'}
        subtitle="Only permitted profile & admin note fields may be modified."
      >
        {editUser && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              adminUpdateUser(editUser.id, {
                name: editName.trim() || editUser.name,
                email: editEmail.trim() || editUser.email,
                mobile: editMobile.trim() || editUser.mobile,
                city: editCity.trim() || editUser.city,
                businessName: editUser.role === 'PG_OWNER' ? editBizName.trim() : undefined,
                businessAddress: editUser.role === 'PG_OWNER' ? editBizAddr.trim() : undefined,
                adminNotes: editNotes.trim(),
              });
              setBanner(`Updated profile for ${editName.trim() || editUser.name}.`);
              setEditUser(null);
            }}
            className="space-y-3 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">City</label>
                <input
                  type="text"
                  required
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Mobile</label>
                <input
                  type="tel"
                  required
                  value={editMobile}
                  onChange={(e) => setEditMobile(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
                />
              </div>
            </div>
            {editUser.role === 'PG_OWNER' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Business Name</label>
                  <input
                    type="text"
                    value={editBizName}
                    onChange={(e) => setEditBizName(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Business Address</label>
                  <input
                    type="text"
                    value={editBizAddr}
                    onChange={(e) => setEditBizAddr(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block font-medium mb-1">Admin Governance Notes</label>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Internal verification or compliance remarks..."
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              />
            </div>
            <button type="submit" className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold">
              Save Permitted Changes
            </button>
          </form>
        )}
      </ModalSheet>

      <ConfirmDialog
        open={Boolean(suspendTarget)}
        onClose={() => setSuspendTarget(null)}
        title={`Suspend ${suspendTarget?.name || 'User'}`}
        description="Suspending this account pauses active platform privileges while preserving historical stay, financial, and audit records."
        confirmLabel="Suspend Account"
        tone="danger"
        requireReason
        reasonLabel="Suspension Reason"
        onConfirm={(reason) => {
          if (suspendTarget) {
            adminSuspendUser(suspendTarget.id, reason);
            setBanner(`Account ${suspendTarget.name} suspended and logged.`);
          }
          setSuspendTarget(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(restoreTarget)}
        onClose={() => setRestoreTarget(null)}
        title={`Restore ${restoreTarget?.name || 'User'}`}
        description="Reactivate this account to Active status?"
        confirmLabel="Restore Account"
        tone="primary"
        requireReason
        reasonLabel="Restoration Note"
        onConfirm={(reason) => {
          if (restoreTarget) {
            adminRestoreUser(restoreTarget.id, reason);
            setBanner(`Account ${restoreTarget.name} restored.`);
          }
          setRestoreTarget(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        title={`Archive ${archiveTarget?.name || 'User'}`}
        description="Accounts with active stays, properties, or financial ledgers cannot be permanently deleted and will be safely archived."
        confirmLabel="Archive Account"
        tone="warning"
        onConfirm={() => {
          if (archiveTarget) {
            const res = adminArchiveUser(archiveTarget.id);
            setBanner(res.message);
          }
          setArchiveTarget(null);
        }}
      />
    </div>
  );
};
