import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Printer } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { usePGFinder } from '../../context/PGFinderContext';
import { KpiCard } from '../../components/ui/Primitives';
import { exportRowsToCsv, formatINR } from '../../utils/formatters';

interface ReportGroup {
  group: string;
  options: string[];
}

const REPORT_GROUPS: ReportGroup[] = [
  {
    group: 'Financial Reports (14)',
    options: [
      'Monthly Revenue Summary',
      'Rent Collection Report',
      'Pending & Overdue Rent Report',
      'Payment Method Breakdown',
      'Property-Wise Income Comparison',
      'Security Deposit Collection Report',
      'Security Deposit Refund Report',
      'Deposit Deduction Report',
      'Owner Business Expense Summary',
      'Expense Category Breakdown',
      'Property-Wise Expense Comparison',
      'Vendor Payment Report',
      'Profit & Loss Statement',
      'Monthly Cash Flow Report',
    ],
  },
  {
    group: 'Tenant Reports (9)',
    options: [
      'Active Tenant Directory Report',
      'New Tenant Onboarding Report',
      'Joining Request Conversion Report',
      'QR Code Onboarding Report',
      'Tenant Transfer History Report',
      'Tenant Checkout & Attrition Report',
      'Tenant Document Compliance Report',
      'Agreement Acceptance Report',
      'Tenant Payment Discipline Report',
    ],
  },
  {
    group: 'Property & Inventory Reports (8)',
    options: [
      'Occupancy Rate Trend Report',
      'Vacancy & Available Beds Report',
      'Sharing-Type Demand Report',
      'AC vs Non-AC Occupancy Report',
      'Floor-Wise Utilization Report',
      'Room-Wise Revenue Yield Report',
      'Property Approval & Verification Log',
      'Public Listing Performance Report',
    ],
  },
  {
    group: 'Operational Reports (8)',
    options: [
      'Maintenance Request Summary',
      'Maintenance Cost Analysis',
      'Scheduled Maintenance Compliance',
      'Complaint Resolution SLA Report',
      'Parcel Handover Log Report',
      'Notice Readership & Reach Report',
      'Staff Directory & Payroll Summary',
      'Food & Mess Operations Report',
    ],
  },
  {
    group: 'Reputation & Growth Reports (6)',
    options: [
      'PG Finder Rating Summary',
      'Category Rating Breakdown',
      'Owner Review Response Rate',
      'Property Comparison Scorecard',
      'Location Sharing Audit Report',
      'Subscription Slot Utilization',
    ],
  },
];

const CHART_COLORS = ['#047857', '#2563EB', '#D97706', '#7C3AED', '#EA580C', '#0891B2'];

export const OwnerReportsPage: React.FC = () => {
  const {
    currentUser,
    properties,
    rooms,
    beds,
    stays,
    transfers,
    joiningRequests,
    rentInvoices,
    rentPayments,
    ownerExpenses,
    maintenanceRequests,
    complaints,
    propertyReviews,
    staff,
    ownerSelectedPropertyId,
    setOwnerSelectedPropertyId,
  } = usePGFinder();

  const [searchParams] = useSearchParams();
  useEffect(() => {
    const pid = searchParams.get('propertyId');
    if (pid) setOwnerSelectedPropertyId(pid);
  }, [searchParams, setOwnerSelectedPropertyId]);

  const [reportType, setReportType] = useState<string>('Monthly Revenue Summary');
  const [dateRange, setDateRange] = useState<string>('This Month');
  const [comparePrev, setComparePrev] = useState<boolean>(false);

  const ownerProps = useMemo(
    () => properties.filter((p) => p.ownerId === (currentUser?.id || 'usr-owner-1') && !p.archived),
    [properties, currentUser]
  );
  const scopedPropIds = useMemo(
    () => (ownerSelectedPropertyId === 'ALL' ? ownerProps.map((p) => p.id) : [ownerSelectedPropertyId]),
    [ownerSelectedPropertyId, ownerProps]
  );

  const scopedProps = ownerProps.filter((p) => scopedPropIds.includes(p.id));
  const scopedRooms = rooms.filter((r) => scopedPropIds.includes(r.propertyId));
  const scopedBeds = beds.filter((b) => scopedPropIds.includes(b.propertyId));
  const scopedStays = stays.filter((s) => scopedPropIds.includes(s.propertyId));
  const scopedInvoices = rentInvoices.filter((i) => scopedPropIds.includes(i.propertyId));
  const scopedPayments = rentPayments.filter((p) => scopedPropIds.includes(p.propertyId) && !p.reversed);
  const scopedExpenses = ownerExpenses.filter((e) => scopedPropIds.includes(e.propertyId) && !e.reversed);
  const scopedMaint = maintenanceRequests.filter((m) => scopedPropIds.includes(m.propertyId));
  const scopedComp = complaints.filter((c) => scopedPropIds.includes(c.propertyId));
  const scopedReviews = propertyReviews.filter((r) => scopedPropIds.includes(r.propertyId));

  // Derive report rows & chart dynamically based on chosen Report Type category
  const reportData = useMemo(() => {
    const totalRentExpected = scopedInvoices.reduce((s, i) => s + i.rentAmount + i.additionalCharges, 0);
    const totalRentCollected = scopedInvoices.reduce((s, i) => s + i.paidAmount, 0);
    const totalPending = Math.max(0, totalRentExpected - totalRentCollected);
    const totalExp = scopedExpenses.reduce((s, e) => s + e.amount, 0);
    const totalDeposits = scopedStays.reduce((s, x) => s + x.depositPaid, 0);
    const occupiedBeds = scopedBeds.filter((b) => b.status === 'Occupied').length;
    const availBeds = scopedBeds.filter((b) => b.status === 'Available').length;
    const occRate = scopedBeds.length > 0 ? Math.round((occupiedBeds / scopedBeds.length) * 100) : 0;

    if (/Expense|Vendor/i.test(reportType)) {
      const byCat = scopedExpenses.reduce<Record<string, number>>((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {});
      const chart = Object.entries(byCat).map(([name, value]) => ({ name, value }));
      return {
        kpis: [
          { label: 'Total Expenses', value: formatINR(totalExp) },
          { label: 'Expense Entries', value: scopedExpenses.length },
          { label: 'Rent Collected', value: formatINR(totalRentCollected) },
          { label: 'Operating Net', value: formatINR(totalRentCollected - totalExp) },
        ],
        chart,
        chartLabel: 'Operating Expenses by Category (INR)',
        columns: ['Date', 'Property', 'Title', 'Category', 'Vendor', 'Amount (INR)'],
        rows: scopedExpenses.map((e) => [
          e.date,
          properties.find((p) => p.id === e.propertyId)?.name || '',
          e.title,
          e.category,
          e.vendor,
          formatINR(e.amount),
        ]),
      };
    }

    if (/Deposit/i.test(reportType)) {
      const chart = scopedProps.map((p) => ({
        name: p.name.split(' ').slice(0, 2).join(' '),
        value: scopedStays.filter((s) => s.propertyId === p.id).reduce((sum, x) => sum + x.depositPaid, 0),
      }));
      return {
        kpis: [
          { label: 'Required Deposits', value: formatINR(scopedStays.reduce((s, x) => s + x.securityDeposit, 0)) },
          { label: 'Deposits Received', value: formatINR(totalDeposits) },
          { label: 'Deductions', value: formatINR(scopedStays.reduce((s, x) => s + (x.depositDeductions || 0), 0)) },
          { label: 'Refunded', value: formatINR(scopedStays.reduce((s, x) => s + (x.depositRefunded || 0), 0)) },
        ],
        chart,
        chartLabel: 'Security Deposits Held by Property (INR)',
        columns: ['Tenant', 'Property', 'Required', 'Paid', 'Deductions', 'Status'],
        rows: scopedStays.map((s) => [
          s.tenantName,
          properties.find((p) => p.id === s.propertyId)?.name || '',
          formatINR(s.securityDeposit),
          formatINR(s.depositPaid),
          formatINR(s.depositDeductions || 0),
          s.depositStatus || 'Received',
        ]),
      };
    }

    if (/Tenant|Joining|QR|Transfer|Checkout|Document|Agreement|Discipline/i.test(reportType)) {
      const byStatus = [
        { name: 'Active', value: scopedStays.filter((s) => s.status === 'Active').length },
        { name: 'Joining Reqs', value: joiningRequests.filter((j) => scopedPropIds.includes(j.propertyId)).length },
        { name: 'Transfers', value: transfers.filter((t) => scopedPropIds.includes(t.fromPropertyId)).length },
      ];
      return {
        kpis: [
          { label: 'Active Tenants', value: scopedStays.filter((s) => s.status === 'Active').length },
          { label: 'Joining Requests', value: joiningRequests.filter((j) => scopedPropIds.includes(j.propertyId)).length },
          { label: 'Transfers', value: transfers.filter((t) => scopedPropIds.includes(t.fromPropertyId)).length },
          { label: 'KYC Verified', value: scopedStays.filter((s) => s.documentStatus === 'Verified').length },
        ],
        chart: byStatus,
        chartLabel: 'Tenant Lifecycle Counts',
        columns: ['Tenant', 'Property', 'Joined Date', 'Rent', 'Docs', 'Status'],
        rows: scopedStays.map((s) => [
          s.tenantName,
          properties.find((p) => p.id === s.propertyId)?.name || '',
          s.joiningDate,
          formatINR(s.monthlyRent),
          s.documentStatus,
          s.status,
        ]),
      };
    }

    if (/Occupancy|Vacancy|Sharing|AC|Floor|Room|Approval|Listing/i.test(reportType)) {
      const chart = scopedProps.map((p) => {
        const pb = beds.filter((b) => b.propertyId === p.id);
        const occ = pb.filter((b) => b.status === 'Occupied').length;
        return {
          name: p.name.split(' ').slice(0, 2).join(' '),
          value: pb.length > 0 ? Math.round((occ / pb.length) * 100) : 0,
        };
      });
      return {
        kpis: [
          { label: 'Total Beds', value: scopedBeds.length },
          { label: 'Occupied Beds', value: occupiedBeds },
          { label: 'Available Beds', value: availBeds },
          { label: 'Occupancy %', value: `${occRate}%` },
        ],
        chart,
        chartLabel: 'Property Occupancy Rate (%)',
        columns: ['Property', 'Room #', 'Sharing', 'AC/Non-AC', 'Monthly Rent', 'Available'],
        rows: scopedRooms.map((r) => [
          properties.find((p) => p.id === r.propertyId)?.name || '',
          r.roomNumber,
          r.sharing,
          r.isAc ? 'AC' : 'Non-AC',
          formatINR(r.monthlyRent),
          beds.filter((b) => b.roomId === r.id && b.status === 'Available').length,
        ]),
      };
    }

    if (/Maintenance|Scheduled|Complaint|Parcel|Notice|Staff|Food/i.test(reportType)) {
      const chart = [
        { name: 'Maintenance Open', value: scopedMaint.filter((m) => m.status !== 'Resolved').length },
        { name: 'Maintenance Done', value: scopedMaint.filter((m) => m.status === 'Resolved').length },
        { name: 'Complaints Open', value: scopedComp.filter((c) => c.status !== 'Resolved').length },
        { name: 'Staff Count', value: staff.filter((st) => scopedPropIds.includes(st.propertyId)).length },
      ];
      return {
        kpis: [
          { label: 'Maintenance Jobs', value: scopedMaint.length },
          { label: 'Est. Maintenance Cost', value: formatINR(scopedMaint.reduce((s, m) => s + m.estimatedCost, 0)) },
          { label: 'Complaints Logged', value: scopedComp.length },
          { label: 'Active Staff', value: staff.filter((st) => scopedPropIds.includes(st.propertyId)).length },
        ],
        chart,
        chartLabel: 'Operational Workload Breakdown',
        columns: ['Title', 'Category', 'Property', 'Priority', 'Assigned To', 'Status'],
        rows: scopedMaint.map((m) => [
          m.title,
          m.category,
          properties.find((p) => p.id === m.propertyId)?.name || '',
          m.priority,
          m.assignedTo,
          m.status,
        ]),
      };
    }

    if (/Rating|Review|Reputation|Scorecard|Location|Subscription/i.test(reportType)) {
      const avgRating =
        scopedReviews.length > 0
          ? (scopedReviews.reduce((s, r) => s + r.overallRating, 0) / scopedReviews.length).toFixed(1)
          : '—';
      const chart = scopedProps.map((p) => ({
        name: p.name.split(' ').slice(0, 2).join(' '),
        value: Number(p.rating || 4.5),
      }));
      return {
        kpis: [
          { label: 'Average PG Finder Rating', value: `${avgRating} ★` },
          { label: 'Total Reviews', value: scopedReviews.length },
          { label: 'Owner Replies', value: scopedReviews.filter((r) => Boolean(r.ownerReply)).length },
          { label: 'Plan', value: currentUser?.subscriptionPlan || 'Pro' },
        ],
        chart,
        chartLabel: 'PG Finder Rating by Property',
        columns: ['Review ID', 'Property', 'Tenant', 'Overall', 'Date', 'Reply Status'],
        rows: scopedReviews.map((r) => [
          r.id,
          properties.find((p) => p.id === r.propertyId)?.name || '',
          r.tenantDisplayName,
          `${r.overallRating} ★`,
          r.date,
          r.ownerReply ? 'Replied' : 'Awaiting Reply',
        ]),
      };
    }

    // Default Financial Revenue / Rent / Cash Flow
    const chart = scopedProps.map((p) => ({
      name: p.name.split(' ').slice(0, 2).join(' '),
      value: scopedInvoices.filter((i) => i.propertyId === p.id).reduce((s, i) => s + i.paidAmount, 0),
    }));
    return {
      kpis: [
        { label: 'Expected Rent', value: formatINR(totalRentExpected) },
        { label: 'Collected Rent', value: formatINR(totalRentCollected) },
        { label: 'Pending Rent', value: formatINR(totalPending) },
        { label: 'Net Operating Cash', value: formatINR(totalRentCollected - totalExp) },
      ],
      chart,
      chartLabel: 'Rent Collected by Property (INR)',
      columns: ['Month', 'Tenant', 'Property', 'Rent Due', 'Paid', 'Status'],
      rows: scopedInvoices.map((i) => [
        i.monthLabel,
        i.tenantName,
        properties.find((p) => p.id === i.propertyId)?.name || '',
        formatINR(i.rentAmount + i.additionalCharges),
        formatINR(i.paidAmount),
        i.status,
      ]),
    };
  }, [
    reportType,
    scopedProps,
    scopedRooms,
    scopedBeds,
    scopedStays,
    scopedInvoices,
    scopedPayments,
    scopedExpenses,
    scopedMaint,
    scopedComp,
    scopedReviews,
    scopedPropIds,
    properties,
    beds,
    joiningRequests,
    transfers,
    staff,
    currentUser,
  ]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-display">Reports &amp; Analytics</h1>
          <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
            Select from 45 operational, financial, tenant, property, and reputation reports in INR (₹).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              exportRowsToCsv(
                `${reportType.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`,
                reportData.columns,
                reportData.rows
              )
            }
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-[#047857] text-white text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" /> Print Report
          </button>
        </div>
      </div>

      {/* Filters & 45-Option Grouped Dropdown */}
      <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block font-medium text-[#64748B] mb-1">Report Type (45 Reports)</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-medium"
          >
            {REPORT_GROUPS.map((grp) => (
              <optgroup key={grp.group} label={grp.group}>
                {grp.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium text-[#64748B] mb-1">Property</label>
          <select
            value={ownerSelectedPropertyId}
            onChange={(e) => setOwnerSelectedPropertyId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
          >
            <option value="ALL">All Properties ({ownerProps.length})</option>
            {ownerProps.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium text-[#64748B] mb-1">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
          >
            {['Today', 'Last 7 Days', 'This Month', 'Previous Month', 'Last 3 Months', 'Last 6 Months', 'This Year', 'Custom'].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end pb-2">
          <label className="inline-flex items-center gap-2 font-medium">
            <input
              type="checkbox"
              checked={comparePrev}
              onChange={(e) => setComparePrev(e.target.checked)}
              className="accent-[#047857]"
            />
            <span>Compare with previous period</span>
          </label>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {reportData.kpis.map((k) => (
          <KpiCard
            key={k.label}
            label={k.label}
            value={k.value}
            subtext={comparePrev ? `${dateRange} vs Prior` : dateRange}
            tone="primary"
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4">
          <h2 className="text-sm font-semibold mb-3">{reportData.chartLabel}</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.chart} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => Number(val ?? 0).toLocaleString('en-IN')} />
                <Bar dataKey="value" fill="#047857" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4">
          <h2 className="text-sm font-semibold mb-3">Distribution Share</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.chart}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={78}
                  label={({ name }) => name}
                >
                  {reportData.chart.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => Number(val ?? 0).toLocaleString('en-IN')} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Report Data Table */}
      <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 overflow-x-auto">
        <div className="text-sm font-semibold mb-3">
          {reportType} — Detailed Records ({reportData.rows.length})
        </div>
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
              {reportData.columns.map((col) => (
                <th key={col} className="py-2 pr-3 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
            {reportData.rows.length === 0 ? (
              <tr>
                <td colSpan={reportData.columns.length} className="py-8 text-center text-[#64748B]">
                  No matching records in current dataset.
                </td>
              </tr>
            ) : (
              reportData.rows.map((row, idx) => (
                <tr key={idx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-2.5 pr-3 font-mono-num">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
