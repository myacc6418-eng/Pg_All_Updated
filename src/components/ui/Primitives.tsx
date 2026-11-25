import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Sun,
  Moon,
  Monitor,
  X,
  Eye,
  Pencil,
  Trash2,
  Plus,
  ArrowLeftRight,
  Download,
  Wrench,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ThemePreference } from '../../types/pgfinder';

export const SafeImage: React.FC<{
  src?: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}> = ({ src, alt, className = '', fallbackTitle }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 p-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Building2 className="w-7 h-7 mb-1.5 opacity-70" />
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-1">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};

export const ThemeSwitch: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { preference, setPreference } = useTheme();
  const options: { key: ThemePreference; label: string; icon: React.ReactNode }[] = [
    { key: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" /> },
    { key: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" /> },
    { key: 'system', label: 'System', icon: <Monitor className="w-3.5 h-3.5" /> },
  ];

  return (
    <div
      className="inline-flex items-center rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#0B1220] p-0.5"
      role="group"
      aria-label="Theme preference"
    >
      {options.map((opt) => {
        const active = preference === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => setPreference(opt.key)}
            title={`${opt.label} theme`}
            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 min-h-[30px] ${
              active
                ? 'bg-white dark:bg-[#1F2937] text-[#111827] dark:text-[#F9FAFB] shadow-xs'
                : 'text-[#64748B] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB]'
            }`}
          >
            {opt.icon}
            {!compact && <span>{opt.label}</span>}
          </button>
        );
      })}
    </div>
  );
};

export const KpiCard: React.FC<{
  label: string;
  value: string | number;
  subtext?: string;
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  onClick?: () => void;
}> = ({ label, value, subtext, tone = 'neutral', onClick }) => {
  const valueTone =
    tone === 'primary'
      ? 'text-[#047857] dark:text-[#34D399]'
      : tone === 'success'
      ? 'text-[#059669] dark:text-[#34D399]'
      : tone === 'warning'
      ? 'text-[#D97706] dark:text-[#FBBF24]'
      : tone === 'error'
      ? 'text-[#DC2626] dark:text-[#F87171]'
      : tone === 'info'
      ? 'text-[#2563EB] dark:text-[#60A5FA]'
      : 'text-[#111827] dark:text-[#F9FAFB]';

  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`w-full text-left rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-3.5 transition-colors ${
        onClick
          ? 'hover:border-[#047857]/40 dark:hover:border-[#34D399]/40 active:scale-[0.99] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#047857]'
          : ''
      }`}
    >
      <div className="text-xs font-medium text-[#64748B] dark:text-[#9CA3AF] truncate">{label}</div>
      <div className={`mt-1 text-xl font-bold tracking-tight font-mono-num tabular-nums ${valueTone}`}>
        {value}
      </div>
      {subtext && (
        <div className="mt-1 text-[11px] text-[#64748B] dark:text-[#9CA3AF] truncate">{subtext}</div>
      )}
    </Tag>
  );
};

export const QuickLinkTile: React.FC<{
  icon: React.ReactNode;
  label: string;
  count?: number;
  onClick: () => void;
}> = ({ icon, label, count, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] px-2 py-2.5 text-center transition-colors hover:border-[#047857]/50 dark:hover:border-[#34D399]/50 hover:bg-[#F8FAFC] dark:hover:bg-[#1F2937]/70 active:scale-[0.98] min-h-[72px] focus-visible:outline-2 focus-visible:outline-[#047857]"
    >
      {typeof count === 'number' && count > 0 && (
        <span className="absolute top-1.5 right-2 text-[11px] font-semibold font-mono-num tabular-nums text-[#047857] dark:text-[#34D399]">
          {count}
        </span>
      )}
      <span className="text-[#047857] dark:text-[#34D399]">{icon}</span>
      <span className="text-[11px] font-medium text-[#111827] dark:text-[#F9FAFB] leading-tight line-clamp-2">
        {label}
      </span>
    </button>
  );
};

export type SemanticTone = 'success' | 'info' | 'warning' | 'orange' | 'error' | 'neutral';

export const StatusText: React.FC<{
  status: string;
  tone?: SemanticTone;
}> = ({ status, tone }) => {
  const s = status.toLowerCase();
  const resolvedTone: SemanticTone =
    tone ||
    (/paid|available|approved|resolved|published|verified|collected|completed|received|voluntarily shared|active stay/i.test(s) && !/partially|refund|pending/i.test(s)
      ? 'success'
      : /reserved|occupied|in progress|upcoming|assigned|active|under review|scheduled/i.test(s)
      ? 'info'
      : /maintenance/i.test(s)
      ? 'orange'
      : /overdue|rejected|suspend|cancel|error|declined|revoked/i.test(s)
      ? 'error'
      : /pending|partial|awaiting|requested|draft|correction|open|reopened|new|replacement|refund/i.test(s)
      ? 'warning'
      : 'neutral');

  const cls =
    resolvedTone === 'success'
      ? 'text-[#059669] dark:text-[#34D399]'
      : resolvedTone === 'info'
      ? 'text-[#2563EB] dark:text-[#60A5FA]'
      : resolvedTone === 'warning'
      ? 'text-[#D97706] dark:text-[#FBBF24]'
      : resolvedTone === 'orange'
      ? 'text-[#EA580C] dark:text-[#FB923C]'
      : resolvedTone === 'error'
      ? 'text-[#DC2626] dark:text-[#F87171]'
      : 'text-[#64748B] dark:text-[#9CA3AF]';

  const Icon =
    resolvedTone === 'success'
      ? CheckCircle2
      : resolvedTone === 'orange'
      ? Wrench
      : resolvedTone === 'error'
      ? XCircle
      : resolvedTone === 'warning' || resolvedTone === 'info'
      ? Clock
      : AlertTriangle;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap ${cls}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{status.replace(/_/g, ' ')}</span>
    </span>
  );
};

export type ActionKind = 'view' | 'edit' | 'delete' | 'add' | 'transfer' | 'download' | 'approve' | 'reject';

export const ActionBtn: React.FC<{
  kind: ActionKind;
  label?: string;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}> = ({ kind, label, onClick, disabled, title }) => {
  const config: Record<ActionKind, { defaultLabel: string; icon: React.ReactNode; style: string }> = {
    view: {
      defaultLabel: 'View',
      icon: <Eye className="w-3.5 h-3.5 shrink-0" />,
      style: 'border-[#E2E8F0] dark:border-[#374151] text-[#2563EB] dark:text-[#60A5FA] hover:bg-blue-50/70 dark:hover:bg-blue-950/30',
    },
    edit: {
      defaultLabel: 'Edit',
      icon: <Pencil className="w-3.5 h-3.5 shrink-0" />,
      style: 'border-[#E2E8F0] dark:border-[#374151] text-[#D97706] dark:text-[#FBBF24] hover:bg-amber-50/70 dark:hover:bg-amber-950/30',
    },
    delete: {
      defaultLabel: 'Delete',
      icon: <Trash2 className="w-3.5 h-3.5 shrink-0" />,
      style: 'border-[#E2E8F0] dark:border-[#374151] text-[#DC2626] dark:text-[#F87171] hover:bg-red-50/70 dark:hover:bg-red-950/30',
    },
    add: {
      defaultLabel: 'Add',
      icon: <Plus className="w-3.5 h-3.5 shrink-0" />,
      style: 'border-[#047857] dark:border-[#34D399] bg-[#047857] dark:bg-[#34D399] text-white dark:text-[#0B1220] hover:bg-[#065F46]',
    },
    transfer: {
      defaultLabel: 'Transfer',
      icon: <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />,
      style: 'border-[#E2E8F0] dark:border-[#374151] text-[#7C3AED] dark:text-[#A78BFA] hover:bg-purple-50/70 dark:hover:bg-purple-950/30',
    },
    download: {
      defaultLabel: 'Download',
      icon: <Download className="w-3.5 h-3.5 shrink-0" />,
      style: 'border-[#E2E8F0] dark:border-[#374151] text-[#111827] dark:text-[#F9FAFB] hover:bg-slate-50 dark:hover:bg-slate-800',
    },
    approve: {
      defaultLabel: 'Approve',
      icon: <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />,
      style: 'border-[#059669] bg-[#059669] text-white hover:bg-[#047857]',
    },
    reject: {
      defaultLabel: 'Reject',
      icon: <XCircle className="w-3.5 h-3.5 shrink-0" />,
      style: 'border-[#E2E8F0] dark:border-[#374151] text-[#DC2626] dark:text-[#F87171] hover:bg-red-50/70 dark:hover:bg-red-950/30',
    },
  };

  const cfg = config[kind];
  return (
    <button
      type="button"
      disabled={disabled}
      title={title || label || cfg.defaultLabel}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 min-h-[34px] disabled:opacity-40 ${cfg.style}`}
    >
      {cfg.icon}
      <span>{label ?? cfg.defaultLabel}</span>
    </button>
  );
};

export const ModalSheet: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidth?: string;
  children: React.ReactNode;
}> = ({ open, onClose, title, subtitle, maxWidth = 'max-w-2xl', children }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`w-full ${maxWidth} max-h-[90dvh] flex flex-col rounded-t-3xl sm:rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] shadow-xl overflow-hidden`}
      >
        <div className="sm:hidden w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5" />
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-[#E2E8F0] dark:border-[#374151] shrink-0">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-[#111827] dark:text-[#F9FAFB] truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#64748B] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-[#F9FAFB] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
};
