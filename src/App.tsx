import React from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { PGFinderProvider } from './context/PGFinderContext';
import { DashboardShell } from './layouts/DashboardShell';

import { LandingPage } from './pages/public/LandingPage';
import { AuthPage } from './pages/public/AuthPage';
import { JoinPropertyPage } from './pages/public/JoinPropertyPage';

import { TenantHomePage } from './pages/tenant/TenantHomePage';
import { TenantExplorePage } from './pages/tenant/TenantExplorePage';
import { TenantMyPgPage } from './pages/tenant/TenantMyPgPage';
import { TenantExpensesPage } from './pages/tenant/TenantExpensesPage';
import { TenantProfilePage } from './pages/tenant/TenantProfilePage';

import { OwnerDashboardPage } from './pages/owner/OwnerDashboardPage';
import { OwnerPropertiesPage } from './pages/owner/OwnerPropertiesPage';
import { OwnerVacanciesPage } from './pages/owner/OwnerVacanciesPage';
import { OwnerTenantsPage } from './pages/owner/OwnerTenantsPage';
import { OwnerFinancePage } from './pages/owner/OwnerFinancePage';
import { OwnerMaintenancePage } from './pages/owner/OwnerMaintenancePage';
import { OwnerTrackingPage } from './pages/owner/OwnerTrackingPage';
import { OwnerReportsPage } from './pages/owner/OwnerReportsPage';
import { OwnerReviewsPage } from './pages/owner/OwnerReviewsPage';
import { OwnerProfilePage } from './pages/owner/OwnerProfilePage';
import { OwnerMorePage } from './pages/owner/OwnerMorePage';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminPropertiesPage } from './pages/admin/AdminPropertiesPage';
import { AdminApprovalsPage } from './pages/admin/AdminApprovalsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminDocumentsPage } from './pages/admin/AdminDocumentsPage';
import { AdminSubscriptionsPage } from './pages/admin/AdminSubscriptionsPage';
import { AdminPromotionsPage } from './pages/admin/AdminPromotionsPage';
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage';
import { AdminSupportPage } from './pages/admin/AdminSupportPage';
import { AdminAuditPage } from './pages/admin/AdminAuditPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';
import { AdminMorePage } from './pages/admin/AdminMorePage';

import { ConnectEventsPage } from './pages/shared/ConnectEventsPage';
import { LocalServicesPage } from './pages/shared/LocalServicesPage';

export default function App() {
  return (
    <ThemeProvider>
      <PGFinderProvider>
        <HashRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/join/:propertyId" element={<JoinPropertyPage />} />

            {/* Tenant Dashboard */}
            <Route path="/tenant" element={<DashboardShell role="TENANT" />}>
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<TenantHomePage />} />
              <Route path="explore" element={<TenantExplorePage />} />
              <Route path="events" element={<ConnectEventsPage />} />
              <Route path="local" element={<LocalServicesPage />} />
              <Route path="my-pg" element={<TenantMyPgPage />} />
              <Route path="expenses" element={<TenantExpensesPage />} />
              <Route path="profile" element={<TenantProfilePage />} />
            </Route>

            {/* PG Owner Dashboard */}
            <Route path="/owner" element={<DashboardShell role="PG_OWNER" />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<OwnerDashboardPage />} />
              <Route path="properties" element={<OwnerPropertiesPage />} />
              <Route path="vacancies" element={<OwnerVacanciesPage />} />
              <Route path="floors" element={<OwnerVacanciesPage />} />
              <Route path="tenants" element={<OwnerTenantsPage />} />
              <Route path="finance" element={<OwnerFinancePage />} />
              <Route path="expenses" element={<OwnerFinancePage />} />
              <Route path="maintenance" element={<OwnerMaintenancePage />} />
              <Route path="rules" element={<OwnerMaintenancePage />} />
              <Route path="tracking" element={<OwnerTrackingPage />} />
              <Route path="reports" element={<OwnerReportsPage />} />
              <Route path="reviews" element={<OwnerReviewsPage />} />
              <Route path="profile" element={<OwnerProfilePage />} />
              <Route path="events" element={<ConnectEventsPage />} />
              <Route path="local" element={<LocalServicesPage />} />
              <Route path="more" element={<OwnerMorePage />} />
            </Route>

            {/* Super Admin Dashboard */}
            <Route path="/admin" element={<DashboardShell role="SUPER_ADMIN" />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="properties" element={<AdminPropertiesPage />} />
              <Route path="approvals" element={<AdminApprovalsPage />} />
              <Route path="locations" element={<AdminApprovalsPage forcedTab="location" />} />
              <Route path="documents" element={<AdminDocumentsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
              <Route path="featured" element={<AdminPromotionsPage forcedSection="featured" />} />
              <Route path="local-ads" element={<AdminPromotionsPage forcedSection="local-ads" />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
              <Route path="support" element={<AdminSupportPage />} />
              <Route path="audit" element={<AdminAuditPage />} />
              <Route path="profile" element={<AdminProfilePage />} />
              <Route path="more" element={<AdminMorePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </PGFinderProvider>
    </ThemeProvider>
  );
}
