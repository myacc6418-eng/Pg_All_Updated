import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Copy, CreditCard, Plus, ShieldCheck } from 'lucide-react';
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
  OwnerSubscriptionRecord,
  PlanFeature,
  PlatformPaymentRecord,
  SubscriptionPlan,
} from '../../types/pgfinder';
import { formatINR } from '../../utils/formatters';

type SubTab = 'plans' | 'features' | 'active' | 'expired' | 'payments' | 'entitlements';

export const AdminSubscriptionsPage: React.FC = () => {
  const {
    subscriptionPlans,
    planFeatures,
    ownerSubscriptions,
    platformPayments,
    properties,
    addSubscriptionPlan,
    updateSubscriptionPlan,
    duplicateSubscriptionPlan,
    deleteOrArchiveSubscriptionPlan,
    addPlanFeature,
    updatePlanFeature,
    togglePlanFeatureStatus,
    manageOwnerSubscription,
  } = usePGFinder();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as SubTab) || 'plans';
  const [tab, setTab] = useState<SubTab>(initialTab);
  const [banner, setBanner] = useState('');

  // Plan modal
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [pName, setPName] = useState('');
  const [pCode, setPCode] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pCycle, setPCycle] = useState<SubscriptionPlan['billingCycle']>('Monthly');
  const [pPrice, setPPrice] = useState('199');
  const [pMaxProps, setPMaxProps] = useState('5');
  const [pMaxRooms, setPMaxRooms] = useState('60');
  const [pMaxBeds, setPMaxBeds] = useState('180');
  const [pSlots, setPSlots] = useState('5');
  const [pGrace, setPGrace] = useState('7');
  const [pFeatures, setPFeatures] = useState<string[]>([]);
  const [pStatus, setPStatus] = useState<SubscriptionPlan['status']>('Active');

  // Feature modal
  const [featModalOpen, setFeatModalOpen] = useState(false);
  const [editingFeat, setEditingFeat] = useState<PlanFeature | null>(null);
  const [fName, setFName] = useState('');
  const [fCode, setFCode] = useState('');
  const [fCat, setFCat] = useState<PlanFeature['category']>('Property Management');
  const [fDesc, setFDesc] = useState('');
  const [fStatus, setFStatus] = useState<'Active' | 'Inactive'>('Active');

  // Owner sub management modal
  const [subActionTarget, setSubActionTarget] = useState<{
    sub: OwnerSubscriptionRecord;
    mode: 'change_plan' | 'extend' | 'cancel' | 'restore';
  } | null>(null);
  const [subPlanId, setSubPlanId] = useState('');
  const [subNewEnd, setSubNewEnd] = useState('2027-06-30');
  const [subReason, setSubReason] = useState('');

  const [archivePlanTarget, setArchivePlanTarget] = useState<SubscriptionPlan | null>(null);

  const switchTab = (next: SubTab) => {
    setTab(next);
    setSearchParams({ tab: next });
  };

  const kpis = useMemo(() => {
    const activeSubs = ownerSubscriptions.filter(
      (s) => s.status === 'Active' || s.status === 'Grace Period'
    ).length;
    const expiredSubs = ownerSubscriptions.filter(
      (s) => s.status === 'Expired' || s.status === 'Cancelled'
    ).length;
    const graceSubs = ownerSubscriptions.filter((s) => s.status === 'Grace Period').length;
    const platformRevenue = platformPayments
      .filter((p) => p.status === 'Paid')
      .reduce((sum, p) => sum + p.amountInr, 0);
    const pendingPayments = platformPayments.filter(
      (p) => p.status === 'Pending' || p.status === 'Failed'
    ).length;

    return {
      totalPlans: subscriptionPlans.filter((p) => p.status !== 'Archived').length,
      activeSubs,
      graceSubs,
      expiredSubs,
      platformRevenue,
      pendingPayments,
    };
  }, [subscriptionPlans, ownerSubscriptions, platformPayments]);

  const openNewPlan = () => {
    setEditingPlan(null);
    setPName('');
    setPCode('');
    setPDesc('');
    setPCycle('Monthly');
    setPPrice('299');
    setPMaxProps('5');
    setPMaxRooms('60');
    setPMaxBeds('180');
    setPSlots('5');
    setPGrace('7');
    setPFeatures(planFeatures.filter((f) => f.status === 'Active').slice(0, 3).map((f) => f.id));
    setPStatus('Active');
    setPlanModalOpen(true);
  };

  const openEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPName(plan.name);
    setPCode(plan.code);
    setPDesc(plan.description);
    setPCycle(plan.billingCycle);
    setPPrice(String(plan.priceInr));
    setPMaxProps(String(plan.maxProperties));
    setPMaxRooms(String(plan.maxRooms));
    setPMaxBeds(String(plan.maxBeds));
    setPSlots(String(plan.includedListingSlots));
    setPGrace(String(plan.graceDays));
    setPFeatures(plan.featureIds);
    setPStatus(plan.status);
    setPlanModalOpen(true);
  };

  const openNewFeat = () => {
    setEditingFeat(null);
    setFName('');
    setFCode('');
    setFCat('Property Management');
    setFDesc('');
    setFStatus('Active');
    setFeatModalOpen(true);
  };

  const openEditFeat = (feat: PlanFeature) => {
    setEditingFeat(feat);
    setFName(feat.name);
    setFCode(feat.code);
    setFCat(feat.category);
    setFDesc(feat.description);
    setFStatus(feat.status);
    setFeatModalOpen(true);
  };

  const openSubModal = (
    sub: OwnerSubscriptionRecord,
    mode: 'change_plan' | 'extend' | 'cancel' | 'restore'
  ) => {
    setSubActionTarget({ sub, mode });
    setSubPlanId(sub.planId);
    setSubNewEnd(sub.endDate);
    setSubReason('');
  };

  const activeSubRows = useMemo(
    () =>
      ownerSubscriptions.filter(
        (s) => s.status === 'Active' || s.status === 'Grace Period' || s.status === 'Pending Payment'
      ),
    [ownerSubscriptions]
  );

  const expiredSubRows = useMemo(
    () =>
      ownerSubscriptions.filter(
        (s) => s.status === 'Expired' || s.status === 'Cancelled' || s.status === 'Suspended'
      ),
    [ownerSubscriptions]
  );

  const subColumns: TableColumn<OwnerSubscriptionRecord>[] = [
    {
      key: 'id',
      label: 'Sub ID',
      sortable: true,
      sortValue: (s) => s.id,
      csvValue: (s) => s.id,
      render: (s) => <span className="font-mono-num text-[11px] text-[#64748B]">{s.id}</span>,
    },
    {
      key: 'ownerName',
      label: 'PG Owner',
      sortable: true,
      sortValue: (s) => s.ownerName,
      csvValue: (s) => `${s.ownerName} (${s.ownerEmail})`,
      render: (s) => (
        <div>
          <div className="font-semibold">{s.ownerName}</div>
          <div className="text-[11px] text-[#64748B]">{s.ownerEmail}</div>
        </div>
      ),
    },
    {
      key: 'planName',
      label: 'Plan & Fee',
      sortable: true,
      sortValue: (s) => s.amountInr,
      csvValue: (s) => `${s.planName} (${formatINR(s.amountInr)})`,
      render: (s) => (
        <div>
          <div className="font-semibold">{s.planName}</div>
          <div className="text-[11px] text-[#64748B] font-mono-num">{formatINR(s.amountInr)} · {s.renewalMode}</div>
        </div>
      ),
    },
    {
      key: 'endDate',
      label: 'Validity Window',
      sortable: true,
      sortValue: (s) => s.endDate,
      csvValue: (s) => `${s.startDate} to ${s.endDate}`,
      render: (s) => (
        <span className="font-mono-num text-[11px] text-[#64748B]">
          {s.startDate} → {s.endDate}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      sortable: true,
      sortValue: (s) => s.paymentStatus,
      csvValue: (s) => s.paymentStatus,
      render: (s) => <StatusText status={s.paymentStatus === 'Unconfigured' ? 'Inactive' : s.paymentStatus} />,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      sortValue: (s) => s.status,
      csvValue: (s) => s.status,
      render: (s) => <StatusText status={s.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (s) => (
        <div className="flex items-center justify-end gap-1">
          <ActionBtn kind="edit" compact label="Change Plan" title="Change Plan" onClick={() => openSubModal(s, 'change_plan')} />
          <ActionBtn kind="add" compact label="Extend" title="Extend Validity" onClick={() => openSubModal(s, 'extend')} />
          {s.status === 'Active' || s.status === 'Grace Period' ? (
            <ActionBtn kind="reject" compact title="Cancel Subscription" onClick={() => openSubModal(s, 'cancel')} />
          ) : (
            <ActionBtn kind="restore" compact title="Restore Subscription" onClick={() => openSubModal(s, 'restore')} />
          )}
        </div>
      ),
    },
  ];

  const paymentColumns: TableColumn<PlatformPaymentRecord>[] = [
    {
      key: 'id',
      label: 'Payment ID',
      sortable: true,
      sortValue: (p) => p.id,
      csvValue: (p) => p.id,
      render: (p) => <span className="font-mono-num text-[11px] text-[#64748B]">{p.id}</span>,
    },
    {
      key: 'ownerName',
      label: 'PG Owner',
      sortable: true,
      sortValue: (p) => p.ownerName,
      csvValue: (p) => p.ownerName,
      render: (p) => <span className="font-semibold">{p.ownerName}</span>,
    },
    {
      key: 'category',
      label: 'Category & Item',
      sortable: true,
      sortValue: (p) => p.category,
      csvValue: (p) => `${p.category} - ${p.planOrCampaignName}`,
      render: (p) => (
        <div>
          <div className="font-medium">{p.category}</div>
          <div className="text-[11px] text-[#64748B]">{p.planOrCampaignName}</div>
        </div>
      ),
    },
    {
      key: 'amountInr',
      label: 'Amount',
      sortable: true,
      sortValue: (p) => p.amountInr,
      csvValue: (p) => p.amountInr,
      render: (p) => <span className="font-mono-num font-semibold">{formatINR(p.amountInr)}</span>,
    },
    {
      key: 'reference',
      label: 'Reference',
      sortable: true,
      sortValue: (p) => p.reference,
      csvValue: (p) => p.reference,
      render: (p) => <span className="font-mono-num text-[11px]">{p.reference}</span>,
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      sortValue: (p) => p.date,
      csvValue: (p) => p.date,
      render: (p) => <span className="font-mono-num text-[#64748B]">{p.date}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      sortValue: (p) => p.status,
      csvValue: (p) => p.status,
      render: (p) => <StatusText status={p.status} />,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold font-display">Subscriptions, Plans &amp; Entitlements</h1>
          <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
            Configure PG Owner subscription plans, feature entitlements, owner subscription lifecycles, and listing fee readiness.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openNewFeat}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" /> Add Feature
          </button>
          <button
            type="button"
            onClick={openNewPlan}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[#047857] dark:bg-[#34D399] text-white dark:text-[#0B1220] text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" /> Create Plan
          </button>
        </div>
      </div>

      <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] flex items-center gap-2 text-xs text-[#64748B] dark:text-[#9CA3AF]">
        <ShieldCheck className="w-4 h-4 text-[#047857] dark:text-[#34D399] shrink-0" />
        <span>
          Platform revenue only: Owner tenant rent &amp; security deposits are strictly separated from SaaS subscription/listing fees. No paid tier ever unlocks automatic tenant GPS tracking.
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
        <KpiCard label="Active Plans" value={kpis.totalPlans} onClick={() => switchTab('plans')} />
        <KpiCard label="Active Subs" value={kpis.activeSubs} tone="success" onClick={() => switchTab('active')} />
        <KpiCard label="Grace Period" value={kpis.graceSubs} tone="info" onClick={() => switchTab('active')} />
        <KpiCard label="Expired / Cancelled" value={kpis.expiredSubs} tone={kpis.expiredSubs > 0 ? 'warning' : 'neutral'} onClick={() => switchTab('expired')} />
        <KpiCard label="Platform Rev (Demo)" value={formatINR(kpis.platformRevenue)} tone="primary" onClick={() => switchTab('payments')} />
        <KpiCard label="Pending / Failed" value={kpis.pendingPayments} tone={kpis.pendingPayments > 0 ? 'error' : 'neutral'} onClick={() => switchTab('payments')} />
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {(
          [
            { id: 'plans', label: `Subscription Plans (${subscriptionPlans.length})` },
            { id: 'features', label: `Plan Features (${planFeatures.length})` },
            { id: 'active', label: `Active Subscriptions (${activeSubRows.length})` },
            { id: 'expired', label: `Expired Subscriptions (${expiredSubRows.length})` },
            { id: 'payments', label: `Platform Payments (${platformPayments.length})` },
            { id: 'entitlements', label: 'Listing Entitlements' },
          ] as { id: SubTab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => switchTab(t.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 ${
              tab === t.id
                ? 'bg-[#047857] text-white dark:bg-[#34D399] dark:text-[#0B1220]'
                : 'bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#374151] text-[#64748B] dark:text-[#9CA3AF]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-base font-bold font-display">{plan.name}</div>
                    <div className="text-[11px] font-mono-num text-[#64748B]">{plan.code} · {plan.billingCycle}</div>
                  </div>
                  <StatusText status={plan.status} />
                </div>
                <div className="text-2xl font-bold font-mono-num text-[#047857] dark:text-[#34D399]">
                  {formatINR(plan.priceInr)}
                  <span className="text-xs font-normal text-[#64748B]">/{plan.billingCycle.toLowerCase()}</span>
                </div>
                <p className="text-[#64748B] dark:text-[#9CA3AF]">{plan.description}</p>
                <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-[#E2E8F0] dark:border-[#374151] font-mono-num">
                  <div>Max Props: {plan.maxProperties}</div>
                  <div>Listing Slots: {plan.includedListingSlots}</div>
                  <div>Max Rooms: {plan.maxRooms}</div>
                  <div>Max Beds: {plan.maxBeds}</div>
                  <div className="col-span-2">Grace Window: {plan.graceDays} days</div>
                </div>
                <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#374151] space-y-1">
                  <div className="font-semibold text-[11px] text-[#64748B]">Included Features ({plan.featureIds.length})</div>
                  {plan.featureIds.map((fid) => {
                    const feat = planFeatures.find((f) => f.id === fid);
                    return feat ? (
                      <div key={fid} className="text-[11px]">• {feat.name}</div>
                    ) : null;
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#E2E8F0] dark:border-[#374151]">
                <ActionBtn kind="edit" onClick={() => openEditPlan(plan)} />
                <button
                  type="button"
                  onClick={() => {
                    duplicateSubscriptionPlan(plan.id);
                    setBanner(`Duplicated plan ${plan.name}.`);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] font-medium"
                >
                  <Copy className="w-3.5 h-3.5" /> Duplicate
                </button>
                {plan.status !== 'Archived' && (
                  <ActionBtn kind="delete" label="Archive" onClick={() => setArchivePlanTarget(plan)} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'features' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#0B1220]/60 text-[#64748B]">
                  <th className="py-2.5 px-3 font-medium">Feature Name &amp; Code</th>
                  <th className="py-2.5 px-3 font-medium">Category</th>
                  <th className="py-2.5 px-3 font-medium">Description</th>
                  <th className="py-2.5 px-3 font-medium">Status</th>
                  <th className="py-2.5 px-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
                {planFeatures.map((feat) => (
                  <tr key={feat.id}>
                    <td className="py-3 px-3">
                      <div className="font-semibold">{feat.name}</div>
                      <div className="font-mono-num text-[11px] text-[#64748B]">{feat.code}</div>
                    </td>
                    <td className="py-3 px-3">{feat.category}</td>
                    <td className="py-3 px-3 text-[#64748B] max-w-xs">{feat.description}</td>
                    <td className="py-3 px-3">
                      <StatusText status={feat.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <ActionBtn kind="edit" compact onClick={() => openEditFeat(feat)} />
                        <button
                          type="button"
                          onClick={() => {
                            togglePlanFeatureStatus(feat.id);
                            setBanner(`Toggled feature ${feat.name} status.`);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] dark:border-[#374151] font-medium"
                        >
                          {feat.status === 'Active' ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'active' && (
        <AdminDataTable
          data={activeSubRows}
          columns={subColumns}
          rowKey={(s) => s.id}
          searchPlaceholder="Search owner name, email, subscription ID, plan..."
          searchExtractor={(s) => `${s.id} ${s.ownerName} ${s.ownerEmail} ${s.planName}`}
          exportFilename="active-owner-subscriptions.csv"
        />
      )}

      {tab === 'expired' && (
        <AdminDataTable
          data={expiredSubRows}
          columns={subColumns}
          rowKey={(s) => s.id}
          searchPlaceholder="Search expired/cancelled owner subscriptions..."
          searchExtractor={(s) => `${s.id} ${s.ownerName} ${s.ownerEmail} ${s.planName}`}
          exportFilename="expired-owner-subscriptions.csv"
        />
      )}

      {tab === 'payments' && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl border border-[#D97706]/30 bg-[#D97706]/10 text-xs flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#D97706] shrink-0" />
            <span>
              Demo / UI-only state: Live payment gateway webhooks (Razorpay/Stripe) are not connected. Pending ₹299 or subscription gateway checkouts remain pending until live gateway settlement is configured.
            </span>
          </div>
          <AdminDataTable
            data={platformPayments}
            columns={paymentColumns}
            rowKey={(p) => p.id}
            searchPlaceholder="Search payment ID, owner, reference..."
            searchExtractor={(p) => `${p.id} ${p.ownerName} ${p.reference} ${p.category} ${p.planOrCampaignName}`}
            exportFilename="platform-payments.csv"
          />
        </div>
      )}

      {tab === 'entitlements' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3 text-xs">
          <h2 className="text-sm font-semibold">Property Public Listing Entitlements</h2>
          <p className="text-[#64748B]">
            Publishing a property requires Approved status + Verified GPS location + either an active Subscription listing slot or ₹299 per-property entitlement.
          </p>
          <div className="space-y-2">
            {properties.filter((p) => !p.archived).map((p) => (
              <div key={p.id} className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-[#64748B]">{p.ownerName} · {p.locality}, {p.city}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono-num text-[#64748B]">{p.listingEntitlementType || 'NONE'}</span>
                  <StatusText status={p.listingStatus} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plan Modal */}
      <ModalSheet
        open={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        title={editingPlan ? `Edit Plan · ${editingPlan.name}` : 'Create Subscription Plan'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const payload = {
              name: pName.trim(),
              code: pCode.trim().toUpperCase(),
              description: pDesc.trim(),
              billingCycle: pCycle,
              priceInr: Number(pPrice) || 0,
              maxProperties: Number(pMaxProps) || 1,
              maxRooms: Number(pMaxRooms) || 10,
              maxBeds: Number(pMaxBeds) || 30,
              includedListingSlots: Number(pSlots) || 0,
              graceDays: Number(pGrace) || 0,
              featureIds: pFeatures,
              status: pStatus,
            };
            if (editingPlan) {
              updateSubscriptionPlan(editingPlan.id, payload);
              setBanner(`Updated plan ${payload.name}.`);
            } else {
              addSubscriptionPlan(payload);
              setBanner(`Created plan ${payload.name}.`);
            }
            setPlanModalOpen(false);
          }}
          className="space-y-3 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Plan Name *</label>
              <input type="text" required value={pName} onChange={(e) => setPName(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]" />
            </div>
            <div>
              <label className="block font-medium mb-1">Plan Code *</label>
              <input type="text" required value={pCode} onChange={(e) => setPCode(e.target.value)} placeholder="e.g. PRO_MONTHLY" className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num" />
            </div>
            <div>
              <label className="block font-medium mb-1">Billing Cycle</label>
              <select value={pCycle} onChange={(e) => setPCycle(e.target.value as SubscriptionPlan['billingCycle'])} className="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]">
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Price (INR ₹)</label>
              <input type="number" min={0} required value={pPrice} onChange={(e) => setPPrice(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num" />
            </div>
            <div>
              <label className="block font-medium mb-1">Max Properties</label>
              <input type="number" min={1} required value={pMaxProps} onChange={(e) => setPMaxProps(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num" />
            </div>
            <div>
              <label className="block font-medium mb-1">Included Listing Slots</label>
              <input type="number" min={0} required value={pSlots} onChange={(e) => setPSlots(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num" />
            </div>
            <div>
              <label className="block font-medium mb-1">Max Rooms</label>
              <input type="number" min={1} required value={pMaxRooms} onChange={(e) => setPMaxRooms(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num" />
            </div>
            <div>
              <label className="block font-medium mb-1">Max Beds</label>
              <input type="number" min={1} required value={pMaxBeds} onChange={(e) => setPMaxBeds(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num" />
            </div>
            <div>
              <label className="block font-medium mb-1">Grace Period Days</label>
              <input type="number" min={0} required value={pGrace} onChange={(e) => setPGrace(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num" />
            </div>
            <div>
              <label className="block font-medium mb-1">Plan Status</label>
              <select value={pStatus} onChange={(e) => setPStatus(e.target.value as SubscriptionPlan['status'])} className="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Description *</label>
            <textarea rows={2} required value={pDesc} onChange={(e) => setPDesc(e.target.value)} className="w-full p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]" />
          </div>

          <div>
            <label className="block font-medium mb-1.5">Included Plan Features</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151]">
              {planFeatures.map((f) => (
                <label key={f.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={pFeatures.includes(f.id)}
                    onChange={(e) => {
                      setPFeatures((prev) =>
                        e.target.checked ? [...prev, f.id] : prev.filter((id) => id !== f.id)
                      );
                    }}
                    className="accent-[#047857]"
                  />
                  <span className="truncate">{f.name}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold">
            {editingPlan ? 'Save Plan Updates' : 'Create Subscription Plan'}
          </button>
        </form>
      </ModalSheet>

      {/* Feature Modal */}
      <ModalSheet
        open={featModalOpen}
        onClose={() => setFeatModalOpen(false)}
        title={editingFeat ? `Edit Feature · ${editingFeat.name}` : 'Add Plan Feature'}
        maxWidth="max-w-lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const payload = {
              name: fName.trim(),
              code: fCode.trim().toUpperCase(),
              category: fCat,
              description: fDesc.trim(),
              status: fStatus,
            };
            if (editingFeat) {
              updatePlanFeature(editingFeat.id, payload);
              setBanner(`Updated feature ${payload.name}.`);
            } else {
              addPlanFeature(payload);
              setBanner(`Added feature ${payload.name}.`);
            }
            setFeatModalOpen(false);
          }}
          className="space-y-3 text-xs"
        >
          <div>
            <label className="block font-medium mb-1">Feature Name *</label>
            <input type="text" required value={fName} onChange={(e) => setFName(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium mb-1">Code *</label>
              <input type="text" required value={fCode} onChange={(e) => setFCode(e.target.value)} placeholder="MULTI_PROP_OPS" className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num" />
            </div>
            <div>
              <label className="block font-medium mb-1">Category</label>
              <select value={fCat} onChange={(e) => setFCat(e.target.value as PlanFeature['category'])} className="w-full h-9 px-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]">
                {[
                  'Property Management',
                  'Tenant Management',
                  'Finance & Billing',
                  'Analytics',
                  'Support & Priority',
                  'Listing & Promotion',
                ].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Description *</label>
            <textarea rows={2} required value={fDesc} onChange={(e) => setFDesc(e.target.value)} className="w-full p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]" />
          </div>
          <button type="submit" className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold">
            {editingFeat ? 'Save Feature' : 'Create Feature'}
          </button>
        </form>
      </ModalSheet>

      {/* Owner Subscription Action Modal */}
      <ModalSheet
        open={Boolean(subActionTarget)}
        onClose={() => setSubActionTarget(null)}
        title={
          subActionTarget
            ? `${
                subActionTarget.mode === 'change_plan'
                  ? 'Change Plan'
                  : subActionTarget.mode === 'extend'
                  ? 'Extend Subscription'
                  : subActionTarget.mode === 'cancel'
                  ? 'Cancel Subscription'
                  : 'Restore Subscription'
              } · ${subActionTarget.sub.ownerName}`
            : 'Manage Subscription'
        }
        maxWidth="max-w-md"
      >
        {subActionTarget && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              manageOwnerSubscription(subActionTarget.sub.id, subActionTarget.mode, {
                planId: subActionTarget.mode === 'change_plan' ? subPlanId : undefined,
                newEndDate: subActionTarget.mode === 'extend' ? subNewEnd : undefined,
                reason: subReason.trim() || 'Super Admin manual update',
              });
              setBanner(`Updated subscription for ${subActionTarget.sub.ownerName}.`);
              setSubActionTarget(null);
            }}
            className="space-y-3 text-xs"
          >
            {subActionTarget.mode === 'change_plan' && (
              <div>
                <label className="block font-medium mb-1">Select New Plan</label>
                <select
                  value={subPlanId}
                  onChange={(e) => setSubPlanId(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                >
                  {subscriptionPlans.filter((p) => p.status === 'Active').map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatINR(p.priceInr)}/{p.billingCycle}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {subActionTarget.mode === 'extend' && (
              <div>
                <label className="block font-medium mb-1">New End Date</label>
                <input
                  type="date"
                  required
                  value={subNewEnd}
                  onChange={(e) => setSubNewEnd(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
                />
              </div>
            )}

            <div>
              <label className="block font-medium mb-1">Reason for Audit Log *</label>
              <textarea
                rows={3}
                required
                value={subReason}
                onChange={(e) => setSubReason(e.target.value)}
                placeholder="Document justification for plan/subscription adjustment..."
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              />
            </div>

            <button
              type="submit"
              className={`w-full h-10 rounded-xl font-semibold text-white ${
                subActionTarget.mode === 'cancel' ? 'bg-[#DC2626]' : 'bg-[#047857]'
              }`}
            >
              Confirm Subscription Update
            </button>
          </form>
        )}
      </ModalSheet>

      <ConfirmDialog
        open={Boolean(archivePlanTarget)}
        onClose={() => setArchivePlanTarget(null)}
        title={`Archive Plan ${archivePlanTarget?.name || ''}`}
        description="Plans assigned to existing owner subscriptions are archived so billing history remains intact; unused plans are deleted."
        confirmLabel="Confirm"
        tone="warning"
        onConfirm={() => {
          if (archivePlanTarget) {
            const res = deleteOrArchiveSubscriptionPlan(archivePlanTarget.id);
            setBanner(res.message);
          }
          setArchivePlanTarget(null);
        }}
      />
    </div>
  );
};
