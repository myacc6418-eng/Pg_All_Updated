import React, { useMemo, useState } from 'react';
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { ModalSheet } from './Primitives';

export interface TableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  align?: 'left' | 'right';
  csvValue?: (row: T) => string | number;
  render: (row: T) => React.ReactNode;
  className?: string;
}

export interface TableFilterDef {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

interface AdminDataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  rowKey: (row: T) => string;
  searchPlaceholder?: string;
  searchExtractor?: (row: T) => string;
  filters?: TableFilterDef[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onClearFilters?: () => void;
  exportFilename?: string;
  emptyTitle?: string;
  emptySubtitle?: string;
  headerRight?: React.ReactNode;
  defaultPageSize?: 10 | 25 | 50 | 100;
  onRowClick?: (row: T) => void;
}

export function AdminDataTable<T>({
  data,
  columns,
  rowKey,
  searchPlaceholder = 'Search records...',
  searchExtractor,
  filters = [],
  filterValues = {},
  onFilterChange,
  onClearFilters,
  exportFilename = 'pgfinder-export.csv',
  emptyTitle = 'No matching records found',
  emptySubtitle = 'Try adjusting your search query or active filters.',
  headerRight,
  defaultPageSize = 10,
  onRowClick,
}: AdminDataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeFilterCount = useMemo(
    () =>
      Object.values(filterValues).filter((v) => v && v !== 'ALL').length +
      (search.trim() ? 1 : 0),
    [filterValues, search]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => {
      if (searchExtractor) return searchExtractor(row).toLowerCase().includes(q);
      return JSON.stringify(row).toLowerCase().includes(q);
    });
  }, [data, search, searchExtractor]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
    return copy;
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const paged = sorted.slice(startIdx, startIdx + pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleClearAll = () => {
    setSearch('');
    setPage(1);
    onClearFilters?.();
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => setIsRefreshing(false), 260);
  };

  const handleExportCsv = () => {
    const exportCols = columns.filter((c) => c.key !== 'actions');
    const headers = exportCols.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(',');
    const rows = sorted.map((row) =>
      exportCols
        .map((c) => {
          const val = c.csvValue ? c.csvValue(row) : c.sortValue ? c.sortValue(row) : '';
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] overflow-hidden">
      {/* Search + Desktop Filters + Toolbar */}
      <div className="p-3.5 border-b border-[#E2E8F0] dark:border-[#374151] space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full h-9 pl-9 pr-8 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-xs"
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#111827]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {filters.length > 0 && (
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(true)}
                className="md:hidden inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-xs font-medium"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="font-mono-num font-bold text-[#047857] dark:text-[#34D399]">
                    ({activeFilterCount})
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleRefresh}
              title="Refresh table"
              className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              title="Export filtered rows as CSV"
              className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {headerRight}
          </div>
        </div>

        {/* Desktop horizontal filter bar */}
        {filters.length > 0 && (
          <div className="hidden md:flex flex-wrap items-center gap-2">
            {filters.map((f) => (
              <select
                key={f.key}
                value={filterValues[f.key] || 'ALL'}
                onChange={(e) => {
                  onFilterChange?.(f.key, e.target.value);
                  setPage(1);
                }}
                aria-label={f.label}
                className="h-8 px-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-xs"
              >
                <option value="ALL">{f.label}: All</option>
                {f.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ))}

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="h-8 px-2.5 rounded-lg text-xs font-medium text-[#DC2626] dark:text-[#F87171] hover:bg-red-50/70 dark:hover:bg-red-950/30"
              >
                Clear Filters ({activeFilterCount})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#0B1220]/60 text-[#64748B] dark:text-[#9CA3AF]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-2.5 px-3 font-medium whitespace-nowrap ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.sortable && col.sortValue ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1 hover:text-[#111827] dark:hover:text-[#F9FAFB]"
                    >
                      <span>{col.label}</span>
                      <ArrowDownUp className="w-3 h-3 opacity-60" />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
            {isRefreshing ? (
              Array.from({ length: Math.min(5, pageSize) }).map((_, i) => (
                <tr key={`skel-${i}`}>
                  <td colSpan={columns.length} className="px-3 py-3">
                    <div className="h-4 rounded bg-slate-200/70 dark:bg-slate-700/60 animate-pulse" />
                  </td>
                </tr>
              ))
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-10 px-4 text-center">
                  <div className="text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]">
                    {emptyTitle}
                  </div>
                  <div className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-1">
                    {emptySubtitle}
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="mt-3 px-3.5 py-1.5 rounded-xl bg-[#047857] text-white text-xs font-semibold"
                    >
                      Clear Search &amp; Filters
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              paged.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`transition-colors ${
                    onRowClick
                      ? 'cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-[#1F2937]/50'
                      : 'hover:bg-[#F8FAFC]/60 dark:hover:bg-[#1F2937]/30'
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-2.5 px-3 align-middle ${
                        col.align === 'right' ? 'text-right' : 'text-left'
                      } ${col.className || ''}`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-3.5 py-2.5 border-t border-[#E2E8F0] dark:border-[#374151] flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B] dark:text-[#9CA3AF]">
        <div className="flex items-center gap-2 font-mono-num">
          <span>
            Showing {sorted.length === 0 ? 0 : startIdx + 1}–{Math.min(startIdx + pageSize, sorted.length)} of{' '}
            {sorted.length}
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            aria-label="Rows per page"
            className="h-7 px-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#1F2937] text-[#111827] dark:text-[#F9FAFB]"
          >
            {[10, 25, 50, 100].map((sz) => (
              <option key={sz} value={sz}>
                {sz} / page
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="h-8 px-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] disabled:opacity-40 inline-flex items-center gap-1 text-[#111827] dark:text-[#F9FAFB]"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </button>
          <span className="px-2 font-mono-num">
            {safePage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="h-8 px-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] disabled:opacity-40 inline-flex items-center gap-1 text-[#111827] dark:text-[#F9FAFB]"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <ModalSheet
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        title="Filter Table"
        subtitle="Narrow down results"
      >
        <div className="space-y-3 text-xs">
          {filters.map((f) => (
            <div key={f.key}>
              <label className="block font-medium mb-1">{f.label}</label>
              <select
                value={filterValues[f.key] || 'ALL'}
                onChange={(e) => {
                  onFilterChange?.(f.key, e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                <option value="ALL">All</option>
                {f.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                handleClearAll();
                setFilterDrawerOpen(false);
              }}
              className="flex-1 h-10 rounded-xl border border-[#E2E8F0] dark:border-[#374151] font-semibold"
            >
              Clear Filters
            </button>
            <button
              type="button"
              onClick={() => setFilterDrawerOpen(false)}
              className="flex-1 h-10 rounded-xl bg-[#047857] text-white font-semibold"
            >
              Apply
            </button>
          </div>
        </div>
      </ModalSheet>
    </div>
  );
}
