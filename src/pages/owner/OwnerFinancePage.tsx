import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { BellRing, Download, Plus, RotateCcw } from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import { ActionBtn, KpiCard, ModalSheet, StatusText } from '../../components/ui/Primitives';
import { exportRowsToCsv, formatINR } from '../../utils/formatters';
import { DepositTransaction, OwnerExpense, RentInvoice, RentPayment, TenantStay } from '../../types/pgfinder';

const EXPENSE_CATEGORIES: OwnerExpense['category'][] = [
  'Electricity',
  'Water',
  'Food',
  'Groceries',
  'Staff Salaries',
  'Property Rent',
  'Internet',
  'Cleaning',
  'Maintenance',
  'Repairs',
  'Furniture',
  'Equipment',
  'Laundry',
  'Marketing',
  'Licences',
  'Other',
];

export const OwnerFinancePage: React.FC = () => {
  const {
    currentUser,
    properties,
    floors,
    rooms,
    stays,
    rentInvoices,
    rentPayments,
    depositTransactions,
    ownerExpenses,
    ownerSelectedPropertyId,
    setOwnerSelectedPropertyId,
    recordRentPayment,
    reverseRentPayment,
    sendRentReminder,
    generateMonthlyInvoices,
    recordDepositTransaction,
    addOwnerExpense,
    updateOwnerExpense,
    reverseOwnerExpense,
  } = usePGFinder();

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultTab = location.pathname.includes('/owner/expenses')
    ? 'expenses'
    : (searchParams.get('tab') as 'overview' | 'rent' | 'history' | 'deposits' | 'expenses') || 'overview';
  const [tab, setTab] = useState<'overview' | 'rent' | 'history' | 'deposits' | 'expenses'>(defaultTab);

  useEffect(() => {
    const pid = searchParams.get('propertyId');
    if (pid) setOwnerSelectedPropertyId(pid);
    if (location.pathname.includes('/owner/expenses')) {
      setTab('expenses');
    } else {
      const t = searchParams.get('tab') as typeof tab | null;
      if (t && ['overview', 'rent', 'history', 'deposits', 'expenses'].includes(t)) setTab(t);
    }
  }, [searchParams, location.pathname, setOwnerSelectedPropertyId]);

  const ownerProps = useMemo(
    () => properties.filter((p) => p.ownerId === (currentUser?.id || 'usr-owner-1') && !p.archived),
    [properties, currentUser]
  );
  const scopedPropIds = useMemo(
    () => (ownerSelectedPropertyId === 'ALL' ? ownerProps.map((p) => p.id) : [ownerSelectedPropertyId]),
    [ownerSelectedPropertyId, ownerProps]
  );

  const [banner, setBanner] = useState<{ ok: boolean; text: string } | null>(null);

  // Rent modals
  const [viewInvoice, setViewInvoice] = useState<RentInvoice | null>(null);
  const [payInvoice, setPayInvoice] = useState<RentInvoice | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<RentPayment['method']>('UPI');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Reverse Payment modal
  const [viewPayment, setViewPayment] = useState<RentPayment | null>(null);
  const [reversePayTarget, setReversePayTarget] = useState<RentPayment | null>(null);
  const [reversePayReason, setReversePayReason] = useState('');

  // Deposit modals
  const [ledgerStay, setLedgerStay] = useState<TenantStay | null>(null);
  const [depositActionStay, setDepositActionStay] = useState<TenantStay | null>(null);
  const [depType, setDepType] = useState<DepositTransaction['type']>('Payment');
  const [depAmt, setDepAmt] = useState('');
  const [depMethod, setDepMethod] = useState('UPI');
  const [depNote, setDepNote] = useState('');

  // Expense modals
  const [expModal, setExpModal] = useState<{ mode: 'add' | 'edit'; exp?: OwnerExpense } | null>(null);
  const [expPropId, setExpPropId] = useState(ownerProps[0]?.id || 'prop-1');
  const [expTitle, setExpTitle] = useState('');
  const [expCat, setExpCat] = useState<OwnerExpense['category']>('Electricity');
  const [expAmt, setExpAmt] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10));
  const [expVendor, setExpVendor] = useState('');
  const [expMethod, setExpMethod] = useState<OwnerExpense['method']>('UPI');
  const [expNotes, setExpNotes] = useState('');
  const [expCatFilter, setExpCatFilter] = useState('ALL');
  const [viewExp, setViewExp] = useState<OwnerExpense | null>(null);
  const [reverseExpTarget, setReverseExpTarget] = useState<OwnerExpense | null>(null);
  const [reverseExpReason, setReverseExpReason] = useState('');

  const invoices = rentInvoices.filter((i) => scopedPropIds.includes(i.propertyId));
  const payments = rentPayments.filter((p) => scopedPropIds.includes(p.propertyId));
  const activeExpenses = ownerExpenses.filter((e) => scopedPropIds.includes(e.propertyId) && !e.reversed);
  const allExpenses = ownerExpenses.filter(
    (e) => scopedPropIds.includes(e.propertyId) && (expCatFilter === 'ALL' || e.category === expCatFilter)
  );
  const ownerStays = stays.filter((s) => scopedPropIds.includes(s.propertyId));

  // Rent KPIs
  const expectedRent = invoices.reduce((s, i) => s + i.rentAmount + i.additionalCharges, 0);
  const collectedRent = invoices.reduce((s, i) => s + i.paidAmount, 0);
  const pendingRent = Math.max(0, expectedRent - collectedRent);
  const overdueRent = invoices
    .filter((i) => i.status === 'Overdue')
    .reduce((s, i) => s + Math.max(0, i.rentAmount + i.additionalCharges - i.paidAmount), 0);

  // Deposit KPIs (6 summary cards)
  const totalDepositRequired = ownerStays.reduce((s, x) => s + x.securityDeposit, 0);
  const totalDepositReceived = ownerStays.reduce((s, x) => s + x.depositPaid, 0);
  const totalDepositPending = ownerStays.reduce(
    (s, x) => s + Math.max(0, x.securityDeposit - x.depositPaid),
    0
  );
  const totalDepositDeductions = ownerStays.reduce((s, x) => s + (x.depositDeductions || 0), 0);
  const totalDepositRefunded = ownerStays.reduce((s, x) => s + (x.depositRefunded || 0), 0);
  const totalDepositRefundable = Math.max(0, totalDepositReceived - totalDepositDeductions - totalDepositRefunded);

  // Expense KPIs (5 summary cards)
  const todayStr = new Date().toISOString().slice(0, 10);
  const monthPrefix = todayStr.slice(0, 7);
  const totalExpenses = activeExpenses.reduce((s, e) => s + e.amount, 0);
  const todayExpenses = activeExpenses.filter((e) => e.date === todayStr).reduce((s, e) => s + e.amount, 0);
  const thisMonthExpenses = activeExpenses
    .filter((e) => e.date.startsWith(monthPrefix) || e.date.startsWith('2026-11'))
    .reduce((s, e) => s + e.amount, 0);
  const prevMonthExpenses = activeExpenses
    .filter((e) => e.date.startsWith('2026-10'))
    .reduce((s, e) => s + e.amount, 0);
  const catTotals = activeExpenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const highestCategory =
    Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

  const switchTab = (next: typeof tab) => {
    setTab(next);
    if (next === 'expenses') {
      navigate(`/owner/expenses${ownerSelectedPropertyId !== 'ALL' ? `?propertyId=${ownerSelectedPropertyId}` : ''}`);
    } else {
      const p: Record<string, string> = { tab: next };
      if (ownerSelectedPropertyId !== 'ALL') p.propertyId = ownerSelectedPropertyId;
      navigate(`/owner/finance?${new URLSearchParams(p).toString()}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-display">Owner Finance &amp; Business Expenses</h1>
          <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
            Track rent collection, payment receipts, refundable security deposits, and operating business expenses separately.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={ownerSelectedPropertyId}
            onChange={(e) => setOwnerSelectedPropertyId(e.target.value)}
            aria-label="Filter by property"
            className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] text-xs font-medium"
          >
            <option value="ALL">All Properties ({ownerProps.length})</option>
            {ownerProps.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setExpPropId(ownerSelectedPropertyId !== 'ALL' ? ownerSelectedPropertyId : ownerProps[0]?.id || 'prop-1');
              setExpTitle('');
              setExpCat('Electricity');
              setExpAmt('');
              setExpDate(new Date().toISOString().slice(0, 10));
              setExpVendor('');
              setExpNotes('');
              setExpModal({ mode: 'add' });
            }}
            className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-[#047857] dark:bg-[#34D399] text-white dark:text-[#0B1220] text-xs font-semibold shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Business Expense
          </button>
        </div>
      </div>

      {banner && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            banner.ok
              ? 'border-[#059669]/30 bg-[#059669]/10 text-[#059669] dark:text-[#34D399]'
              : 'border-[#DC2626]/30 bg-[#DC2626]/10 text-[#DC2626] dark:text-[#F87171]'
          }`}
        >
          <span>{banner.text}</span>
          <button type="button" onClick={() => setBanner(null)} className="font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] w-fit max-w-full">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'rent', label: 'Rent Collection' },
          { id: 'history', label: 'Payment History' },
          { id: 'deposits', label: 'Security Deposits' },
          { id: 'expenses', label: 'Business Expenses' },
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

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard label="Expected Rent" value={formatINR(expectedRent)} />
            <KpiCard label="Rent Collected" value={formatINR(collectedRent)} tone="success" />
            <KpiCard label="Pending Rent" value={formatINR(pendingRent)} tone="warning" subtext={`Overdue: ${formatINR(overdueRent)}`} />
            <KpiCard label="Deposits Held" value={formatINR(totalDepositRefundable)} subtext="Refundable liability" />
            <KpiCard label="Business Expenses" value={formatINR(totalExpenses)} />
            <KpiCard
              label="Operating Net"
              value={formatINR(collectedRent - totalExpenses)}
              tone={collectedRent - totalExpenses >= 0 ? 'primary' : 'error'}
              subtext="Rent − expenses"
            />
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Recent Rent Payment Receipts</h2>
              <button
                type="button"
                onClick={() => switchTab('history')}
                className="text-xs font-semibold text-[#047857] dark:text-[#34D399]"
              >
                Open Full Payment History
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
                    <th className="py-2 pr-3 font-medium">Receipt</th>
                    <th className="py-2 pr-3 font-medium">Method</th>
                    <th className="py-2 pr-3 font-medium font-mono-num">Paid Date</th>
                    <th className="py-2 pr-3 font-medium font-mono-num">Amount</th>
                    <th className="py-2 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
                  {payments.slice(0, 6).map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 pr-3 font-mono-num font-medium">{p.reference}</td>
                      <td className="py-2.5 pr-3">{p.method}</td>
                      <td className="py-2.5 pr-3 font-mono-num">{p.paidAt}</td>
                      <td className="py-2.5 pr-3 font-mono-num font-semibold">{formatINR(p.amount)}</td>
                      <td className="py-2.5 text-right">
                        <StatusText status={p.reversed ? 'Cancelled' : 'Paid'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* RENT COLLECTION TABLE */}
      {tab === 'rent' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Rent Collection Table</h2>
            <button
              type="button"
              onClick={() => {
                const count = generateMonthlyInvoices(ownerSelectedPropertyId, 'December 2026', '2026-12-05');
                setBanner({
                  ok: true,
                  text:
                    count > 0
                      ? `Generated ${count} rent invoice(s) for December 2026.`
                      : 'All active stays already have December 2026 invoices (duplicates prevented).',
                });
              }}
              className="px-3 py-1.5 rounded-lg border border-[#047857] text-[#047857] dark:border-[#34D399] dark:text-[#34D399] text-xs font-semibold"
            >
              Generate Dec 2026 Rent
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B] dark:text-[#9CA3AF]">
                  <th className="py-2 pr-3 font-medium">Tenant</th>
                  <th className="py-2 pr-3 font-medium">PG / Floor / Room</th>
                  <th className="py-2 pr-3 font-medium">Month</th>
                  <th className="py-2 pr-3 font-medium font-mono-num">Rent</th>
                  <th className="py-2 pr-3 font-medium font-mono-num">Paid</th>
                  <th className="py-2 pr-3 font-medium font-mono-num">Pending</th>
                  <th className="py-2 pr-3 font-medium font-mono-num">Due Date</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
                {invoices.map((inv) => {
                  const stay = stays.find((s) => s.id === inv.stayId);
                  const prop = properties.find((p) => p.id === inv.propertyId);
                  const fl = floors.find((f) => f.id === stay?.floorId);
                  const rm = rooms.find((r) => r.id === stay?.roomId);
                  const total = inv.rentAmount + inv.additionalCharges;
                  const bal = Math.max(0, total - inv.paidAmount);

                  return (
                    <tr key={inv.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1F2937]/40">
                      <td className="py-2.5 pr-3 whitespace-nowrap">
                        <div className="font-semibold">{inv.tenantName}</div>
                        <div className="text-[11px] text-[#64748B] font-mono-num">{stay?.tenantMobile || '—'}</div>
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">
                        <div>{prop?.name}</div>
                        <div className="text-[11px] text-[#64748B]">
                          {fl?.name || '—'} · Room {rm?.roomNumber || '—'}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">{inv.monthLabel}</td>
                      <td className="py-2.5 pr-3 font-mono-num">{formatINR(total)}</td>
                      <td className="py-2.5 pr-3 font-mono-num text-[#059669] dark:text-[#34D399]">
                        {formatINR(inv.paidAmount)}
                      </td>
                      <td className="py-2.5 pr-3 font-mono-num font-semibold text-[#D97706] dark:text-[#FBBF24]">
                        {formatINR(bal)}
                      </td>
                      <td className="py-2.5 pr-3 font-mono-num whitespace-nowrap">{inv.dueDate}</td>
                      <td className="py-2.5 pr-3">
                        <StatusText status={inv.status} />
                      </td>
                      <td className="py-2.5 text-right min-w-[270px]">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <ActionBtn kind="view" label="Details" onClick={() => setViewInvoice(inv)} />
                          {bal > 0 && (
                            <>
                              <ActionBtn
                                kind="add"
                                label="Record Pay"
                                onClick={() => {
                                  setPayInvoice(inv);
                                  setPayAmount(String(bal));
                                  setPayRef('');
                                  setPayNotes('');
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  sendRentReminder(inv.id);
                                  setBanner({ ok: true, text: `Rent reminder sent to ${inv.tenantName}.` });
                                }}
                                className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] dark:border-[#374151] px-2.5 py-1.5 text-xs font-medium min-h-[34px]"
                              >
                                <BellRing className="w-3.5 h-3.5 text-[#D97706]" /> Remind
                              </button>
                            </>
                          )}
                          {inv.paidAmount > 0 && (
                            <ActionBtn
                              kind="download"
                              label="Receipt"
                              onClick={() => window.print()}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAYMENT HISTORY TABLE */}
      {tab === 'history' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Rent Payment History &amp; Reversal Audit</h2>
            <ActionBtn
              kind="download"
              label="Export CSV"
              onClick={() =>
                exportRowsToCsv(
                  'pg-finder-rent-payments.csv',
                  ['Payment ID', 'Date', 'Tenant', 'Property', 'Amount', 'Method', 'Reference', 'Status'],
                  payments.map((p) => {
                    const inv = rentInvoices.find((i) => i.id === p.invoiceId);
                    return [
                      p.id,
                      p.paidAt,
                      inv?.tenantName || '',
                      properties.find((pr) => pr.id === p.propertyId)?.name || '',
                      p.amount,
                      p.method,
                      p.reference,
                      p.reversed ? 'Reversed' : 'Paid',
                    ];
                  })
                )
              }
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
                  <th className="py-2 pr-3 font-medium">Payment ID</th>
                  <th className="py-2 pr-3 font-medium">Tenant &amp; PG</th>
                  <th className="py-2 pr-3 font-medium">Month</th>
                  <th className="py-2 pr-3 font-medium font-mono-num">Amount</th>
                  <th className="py-2 pr-3 font-medium">Method &amp; Ref</th>
                  <th className="py-2 pr-3 font-medium font-mono-num">Paid Date</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
                {payments.map((p) => {
                  const inv = rentInvoices.find((i) => i.id === p.invoiceId);
                  const prop = properties.find((pr) => pr.id === p.propertyId);
                  return (
                    <tr key={p.id}>
                      <td className="py-2.5 pr-3 font-mono-num text-[#64748B]">{p.id}</td>
                      <td className="py-2.5 pr-3">
                        <div className="font-semibold">{inv?.tenantName || p.tenantId}</div>
                        <div className="text-[11px] text-[#64748B]">{prop?.name}</div>
                      </td>
                      <td className="py-2.5 pr-3">{inv?.monthLabel || '—'}</td>
                      <td className="py-2.5 pr-3 font-mono-num font-semibold">{formatINR(p.amount)}</td>
                      <td className="py-2.5 pr-3 font-mono-num">
                        {p.method} · {p.reference}
                      </td>
                      <td className="py-2.5 pr-3 font-mono-num">{p.paidAt}</td>
                      <td className="py-2.5 pr-3">
                        <StatusText status={p.reversed ? 'Cancelled' : 'Paid'} />
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <ActionBtn kind="view" onClick={() => setViewPayment(p)} />
                          {!p.reversed && (
                            <button
                              type="button"
                              onClick={() => {
                                setReversePayTarget(p);
                                setReversePayReason('');
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] dark:border-[#374151] px-2.5 py-1.5 text-xs font-medium text-[#DC2626] dark:text-[#F87171] min-h-[34px]"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Reverse
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECURITY DEPOSITS (6 CARDS + TABLE) */}
      {tab === 'deposits' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <KpiCard label="Total Required" value={formatINR(totalDepositRequired)} />
            <KpiCard label="Total Received" value={formatINR(totalDepositReceived)} tone="success" />
            <KpiCard label="Pending Deposit" value={formatINR(totalDepositPending)} tone="warning" />
            <KpiCard label="Deductions" value={formatINR(totalDepositDeductions)} tone="error" />
            <KpiCard label="Refundable Held" value={formatINR(totalDepositRefundable)} tone="info" />
            <KpiCard label="Total Refunded" value={formatINR(totalDepositRefunded)} />
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
                  <th className="py-2 pr-3 font-medium">Tenant</th>
                  <th className="py-2 pr-3 font-medium">PG &amp; Room</th>
                  <th className="py-2 pr-3 font-medium font-mono-num">Required</th>
                  <th className="py-2 pr-3 font-medium font-mono-num">Received</th>
                  <th className="py-2 pr-3 font-medium font-mono-num">Pending</th>
                  <th className="py-2 pr-3 font-medium font-mono-num">Deductions</th>
                  <th className="py-2 pr-3 font-medium font-mono-num">Refundable</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
                {ownerStays.map((s) => {
                  const pending = Math.max(0, s.securityDeposit - s.depositPaid);
                  const ded = s.depositDeductions || 0;
                  const refunded = s.depositRefunded || 0;
                  const refundable = Math.max(0, s.depositPaid - ded - refunded);

                  return (
                    <tr key={s.id}>
                      <td className="py-2.5 pr-3">
                        <div className="font-semibold">{s.tenantName}</div>
                        <div className="text-[11px] text-[#64748B] font-mono-num">{s.tenantMobile}</div>
                      </td>
                      <td className="py-2.5 pr-3">
                        {properties.find((p) => p.id === s.propertyId)?.name} · Room{' '}
                        {rooms.find((r) => r.id === s.roomId)?.roomNumber}
                      </td>
                      <td className="py-2.5 pr-3 font-mono-num">{formatINR(s.securityDeposit)}</td>
                      <td className="py-2.5 pr-3 font-mono-num text-[#059669] dark:text-[#34D399]">{formatINR(s.depositPaid)}</td>
                      <td className="py-2.5 pr-3 font-mono-num text-[#D97706] dark:text-[#FBBF24]">{formatINR(pending)}</td>
                      <td className="py-2.5 pr-3 font-mono-num">{formatINR(ded)}</td>
                      <td className="py-2.5 pr-3 font-mono-num font-semibold">{formatINR(refundable)}</td>
                      <td className="py-2.5 pr-3">
                        <StatusText status={s.depositStatus || (pending === 0 ? 'Received' : 'Pending')} />
                      </td>
                      <td className="py-2.5 text-right min-w-[230px]">
                        <div className="flex justify-end gap-1.5">
                          <ActionBtn kind="view" label="Ledger" onClick={() => setLedgerStay(s)} />
                          <ActionBtn
                            kind="add"
                            label="Record"
                            onClick={() => {
                              setDepositActionStay(s);
                              setDepType(pending > 0 ? 'Payment' : 'Deduction');
                              setDepAmt(String(pending > 0 ? pending : 0));
                              setDepNote('');
                            }}
                          />
                          <ActionBtn kind="download" label="Receipt" onClick={() => window.print()} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BUSINESS EXPENSES (5 CARDS + 16-CATEGORY TABLE) */}
      {tab === 'expenses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            <KpiCard label="Today Expenses" value={formatINR(todayExpenses)} />
            <KpiCard label="This Month" value={formatINR(thisMonthExpenses)} tone="warning" />
            <KpiCard label="Previous Month" value={formatINR(prevMonthExpenses)} />
            <KpiCard label="Highest Category" value={highestCategory} />
            <KpiCard label="Total Operating" value={formatINR(totalExpenses)} tone="primary" />
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">Operating Expenses Ledger</h2>
                <select
                  value={expCatFilter}
                  onChange={(e) => setExpCatFilter(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-xs"
                >
                  <option value="ALL">All 16 Categories</option>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <ActionBtn
                kind="download"
                label="Export CSV"
                onClick={() =>
                  exportRowsToCsv(
                    'pg-finder-owner-expenses.csv',
                    ['Expense ID', 'Date', 'Property', 'Title', 'Category', 'Vendor', 'Method', 'Amount', 'Status'],
                    allExpenses.map((e) => [
                      e.id,
                      e.date,
                      properties.find((p) => p.id === e.propertyId)?.name || '',
                      e.title,
                      e.category,
                      e.vendor,
                      e.method,
                      e.amount,
                      e.reversed ? 'Reversed' : 'Recorded',
                    ])
                  )
                }
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
                    <th className="py-2 pr-3 font-medium">Expense ID</th>
                    <th className="py-2 pr-3 font-medium">PG Name</th>
                    <th className="py-2 pr-3 font-medium">Title</th>
                    <th className="py-2 pr-3 font-medium">Category</th>
                    <th className="py-2 pr-3 font-medium font-mono-num">Amount</th>
                    <th className="py-2 pr-3 font-medium font-mono-num">Date</th>
                    <th className="py-2 pr-3 font-medium">Method &amp; Vendor</th>
                    <th className="py-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
                  {allExpenses.map((e) => (
                    <tr key={e.id} className={e.reversed ? 'opacity-55' : ''}>
                      <td className="py-2.5 pr-3 font-mono-num text-[#64748B]">{e.id}</td>
                      <td className="py-2.5 pr-3">{properties.find((p) => p.id === e.propertyId)?.name}</td>
                      <td className="py-2.5 pr-3 font-semibold">{e.title}</td>
                      <td className="py-2.5 pr-3">{e.category}</td>
                      <td className="py-2.5 pr-3 font-mono-num font-bold">{formatINR(e.amount)}</td>
                      <td className="py-2.5 pr-3 font-mono-num">{e.date}</td>
                      <td className="py-2.5 pr-3">
                        {e.method} · {e.vendor}
                      </td>
                      <td className="py-2.5 text-right min-w-[230px]">
                        <div className="flex justify-end gap-1.5">
                          <ActionBtn kind="view" onClick={() => setViewExp(e)} />
                          {!e.reversed && (
                            <>
                              <ActionBtn
                                kind="edit"
                                onClick={() => {
                                  setExpPropId(e.propertyId);
                                  setExpTitle(e.title);
                                  setExpCat(e.category);
                                  setExpAmt(String(e.amount));
                                  setExpDate(e.date);
                                  setExpVendor(e.vendor);
                                  setExpMethod(e.method);
                                  setExpNotes(e.notes || '');
                                  setExpModal({ mode: 'edit', exp: e });
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setReverseExpTarget(e);
                                  setReverseExpReason('');
                                }}
                                className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] dark:border-[#374151] px-2.5 py-1.5 text-xs font-medium text-[#DC2626] dark:text-[#F87171] min-h-[34px]"
                              >
                                <RotateCcw className="w-3.5 h-3.5" /> Reverse
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      <ModalSheet open={viewInvoice !== null} onClose={() => setViewInvoice(null)} title="Rent Invoice Details" subtitle={viewInvoice?.id}>
        {viewInvoice && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151]">
              <div>Tenant: <span className="font-semibold">{viewInvoice.tenantName}</span></div>
              <div>Month: {viewInvoice.monthLabel}</div>
              <div>Monthly Rent: <span className="font-mono-num">{formatINR(viewInvoice.rentAmount)}</span></div>
              <div>Additional Charges: <span className="font-mono-num">{formatINR(viewInvoice.additionalCharges)}</span></div>
              <div>Paid: <span className="font-mono-num font-semibold">{formatINR(viewInvoice.paidAmount)}</span></div>
              <div>Due Date: <span className="font-mono-num">{viewInvoice.dueDate}</span></div>
              <div>Status: <StatusText status={viewInvoice.status} /></div>
              <div>Last Reminder: {viewInvoice.lastReminderAt || 'None sent'}</div>
            </div>
          </div>
        )}
      </ModalSheet>

      {/* Record Rent Payment Modal */}
      <ModalSheet
        open={payInvoice !== null}
        onClose={() => setPayInvoice(null)}
        title="Record Rent Payment"
        subtitle={payInvoice ? `${payInvoice.tenantName} · ${payInvoice.monthLabel}` : ''}
      >
        {payInvoice && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const res = recordRentPayment(payInvoice.id, Number(payAmount) || 0, payMethod, payRef, payNotes);
              setBanner({ ok: res.ok, text: res.message });
              if (res.ok) setPayInvoice(null);
            }}
            className="space-y-3 text-xs"
          >
            <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1F2937]/40 font-mono-num flex justify-between">
              <span>Pending Balance: {formatINR(Math.max(0, payInvoice.rentAmount + payInvoice.additionalCharges - payInvoice.paidAmount))}</span>
              <span>Auto-calculates Partial/Paid</span>
            </div>
            <div>
              <label className="block font-medium mb-1">Amount Received (₹)</label>
              <input
                type="number"
                required
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as RentPayment['method'])}
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                {['UPI', 'Bank Transfer', 'Cash', 'Card', 'Other'].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="UPI / UTR Reference"
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
              />
            </div>
            <input
              type="text"
              value={payNotes}
              onChange={(e) => setPayNotes(e.target.value)}
              placeholder="Optional payment note"
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            />
            <button type="submit" className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold">
              Confirm &amp; Issue Receipt
            </button>
          </form>
        )}
      </ModalSheet>

      {/* View & Reverse Rent Payment Modals */}
      <ModalSheet open={viewPayment !== null} onClose={() => setViewPayment(null)} title="Payment Receipt Details" subtitle={viewPayment?.id}>
        {viewPayment && (
          <div className="space-y-2 text-xs">
            <div>Amount: <span className="font-mono-num font-bold">{formatINR(viewPayment.amount)}</span></div>
            <div>Method: {viewPayment.method}</div>
            <div>Reference: <span className="font-mono-num">{viewPayment.reference}</span></div>
            <div>Paid On: <span className="font-mono-num">{viewPayment.paidAt}</span></div>
            <div>Recorded By: {viewPayment.recordedBy}</div>
            {viewPayment.reversed && (
              <div className="p-2.5 rounded-lg bg-[#DC2626]/10 text-[#DC2626]">
                Reversed: {viewPayment.reversalReason}
              </div>
            )}
          </div>
        )}
      </ModalSheet>

      <ModalSheet open={reversePayTarget !== null} onClose={() => setReversePayTarget(null)} title="Reverse Rent Payment" subtitle={reversePayTarget?.reference}>
        {reversePayTarget && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!reversePayReason.trim()) return;
              reverseRentPayment(reversePayTarget.id, reversePayReason.trim());
              setBanner({ ok: true, text: `Reversed receipt ${reversePayTarget.reference} with audit trail.` });
              setReversePayTarget(null);
            }}
            className="space-y-3 text-xs"
          >
            <p className="text-[#64748B]">
              Confirmed financial payments are never silently deleted. Reversing restores the invoice balance and logs an audit entry.
            </p>
            <input
              type="text"
              required
              value={reversePayReason}
              onChange={(e) => setReversePayReason(e.target.value)}
              placeholder="Reason for reversal *"
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            />
            <button type="submit" className="w-full h-10 rounded-xl bg-[#DC2626] text-white font-semibold">
              Confirm Payment Reversal
            </button>
          </form>
        )}
      </ModalSheet>

      {/* Deposit Ledger & Action Modals */}
      <ModalSheet open={ledgerStay !== null} onClose={() => setLedgerStay(null)} title={`Deposit Ledger — ${ledgerStay?.tenantName || ''}`}>
        {ledgerStay && (
          <div className="space-y-2.5 text-xs">
            {depositTransactions.filter((d) => d.stayId === ledgerStay.id).length === 0 ? (
              <div className="text-[#64748B] py-4 text-center">No deposit transactions recorded yet.</div>
            ) : (
              depositTransactions
                .filter((d) => d.stayId === ledgerStay.id)
                .map((d) => (
                  <div key={d.id} className="p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex justify-between">
                    <div>
                      <div className="font-semibold">{d.type}</div>
                      <div className="text-[#64748B]">{d.date} · {d.note}</div>
                    </div>
                    <div className="font-mono-num font-bold">{formatINR(d.amount)}</div>
                  </div>
                ))
            )}
          </div>
        )}
      </ModalSheet>

      <ModalSheet open={depositActionStay !== null} onClose={() => setDepositActionStay(null)} title={`Record Deposit Entry — ${depositActionStay?.tenantName || ''}`}>
        {depositActionStay && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              recordDepositTransaction({
                stayId: depositActionStay.id,
                tenantId: depositActionStay.tenantId,
                tenantName: depositActionStay.tenantName,
                propertyId: depositActionStay.propertyId,
                type: depType,
                amount: Number(depAmt) || 0,
                date: new Date().toISOString().slice(0, 10),
                method: depMethod,
                note: depNote.trim() || `${depType} recorded`,
              });
              setBanner({ ok: true, text: `Recorded security deposit ${depType.toLowerCase()} for ${depositActionStay.tenantName}.` });
              setDepositActionStay(null);
            }}
            className="space-y-3 text-xs"
          >
            <div className="grid grid-cols-2 gap-3">
              <select
                value={depType}
                onChange={(e) => setDepType(e.target.value as DepositTransaction['type'])}
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                <option value="Payment">Receive Deposit</option>
                <option value="Deduction">Record Deduction</option>
                <option value="Refund">Record Refund</option>
                <option value="Adjustment">Adjustment</option>
              </select>
              <input
                type="number"
                required
                value={depAmt}
                onChange={(e) => setDepAmt(e.target.value)}
                placeholder="Amount ₹"
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
              />
            </div>
            <input
              type="text"
              value={depMethod}
              onChange={(e) => setDepMethod(e.target.value)}
              placeholder="Payment Method (UPI / Bank Transfer / Cash)"
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            />
            <input
              type="text"
              required
              value={depNote}
              onChange={(e) => setDepNote(e.target.value)}
              placeholder="Reason / Note *"
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            />
            <button type="submit" className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold">
              Save Deposit Entry
            </button>
          </form>
        )}
      </ModalSheet>

      {/* Add / Edit Business Expense Modal */}
      <ModalSheet
        open={expModal !== null}
        onClose={() => setExpModal(null)}
        title={expModal?.mode === 'edit' ? 'Edit Business Expense' : 'Add Business Expense'}
      >
        {expModal && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!expTitle.trim() || !expAmt) return;
              if (expModal.mode === 'add') {
                addOwnerExpense({
                  propertyId: expPropId,
                  title: expTitle.trim(),
                  category: expCat,
                  amount: Number(expAmt) || 0,
                  date: expDate,
                  method: expMethod,
                  vendor: expVendor.trim() || 'Local Vendor',
                  notes: expNotes.trim(),
                  recurring: false,
                });
                setBanner({ ok: true, text: `Recorded expense "${expTitle.trim()}".` });
              } else if (expModal.exp) {
                updateOwnerExpense(expModal.exp.id, {
                  propertyId: expPropId,
                  title: expTitle.trim(),
                  category: expCat,
                  amount: Number(expAmt) || 0,
                  date: expDate,
                  method: expMethod,
                  vendor: expVendor.trim() || 'Local Vendor',
                  notes: expNotes.trim(),
                });
                setBanner({ ok: true, text: `Updated expense "${expTitle.trim()}".` });
              }
              setExpModal(null);
            }}
            className="space-y-3 text-xs"
          >
            <select
              value={expPropId}
              onChange={(e) => setExpPropId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            >
              {ownerProps.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              required
              value={expTitle}
              onChange={(e) => setExpTitle(e.target.value)}
              placeholder="Expense title (e.g., Monthly BESCOM Electricity)"
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <input
                type="number"
                required
                value={expAmt}
                onChange={(e) => setExpAmt(e.target.value)}
                placeholder="Amount ₹"
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
              />
              <select
                value={expCat}
                onChange={(e) => setExpCat(e.target.value as OwnerExpense['category'])}
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={expVendor}
                onChange={(e) => setExpVendor(e.target.value)}
                placeholder="Vendor name"
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              />
              <select
                value={expMethod}
                onChange={(e) => setExpMethod(e.target.value as OwnerExpense['method'])}
                className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                {['UPI', 'Bank Transfer', 'Cash', 'Card', 'Other'].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="text"
              value={expNotes}
              onChange={(e) => setExpNotes(e.target.value)}
              placeholder="Optional notes"
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            />
            <button type="submit" className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold">
              {expModal.mode === 'edit' ? 'Save Expense Changes' : 'Save Business Expense'}
            </button>
          </form>
        )}
      </ModalSheet>

      <ModalSheet open={viewExp !== null} onClose={() => setViewExp(null)} title={viewExp?.title || ''} subtitle={viewExp?.id}>
        {viewExp && (
          <div className="space-y-2 text-xs">
            <div>Property: {properties.find((p) => p.id === viewExp.propertyId)?.name}</div>
            <div>Category: {viewExp.category}</div>
            <div>Amount: <span className="font-mono-num font-bold">{formatINR(viewExp.amount)}</span></div>
            <div>Date: <span className="font-mono-num">{viewExp.date}</span></div>
            <div>Method: {viewExp.method} · Vendor: {viewExp.vendor}</div>
            <div>Notes: {viewExp.notes || 'None'}</div>
          </div>
        )}
      </ModalSheet>

      <ModalSheet open={reverseExpTarget !== null} onClose={() => setReverseExpTarget(null)} title="Reverse Business Expense" subtitle={reverseExpTarget?.title}>
        {reverseExpTarget && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!reverseExpReason.trim()) return;
              reverseOwnerExpense(reverseExpTarget.id, reverseExpReason.trim());
              setBanner({ ok: true, text: `Reversed expense "${reverseExpTarget.title}" with audit log.` });
              setReverseExpTarget(null);
            }}
            className="space-y-3 text-xs"
          >
            <input
              type="text"
              required
              value={reverseExpReason}
              onChange={(e) => setReverseExpReason(e.target.value)}
              placeholder="Reason for reversal *"
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            />
            <button type="submit" className="w-full h-10 rounded-xl bg-[#DC2626] text-white font-semibold">
              Confirm Expense Reversal
            </button>
          </form>
        )}
      </ModalSheet>
    </div>
  );
};
