import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  Download,
  EyeOff,
  Lock,
  Plus,
  Printer,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { usePGFinder } from '../../context/PGFinderContext';
import { KpiCard, ModalSheet, StatusText } from '../../components/ui/Primitives';
import { exportRowsToCsv, formatPaiseToINR } from '../../utils/formatters';
import { TenantExpense } from '../../types/pgfinder';

export const TenantExpensesPage: React.FC = () => {
  const {
    currentUser,
    tenantExpenses,
    tenantCategories,
    tenantBudget,
    autoImportConfirmedRent,
    setAutoImportConfirmedRent,
    sharedExpenses,
    addTenantExpense,
    updateTenantExpense,
    deleteTenantExpense,
    confirmRecurringExpense,
    addTenantCustomCategory,
    updateTenantBudget,
    addSharedExpense,
    settleSharedParticipant,
  } = usePGFinder();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'personal' | 'budgets' | 'shared') || 'personal';
  const [activeTab, setActiveTab] = useState<'personal' | 'budgets' | 'shared'>(initialTab);

  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'last_month' | 'custom'>('month');
  const [customStart, setCustomStart] = useState('2026-11-01');
  const [customEnd, setCustomEnd] = useState('2026-11-30');
  const [searchQuery, setSearchQuery] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');

  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [amountRupees, setAmountRupees] = useState('');
  const [category, setCategory] = useState('Food');
  const [customCatInput, setCustomCatInput] = useState('');
  const [date, setDate] = useState('2026-11-25');
  const [method, setMethod] = useState<TenantExpense['paymentMethod']>('UPI');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  const [budgetRupees, setBudgetRupees] = useState(String(tenantBudget.monthlyLimitPaise / 100));
  const [thresholdPct, setThresholdPct] = useState(String(tenantBudget.alertThresholdPct));

  const [sharedOpen, setSharedOpen] = useState(false);
  const [shTitle, setShTitle] = useState('');
  const [shAmount, setShAmount] = useState('');
  const [shPaidBy, setShPaidBy] = useState(currentUser?.name || 'Aarav Sharma');
  const [shRoommate, setShRoommate] = useState('Nikhil Rao');
  const [shSplitMode, setShSplitMode] = useState<'Equal' | 'Custom'>('Equal');
  const [shCustomMyShare, setShCustomMyShare] = useState('');

  const switchTab = (t: 'personal' | 'budgets' | 'shared') => {
    setActiveTab(t);
    setSearchParams({ tab: t });
  };

  const confirmedExpenses = useMemo(
    () => tenantExpenses.filter((e) => e.isConfirmed !== false),
    [tenantExpenses]
  );

  const unconfirmedRecurring = useMemo(
    () => tenantExpenses.filter((e) => e.isConfirmed === false),
    [tenantExpenses]
  );

  const todayPaise = confirmedExpenses
    .filter((e) => !e.excludedFromAnalytics && e.date === '2026-11-25')
    .reduce((s, e) => s + e.amountPaise, 0);

  const weekPaise = confirmedExpenses
    .filter((e) => !e.excludedFromAnalytics && e.date >= '2026-11-19' && e.date <= '2026-11-25')
    .reduce((s, e) => s + e.amountPaise, 0);

  const monthPaise = confirmedExpenses
    .filter((e) => !e.excludedFromAnalytics && e.date.startsWith('2026-11'))
    .reduce((s, e) => s + e.amountPaise, 0);

  const remainingBudgetPaise = Math.max(0, tenantBudget.monthlyLimitPaise - monthPaise);
  const utilizationPct =
    tenantBudget.monthlyLimitPaise > 0
      ? Math.round((monthPaise / tenantBudget.monthlyLimitPaise) * 100)
      : 0;

  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return confirmedExpenses.filter((e) => {
      if (period === 'today' && e.date !== '2026-11-25') return false;
      if (period === 'week' && (e.date < '2026-11-19' || e.date > '2026-11-25')) return false;
      if (period === 'month' && !e.date.startsWith('2026-11')) return false;
      if (period === 'last_month' && !e.date.startsWith('2026-10')) return false;
      if (period === 'custom' && (e.date < customStart || e.date > customEnd)) return false;
      if (catFilter !== 'ALL' && e.category !== catFilter) return false;
      if (methodFilter !== 'ALL' && e.paymentMethod !== methodFilter) return false;
      if (q && !e.title.toLowerCase().includes(q) && !(e.notes || '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [confirmedExpenses, period, customStart, customEnd, catFilter, methodFilter, searchQuery]);

  const categoryChartData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredList
      .filter((e) => !e.excludedFromAnalytics)
      .forEach((e) => {
        map[e.category] = (map[e.category] || 0) + e.amountPaise;
      });
    return Object.entries(map)
      .map(([name, paise]) => ({ name, amount: Math.round(paise / 100) }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [filteredList]);

  const openAddModal = (exp?: TenantExpense) => {
    if (exp) {
      setEditingId(exp.id);
      setTitle(exp.title);
      setAmountRupees(String(exp.amountPaise / 100));
      setCategory(exp.category);
      setDate(exp.date);
      setMethod(exp.paymentMethod);
      setNotes(exp.notes || '');
      setIsRecurring(Boolean(exp.isRecurring));
    } else {
      setEditingId(null);
      setTitle('');
      setAmountRupees('');
      setCategory('Food');
      setDate('2026-11-25');
      setMethod('UPI');
      setNotes('');
      setIsRecurring(false);
    }
    setAddOpen(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(amountRupees);
    if (!title.trim() || !Number.isFinite(numeric) || numeric <= 0) return;
    const amountPaise = Math.round(numeric * 100);
    if (editingId) {
      updateTenantExpense(editingId, {
        title: title.trim(),
        amountPaise,
        category,
        date,
        paymentMethod: method,
        notes: notes.trim() || undefined,
        isRecurring,
      });
    } else {
      addTenantExpense({
        title: title.trim(),
        amountPaise,
        category,
        date,
        paymentMethod: method,
        notes: notes.trim() || undefined,
        isRecurring,
        recurrenceCycle: isRecurring ? 'Monthly' : undefined,
        isConfirmed: true,
      });
    }
    setAddOpen(false);
  };

  const handleSaveShared = (e: React.FormEvent) => {
    e.preventDefault();
    const totalNum = Number(shAmount);
    if (!shTitle.trim() || !Number.isFinite(totalNum) || totalNum <= 0) return;
    const totalPaise = Math.round(totalNum * 100);
    const myName = currentUser?.name || 'Aarav Sharma';
    const mySharePaise =
      shSplitMode === 'Equal'
        ? Math.floor(totalPaise / 2)
        : Math.min(totalPaise, Math.max(0, Math.round((Number(shCustomMyShare) || 0) * 100)));
    const otherSharePaise = totalPaise - mySharePaise;
    addSharedExpense({
      title: shTitle.trim(),
      totalPaise,
      date: '2026-11-25',
      paidBy: shPaidBy,
      splitMode: shSplitMode,
      participants: [
        {
          name: myName,
          sharePaise: mySharePaise,
          paidPaise: shPaidBy === myName ? totalPaise : 0,
          settled: shPaidBy === myName,
        },
        {
          name: shRoommate.trim() || 'Roommate',
          sharePaise: otherSharePaise,
          paidPaise: shPaidBy !== myName ? totalPaise : 0,
          settled: shPaidBy !== myName,
        },
      ],
    });
    setShTitle('');
    setShAmount('');
    setSharedOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-display">Personal Expense Tracker</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#9CA3AF]">
            <Lock className="w-3.5 h-3.5 text-[#047857] dark:text-[#34D399]" />
            <span>Private to your tenant account — PG owners cannot view your personal expenses.</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => openAddModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#047857] hover:bg-[#065F46] dark:bg-[#34D399] dark:text-[#0B1220] text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      {/* Module Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] w-fit">
        {[
          { id: 'personal', label: 'Expenses & Analytics' },
          { id: 'budgets', label: 'Monthly Budgets' },
          { id: 'shared', label: 'Roommate Splits' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => switchTab(t.id as typeof activeTab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-[#047857] text-white dark:bg-[#34D399] dark:text-[#0B1220]'
                : 'text-[#64748B] dark:text-[#9CA3AF]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'personal' && (
        <>
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <KpiCard label="Today's Expenses" value={formatPaiseToINR(todayPaise)} />
            <KpiCard label="This Week" value={formatPaiseToINR(weekPaise)} />
            <KpiCard label="This Month (Nov)" value={formatPaiseToINR(monthPaise)} tone="primary" />
            <KpiCard label="Monthly Budget" value={formatPaiseToINR(tenantBudget.monthlyLimitPaise)} />
            <KpiCard
              label="Remaining Budget"
              value={formatPaiseToINR(remainingBudgetPaise)}
              tone={utilizationPct >= tenantBudget.alertThresholdPct ? 'warning' : 'success'}
              subtext={`${utilizationPct}% of budget used`}
            />
          </div>

          {/* Upcoming Recurring Confirmations */}
          {unconfirmedRecurring.length > 0 && (
            <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-2.5">
              <div className="text-xs font-semibold text-[#111827] dark:text-[#F9FAFB]">
                Upcoming Recurring Reminders (Confirm when actually paid)
              </div>
              {unconfirmedRecurring.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="font-semibold">{item.title}</span>
                    <span className="text-[#64748B] dark:text-[#9CA3AF]">
                      {' '}
                      · {item.category} · Due {item.date} · {formatPaiseToINR(item.amountPaise)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => confirmRecurringExpense(item.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#047857] text-white font-semibold"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Payment
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Chart & Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">Category Spending (INR)</h2>
                <span className="text-[11px] text-[#64748B] dark:text-[#9CA3AF]">
                  {categoryChartData[0] ? `Top: ${categoryChartData[0].name}` : 'No entries'}
                </span>
              </div>
              <div className="h-56">
                {categoryChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-[#64748B]">
                    No confirmed expenses in this date filter.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryChartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => [`₹${Number(v ?? 0).toLocaleString('en-IN')}`, 'Spent']} />
                      <Bar dataKey="amount" fill="#047857" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="lg:col-span-7 rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">Transactions</h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      exportRowsToCsv(
                        'pg-finder-personal-expenses.csv',
                        ['Date', 'Title', 'Category', 'Method', 'Amount (INR)', 'Source'],
                        filteredList.map((e) => [
                          e.date,
                          e.title,
                          e.category,
                          e.paymentMethod,
                          (e.amountPaise / 100).toFixed(2),
                          e.sourceRentPaymentId ? 'Imported PG Rent' : 'Manual',
                        ])
                      )
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] text-xs font-medium"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] text-xs font-medium"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'week', label: 'This Week' },
                  { id: 'month', label: 'This Month' },
                  { id: 'last_month', label: 'Last Month' },
                  { id: 'custom', label: 'Custom' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPeriod(p.id as typeof period)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                      period === p.id
                        ? 'bg-[#047857]/12 dark:bg-[#34D399]/15 text-[#047857] dark:text-[#34D399]'
                        : 'text-[#64748B] dark:text-[#9CA3AF]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {period === 'custom' && (
                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="h-8 px-2 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="h-8 px-2 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search title..."
                    className="w-full h-9 pl-8 pr-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-xs"
                  />
                </div>
                <select
                  value={catFilter}
                  onChange={(e) => setCatFilter(e.target.value)}
                  className="h-9 px-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-xs"
                >
                  <option value="ALL">All Categories</option>
                  {tenantCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="h-9 px-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-xs"
                >
                  <option value="ALL">All Methods</option>
                  {['UPI', 'Cash', 'Debit Card', 'Credit Card', 'Bank Transfer', 'Other'].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="divide-y divide-[#E2E8F0] dark:divide-[#374151] max-h-80 overflow-y-auto">
                {filteredList.length === 0 ? (
                  <p className="text-xs text-[#64748B] py-6 text-center">No transactions match the current filters.</p>
                ) : (
                  filteredList.map((exp) => (
                    <div key={exp.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <div className="font-semibold flex items-center gap-1.5 truncate">
                          <span
                            onClick={() => openAddModal(exp)}
                            className="cursor-pointer hover:text-[#047857] dark:hover:text-[#34D399] truncate"
                          >
                            {exp.title}
                          </span>
                          {exp.sourceRentPaymentId && (
                            <span className="text-[10px] font-medium text-[#047857] dark:text-[#34D399]">
                              · Imported Rent
                            </span>
                          )}
                        </div>
                        <div className="text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
                          {exp.category} · {exp.paymentMethod} · {exp.date}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`font-bold font-mono-num ${
                            exp.excludedFromAnalytics ? 'line-through text-[#64748B]' : ''
                          }`}
                        >
                          {formatPaiseToINR(exp.amountPaise)}
                        </span>
                        {exp.sourceRentPaymentId && (
                          <button
                            type="button"
                            title={exp.excludedFromAnalytics ? 'Include in analytics' : 'Exclude from analytics'}
                            onClick={() =>
                              updateTenantExpense(exp.id, { excludedFromAnalytics: !exp.excludedFromAnalytics })
                            }
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#111827] dark:hover:text-[#F9FAFB]"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          aria-label="Delete expense"
                          onClick={() => deleteTenantExpense(exp.id)}
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC2626]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'budgets' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-5 space-y-4">
            <h2 className="text-sm font-semibold">Monthly Budget &amp; Alert Settings</h2>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span>Monthly Utilization</span>
                <span className="font-mono-num font-semibold">
                  {formatPaiseToINR(monthPaise)} / {formatPaiseToINR(tenantBudget.monthlyLimitPaise)} ({utilizationPct}%)
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    utilizationPct >= 100
                      ? 'bg-[#DC2626]'
                      : utilizationPct >= tenantBudget.alertThresholdPct
                      ? 'bg-[#D97706]'
                      : 'bg-[#047857] dark:bg-[#34D399]'
                  }`}
                  style={{ width: `${Math.min(100, utilizationPct)}%` }}
                />
              </div>
              {utilizationPct >= tenantBudget.alertThresholdPct && (
                <p className="mt-2 text-xs text-[#D97706] dark:text-[#FBBF24]">
                  Heads up: You have reached {utilizationPct}% of your configured monthly budget.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Overall Monthly Limit (INR)</label>
                <input
                  type="number"
                  value={budgetRupees}
                  onChange={(e) => setBudgetRupees(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Alert Threshold (%)</label>
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={thresholdPct}
                  onChange={(e) => setThresholdPct(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                updateTenantBudget({
                  ...tenantBudget,
                  monthlyLimitPaise: Math.max(1000, Math.round(Number(budgetRupees) || 24000)) * 100,
                  alertThresholdPct: Math.min(100, Math.max(50, Number(thresholdPct) || 80)),
                })
              }
              className="px-4 py-2 rounded-xl bg-[#047857] text-white text-xs font-semibold"
            >
              Save Budget Preferences
            </button>

            <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#374151] flex items-center justify-between text-xs">
              <div>
                <div className="font-medium">Auto-import confirmed PG Rent payments</div>
                <div className="text-[#64748B] dark:text-[#9CA3AF]">
                  Imports confirmed rent receipts without affecting the owner ledger.
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoImportConfirmedRent}
                onChange={(e) => setAutoImportConfirmedRent(e.target.checked)}
                className="w-4 h-4 accent-[#047857]"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-5 space-y-3">
            <h2 className="text-sm font-semibold">Category Budgets (Nov 2026)</h2>
            {Object.entries(tenantBudget.categoryLimitsPaise).map(([cat, limitPaise]) => {
              const spent = confirmedExpenses
                .filter((e) => !e.excludedFromAnalytics && e.date.startsWith('2026-11') && e.category === cat)
                .reduce((s, e) => s + e.amountPaise, 0);
              const pct = Math.min(100, Math.round((spent / limitPaise) * 100));
              return (
                <div key={cat} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-medium">{cat}</span>
                    <span className="font-mono-num">
                      {formatPaiseToINR(spent)} / {formatPaiseToINR(limitPaise)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-[#047857] dark:bg-[#34D399]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'shared' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-[#9CA3AF]">
              <Users className="w-4 h-4 text-[#047857] dark:text-[#34D399]" />
              <span>Shared expenses stay separate from personal expenses and official PG rent records.</span>
            </div>
            <button
              type="button"
              onClick={() => setSharedOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#047857] text-white text-xs font-semibold"
            >
              + Split Roommate Expense
            </button>
          </div>

          <div className="space-y-3">
            {sharedExpenses.map((se) => (
              <div key={se.id} className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold">{se.title}</h3>
                    <p className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
                      Paid by {se.paidBy} · {se.date} · {se.splitMode} Split
                    </p>
                  </div>
                  <div className="text-base font-bold font-mono-num">{formatPaiseToINR(se.totalPaise)}</div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#E2E8F0] dark:border-[#374151] space-y-2">
                  {se.participants.map((p) => (
                    <div key={p.name} className="flex items-center justify-between text-xs">
                      <span>
                        {p.name} (Share: <strong className="font-mono-num">{formatPaiseToINR(p.sharePaise)}</strong>)
                      </span>
                      {p.settled ? (
                        <StatusText status="Settled" tone="success" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => settleSharedParticipant(se.id, p.name)}
                          className="px-2.5 py-1 rounded-lg border border-[#047857] text-[#047857] dark:border-[#34D399] dark:text-[#34D399] font-semibold"
                        >
                          Confirm Settlement
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Personal Expense Modal */}
      <ModalSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={editingId ? 'Edit Expense' : 'Add Personal Expense'}
        subtitle="Stored privately in INR minor units"
      >
        <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium mb-1">Expense Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Metro card recharge"
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Amount (INR) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={amountRupees}
                onChange={(e) => setAmountRupees(e.target.value)}
                placeholder="450"
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-sm font-mono-num"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-sm"
              >
                {tenantCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Payment Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as TenantExpense['paymentMethod'])}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-sm"
              >
                {['UPI', 'Cash', 'Debit Card', 'Credit Card', 'Bank Transfer', 'Other'].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customCatInput}
              onChange={(e) => setCustomCatInput(e.target.value)}
              placeholder="Or add custom category..."
              className="flex-1 h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            />
            <button
              type="button"
              onClick={() => {
                if (customCatInput.trim()) {
                  addTenantCustomCategory(customCatInput.trim());
                  setCategory(customCatInput.trim());
                  setCustomCatInput('');
                }
              }}
              className="px-3 h-9 rounded-xl border border-[#E2E8F0] dark:border-[#374151] font-medium"
            >
              Add Category
            </button>
          </div>

          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes..."
            className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="accent-[#047857]"
            />
            <span>Mark as monthly recurring expense</span>
          </label>

          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold text-sm"
          >
            {editingId ? 'Save Changes' : 'Save Expense'}
          </button>
        </form>
      </ModalSheet>

      {/* Shared Expense Modal */}
      <ModalSheet open={sharedOpen} onClose={() => setSharedOpen(false)} title="New Shared Roommate Expense">
        <form onSubmit={handleSaveShared} className="space-y-3 text-xs">
          <input
            type="text"
            required
            value={shTitle}
            onChange={(e) => setShTitle(e.target.value)}
            placeholder="Expense description (e.g., Water cans & cleaning supplies)"
            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              required
              value={shAmount}
              onChange={(e) => setShAmount(e.target.value)}
              placeholder="Total INR"
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-sm font-mono-num"
            />
            <input
              type="text"
              value={shRoommate}
              onChange={(e) => setShRoommate(e.target.value)}
              placeholder="Roommate name"
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={shPaidBy}
              onChange={(e) => setShPaidBy(e.target.value)}
              className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            >
              <option value={currentUser?.name || 'Aarav Sharma'}>Paid by Me</option>
              <option value={shRoommate || 'Nikhil Rao'}>Paid by {shRoommate || 'Roommate'}</option>
            </select>
            <select
              value={shSplitMode}
              onChange={(e) => setShSplitMode(e.target.value as 'Equal' | 'Custom')}
              className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            >
              <option value="Equal">Equal Split</option>
              <option value="Custom">Custom Split</option>
            </select>
          </div>
          {shSplitMode === 'Custom' && (
            <input
              type="number"
              value={shCustomMyShare}
              onChange={(e) => setShCustomMyShare(e.target.value)}
              placeholder="Your share in INR"
              className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
            />
          )}
          <button type="submit" className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold text-sm">
            Create Split Record
          </button>
        </form>
      </ModalSheet>
    </div>
  );
};
