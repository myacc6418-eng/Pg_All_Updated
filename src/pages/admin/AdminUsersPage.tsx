import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import { StatusText } from '../../components/ui/Primitives';

export const AdminUsersPage: React.FC = () => {
  const { users, properties, stays, tenantExpenses, toggleUserStatus } = usePGFinder();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'owners' | 'tenants' | 'roles') || 'owners';
  const [tab, setTab] = useState<'owners' | 'tenants' | 'roles'>(initialTab);

  const owners = users.filter((u) => u.role === 'PG_OWNER');
  const tenants = users.filter((u) => u.role === 'TENANT');

  const switchTab = (next: 'owners' | 'tenants' | 'roles') => {
    setTab(next);
    setSearchParams({ tab: next });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold font-display">User &amp; Role Administration</h1>
        <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
          Manage PG owners, tenant accounts, and restricted admin sub-roles.
        </p>
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] w-fit">
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
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
                <th className="py-2 pr-3 font-medium">Owner</th>
                <th className="py-2 pr-3 font-medium">Contact</th>
                <th className="py-2 pr-3 font-medium">Properties</th>
                <th className="py-2 pr-3 font-medium">Plan</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
              {owners.map((o) => {
                const oProps = properties.filter((p) => p.ownerId === o.id);
                const approved = oProps.filter((p) => p.approvalStatus === 'APPROVED').length;
                return (
                  <tr key={o.id}>
                    <td className="py-3 pr-3">
                      <div className="font-semibold">{o.name}</div>
                      <div className="text-[11px] text-[#64748B] font-mono-num">{o.id}</div>
                    </td>
                    <td className="py-3 pr-3">
                      <div>{o.email}</div>
                      <div className="text-[11px] text-[#64748B] font-mono-num">{o.mobile}</div>
                    </td>
                    <td className="py-3 pr-3 font-mono-num">
                      {oProps.length} total · {approved} approved
                    </td>
                    <td className="py-3 pr-3 font-semibold">{o.subscriptionPlan || 'Basic'}</td>
                    <td className="py-3 pr-3">
                      <StatusText status={o.status} />
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleUserStatus(o.id)}
                        className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] font-medium"
                      >
                        {o.status === 'Active' ? 'Suspend' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'tenants' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#64748B] dark:text-[#9CA3AF]">
              <Lock className="w-4 h-4 text-[#047857] dark:text-[#34D399]" />
              <span>
                Privacy boundary enforced: Admins view stay &amp; aggregate expense module adoption ({tenantExpenses.length} total entries platform-wide), never private tenant spending items.
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
                  <th className="py-2 pr-3 font-medium">Tenant</th>
                  <th className="py-2 pr-3 font-medium">Contact</th>
                  <th className="py-2 pr-3 font-medium">Active PG</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
                {tenants.map((t) => {
                  const activeStay = stays.find((s) => s.tenantId === t.id && s.status === 'Active');
                  const prop = activeStay ? properties.find((p) => p.id === activeStay.propertyId) : undefined;
                  return (
                    <tr key={t.id}>
                      <td className="py-3 pr-3 font-semibold">{t.name}</td>
                      <td className="py-3 pr-3">
                        <div>{t.email}</div>
                        <div className="text-[11px] text-[#64748B] font-mono-num">{t.mobile}</div>
                      </td>
                      <td className="py-3 pr-3">{prop?.name || 'No active stay'}</td>
                      <td className="py-3 pr-3">
                        <StatusText status={t.status} />
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => toggleUserStatus(t.id)}
                          className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] font-medium"
                        >
                          {t.status === 'Active' ? 'Suspend' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'roles' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {[
            { name: 'Operations Admin', scope: 'Inventory oversight, stays & checkouts monitoring' },
            { name: 'Verification Admin', scope: 'Property approvals, GPS verification & private documents' },
            { name: 'Support Admin', scope: 'Support tickets, disputes & review moderation' },
            { name: 'Finance Admin', scope: 'Subscriptions, platform payments & refund approvals' },
            { name: 'Events Admin', scope: 'Create, publish & manage Startup Events in Connect' },
            { name: 'Content Admin', scope: 'Landing page copy, FAQs, policies & supported cities' },
          ].map((role) => (
            <div key={role.name} className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4">
              <div className="font-semibold text-sm">{role.name}</div>
              <p className="text-[#64748B] dark:text-[#9CA3AF] mt-1">{role.scope}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
