import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Compass,
  House,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  Wallet,
  ReceiptIndianRupee,
  Store,
} from 'lucide-react';
import { usePGFinder } from '../context/PGFinderContext';
import { ThemeSwitch, ModalSheet } from '../components/ui/Primitives';
import { UserRole } from '../types/pgfinder';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  group?: string;
}

const TENANT_BOTTOM_TABS: NavItem[] = [
  { label: 'Home', to: '/tenant/home', icon: <House className="w-5 h-5" /> },
  { label: 'Explore', to: '/tenant/explore', icon: <Search className="w-5 h-5" /> },
  { label: 'Connect', to: '/tenant/events', icon: <CalendarDays className="w-5 h-5" /> },
  { label: 'My PG', to: '/tenant/my-pg', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Profile', to: '/tenant/profile', icon: <UserRound className="w-5 h-5" /> },
];

const TENANT_SIDEBAR: NavItem[] = [
  { group: 'Overview', label: 'Home', to: '/tenant/home', icon: <House className="w-4 h-4" /> },
  { group: 'Overview', label: 'Explore PGs', to: '/tenant/explore', icon: <Search className="w-4 h-4" /> },
  { group: 'Stay & Finance', label: 'My PG', to: '/tenant/my-pg', icon: <Building2 className="w-4 h-4" /> },
  { group: 'Stay & Finance', label: 'Expense Tracker', to: '/tenant/expenses', icon: <ReceiptIndianRupee className="w-4 h-4" /> },
  { group: 'Community', label: 'Startup Events', to: '/tenant/events', icon: <CalendarDays className="w-4 h-4" /> },
  { group: 'Community', label: 'PG Finder Local', to: '/tenant/local', icon: <Store className="w-4 h-4" /> },
  { group: 'Account', label: 'Profile & Settings', to: '/tenant/profile', icon: <UserRound className="w-4 h-4" /> },
];

const OWNER_BOTTOM_TABS: NavItem[] = [
  { label: 'Home', to: '/owner/dashboard', icon: <House className="w-5 h-5" /> },
  { label: 'Properties', to: '/owner/properties', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Tenants', to: '/owner/tenants', icon: <Users className="w-5 h-5" /> },
  { label: 'Finance', to: '/owner/finance', icon: <Wallet className="w-5 h-5" /> },
  { label: 'Profile', to: '/owner/profile', icon: <UserRound className="w-5 h-5" /> },
];

const OWNER_SIDEBAR: NavItem[] = [
  { group: 'Overview', label: 'Dashboard', to: '/owner/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { group: 'Property Management', label: 'My Properties', to: '/owner/properties', icon: <Building2 className="w-4 h-4" /> },
  { group: 'Property Management', label: 'Floors, Rooms & Vacancies', to: '/owner/vacancies', icon: <Building2 className="w-4 h-4" /> },
  { group: 'Tenant Management', label: 'All Tenants & Requests', to: '/owner/tenants', icon: <Users className="w-4 h-4" /> },
  { group: 'Finance', label: 'Rent & Deposits', to: '/owner/finance', icon: <Wallet className="w-4 h-4" /> },
  { group: 'Finance', label: 'Business Expenses', to: '/owner/expenses', icon: <ReceiptIndianRupee className="w-4 h-4" /> },
  { group: 'Daily Operations', label: 'Maintenance & Rules', to: '/owner/maintenance', icon: <ClipboardCheck className="w-4 h-4" /> },
  { group: 'Daily Operations', label: 'Food, Notices & Staff', to: '/owner/more', icon: <ClipboardCheck className="w-4 h-4" /> },
  { group: 'Analytics & Reviews', label: 'Tracking Center', to: '/owner/tracking', icon: <ShieldCheck className="w-4 h-4" /> },
  { group: 'Analytics & Reviews', label: 'Reports & Analytics', to: '/owner/reports', icon: <LayoutDashboard className="w-4 h-4" /> },
  { group: 'Analytics & Reviews', label: 'Reviews & Ratings', to: '/owner/reviews', icon: <ClipboardCheck className="w-4 h-4" /> },
  { group: 'Community', label: 'Startup Events', to: '/owner/events', icon: <CalendarDays className="w-4 h-4" /> },
  { group: 'Community', label: 'PG Finder Local', to: '/owner/local', icon: <Compass className="w-4 h-4" /> },
  { group: 'Account', label: 'Profile & Settings', to: '/owner/profile', icon: <UserRound className="w-4 h-4" /> },
];

const ADMIN_BOTTOM_TABS: NavItem[] = [
  { label: 'Home', to: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Properties', to: '/admin/properties', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Users', to: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { label: 'Approvals', to: '/admin/approvals', icon: <ClipboardCheck className="w-5 h-5" /> },
  { label: 'More', to: '/admin/more', icon: <Menu className="w-5 h-5" /> },
];

const ADMIN_SIDEBAR: NavItem[] = [
  { group: 'Overview', label: 'Dashboard', to: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { group: 'Verification', label: 'Approvals & GPS', to: '/admin/approvals', icon: <ClipboardCheck className="w-4 h-4" /> },
  { group: 'Property Management', label: 'All Properties', to: '/admin/properties', icon: <Building2 className="w-4 h-4" /> },
  { group: 'User Management', label: 'Owners & Tenants', to: '/admin/users', icon: <Users className="w-4 h-4" /> },
  { group: 'Platform Operations', label: 'Platform Controls', to: '/admin/more', icon: <ShieldCheck className="w-4 h-4" /> },
];

export const DashboardShell: React.FC<{ role: UserRole }> = ({ role }) => {
  const { currentUser, switchDemoRole, notifications, markNotificationRead, logout, selectedCity } = usePGFinder();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);

  const bottomTabs =
    role === 'TENANT' ? TENANT_BOTTOM_TABS : role === 'PG_OWNER' ? OWNER_BOTTOM_TABS : ADMIN_BOTTOM_TABS;
  const sidebarItems =
    role === 'TENANT' ? TENANT_SIDEBAR : role === 'PG_OWNER' ? OWNER_SIDEBAR : ADMIN_SIDEBAR;

  const groupedSidebar = sidebarItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const g = item.group || 'Menu';
    acc[g] = acc[g] || [];
    acc[g].push(item);
    return acc;
  }, {});

  const roleNotifications = notifications.filter((n) => n.targetRole === role || n.targetRole === 'ALL');
  const unreadCount = roleNotifications.filter((n) => !n.read).length;

  const handleRoleSwitch = (targetRole: UserRole) => {
    switchDemoRole(targetRole);
    if (targetRole === 'TENANT') navigate('/tenant/home');
    else if (targetRole === 'PG_OWNER') navigate('/owner/dashboard');
    else navigate('/admin/dashboard');
  };

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-[#F8FAFC] dark:bg-[#0B1220] text-[#111827] dark:text-[#F9FAFB]">
      {/* Fixed non-scrolling top header (compact height to honor <= 15% mobile sticky cap) */}
      <header className="shrink-0 h-13 border-b border-[#E2E8F0] dark:border-[#374151] bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between gap-3 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-base font-bold font-display tracking-tight text-[#047857] dark:text-[#34D399] whitespace-nowrap shrink-0"
          >
            PG Finder
          </button>
          <span className="hidden sm:inline text-xs text-[#64748B] dark:text-[#9CA3AF] truncate">
            {role === 'TENANT'
              ? `Tenant · ${selectedCity}`
              : role === 'PG_OWNER'
              ? 'PG Owner Console'
              : 'Super Admin Console'}
          </span>
        </div>

        {/* Demo role switcher (development prototype convenience) */}
        <div className="hidden md:flex items-center gap-1 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#0B1220] p-0.5">
          <span className="px-2 text-[11px] font-medium text-[#64748B] dark:text-[#9CA3AF] whitespace-nowrap">
            Demo Role
          </span>
          {(
            [
              { r: 'TENANT', label: 'Tenant' },
              { r: 'PG_OWNER', label: 'Owner' },
              { r: 'SUPER_ADMIN', label: 'Admin' },
            ] as { r: UserRole; label: string }[]
          ).map((item) => (
            <button
              key={item.r}
              type="button"
              onClick={() => handleRoleSwitch(item.r)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                role === item.r
                  ? 'bg-[#047857] text-white dark:bg-[#34D399] dark:text-[#0B1220]'
                  : 'text-[#64748B] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:block">
            <ThemeSwitch compact />
          </div>
          <button
            type="button"
            onClick={() => setNotifOpen(true)}
            aria-label="Notifications"
            className="relative min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#1F2937] text-[#111827] dark:text-[#F9FAFB] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#047857] dark:bg-[#34D399] text-white dark:text-[#0B1220] text-[10px] font-bold font-mono-num flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <div className="hidden sm:flex items-center gap-2 pl-1">
            <div className="w-8 h-8 rounded-full bg-[#047857]/12 dark:bg-[#34D399]/15 text-[#047857] dark:text-[#34D399] text-xs font-bold flex items-center justify-center shrink-0">
              {currentUser?.avatarInitials || 'PG'}
            </div>
          </div>
        </div>
      </header>

      {/* Middle area: Desktop sidebar + Independently scrollable main */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] overflow-y-auto p-3">
          <div className="mb-3 px-2 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1F2937]/60 border border-[#E2E8F0] dark:border-[#374151]">
            <div className="text-xs font-semibold text-[#111827] dark:text-[#F9FAFB] truncate">
              {currentUser?.name || 'Demo User'}
            </div>
            <div className="text-[11px] text-[#64748B] dark:text-[#9CA3AF] truncate flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 shrink-0" />
              <span>{currentUser?.city || 'Bengaluru'}</span>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {Object.entries(groupedSidebar).map(([group, items]) => (
              <div key={group}>
                <div className="px-2 mb-1 text-[11px] font-medium text-[#64748B] dark:text-[#9CA3AF]">
                  {group}
                </div>
                <div className="space-y-0.5">
                  {items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-[#047857]/10 dark:bg-[#34D399]/15 text-[#047857] dark:text-[#34D399]'
                            : 'text-[#64748B] dark:text-[#9CA3AF] hover:bg-slate-100 dark:hover:bg-[#1F2937] hover:text-[#111827] dark:hover:text-[#F9FAFB]'
                        }`
                      }
                    >
                      {item.icon}
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 mt-3 border-t border-[#E2E8F0] dark:border-[#374151]">
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/auth');
              }}
              className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-[#64748B] dark:text-[#9CA3AF] hover:text-[#DC2626] dark:hover:text-[#F87171] hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Independently scrollable main viewport */}
        <main className="min-h-0 flex-1 overflow-y-auto">
          {/* Mobile Demo Role Bar inside scrollable top area (never bloated in fixed header) */}
          <div className="md:hidden px-4 pt-2.5 pb-1 flex items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827]">
            <div className="flex items-center gap-1 overflow-x-auto">
              {(
                [
                  { r: 'TENANT', label: 'Tenant' },
                  { r: 'PG_OWNER', label: 'Owner' },
                  { r: 'SUPER_ADMIN', label: 'Admin' },
                ] as { r: UserRole; label: string }[]
              ).map((item) => (
                <button
                  key={item.r}
                  type="button"
                  onClick={() => handleRoleSwitch(item.r)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap ${
                    role === item.r
                      ? 'bg-[#047857] text-white dark:bg-[#34D399] dark:text-[#0B1220]'
                      : 'text-[#64748B] dark:text-[#9CA3AF]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <ThemeSwitch compact />
          </div>

          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-4 sm:py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Permanently visible mobile bottom navigation (never inside scrollable content) */}
      <nav
        aria-label="Mobile navigation"
        className="shrink-0 lg:hidden pb-safe border-t border-[#E2E8F0] dark:border-[#374151] bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md z-30"
      >
        <div className="grid grid-cols-5 h-14 items-center">
          {bottomTabs.map((tab) => {
            const active = location.pathname === tab.to || location.pathname.startsWith(`${tab.to}/`);
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={`flex flex-col items-center justify-center min-h-[44px] px-1 transition-colors ${
                  active
                    ? 'text-[#047857] dark:text-[#34D399]'
                    : 'text-[#64748B] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB]'
                }`}
              >
                {tab.icon}
                <span className="text-[10px] font-medium tracking-tight mt-0.5 truncate max-w-full">
                  {tab.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <ModalSheet open={notifOpen} onClose={() => setNotifOpen(false)} title="Notifications" subtitle="Role updates and alerts">
        <div className="space-y-2.5">
          {roleNotifications.length === 0 ? (
            <p className="text-sm text-[#64748B] dark:text-[#9CA3AF] py-6 text-center">No notifications right now.</p>
          ) : (
            roleNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  markNotificationRead(n.id);
                  if (n.route) {
                    setNotifOpen(false);
                    navigate(n.route);
                  }
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                  n.read
                    ? 'border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827]'
                    : 'border-[#047857]/30 dark:border-[#34D399]/30 bg-[#047857]/5 dark:bg-[#34D399]/10'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#111827] dark:text-[#F9FAFB]">{n.title}</span>
                  <span className="text-[11px] text-[#64748B] dark:text-[#9CA3AF] shrink-0">{n.createdAt}</span>
                </div>
                <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-1">{n.body}</p>
              </div>
            ))
          )}
        </div>
      </ModalSheet>
    </div>
  );
};
