import React, { createContext, useContext, useState } from 'react';
import {
  AdminNotificationRecord,
  AdvertiserAccount,
  AppNotification,
  AuditCategory,
  AuditLogEntry,
  Bed,
  BedStatus,
  CheckoutRequest,
  ComplaintItem,
  DepositTransaction,
  FeaturedCampaign,
  Floor,
  FoodMenuDay,
  JoiningRequest,
  LocalAdCampaign,
  LocalBusiness,
  LocationSharingRequest,
  MaintenanceRequest,
  NoticeItem,
  OwnerExpense,
  OwnerSubscriptionRecord,
  PGProperty,
  ParcelItem,
  PlanFeature,
  PlatformPaymentRecord,
  PropertyReview,
  PropertyRule,
  RentInvoice,
  RentPayment,
  Room,
  ScheduledMaintenance,
  SharedExpense,
  SharingOption,
  StaffMember,
  StartupEvent,
  SubscriptionPlan,
  SupportTicket,
  TenantBudget,
  TenantExpense,
  TenantStay,
  TenantTransferRecord,
  UnifiedDocumentRecord,
  UserAccount,
  UserRole,
} from '../types/pgfinder';
import {
  INITIAL_ADMIN_NOTIFICATIONS,
  INITIAL_ADVERTISERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_BEDS,
  INITIAL_CHECKOUTS,
  INITIAL_COMPLAINTS,
  INITIAL_DEPOSIT_TRANSACTIONS,
  INITIAL_EVENTS,
  INITIAL_FEATURED_CAMPAIGNS,
  INITIAL_FLOORS,
  INITIAL_FOOD_MENU,
  INITIAL_JOINING_REQUESTS,
  INITIAL_LOCAL_AD_CAMPAIGNS,
  INITIAL_LOCAL_BUSINESSES,
  INITIAL_LOCATION_SHARING_REQUESTS,
  INITIAL_MAINTENANCE_REQUESTS,
  INITIAL_NOTICES,
  INITIAL_NOTIFICATIONS,
  INITIAL_OWNER_EXPENSES,
  INITIAL_OWNER_SUBSCRIPTIONS,
  INITIAL_OWNER_TRANSFERS,
  INITIAL_PARCELS,
  INITIAL_PLAN_FEATURES,
  INITIAL_PLATFORM_PAYMENTS,
  INITIAL_PROPERTIES,
  INITIAL_PROPERTY_REVIEWS,
  INITIAL_PROPERTY_RULES,
  INITIAL_RENT_INVOICES,
  INITIAL_RENT_PAYMENTS,
  INITIAL_ROOMS,
  INITIAL_SCHEDULED_MAINTENANCE,
  INITIAL_SHARED_EXPENSES,
  INITIAL_STAFF,
  INITIAL_STAYS,
  INITIAL_SUBSCRIPTION_PLANS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_TENANT_BUDGET,
  INITIAL_TENANT_EXPENSES,
  INITIAL_UNIFIED_DOCUMENTS,
  INITIAL_USERS,
  TENANT_EXPENSE_CATEGORIES,
} from '../data/demoData';

interface PGFinderContextValue {
  users: UserAccount[];
  currentUser: UserAccount | null;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  ownerSelectedPropertyId: string;
  setOwnerSelectedPropertyId: (propId: string) => void;
  tenantPreviewSearching: boolean;
  setTenantPreviewSearching: (val: boolean) => void;
  switchDemoRole: (role: UserRole) => void;
  loginUser: (email: string, role?: UserRole) => UserAccount;
  registerUser: (data: {
    name: string;
    email: string;
    mobile: string;
    role: 'TENANT' | 'PG_OWNER';
    city: string;
  }) => UserAccount;
  updateCurrentUserProfile: (patch: Partial<UserAccount>) => void;
  logout: () => void;

  properties: PGProperty[];
  floors: Floor[];
  rooms: Room[];
  beds: Bed[];
  stays: TenantStay[];
  transfers: TenantTransferRecord[];
  joiningRequests: JoiningRequest[];
  rentInvoices: RentInvoice[];
  rentPayments: RentPayment[];
  depositTransactions: DepositTransaction[];
  ownerExpenses: OwnerExpense[];
  maintenanceRequests: MaintenanceRequest[];
  scheduledMaintenance: ScheduledMaintenance[];
  propertyRules: PropertyRule[];
  propertyReviews: PropertyReview[];
  locationRequests: LocationSharingRequest[];

  tenantExpenses: TenantExpense[];
  tenantCategories: string[];
  tenantBudget: TenantBudget;
  autoImportConfirmedRent: boolean;
  setAutoImportConfirmedRent: (v: boolean) => void;
  sharedExpenses: SharedExpense[];
  foodMenu: FoodMenuDay[];
  complaints: ComplaintItem[];
  notices: NoticeItem[];
  parcels: ParcelItem[];
  checkouts: CheckoutRequest[];
  staff: StaffMember[];
  events: StartupEvent[];
  localBusinesses: LocalBusiness[];
  supportTickets: SupportTicket[];
  auditLogs: AuditLogEntry[];
  notifications: AppNotification[];

  savedPropertyIds: string[];
  recentlyViewedIds: string[];
  savedEventIds: string[];
  rsvpedEventIds: string[];
  waitlistedEventIds: string[];
  toggleSaveProperty: (propertyId: string) => void;
  markPropertyViewed: (propertyId: string) => void;

  submitNewProperty: (prop: Omit<PGProperty, 'id' | 'qrToken' | 'reviewCount'>) => PGProperty;
  updatePropertyDetails: (propertyId: string, patch: Partial<PGProperty>) => void;
  archiveOrDeleteProperty: (propertyId: string) => { ok: boolean; mode: 'deleted' | 'archived'; message: string };
  updatePropertyListingStatus: (propertyId: string, status: PGProperty['listingStatus']) => void;
  togglePropertyQr: (propertyId: string) => void;
  regeneratePropertyQr: (propertyId: string) => void;

  adminReviewProperty: (
    propertyId: string,
    decision: 'UNDER_REVIEW' | 'APPROVED' | 'CORRECTIONS_REQUIRED' | 'REJECTED' | 'SUSPENDED',
    comment?: string
  ) => void;
  adminSuspendProperty: (
    propertyId: string,
    details: { category: string; reason: string; effectiveDate: string; reviewDate?: string; notifyOwner?: boolean }
  ) => void;
  adminRestoreProperty: (propertyId: string, reason: string) => void;
  adminVerifyLocation: (
    propertyId: string,
    decision: 'UNDER_REVIEW' | 'VERIFIED' | 'CORRECTIONS_REQUIRED' | 'REJECTED' | 'REVERIFICATION_REQUIRED',
    comment?: string
  ) => void;
  adminVerifyDocument: (
    propertyId: string,
    docId: string,
    status: 'Verified' | 'Rejected' | 'Replacement Required',
    note?: string
  ) => void;
  toggleUserStatus: (userId: string) => void;
  adminUpdateUser: (userId: string, patch: Partial<UserAccount>) => void;
  adminSuspendUser: (userId: string, reason: string) => void;
  adminRestoreUser: (userId: string, reason?: string) => void;
  adminArchiveUser: (userId: string) => { ok: boolean; message: string };

  unifiedDocuments: UnifiedDocumentRecord[];
  logDocumentAccess: (docId: string) => void;
  adminReviewUnifiedDocument: (
    docId: string,
    status: UnifiedDocumentRecord['verificationStatus'],
    note?: string
  ) => void;
  archiveOrDeleteUnifiedDocument: (docId: string) => { ok: boolean; message: string };

  planFeatures: PlanFeature[];
  addPlanFeature: (feat: Omit<PlanFeature, 'id' | 'createdAt'>) => void;
  updatePlanFeature: (id: string, patch: Partial<PlanFeature>) => void;
  togglePlanFeatureStatus: (id: string) => void;

  subscriptionPlans: SubscriptionPlan[];
  addSubscriptionPlan: (plan: Omit<SubscriptionPlan, 'id'>) => void;
  updateSubscriptionPlan: (id: string, patch: Partial<SubscriptionPlan>) => void;
  duplicateSubscriptionPlan: (id: string) => void;
  deleteOrArchiveSubscriptionPlan: (id: string) => { ok: boolean; message: string };

  ownerSubscriptions: OwnerSubscriptionRecord[];
  platformPayments: PlatformPaymentRecord[];
  manageOwnerSubscription: (
    subId: string,
    action: 'change_plan' | 'extend' | 'cancel' | 'restore',
    payload: { planId?: string; newEndDate?: string; reason: string }
  ) => void;

  featuredCampaigns: FeaturedCampaign[];
  saveFeaturedCampaign: (camp: Omit<FeaturedCampaign, 'id' | 'impressions' | 'clicks'>, editId?: string) => { ok: boolean; message: string };
  updateFeaturedCampaignStatus: (id: string, status: FeaturedCampaign['status'], newEndDate?: string) => void;
  deleteFeaturedCampaign: (id: string) => { ok: boolean; message: string };

  advertisers: AdvertiserAccount[];
  localAdCampaigns: LocalAdCampaign[];
  saveAdvertiser: (adv: Omit<AdvertiserAccount, 'id' | 'createdAt'>, editId?: string) => void;
  updateAdvertiserStatus: (id: string, status: AdvertiserAccount['status']) => void;
  saveLocalAdCampaign: (ad: Omit<LocalAdCampaign, 'id' | 'impressions' | 'clicks'>, editId?: string) => void;
  updateLocalAdStatus: (id: string, status: LocalAdCampaign['status']) => void;
  deleteLocalAdCampaign: (id: string) => { ok: boolean; message: string };

  adminNotifications: AdminNotificationRecord[];
  saveAdminNotification: (
    rec: Omit<AdminNotificationRecord, 'id' | 'createdBy' | 'inAppReadCount' | 'publishedAt'>
  ) => void;
  updateAdminNotificationStatus: (
    id: string,
    status: AdminNotificationRecord['status']
  ) => void;
  duplicateAdminNotification: (id: string) => void;

  adminReplySupportTicket: (
    ticketId: string,
    replyBody: string,
    nextStatus?: SupportTicket['status'],
    resolutionSummary?: string
  ) => void;
  adminAddSupportInternalNote: (ticketId: string, note: string) => void;
  adminUpdateSupportTicketMeta: (
    ticketId: string,
    patch: Partial<Pick<SupportTicket, 'priority' | 'status' | 'assignedAdmin' | 'resolutionSummary'>>
  ) => void;
  moderateReviewStatus: (reviewId: string, action: 'Keep' | 'Hide') => void;

  addFloor: (floor: Omit<Floor, 'id'>) => void;
  editFloor: (floorId: string, patch: Partial<Floor>) => void;
  deleteOrDeactivateFloor: (floorId: string) => { ok: boolean; message: string };
  addRoom: (room: Omit<Room, 'id'>) => void;
  editRoom: (roomId: string, patch: Partial<Room>) => { ok: boolean; message: string };
  deleteOrDeactivateRoom: (roomId: string) => { ok: boolean; message: string };
  addBedToRoom: (roomId: string) => void;
  updateBedStatus: (bedId: string, status: BedStatus) => { ok: boolean; message: string };

  submitJoiningRequest: (req: {
    propertyId: string;
    preferredSharing: SharingOption;
    moveInDate: string;
    source: 'EXPLORE' | 'QR' | 'OWNER_INVITE';
    notes?: string;
  }) => { ok: boolean; message: string };
  approveJoiningRequest: (requestId: string) => void;
  assignBedAndActivateStay: (
    requestId: string,
    roomId: string,
    bedId: string,
    agreedRent: number,
    agreedDeposit: number
  ) => { ok: boolean; message: string };
  rejectJoiningRequest: (requestId: string) => void;
  cancelJoiningRequest: (requestId: string) => void;
  updateTenantStayPermitted: (stayId: string, patch: Partial<TenantStay>) => void;
  archiveTenantStay: (stayId: string) => { ok: boolean; message: string };
  transferTenantBed: (params: {
    stayId: string;
    toPropertyId: string;
    toRoomId: string;
    toBedId: string;
    transferDate: string;
    reason: TenantTransferRecord['reason'];
    newRent?: number;
    notes?: string;
  }) => { ok: boolean; message: string };

  recordRentPayment: (
    invoiceId: string,
    amount: number,
    method: RentPayment['method'],
    reference: string,
    notes?: string
  ) => { ok: boolean; message: string };
  reverseRentPayment: (paymentId: string, reason: string) => void;
  sendRentReminder: (invoiceId: string) => void;
  generateMonthlyInvoices: (propertyId: string, monthLabel: string, dueDate: string) => number;

  recordDepositTransaction: (tx: Omit<DepositTransaction, 'id'>) => void;
  addOwnerExpense: (exp: Omit<OwnerExpense, 'id'>) => void;
  updateOwnerExpense: (id: string, patch: Partial<OwnerExpense>) => void;
  reverseOwnerExpense: (id: string, reason: string) => void;

  addMaintenanceRequest: (req: Omit<MaintenanceRequest, 'id'>) => void;
  updateMaintenanceRequest: (id: string, patch: Partial<MaintenanceRequest>, restoreBed?: boolean) => void;
  addScheduledMaintenance: (item: Omit<ScheduledMaintenance, 'id'>) => void;
  updateScheduledMaintenance: (id: string, patch: Partial<ScheduledMaintenance>) => void;

  addPropertyRule: (rule: Omit<PropertyRule, 'id' | 'version'>) => void;
  updatePropertyRule: (id: string, patch: Partial<PropertyRule>) => void;

  replyToReview: (reviewId: string, reply: string) => void;
  reportReviewToAdmin: (reviewId: string, reason: string) => void;

  submitLocationSharingRequest: (req: {
    propertyId: string;
    tenantId: string;
    category: LocationSharingRequest['category'];
    reason: string;
    explanation: string;
    durationHours: number;
  }) => void;
  adminReviewLocationRequest: (reqId: string, decision: 'Awaiting Tenant Permission' | 'Rejected', note?: string) => void;
  tenantRespondLocationRequest: (reqId: string, decision: 'Voluntarily Shared' | 'Declined by Tenant' | 'Revoked') => void;
  cancelLocationRequest: (reqId: string) => void;

  addTenantExpense: (exp: Omit<TenantExpense, 'id' | 'tenantId'>) => void;
  updateTenantExpense: (id: string, patch: Partial<TenantExpense>) => void;
  deleteTenantExpense: (id: string) => void;
  confirmRecurringExpense: (id: string) => void;
  addTenantCustomCategory: (name: string) => void;
  updateTenantBudget: (budget: TenantBudget) => void;
  addSharedExpense: (exp: Omit<SharedExpense, 'id'>) => void;
  settleSharedParticipant: (expenseId: string, participantName: string) => void;

  updateFoodMenuDay: (day: string, patch: Partial<FoodMenuDay>) => void;
  createComplaint: (cmp: Omit<ComplaintItem, 'id' | 'createdAt' | 'status'>) => void;
  updateComplaintStatus: (
    id: string,
    status: ComplaintItem['status'],
    assignedStaff?: string,
    ownerResponse?: string
  ) => void;
  createNotice: (notice: Omit<NoticeItem, 'id' | 'publishedAt' | 'readByTenantIds'>) => void;
  markNoticeRead: (noticeId: string, tenantId: string) => void;
  addParcel: (parcel: Omit<ParcelItem, 'id' | 'receivedAt'>) => void;
  updateParcelStatus: (parcelId: string, status: ParcelItem['status']) => void;
  requestCheckout: (stayId: string, requestedDate: string) => void;
  completeCheckout: (checkoutId: string, deductions: number, reason: string) => void;
  addStaffMember: (member: Omit<StaffMember, 'id'>) => void;

  createEvent: (evt: Omit<StartupEvent, 'id' | 'registeredCount'>) => void;
  toggleEventStatus: (eventId: string, status: StartupEvent['status']) => void;
  toggleEventBookmark: (eventId: string) => void;
  toggleEventRsvp: (eventId: string) => void;

  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status' | 'lastReply'>) => void;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status'], reply?: string) => void;
  markNotificationRead: (id: string) => void;
}

const PGFinderContext = createContext<PGFinderContextValue | undefined>(undefined);

export const PGFinderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(INITIAL_USERS[0]);
  const [selectedCity, setSelectedCity] = useState<string>('Bengaluru');
  const [ownerSelectedPropertyId, setOwnerSelectedPropertyId] = useState<string>('ALL');
  const [tenantPreviewSearching, setTenantPreviewSearching] = useState<boolean>(false);

  const [properties, setProperties] = useState<PGProperty[]>(INITIAL_PROPERTIES);
  const [floors, setFloors] = useState<Floor[]>(INITIAL_FLOORS);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [beds, setBeds] = useState<Bed[]>(INITIAL_BEDS);
  const [stays, setStays] = useState<TenantStay[]>(INITIAL_STAYS);
  const [transfers, setTransfers] = useState<TenantTransferRecord[]>(INITIAL_OWNER_TRANSFERS);
  const [joiningRequests, setJoiningRequests] = useState<JoiningRequest[]>(INITIAL_JOINING_REQUESTS);
  const [rentInvoices, setRentInvoices] = useState<RentInvoice[]>(INITIAL_RENT_INVOICES);
  const [rentPayments, setRentPayments] = useState<RentPayment[]>(INITIAL_RENT_PAYMENTS);
  const [depositTransactions, setDepositTransactions] = useState<DepositTransaction[]>(INITIAL_DEPOSIT_TRANSACTIONS);
  const [ownerExpenses, setOwnerExpenses] = useState<OwnerExpense[]>(INITIAL_OWNER_EXPENSES);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>(INITIAL_MAINTENANCE_REQUESTS);
  const [scheduledMaintenance, setScheduledMaintenance] = useState<ScheduledMaintenance[]>(INITIAL_SCHEDULED_MAINTENANCE);
  const [propertyRules, setPropertyRules] = useState<PropertyRule[]>(INITIAL_PROPERTY_RULES);
  const [propertyReviews, setPropertyReviews] = useState<PropertyReview[]>(INITIAL_PROPERTY_REVIEWS);
  const [locationRequests, setLocationRequests] = useState<LocationSharingRequest[]>(INITIAL_LOCATION_SHARING_REQUESTS);

  const [tenantExpenses, setTenantExpenses] = useState<TenantExpense[]>(INITIAL_TENANT_EXPENSES);
  const [tenantCategories, setTenantCategories] = useState<string[]>(TENANT_EXPENSE_CATEGORIES);
  const [tenantBudget, setTenantBudget] = useState<TenantBudget>(INITIAL_TENANT_BUDGET);
  const [autoImportConfirmedRent, setAutoImportConfirmedRent] = useState<boolean>(true);
  const [sharedExpenses, setSharedExpenses] = useState<SharedExpense[]>(INITIAL_SHARED_EXPENSES);
  const [foodMenu, setFoodMenu] = useState<FoodMenuDay[]>(INITIAL_FOOD_MENU);
  const [complaints, setComplaints] = useState<ComplaintItem[]>(INITIAL_COMPLAINTS);
  const [notices, setNotices] = useState<NoticeItem[]>(INITIAL_NOTICES);
  const [parcels, setParcels] = useState<ParcelItem[]>(INITIAL_PARCELS);
  const [checkouts, setCheckouts] = useState<CheckoutRequest[]>(INITIAL_CHECKOUTS);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [events, setEvents] = useState<StartupEvent[]>(INITIAL_EVENTS);
  const [localBusinesses] = useState<LocalBusiness[]>(INITIAL_LOCAL_BUSINESSES);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(INITIAL_SUPPORT_TICKETS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  const [unifiedDocuments, setUnifiedDocuments] = useState<UnifiedDocumentRecord[]>(INITIAL_UNIFIED_DOCUMENTS);
  const [planFeatures, setPlanFeatures] = useState<PlanFeature[]>(INITIAL_PLAN_FEATURES);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(INITIAL_SUBSCRIPTION_PLANS);
  const [ownerSubscriptions, setOwnerSubscriptions] = useState<OwnerSubscriptionRecord[]>(INITIAL_OWNER_SUBSCRIPTIONS);
  const [platformPayments] = useState<PlatformPaymentRecord[]>(INITIAL_PLATFORM_PAYMENTS);
  const [featuredCampaigns, setFeaturedCampaigns] = useState<FeaturedCampaign[]>(INITIAL_FEATURED_CAMPAIGNS);
  const [advertisers, setAdvertisers] = useState<AdvertiserAccount[]>(INITIAL_ADVERTISERS);
  const [localAdCampaigns, setLocalAdCampaigns] = useState<LocalAdCampaign[]>(INITIAL_LOCAL_AD_CAMPAIGNS);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotificationRecord[]>(INITIAL_ADMIN_NOTIFICATIONS);

  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>(['prop-2', 'prop-4']);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(['prop-1', 'prop-2']);
  const [savedEventIds, setSavedEventIds] = useState<string[]>(['evt-1']);
  const [rsvpedEventIds, setRsvpedEventIds] = useState<string[]>(['evt-1']);
  const [waitlistedEventIds, setWaitlistedEventIds] = useState<string[]>([]);

  const pushAudit = (
    action: string,
    entityType: string,
    entityId: string,
    summary: string,
    meta?: {
      category?: AuditCategory;
      beforeValue?: string;
      afterValue?: string;
      reason?: string;
      status?: 'Success' | 'Failed' | 'Blocked';
    }
  ) => {
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        actorName: currentUser?.name || 'System',
        actorRole: currentUser?.role || 'SUPER_ADMIN',
        category: meta?.category || 'Administrator',
        action,
        entityType,
        entityId,
        summary,
        beforeValue: meta?.beforeValue,
        afterValue: meta?.afterValue,
        reason: meta?.reason,
        status: meta?.status || 'Success',
        ipOrDeviceSummary: 'Web Session · Browser',
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const pushNotification = (targetRole: UserRole | 'ALL', title: string, body: string, route?: string) => {
    setNotifications((prev) => [
      {
        id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        targetRole,
        title,
        body,
        createdAt: 'Just now',
        read: false,
        route,
      },
      ...prev,
    ]);
  };

  const switchDemoRole = (role: UserRole) => {
    const match = users.find((u) => u.role === role);
    if (match) setCurrentUser(match);
  };

  const loginUser = (email: string, role?: UserRole): UserAccount => {
    const byEmail = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (byEmail) {
      setCurrentUser(byEmail);
      return byEmail;
    }
    const byRole = role ? users.find((u) => u.role === role) : users[0];
    const resolved = byRole || users[0];
    setCurrentUser(resolved);
    return resolved;
  };

  const registerUser = (data: {
    name: string;
    email: string;
    mobile: string;
    role: 'TENANT' | 'PG_OWNER';
    city: string;
  }): UserAccount => {
    const initials = data.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0].toUpperCase())
      .join('');
    const created: UserAccount = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      role: data.role,
      status: 'Active',
      city: data.city || 'Bengaluru',
      registeredAt: new Date().toISOString().slice(0, 10),
      avatarInitials: initials || 'PG',
      subscriptionPlan: data.role === 'PG_OWNER' ? 'Basic' : undefined,
      languagePreference: 'English',
    };
    setUsers((prev) => [created, ...prev]);
    setCurrentUser(created);
    return created;
  };

  const updateCurrentUserProfile = (patch: Partial<UserAccount>) => {
    if (!currentUser) return;
    // Security rule: never allow self-elevation of role or admin sub-role via profile edit
    const { role: _ignoredRole, assignedAdminRole: _ignoredSubRole, ...safePatch } = patch;
    const updated = { ...currentUser, ...safePatch };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    pushAudit('UPDATE_PROFILE', 'User', currentUser.id, `Updated profile details for ${updated.name}.`, {
      category: currentUser.role === 'SUPER_ADMIN' ? 'Administrator' : currentUser.role === 'PG_OWNER' ? 'PG Owner' : 'Tenant',
    });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const toggleSaveProperty = (propertyId: string) => {
    setSavedPropertyIds((prev) =>
      prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]
    );
  };

  const markPropertyViewed = (propertyId: string) => {
    setRecentlyViewedIds((prev) => [propertyId, ...prev.filter((id) => id !== propertyId)].slice(0, 6));
  };

  const submitNewProperty = (prop: Omit<PGProperty, 'id' | 'qrToken' | 'reviewCount'>): PGProperty => {
    const id = `prop-${Date.now()}`;
    const token = `PGF-${prop.city.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const created: PGProperty = {
      ...prop,
      id,
      qrToken: token,
      reviewCount: 0,
    };
    setProperties((prev) => [created, ...prev]);
    if (created.approvalStatus === 'PENDING_APPROVAL') {
      pushAudit('SUBMIT_PROPERTY', 'Property', id, `Submitted ${created.name} (${created.city}) for approval.`);
      pushNotification(
        'SUPER_ADMIN',
        'New property awaiting approval',
        `${created.name} in ${created.locality}, ${created.city} submitted by ${created.ownerName}.`,
        '/admin/approvals'
      );
    }
    return created;
  };

  const updatePropertyDetails = (propertyId: string, patch: Partial<PGProperty>) => {
    setProperties((prev) => prev.map((p) => (p.id === propertyId ? { ...p, ...patch } : p)));
  };

  const archiveOrDeleteProperty = (
    propertyId: string
  ): { ok: boolean; mode: 'deleted' | 'archived'; message: string } => {
    const prop = properties.find((p) => p.id === propertyId);
    if (!prop) return { ok: false, mode: 'archived', message: 'Property not found.' };
    const hasActiveTenants = stays.some((s) => s.propertyId === propertyId && s.status === 'Active');
    if (hasActiveTenants) {
      return {
        ok: false,
        mode: 'archived',
        message: 'Cannot delete or archive a PG with active tenants. Complete checkout or transfer tenants first.',
      };
    }
    const hasHistory =
      stays.some((s) => s.propertyId === propertyId) ||
      rentInvoices.some((i) => i.propertyId === propertyId) ||
      ownerExpenses.some((e) => e.propertyId === propertyId);
    if (prop.approvalStatus === 'DRAFT' && !hasHistory) {
      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      return { ok: true, mode: 'deleted', message: `Deleted empty draft "${prop.name}".` };
    }
    setProperties((prev) =>
      prev.map((p) =>
        p.id === propertyId
          ? { ...p, archived: true, listingStatus: 'UNPUBLISHED', qrEnabled: false }
          : p
      )
    );
    pushAudit('ARCHIVE_PROPERTY', 'Property', propertyId, `Archived ${prop.name} preserving historical records.`);
    return {
      ok: true,
      mode: 'archived',
      message: `Archived "${prop.name}". Historical stays and financial records were preserved.`,
    };
  };

  const updatePropertyListingStatus = (propertyId: string, status: PGProperty['listingStatus']) => {
    setProperties((prev) => prev.map((p) => (p.id === propertyId ? { ...p, listingStatus: status } : p)));
  };

  const togglePropertyQr = (propertyId: string) => {
    setProperties((prev) => prev.map((p) => (p.id === propertyId ? { ...p, qrEnabled: !p.qrEnabled } : p)));
  };

  const regeneratePropertyQr = (propertyId: string) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === propertyId
          ? { ...p, qrToken: `PGF-${p.city.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}` }
          : p
      )
    );
  };

  const adminReviewProperty = (
    propertyId: string,
    decision: 'UNDER_REVIEW' | 'APPROVED' | 'CORRECTIONS_REQUIRED' | 'REJECTED' | 'SUSPENDED',
    comment?: string
  ) => {
    const existing = properties.find((p) => p.id === propertyId);
    const nowStr = new Date().toLocaleString('en-IN');
    const actor = currentUser?.name || 'Super Admin';
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id !== propertyId) return p;
        const nextListing =
          decision === 'SUSPENDED' || decision === 'REJECTED'
            ? 'SUSPENDED'
            : decision === 'APPROVED' && p.locationVerificationStatus === 'VERIFIED'
            ? p.listingStatus === 'PUBLISHED'
              ? 'PUBLISHED'
              : 'ELIGIBLE_FOR_LISTING'
            : p.listingStatus;
        const nextHistory = [
          {
            id: `vh-${Date.now()}`,
            status: decision,
            actor,
            timestamp: nowStr,
            comment,
          },
          ...(p.verificationHistory || []),
        ];
        return {
          ...p,
          approvalStatus: decision,
          listingStatus: nextListing,
          qrEnabled: decision === 'APPROVED' && p.locationVerificationStatus === 'VERIFIED' ? true : p.qrEnabled,
          adminComment: comment || p.adminComment,
          reviewedBy: actor,
          reviewedAt: nowStr,
          verificationHistory: nextHistory,
        };
      })
    );
    pushAudit(`PROPERTY_${decision}`, 'Property', propertyId, comment || `Property status updated to ${decision}.`, {
      category: 'Property',
      beforeValue: existing?.approvalStatus,
      afterValue: decision,
      reason: comment,
    });
    pushNotification(
      'PG_OWNER',
      `Property ${decision.replace(/_/g, ' ').toLowerCase()}`,
      comment || `Super Admin updated property approval status to ${decision.replace(/_/g, ' ')}.`,
      '/owner/properties'
    );
  };

  const adminSuspendProperty = (
    propertyId: string,
    details: { category: string; reason: string; effectiveDate: string; reviewDate?: string; notifyOwner?: boolean }
  ) => {
    const existing = properties.find((p) => p.id === propertyId);
    const actor = currentUser?.name || 'Super Admin';
    const nowStr = new Date().toLocaleString('en-IN');
    setProperties((prev) =>
      prev.map((p) =>
        p.id === propertyId
          ? {
              ...p,
              approvalStatus: 'SUSPENDED',
              listingStatus: 'SUSPENDED',
              isSponsored: false,
              qrEnabled: false,
              adminComment: `${details.category}: ${details.reason}`,
              suspensionDetails: {
                category: details.category,
                reason: details.reason,
                effectiveDate: details.effectiveDate,
                reviewDate: details.reviewDate,
                suspendedBy: actor,
                suspendedAt: nowStr,
              },
              verificationHistory: [
                {
                  id: `vh-${Date.now()}`,
                  status: 'SUSPENDED',
                  actor,
                  timestamp: nowStr,
                  comment: `${details.category} — ${details.reason}`,
                },
                ...(p.verificationHistory || []),
              ],
            }
          : p
      )
    );
    setFeaturedCampaigns((prev) =>
      prev.map((c) => (c.propertyId === propertyId && c.status === 'Active' ? { ...c, status: 'Paused' } : c))
    );
    pushAudit('SUSPEND_PROPERTY', 'Property', propertyId, `Suspended ${existing?.name || propertyId}: ${details.category} — ${details.reason}`, {
      category: 'Property',
      beforeValue: existing?.approvalStatus,
      afterValue: 'SUSPENDED',
      reason: details.reason,
    });
    if (details.notifyOwner !== false) {
      pushNotification(
        'PG_OWNER',
        `Property suspended: ${existing?.name || 'PG Property'}`,
        `${details.category}: ${details.reason}`,
        '/owner/properties'
      );
    }
  };

  const adminRestoreProperty = (propertyId: string, reason: string) => {
    const existing = properties.find((p) => p.id === propertyId);
    const actor = currentUser?.name || 'Super Admin';
    const nowStr = new Date().toLocaleString('en-IN');
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id !== propertyId) return p;
        const canList = p.locationVerificationStatus === 'VERIFIED';
        return {
          ...p,
          approvalStatus: 'APPROVED',
          listingStatus: canList ? 'ELIGIBLE_FOR_LISTING' : 'NOT_LISTED',
          suspensionDetails: undefined,
          adminComment: reason,
          verificationHistory: [
            {
              id: `vh-${Date.now()}`,
              status: 'RESTORED_APPROVED',
              actor,
              timestamp: nowStr,
              comment: reason,
            },
            ...(p.verificationHistory || []),
          ],
        };
      })
    );
    pushAudit('RESTORE_PROPERTY', 'Property', propertyId, `Restored ${existing?.name || propertyId}: ${reason}`, {
      category: 'Property',
      beforeValue: existing?.approvalStatus,
      afterValue: 'APPROVED',
      reason,
    });
    pushNotification(
      'PG_OWNER',
      `Property restored: ${existing?.name || 'PG Property'}`,
      reason,
      '/owner/properties'
    );
  };

  const adminVerifyLocation = (
    propertyId: string,
    decision: 'UNDER_REVIEW' | 'VERIFIED' | 'CORRECTIONS_REQUIRED' | 'REJECTED' | 'REVERIFICATION_REQUIRED',
    comment?: string
  ) => {
    const existing = properties.find((p) => p.id === propertyId);
    const actor = currentUser?.name || 'Super Admin';
    const nowStr = new Date().toLocaleString('en-IN');
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id !== propertyId) return p;
        const bothVerified = p.approvalStatus === 'APPROVED' && decision === 'VERIFIED';
        return {
          ...p,
          locationVerificationStatus: decision,
          listingStatus: bothVerified && p.listingStatus === 'NOT_LISTED' ? 'ELIGIBLE_FOR_LISTING' : p.listingStatus,
          qrEnabled: bothVerified ? true : p.qrEnabled,
          adminComment: comment || p.adminComment,
          locationReviewedBy: actor,
          locationReviewedAt: nowStr,
          locationNotes: comment || p.locationNotes,
          locationHistory: [
            {
              id: `lh-${Date.now()}`,
              status: decision,
              actor,
              timestamp: nowStr,
              latitude: p.location?.latitude,
              longitude: p.location?.longitude,
              accuracy: p.location?.accuracy,
              comment,
            },
            ...(p.locationHistory || []),
          ],
        };
      })
    );
    pushAudit(`LOCATION_${decision}`, 'Property', propertyId, comment || `Location verification updated to ${decision}.`, {
      category: 'Location Verification',
      beforeValue: existing?.locationVerificationStatus,
      afterValue: decision,
      reason: comment,
    });
    pushNotification(
      'PG_OWNER',
      `Location ${decision.replace(/_/g, ' ').toLowerCase()}`,
      comment || `Location verification status updated to ${decision.replace(/_/g, ' ')}.`,
      '/owner/properties'
    );
  };

  const adminVerifyDocument = (
    propertyId: string,
    docId: string,
    status: 'Verified' | 'Rejected' | 'Replacement Required',
    note?: string
  ) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === propertyId
          ? {
              ...p,
              documents: p.documents.map((d) => (d.id === docId ? { ...d, status, reviewNote: note } : d)),
            }
          : p
      )
    );
    setUnifiedDocuments((prev) =>
      prev.map((ud) =>
        ud.propertyId === propertyId && (ud.id === docId || ud.fileName === properties.find((p) => p.id === propertyId)?.documents.find((d) => d.id === docId)?.name)
          ? {
              ...ud,
              verificationStatus: status,
              verifiedBy: currentUser?.name || 'Super Admin',
              verifiedAt: new Date().toISOString().slice(0, 10),
              rejectionOrReplacementNote: note,
            }
          : ud
      )
    );
    pushAudit('DOCUMENT_REVIEW', 'PropertyDocument', docId, `Document marked ${status}.`, {
      category: 'Document Access',
      afterValue: status,
      reason: note,
    });
  };

  const toggleUserStatus = (userId: string) => {
    const existing = users.find((u) => u.id === userId);
    const nextStatus = existing?.status === 'Active' ? 'Suspended' : 'Active';
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
    );
    pushAudit('TOGGLE_USER_STATUS', 'User', userId, `Updated ${existing?.name || userId} status to ${nextStatus}.`, {
      category: existing?.role === 'PG_OWNER' ? 'PG Owner' : 'Tenant',
      beforeValue: existing?.status,
      afterValue: nextStatus,
    });
  };

  const adminUpdateUser = (userId: string, patch: Partial<UserAccount>) => {
    const existing = users.find((u) => u.id === userId);
    const { role: _r, ...safePatch } = patch;
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...safePatch } : u)));
    pushAudit('ADMIN_EDIT_USER', 'User', userId, `Updated permitted profile fields for ${existing?.name || userId}.`, {
      category: existing?.role === 'PG_OWNER' ? 'PG Owner' : 'Tenant',
    });
  };

  const adminSuspendUser = (userId: string, reason: string) => {
    const existing = users.find((u) => u.id === userId);
    const actor = currentUser?.name || 'Super Admin';
    const nowStr = new Date().toISOString().slice(0, 10);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: 'Suspended', suspendedReason: reason, suspendedAt: nowStr, suspendedBy: actor }
          : u
      )
    );
    if (existing?.role === 'PG_OWNER') {
      setProperties((prev) =>
        prev.map((p) => (p.ownerId === userId && p.listingStatus === 'PUBLISHED' ? { ...p, listingStatus: 'SUSPENDED' } : p))
      );
    }
    pushAudit('SUSPEND_USER', 'User', userId, `Suspended ${existing?.name || userId}: ${reason}`, {
      category: existing?.role === 'PG_OWNER' ? 'PG Owner' : 'Tenant',
      beforeValue: existing?.status,
      afterValue: 'Suspended',
      reason,
    });
    pushNotification(
      existing?.role || 'TENANT',
      'Account suspended by Super Admin',
      reason,
      existing?.role === 'PG_OWNER' ? '/owner/profile' : '/tenant/profile'
    );
  };

  const adminRestoreUser = (userId: string, reason?: string) => {
    const existing = users.find((u) => u.id === userId);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: 'Active', suspendedReason: undefined, suspendedAt: undefined } : u
      )
    );
    pushAudit('RESTORE_USER', 'User', userId, `Reactivated ${existing?.name || userId}${reason ? `: ${reason}` : '.'}`, {
      category: existing?.role === 'PG_OWNER' ? 'PG Owner' : 'Tenant',
      beforeValue: existing?.status,
      afterValue: 'Active',
      reason,
    });
  };

  const adminArchiveUser = (userId: string): { ok: boolean; message: string } => {
    const existing = users.find((u) => u.id === userId);
    if (!existing) return { ok: false, message: 'User not found.' };
    const hasActiveStay = stays.some((s) => s.tenantId === userId && s.status === 'Active');
    const hasProps = properties.some((p) => p.ownerId === userId && !p.archived);
    if (hasActiveStay || hasProps) {
      return {
        ok: false,
        message: 'Cannot archive user with active stays or active properties. Historical financial records must be preserved.',
      };
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, archived: true, status: 'Suspended' } : u)));
    pushAudit('ARCHIVE_USER', 'User', userId, `Archived user ${existing.name} (historical records preserved).`, {
      category: existing.role === 'PG_OWNER' ? 'PG Owner' : 'Tenant',
    });
    return { ok: true, message: `${existing.name} archived safely.` };
  };

  const logDocumentAccess = (docId: string) => {
    const doc = unifiedDocuments.find((d) => d.id === docId);
    if (!doc) return;
    pushAudit('DOCUMENT_VIEWED', 'UnifiedDocument', docId, `Viewed ${doc.category} document "${doc.fileName}" (${doc.ownerOrTenantName}).`, {
      category: 'Document Access',
    });
  };

  const adminReviewUnifiedDocument = (
    docId: string,
    status: UnifiedDocumentRecord['verificationStatus'],
    note?: string
  ) => {
    const doc = unifiedDocuments.find((d) => d.id === docId);
    const actor = currentUser?.name || 'Super Admin';
    const today = new Date().toISOString().slice(0, 10);
    setUnifiedDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              verificationStatus: status,
              verifiedBy: actor,
              verifiedAt: today,
              rejectionOrReplacementNote: note,
            }
          : d
      )
    );
    if (doc?.propertyId) {
      setProperties((prev) =>
        prev.map((p) =>
          p.id === doc.propertyId
            ? {
                ...p,
                documents: p.documents.map((pd) =>
                  pd.name === doc.fileName ? { ...pd, status, reviewNote: note } : pd
                ),
              }
            : p
        )
      );
    }
    if (doc?.stayId && (status === 'Verified' || status === 'Rejected')) {
      setStays((prev) =>
        prev.map((s) =>
          s.id === doc.stayId ? { ...s, documentStatus: status === 'Verified' ? 'Verified' : 'Pending' } : s
        )
      );
    }
    pushAudit(`DOCUMENT_${status.toUpperCase().replace(/\s+/g, '_')}`, 'UnifiedDocument', docId, `Marked "${doc?.fileName || docId}" as ${status}.`, {
      category: 'Document Access',
      beforeValue: doc?.verificationStatus,
      afterValue: status,
      reason: note,
    });
    if (doc) {
      pushNotification(
        doc.category === 'Tenant' ? 'TENANT' : 'PG_OWNER',
        `Document ${status.toLowerCase()}`,
        `${doc.fileName} (${doc.documentType}) marked ${status}${note ? `: ${note}` : '.'}`,
        doc.category === 'Tenant' ? '/tenant/my-pg' : '/owner/properties'
      );
    }
  };

  const archiveOrDeleteUnifiedDocument = (docId: string): { ok: boolean; message: string } => {
    const doc = unifiedDocuments.find((d) => d.id === docId);
    if (!doc) return { ok: false, message: 'Document not found.' };
    if (doc.verificationStatus === 'Verified') {
      setUnifiedDocuments((prev) => prev.map((d) => (d.id === docId ? { ...d, archived: true } : d)));
      pushAudit('ARCHIVE_DOCUMENT', 'UnifiedDocument', docId, `Archived verified compliance document "${doc.fileName}".`, {
        category: 'Document Access',
      });
      return { ok: true, message: 'Verified compliance document archived (preserved for audit).' };
    }
    setUnifiedDocuments((prev) => prev.filter((d) => d.id !== docId));
    pushAudit('DELETE_DOCUMENT', 'UnifiedDocument', docId, `Removed non-verified draft/duplicate document "${doc.fileName}".`, {
      category: 'Document Access',
    });
    return { ok: true, message: 'Document removed.' };
  };

  const addPlanFeature = (feat: Omit<PlanFeature, 'id' | 'createdAt'>) => {
    const id = `feat-${Date.now()}`;
    setPlanFeatures((prev) => [{ ...feat, id, createdAt: new Date().toISOString().slice(0, 10) }, ...prev]);
    pushAudit('CREATE_PLAN_FEATURE', 'PlanFeature', id, `Created plan feature ${feat.name} (${feat.code}).`, {
      category: 'Financial',
    });
  };

  const updatePlanFeature = (id: string, patch: Partial<PlanFeature>) => {
    setPlanFeatures((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    pushAudit('UPDATE_PLAN_FEATURE', 'PlanFeature', id, `Updated plan feature ${patch.name || id}.`, {
      category: 'Financial',
    });
  };

  const togglePlanFeatureStatus = (id: string) => {
    setPlanFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: f.status === 'Active' ? 'Inactive' : 'Active' } : f))
    );
  };

  const addSubscriptionPlan = (plan: Omit<SubscriptionPlan, 'id'>) => {
    const id = `plan-${Date.now()}`;
    setSubscriptionPlans((prev) => [{ ...plan, id }, ...prev]);
    pushAudit('CREATE_SUBSCRIPTION_PLAN', 'SubscriptionPlan', id, `Created plan ${plan.name} (₹${plan.priceInr}).`, {
      category: 'Financial',
    });
  };

  const updateSubscriptionPlan = (id: string, patch: Partial<SubscriptionPlan>) => {
    setSubscriptionPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    pushAudit('UPDATE_SUBSCRIPTION_PLAN', 'SubscriptionPlan', id, `Updated subscription plan ${patch.name || id}.`, {
      category: 'Financial',
    });
  };

  const duplicateSubscriptionPlan = (id: string) => {
    const src = subscriptionPlans.find((p) => p.id === id);
    if (!src) return;
    const copyId = `plan-${Date.now()}`;
    setSubscriptionPlans((prev) => [
      {
        ...src,
        id: copyId,
        name: `${src.name} Copy`,
        code: `${src.code}_COPY`,
        status: 'Inactive',
      },
      ...prev,
    ]);
  };

  const deleteOrArchiveSubscriptionPlan = (id: string): { ok: boolean; message: string } => {
    const inUse = ownerSubscriptions.some((s) => s.planId === id);
    if (inUse) {
      setSubscriptionPlans((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'Archived' } : p)));
      return { ok: true, message: 'Plan has linked subscribers and was archived instead of deleted.' };
    }
    setSubscriptionPlans((prev) => prev.filter((p) => p.id !== id));
    return { ok: true, message: 'Unused subscription plan deleted.' };
  };

  const manageOwnerSubscription = (
    subId: string,
    action: 'change_plan' | 'extend' | 'cancel' | 'restore',
    payload: { planId?: string; newEndDate?: string; reason: string }
  ) => {
    const existing = ownerSubscriptions.find((s) => s.id === subId);
    if (!existing) return;
    const nextPlan = payload.planId ? subscriptionPlans.find((p) => p.id === payload.planId) : undefined;
    setOwnerSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id !== subId) return s;
        if (action === 'change_plan' && nextPlan) {
          return { ...s, planId: nextPlan.id, planName: nextPlan.name, amountInr: nextPlan.priceInr, notes: payload.reason };
        }
        if (action === 'extend' && payload.newEndDate) {
          return { ...s, endDate: payload.newEndDate, status: 'Active', notes: payload.reason };
        }
        if (action === 'cancel') {
          return { ...s, status: 'Cancelled', notes: payload.reason };
        }
        return { ...s, status: 'Active', notes: payload.reason };
      })
    );
    if (action === 'change_plan' && nextPlan && (nextPlan.name === 'Basic' || nextPlan.name === 'Pro' || nextPlan.name === 'Business')) {
      setUsers((prev) =>
        prev.map((u) => (u.id === existing.ownerId ? { ...u, subscriptionPlan: nextPlan.name as UserAccount['subscriptionPlan'] } : u))
      );
    }
    pushAudit(`SUBSCRIPTION_${action.toUpperCase()}`, 'OwnerSubscription', subId, `${existing.ownerName}: ${payload.reason}`, {
      category: 'Financial',
      beforeValue: `${existing.planName} (${existing.status})`,
      afterValue: nextPlan ? nextPlan.name : action,
      reason: payload.reason,
    });
  };

  const saveFeaturedCampaign = (
    camp: Omit<FeaturedCampaign, 'id' | 'impressions' | 'clicks'>,
    editId?: string
  ): { ok: boolean; message: string } => {
    const prop = properties.find((p) => p.id === camp.propertyId);
    if (!prop || prop.approvalStatus !== 'APPROVED' || prop.locationVerificationStatus !== 'VERIFIED') {
      return { ok: false, message: 'Only Approved and GPS-Verified properties can be featured.' };
    }
    if (editId) {
      setFeaturedCampaigns((prev) => prev.map((c) => (c.id === editId ? { ...c, ...camp } : c)));
    } else {
      setFeaturedCampaigns((prev) => [{ ...camp, id: `fcmp-${Date.now()}`, impressions: 0, clicks: 0 }, ...prev]);
    }
    if (camp.status === 'Active') {
      setProperties((prev) => prev.map((p) => (p.id === camp.propertyId ? { ...p, isSponsored: true } : p)));
    }
    pushAudit(editId ? 'UPDATE_FEATURED_PG' : 'CREATE_FEATURED_PG', 'FeaturedCampaign', editId || camp.propertyId, `Saved featured campaign for ${camp.propertyName}.`, {
      category: 'Financial',
    });
    return { ok: true, message: 'Featured PG campaign saved.' };
  };

  const updateFeaturedCampaignStatus = (id: string, status: FeaturedCampaign['status'], newEndDate?: string) => {
    const target = featuredCampaigns.find((c) => c.id === id);
    setFeaturedCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status, endDate: newEndDate || c.endDate } : c))
    );
    if (target) {
      setProperties((prev) =>
        prev.map((p) => (p.id === target.propertyId ? { ...p, isSponsored: status === 'Active' } : p))
      );
      pushAudit('FEATURED_PG_STATUS', 'FeaturedCampaign', id, `Updated ${target.propertyName} featured status to ${status}.`, {
        category: 'Financial',
        beforeValue: target.status,
        afterValue: status,
      });
    }
  };

  const deleteFeaturedCampaign = (id: string): { ok: boolean; message: string } => {
    const target = featuredCampaigns.find((c) => c.id === id);
    if (!target) return { ok: false, message: 'Campaign not found.' };
    if (target.status !== 'Draft') {
      setFeaturedCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'Archived' } : c)));
      return { ok: true, message: 'Non-draft campaign archived to preserve history.' };
    }
    setFeaturedCampaigns((prev) => prev.filter((c) => c.id !== id));
    return { ok: true, message: 'Draft featured campaign deleted.' };
  };

  const saveAdvertiser = (adv: Omit<AdvertiserAccount, 'id' | 'createdAt'>, editId?: string) => {
    if (editId) {
      setAdvertisers((prev) => prev.map((a) => (a.id === editId ? { ...a, ...adv } : a)));
    } else {
      setAdvertisers((prev) => [{ ...adv, id: `adv-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10) }, ...prev]);
    }
  };

  const updateAdvertiserStatus = (id: string, status: AdvertiserAccount['status']) => {
    setAdvertisers((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const saveLocalAdCampaign = (ad: Omit<LocalAdCampaign, 'id' | 'impressions' | 'clicks'>, editId?: string) => {
    if (editId) {
      setLocalAdCampaigns((prev) => prev.map((a) => (a.id === editId ? { ...a, ...ad } : a)));
    } else {
      setLocalAdCampaigns((prev) => [{ ...ad, id: `lad-${Date.now()}`, impressions: 0, clicks: 0 }, ...prev]);
    }
    pushAudit(editId ? 'UPDATE_LOCAL_AD' : 'CREATE_LOCAL_AD', 'LocalAdCampaign', editId || ad.advertiserId, `Saved local ad "${ad.title}".`, {
      category: 'Financial',
    });
  };

  const updateLocalAdStatus = (id: string, status: LocalAdCampaign['status']) => {
    setLocalAdCampaigns((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    pushAudit('LOCAL_AD_STATUS', 'LocalAdCampaign', id, `Updated local ad status to ${status}.`, {
      category: 'Financial',
    });
  };

  const deleteLocalAdCampaign = (id: string): { ok: boolean; message: string } => {
    const ad = localAdCampaigns.find((a) => a.id === id);
    if (!ad) return { ok: false, message: 'Ad not found.' };
    if (ad.status !== 'Draft') {
      setLocalAdCampaigns((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'Archived' } : a)));
      return { ok: true, message: 'Published/active campaign archived.' };
    }
    setLocalAdCampaigns((prev) => prev.filter((a) => a.id !== id));
    return { ok: true, message: 'Draft local ad deleted.' };
  };

  const saveAdminNotification = (
    rec: Omit<AdminNotificationRecord, 'id' | 'createdBy' | 'inAppReadCount' | 'publishedAt'>
  ) => {
    const id = `antf-${Date.now()}`;
    const publishedAt = rec.status === 'Published' ? new Date().toLocaleString('en-IN') + ' IST' : undefined;
    setAdminNotifications((prev) => [
      {
        ...rec,
        id,
        createdBy: currentUser?.name || 'Super Admin',
        inAppReadCount: 0,
        publishedAt,
      },
      ...prev,
    ]);
    if (rec.status === 'Published' && rec.channels.includes('In-App')) {
      const targetRole: UserRole | 'ALL' =
        rec.targetAudienceMode === 'All PG Owners' ||
        rec.targetAudienceMode === 'Specific Property Owners' ||
        rec.targetAudienceMode === 'Active Subscribers' ||
        rec.targetAudienceMode === 'Expired Subscribers'
          ? 'PG_OWNER'
          : rec.targetAudienceMode === 'All Tenants' || rec.targetAudienceMode === 'Specific Property Tenants'
          ? 'TENANT'
          : 'ALL';
      pushNotification(targetRole, rec.title, rec.message);
    }
    pushAudit('ADMIN_NOTIFICATION', 'AdminNotification', id, `${rec.status} notification "${rec.title}" (${rec.targetAudienceMode}).`, {
      category: 'Administrator',
    });
  };

  const updateAdminNotificationStatus = (id: string, status: AdminNotificationRecord['status']) => {
    const target = adminNotifications.find((n) => n.id === id);
    setAdminNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              status,
              publishedAt: status === 'Published' ? new Date().toLocaleString('en-IN') + ' IST' : n.publishedAt,
            }
          : n
      )
    );
    if (status === 'Published' && target && target.channels.includes('In-App')) {
      const role: UserRole | 'ALL' = target.targetAudienceMode.includes('Owner')
        ? 'PG_OWNER'
        : target.targetAudienceMode.includes('Tenant')
        ? 'TENANT'
        : 'ALL';
      pushNotification(role, target.title, target.message);
    }
    pushAudit('ADMIN_NOTIFICATION_STATUS', 'AdminNotification', id, `Notification "${target?.title || id}" changed to ${status}.`, {
      category: 'Administrator',
    });
  };

  const duplicateAdminNotification = (id: string) => {
    const src = adminNotifications.find((n) => n.id === id);
    if (!src) return;
    setAdminNotifications((prev) => [
      {
        ...src,
        id: `antf-${Date.now()}`,
        title: `${src.title} (Copy)`,
        status: 'Draft',
        publishedAt: undefined,
        inAppReadCount: 0,
      },
      ...prev,
    ]);
  };

  const adminReplySupportTicket = (
    ticketId: string,
    replyBody: string,
    nextStatus?: SupportTicket['status'],
    resolutionSummary?: string
  ) => {
    const tkt = supportTickets.find((t) => t.id === ticketId);
    const nowStr = new Date().toLocaleString('en-IN');
    const actor = currentUser?.name || 'Super Admin';
    setSupportTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: nextStatus || 'Waiting for User',
              lastReply: replyBody,
              updatedAt: new Date().toISOString().slice(0, 10),
              resolutionSummary: resolutionSummary ?? t.resolutionSummary,
              messages: [
                ...(t.messages || []),
                {
                  id: `msg-${Date.now()}`,
                  senderName: `${actor} (Support Admin)`,
                  senderRole: 'SUPER_ADMIN',
                  body: replyBody,
                  createdAt: nowStr,
                },
              ],
            }
          : t
      )
    );
    if (tkt) {
      pushNotification(
        tkt.userRole,
        `Support reply on ${tkt.ticketCode || tkt.id}`,
        replyBody,
        tkt.userRole === 'TENANT' ? '/tenant/profile' : '/owner/profile'
      );
      pushAudit('SUPPORT_TICKET_REPLY', 'SupportTicket', ticketId, `Replied to ${tkt.userName}'s ticket (${tkt.subject}).`, {
        category: 'Administrator',
        afterValue: nextStatus || 'Waiting for User',
      });
    }
  };

  const adminAddSupportInternalNote = (ticketId: string, note: string) => {
    const actor = currentUser?.name || 'Super Admin';
    setSupportTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              internalNotes: [
                ...(t.internalNotes || []),
                {
                  id: `in-${Date.now()}`,
                  authorName: actor,
                  note,
                  createdAt: new Date().toLocaleString('en-IN'),
                },
              ],
            }
          : t
      )
    );
  };

  const adminUpdateSupportTicketMeta = (
    ticketId: string,
    patch: Partial<Pick<SupportTicket, 'priority' | 'status' | 'assignedAdmin' | 'resolutionSummary'>>
  ) => {
    setSupportTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId ? { ...t, ...patch, updatedAt: new Date().toISOString().slice(0, 10) } : t
      )
    );
    pushAudit('UPDATE_SUPPORT_TICKET', 'SupportTicket', ticketId, `Updated support ticket metadata (${Object.keys(patch).join(', ')}).`, {
      category: 'Administrator',
    });
  };

  const moderateReviewStatus = (reviewId: string, action: 'Keep' | 'Hide') => {
    setPropertyReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, reportedStatus: 'Reviewed', reportReason: `${r.reportReason || ''} (Admin decision: ${action})`.trim() }
          : r
      )
    );
    pushAudit('MODERATE_REVIEW', 'PropertyReview', reviewId, `Moderated reported review: ${action}.`, {
      category: 'Administrator',
    });
  };

  const addFloor = (floor: Omit<Floor, 'id'>) => {
    setFloors((prev) => [...prev, { ...floor, id: `flr-${Date.now()}` }]);
  };

  const editFloor = (floorId: string, patch: Partial<Floor>) => {
    setFloors((prev) => prev.map((f) => (f.id === floorId ? { ...f, ...patch } : f)));
  };

  const deleteOrDeactivateFloor = (floorId: string): { ok: boolean; message: string } => {
    const floorRooms = rooms.filter((r) => r.floorId === floorId).map((r) => r.id);
    const hasOccupied = beds.some((b) => floorRooms.includes(b.roomId) && b.status === 'Occupied');
    if (hasOccupied) {
      return { ok: false, message: 'Cannot delete or deactivate a floor with occupied beds.' };
    }
    if (floorRooms.length > 0) {
      setFloors((prev) => prev.map((f) => (f.id === floorId ? { ...f, operational: !f.operational } : f)));
      return { ok: true, message: 'Floor operational status toggled (rooms preserved).' };
    }
    setFloors((prev) => prev.filter((f) => f.id !== floorId));
    return { ok: true, message: 'Empty floor deleted.' };
  };

  const addRoom = (room: Omit<Room, 'id'>) => {
    const roomId = `rm-${Date.now()}`;
    setRooms((prev) => [...prev, { ...room, id: roomId }]);
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const newBeds: Bed[] = Array.from({ length: room.capacity }, (_, idx) => ({
      id: `bed-${roomId}-${idx}`,
      propertyId: room.propertyId,
      roomId,
      bedCode: `${room.roomNumber}-${letters[idx] || idx + 1}`,
      status: 'Available',
    }));
    setBeds((prev) => [...prev, ...newBeds]);
  };

  const editRoom = (roomId: string, patch: Partial<Room>): { ok: boolean; message: string } => {
    const existing = rooms.find((r) => r.id === roomId);
    if (!existing) return { ok: false, message: 'Room not found.' };
    const roomBeds = beds.filter((b) => b.roomId === roomId);
    const occupiedCount = roomBeds.filter((b) => b.status === 'Occupied').length;
    if (patch.capacity !== undefined && patch.capacity < occupiedCount) {
      return {
        ok: false,
        message: `Cannot reduce capacity to ${patch.capacity}: room currently has ${occupiedCount} occupied bed(s).`,
      };
    }
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, ...patch } : r)));
    if (patch.capacity !== undefined && patch.capacity > roomBeds.length) {
      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const extra: Bed[] = Array.from({ length: patch.capacity - roomBeds.length }, (_, i) => {
        const idx = roomBeds.length + i;
        return {
          id: `bed-${roomId}-${Date.now()}-${i}`,
          propertyId: existing.propertyId,
          roomId,
          bedCode: `${patch.roomNumber || existing.roomNumber}-${letters[idx] || idx + 1}`,
          status: 'Available',
        };
      });
      setBeds((prev) => [...prev, ...extra]);
    }
    return { ok: true, message: 'Room configuration updated.' };
  };

  const deleteOrDeactivateRoom = (roomId: string): { ok: boolean; message: string } => {
    const roomBeds = beds.filter((b) => b.roomId === roomId);
    if (roomBeds.some((b) => b.status === 'Occupied')) {
      return { ok: false, message: 'Cannot delete or deactivate a room with occupied beds.' };
    }
    const hasStayHistory = stays.some((s) => s.roomId === roomId);
    if (hasStayHistory) {
      setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, available: !r.available } : r)));
      return { ok: true, message: 'Room availability toggled (stay history preserved).' };
    }
    setBeds((prev) => prev.filter((b) => b.roomId !== roomId));
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
    return { ok: true, message: 'Empty room removed.' };
  };

  const addBedToRoom = (roomId: string) => {
    const rm = rooms.find((r) => r.id === roomId);
    if (!rm) return;
    const roomBeds = beds.filter((b) => b.roomId === roomId);
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const idx = roomBeds.length;
    setBeds((prev) => [
      ...prev,
      {
        id: `bed-${roomId}-${Date.now()}`,
        propertyId: rm.propertyId,
        roomId,
        bedCode: `${rm.roomNumber}-${letters[idx] || idx + 1}`,
        status: 'Available',
      },
    ]);
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, capacity: r.capacity + 1 } : r)));
  };

  const updateBedStatus = (bedId: string, status: BedStatus): { ok: boolean; message: string } => {
    const bed = beds.find((b) => b.id === bedId);
    if (!bed) return { ok: false, message: 'Bed not found.' };
    if (bed.status === 'Occupied' && status !== 'Occupied') {
      return { ok: false, message: 'Use Transfer Tenant or Checkout before releasing an occupied bed.' };
    }
    setBeds((prev) => prev.map((b) => (b.id === bedId ? { ...b, status } : b)));
    return { ok: true, message: `Bed ${bed.bedCode} updated to ${status}.` };
  };

  const submitJoiningRequest = (req: {
    propertyId: string;
    preferredSharing: SharingOption;
    moveInDate: string;
    source: 'EXPLORE' | 'QR' | 'OWNER_INVITE';
    notes?: string;
  }): { ok: boolean; message: string } => {
    if (!currentUser) return { ok: false, message: 'Please log in as a tenant first.' };
    const prop = properties.find((p) => p.id === req.propertyId);
    if (!prop || prop.approvalStatus !== 'APPROVED' || prop.locationVerificationStatus !== 'VERIFIED') {
      return { ok: false, message: 'This property is not currently eligible for tenant onboarding.' };
    }
    const existing = joiningRequests.find(
      (jr) =>
        jr.propertyId === req.propertyId &&
        jr.tenantId === currentUser.id &&
        jr.status !== 'Rejected' &&
        jr.status !== 'Cancelled'
    );
    if (existing) {
      return { ok: false, message: 'You already have an active joining request for this property.' };
    }
    const created: JoiningRequest = {
      id: `jr-${Date.now()}`,
      propertyId: req.propertyId,
      tenantId: currentUser.id,
      tenantName: currentUser.name,
      tenantMobile: currentUser.mobile,
      tenantEmail: currentUser.email,
      preferredSharing: req.preferredSharing,
      moveInDate: req.moveInDate,
      source: req.source,
      status: 'New',
      notes: req.notes,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setJoiningRequests((prev) => [created, ...prev]);
    pushNotification(
      'PG_OWNER',
      `New ${req.source} joining request`,
      `${currentUser.name} requested ${req.preferredSharing} sharing at ${prop.name}.`,
      '/owner/tenants?tab=requests'
    );
    return { ok: true, message: 'Joining request submitted to the PG owner.' };
  };

  const approveJoiningRequest = (requestId: string) => {
    setJoiningRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Awaiting Bed Assignment' } : r))
    );
  };

  const assignBedAndActivateStay = (
    requestId: string,
    roomId: string,
    bedId: string,
    agreedRent: number,
    agreedDeposit: number
  ): { ok: boolean; message: string } => {
    const req = joiningRequests.find((r) => r.id === requestId);
    const room = rooms.find((r) => r.id === roomId);
    const bed = beds.find((b) => b.id === bedId);
    if (!req || !room || !bed) return { ok: false, message: 'Invalid request, room, or bed selection.' };
    if (bed.status !== 'Available') return { ok: false, message: 'Selected bed is no longer available.' };

    const activeStayExists = stays.some((s) => s.tenantId === req.tenantId && s.status === 'Active');
    if (activeStayExists) {
      return { ok: false, message: 'Tenant already has an active PG stay elsewhere.' };
    }

    setBeds((prev) =>
      prev.map((b) => (b.id === bedId ? { ...b, status: 'Occupied', tenantId: req.tenantId } : b))
    );
    setJoiningRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'Active Stay',
              assignedRoomId: roomId,
              assignedBedId: bedId,
              agreedRent,
              agreedDeposit,
            }
          : r
      )
    );
    const stayId = `stay-${Date.now()}`;
    const newStay: TenantStay = {
      id: stayId,
      tenantId: req.tenantId,
      tenantName: req.tenantName,
      tenantMobile: req.tenantMobile,
      tenantEmail: req.tenantEmail,
      propertyId: req.propertyId,
      floorId: room.floorId,
      roomId,
      bedId,
      joiningDate: req.moveInDate,
      monthlyRent: agreedRent,
      rentDueDay: 5,
      securityDeposit: agreedDeposit,
      depositPaid: 0,
      depositDeductions: 0,
      depositRefunded: 0,
      depositStatus: 'Pending',
      status: 'Active',
      documentStatus: 'Verified',
      agreementAccepted: true,
    };
    setStays((prev) => [newStay, ...prev]);
    setRentInvoices((prev) => [
      {
        id: `inv-${Date.now()}`,
        stayId,
        tenantId: req.tenantId,
        tenantName: req.tenantName,
        propertyId: req.propertyId,
        monthLabel: 'December 2026',
        dueDate: '2026-12-05',
        rentAmount: agreedRent,
        additionalCharges: 0,
        paidAmount: 0,
        status: 'Upcoming',
      },
      ...prev,
    ]);
    pushNotification(
      'TENANT',
      'Stay activated!',
      `Bed ${bed.bedCode} (Room ${room.roomNumber}) assigned for ${req.tenantName}.`,
      '/tenant/my-pg'
    );
    return { ok: true, message: `Assigned bed ${bed.bedCode} and activated stay.` };
  };

  const rejectJoiningRequest = (requestId: string) => {
    setJoiningRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: 'Rejected' } : r)));
  };

  const cancelJoiningRequest = (requestId: string) => {
    setJoiningRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: 'Cancelled' } : r)));
  };

  const updateTenantStayPermitted = (stayId: string, patch: Partial<TenantStay>) => {
    setStays((prev) => prev.map((s) => (s.id === stayId ? { ...s, ...patch } : s)));
  };

  const archiveTenantStay = (stayId: string): { ok: boolean; message: string } => {
    const stay = stays.find((s) => s.id === stayId);
    if (!stay) return { ok: false, message: 'Stay not found.' };
    if (stay.status === 'Active') {
      return { ok: false, message: 'Active stays cannot be archived. Complete Checkout first.' };
    }
    setStays((prev) => prev.map((s) => (s.id === stayId ? { ...s, status: 'Archived' } : s)));
    return { ok: true, message: 'Completed stay archived with financial history intact.' };
  };

  const transferTenantBed = (params: {
    stayId: string;
    toPropertyId: string;
    toRoomId: string;
    toBedId: string;
    transferDate: string;
    reason: TenantTransferRecord['reason'];
    newRent?: number;
    notes?: string;
  }): { ok: boolean; message: string } => {
    const stay = stays.find((s) => s.id === params.stayId);
    const destProp = properties.find((p) => p.id === params.toPropertyId);
    const newRoom = rooms.find((r) => r.id === params.toRoomId);
    const newBed = beds.find((b) => b.id === params.toBedId);
    if (!stay || !destProp || !newRoom || !newBed) {
      return { ok: false, message: 'Select a valid destination PG, floor, room, and bed.' };
    }
    if (destProp.approvalStatus !== 'APPROVED' || destProp.locationVerificationStatus !== 'VERIFIED') {
      return { ok: false, message: 'Destination PG is not verified/eligible.' };
    }
    if (newBed.status !== 'Available') {
      return { ok: false, message: 'Destination bed is not available.' };
    }

    const updatedRent = params.newRent !== undefined ? params.newRent : stay.monthlyRent;
    setBeds((prev) =>
      prev.map((b) => {
        if (b.id === stay.bedId) return { ...b, status: 'Available', tenantId: undefined };
        if (b.id === params.toBedId) return { ...b, status: 'Occupied', tenantId: stay.tenantId };
        return b;
      })
    );
    setStays((prev) =>
      prev.map((s) =>
        s.id === stay.id
          ? {
              ...s,
              propertyId: params.toPropertyId,
              floorId: newRoom.floorId,
              roomId: params.toRoomId,
              bedId: params.toBedId,
              monthlyRent: updatedRent,
            }
          : s
      )
    );
    setTransfers((prev) => [
      {
        id: `trf-${Date.now()}`,
        stayId: stay.id,
        tenantId: stay.tenantId,
        tenantName: stay.tenantName,
        fromPropertyId: stay.propertyId,
        fromRoomId: stay.roomId,
        fromBedId: stay.bedId,
        toPropertyId: params.toPropertyId,
        toRoomId: params.toRoomId,
        toBedId: params.toBedId,
        transferDate: params.transferDate,
        reason: params.reason,
        previousRent: stay.monthlyRent,
        newRent: updatedRent,
        notes: params.notes,
      },
      ...prev,
    ]);
    pushNotification(
      'TENANT',
      'Room transfer completed',
      `Your accommodation moved to ${destProp.name}, Room ${newRoom.roomNumber} (${newBed.bedCode}).`,
      '/tenant/my-pg'
    );
    return { ok: true, message: `Transferred ${stay.tenantName} to Room ${newRoom.roomNumber} (${newBed.bedCode}).` };
  };

  const recordRentPayment = (
    invoiceId: string,
    amount: number,
    method: RentPayment['method'],
    reference: string,
    notes?: string
  ): { ok: boolean; message: string } => {
    const inv = rentInvoices.find((i) => i.id === invoiceId);
    if (!inv || amount <= 0) return { ok: false, message: 'Enter a valid positive payment amount.' };
    if (
      reference.trim() &&
      rentPayments.some((p) => !p.reversed && p.reference.toLowerCase() === reference.trim().toLowerCase())
    ) {
      return { ok: false, message: 'Duplicate transaction reference detected.' };
    }

    const totalDue = inv.rentAmount + inv.additionalCharges;
    const nextPaid = Math.min(totalDue, inv.paidAmount + amount);
    const nextStatus: RentInvoice['status'] = nextPaid >= totalDue ? 'Paid' : 'Partially Paid';

    setRentInvoices((prev) =>
      prev.map((i) => (i.id === invoiceId ? { ...i, paidAmount: nextPaid, status: nextStatus } : i))
    );

    const paymentId = `pay-${Date.now()}`;
    const payment: RentPayment = {
      id: paymentId,
      invoiceId,
      tenantId: inv.tenantId,
      propertyId: inv.propertyId,
      amount,
      method,
      reference: reference.trim() || `MAN-${Math.floor(100000 + Math.random() * 900000)}`,
      paidAt: new Date().toISOString().slice(0, 10),
      recordedBy: currentUser?.name || 'PG Owner',
      notes,
      importedToPersonalTracker: autoImportConfirmedRent,
    };
    setRentPayments((prev) => [payment, ...prev]);

    if (autoImportConfirmedRent && !tenantExpenses.some((e) => e.sourceRentPaymentId === paymentId)) {
      setTenantExpenses((prev) => [
        {
          id: `texp-rent-${Date.now()}`,
          tenantId: inv.tenantId,
          title: `PG Rent — ${inv.monthLabel}`,
          amountPaise: Math.round(amount * 100),
          category: 'PG Rent',
          date: payment.paidAt,
          paymentMethod: method === 'Card' ? 'Debit Card' : method,
          notes: `Imported from confirmed receipt ${payment.reference}`,
          isConfirmed: true,
          sourceRentPaymentId: paymentId,
        },
        ...prev,
      ]);
    }
    return { ok: true, message: `Recorded ₹${amount.toLocaleString('en-IN')} payment.` };
  };

  const reverseRentPayment = (paymentId: string, reason: string) => {
    const pmt = rentPayments.find((p) => p.id === paymentId);
    if (!pmt || pmt.reversed) return;
    setRentPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, reversed: true, reversalReason: reason } : p))
    );
    setRentInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== pmt.invoiceId) return inv;
        const nextPaid = Math.max(0, inv.paidAmount - pmt.amount);
        const total = inv.rentAmount + inv.additionalCharges;
        const nextStatus: RentInvoice['status'] =
          nextPaid === 0 ? 'Due' : nextPaid >= total ? 'Paid' : 'Partially Paid';
        return { ...inv, paidAmount: nextPaid, status: nextStatus };
      })
    );
    pushAudit('REVERSE_RENT_PAYMENT', 'RentPayment', paymentId, `Reversed payment ${pmt.reference}: ${reason}`);
  };

  const sendRentReminder = (invoiceId: string) => {
    const inv = rentInvoices.find((i) => i.id === invoiceId);
    if (!inv) return;
    setRentInvoices((prev) =>
      prev.map((i) => (i.id === invoiceId ? { ...i, lastReminderAt: new Date().toISOString().slice(0, 10) } : i))
    );
    pushNotification(
      'TENANT',
      'Rent payment reminder',
      `Reminder for ${inv.monthLabel} rent due (${inv.dueDate}).`,
      '/tenant/my-pg?tab=rent'
    );
  };

  const generateMonthlyInvoices = (propertyId: string, monthLabel: string, dueDate: string): number => {
    const activeStays = stays.filter(
      (s) => s.status === 'Active' && (propertyId === 'ALL' || s.propertyId === propertyId)
    );
    let createdCount = 0;
    const newInvoices: RentInvoice[] = [];
    for (const s of activeStays) {
      const exists = rentInvoices.some((inv) => inv.stayId === s.id && inv.monthLabel === monthLabel);
      if (!exists) {
        createdCount++;
        newInvoices.push({
          id: `inv-${Date.now()}-${createdCount}`,
          stayId: s.id,
          tenantId: s.tenantId,
          tenantName: s.tenantName,
          propertyId: s.propertyId,
          monthLabel,
          dueDate,
          rentAmount: s.monthlyRent,
          additionalCharges: 0,
          paidAmount: 0,
          status: 'Due',
        });
      }
    }
    if (newInvoices.length > 0) {
      setRentInvoices((prev) => [...newInvoices, ...prev]);
    }
    return createdCount;
  };

  const recordDepositTransaction = (tx: Omit<DepositTransaction, 'id'>) => {
    const entry: DepositTransaction = { ...tx, id: `dep-${Date.now()}` };
    setDepositTransactions((prev) => [entry, ...prev]);
    setStays((prev) =>
      prev.map((s) => {
        if (s.id !== tx.stayId) return s;
        let depositPaid = s.depositPaid;
        let depositDeductions = s.depositDeductions || 0;
        let depositRefunded = s.depositRefunded || 0;
        if (tx.type === 'Payment') depositPaid += tx.amount;
        if (tx.type === 'Deduction') depositDeductions += tx.amount;
        if (tx.type === 'Refund') depositRefunded += tx.amount;
        const refundable = Math.max(0, depositPaid - depositDeductions);
        const depositStatus: TenantStay['depositStatus'] =
          depositRefunded >= refundable && refundable > 0
            ? 'Refunded'
            : depositRefunded > 0
            ? 'Partially Refunded'
            : depositPaid >= s.securityDeposit
            ? 'Received'
            : depositPaid > 0
            ? 'Partially Received'
            : 'Pending';
        return { ...s, depositPaid, depositDeductions, depositRefunded, depositStatus };
      })
    );
  };

  const addOwnerExpense = (exp: Omit<OwnerExpense, 'id'>) => {
    setOwnerExpenses((prev) => [{ ...exp, id: `oexp-${Date.now()}` }, ...prev]);
  };

  const updateOwnerExpense = (id: string, patch: Partial<OwnerExpense>) => {
    setOwnerExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const reverseOwnerExpense = (id: string, reason: string) => {
    setOwnerExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, reversed: true, reversalReason: reason } : e))
    );
    pushAudit('REVERSE_OWNER_EXPENSE', 'OwnerExpense', id, `Reversed expense: ${reason}`);
  };

  const addMaintenanceRequest = (req: Omit<MaintenanceRequest, 'id'>) => {
    const id = `mnt-${Date.now()}`;
    setMaintenanceRequests((prev) => [{ ...req, id }, ...prev]);
    if (req.inventoryMarkedUnavailable && req.bedId) {
      setBeds((prev) =>
        prev.map((b) =>
          b.id === req.bedId && b.status === 'Available' ? { ...b, status: 'Under Maintenance' } : b
        )
      );
    }
  };

  const updateMaintenanceRequest = (
    id: string,
    patch: Partial<MaintenanceRequest>,
    restoreBed?: boolean
  ) => {
    const current = maintenanceRequests.find((m) => m.id === id);
    setMaintenanceRequests((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    if (restoreBed && current?.bedId) {
      setBeds((prev) =>
        prev.map((b) =>
          b.id === current.bedId && b.status === 'Under Maintenance' ? { ...b, status: 'Available' } : b
        )
      );
    }
  };

  const addScheduledMaintenance = (item: Omit<ScheduledMaintenance, 'id'>) => {
    setScheduledMaintenance((prev) => [{ ...item, id: `smnt-${Date.now()}` }, ...prev]);
  };

  const updateScheduledMaintenance = (id: string, patch: Partial<ScheduledMaintenance>) => {
    setScheduledMaintenance((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const addPropertyRule = (rule: Omit<PropertyRule, 'id' | 'version'>) => {
    setPropertyRules((prev) => [{ ...rule, id: `rule-${Date.now()}`, version: 1 }, ...prev]);
    if (rule.status === 'Published') {
      pushNotification('TENANT', 'PG rule published', `${rule.title} (${rule.category})`, '/tenant/my-pg');
    }
  };

  const updatePropertyRule = (id: string, patch: Partial<PropertyRule>) => {
    setPropertyRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch, version: r.version + 1 } : r))
    );
  };

  const replyToReview = (reviewId: string, reply: string) => {
    setPropertyReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, ownerReply: reply, ownerReplyAt: new Date().toISOString().slice(0, 10) }
          : r
      )
    );
  };

  const reportReviewToAdmin = (reviewId: string, reason: string) => {
    setPropertyReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, reportedStatus: 'Reported', reportReason: reason } : r))
    );
    pushNotification('SUPER_ADMIN', 'Review reported for moderation', reason, '/admin/more?section=support');
  };

  const submitLocationSharingRequest = (req: {
    propertyId: string;
    tenantId: string;
    category: LocationSharingRequest['category'];
    reason: string;
    explanation: string;
    durationHours: number;
  }) => {
    const stay = stays.find((s) => s.propertyId === req.propertyId && s.tenantId === req.tenantId);
    const created: LocationSharingRequest = {
      id: `locreq-${Date.now()}`,
      propertyId: req.propertyId,
      ownerId: currentUser?.id || 'usr-owner-1',
      ownerName: currentUser?.name || 'Vikram Reddy',
      tenantId: req.tenantId,
      tenantName: stay?.tenantName || 'Tenant',
      category: req.category,
      reason: req.reason,
      explanation: req.explanation,
      requestedAt: new Date().toLocaleString('en-IN'),
      requestedDurationHours: req.durationHours,
      status: 'Submitted',
    };
    setLocationRequests((prev) => [created, ...prev]);
    pushNotification(
      'SUPER_ADMIN',
      'Location sharing request for review',
      `${created.ownerName} submitted a consent request for ${created.tenantName}.`,
      '/admin/more?section=support'
    );
  };

  const adminReviewLocationRequest = (
    reqId: string,
    decision: 'Awaiting Tenant Permission' | 'Rejected',
    note?: string
  ) => {
    const req = locationRequests.find((r) => r.id === reqId);
    setLocationRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: decision, adminNote: note } : r))
    );
    pushAudit(
      decision === 'Awaiting Tenant Permission' ? 'FORWARD_CONSENT_PROMPT' : 'REJECT_LOCATION_SHARE_REQ',
      'LocationSharingRequest',
      reqId,
      `${decision} for ${req?.ownerName || 'Owner'} → ${req?.tenantName || 'Tenant'}${note ? `: ${note}` : ''}`,
      { category: 'Location Sharing Requests', beforeValue: req?.status, afterValue: decision, reason: note }
    );
    if (decision === 'Awaiting Tenant Permission') {
      pushNotification(
        'TENANT',
        'Location sharing consent request',
        'Your PG owner requested a one-time voluntary location share (reviewed by Admin). You may accept or decline.',
        '/tenant/profile'
      );
    }
  };

  const tenantRespondLocationRequest = (
    reqId: string,
    decision: 'Voluntarily Shared' | 'Declined by Tenant' | 'Revoked'
  ) => {
    setLocationRequests((prev) =>
      prev.map((r) => {
        if (r.id !== reqId) return r;
        if (decision === 'Voluntarily Shared') {
          const now = new Date();
          const exp = new Date(now.getTime() + r.requestedDurationHours * 3600 * 1000);
          return {
            ...r,
            status: decision,
            sharedSnapshot: {
              latitude: 12.9364,
              longitude: 77.6251,
              accuracy: 14,
              sharedAt: now.toLocaleString('en-IN'),
              expiresAt: exp.toLocaleString('en-IN'),
            },
          };
        }
        return { ...r, status: decision, sharedSnapshot: undefined };
      })
    );
  };

  const cancelLocationRequest = (reqId: string) => {
    setLocationRequests((prev) => prev.filter((r) => r.id !== reqId));
  };

  const addTenantExpense = (exp: Omit<TenantExpense, 'id' | 'tenantId'>) => {
    setTenantExpenses((prev) => [
      { ...exp, id: `texp-${Date.now()}`, tenantId: currentUser?.id || 'usr-tenant-1' },
      ...prev,
    ]);
  };

  const updateTenantExpense = (id: string, patch: Partial<TenantExpense>) => {
    setTenantExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const deleteTenantExpense = (id: string) => {
    setTenantExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const confirmRecurringExpense = (id: string) => {
    setTenantExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isConfirmed: true, date: new Date().toISOString().slice(0, 10) } : e))
    );
  };

  const addTenantCustomCategory = (name: string) => {
    const clean = name.trim();
    if (clean && !tenantCategories.includes(clean)) {
      setTenantCategories((prev) => [...prev, clean]);
    }
  };

  const updateTenantBudget = (budget: TenantBudget) => {
    setTenantBudget(budget);
  };

  const addSharedExpense = (exp: Omit<SharedExpense, 'id'>) => {
    setSharedExpenses((prev) => [{ ...exp, id: `sh-${Date.now()}` }, ...prev]);
  };

  const settleSharedParticipant = (expenseId: string, participantName: string) => {
    setSharedExpenses((prev) =>
      prev.map((se) =>
        se.id === expenseId
          ? {
              ...se,
              participants: se.participants.map((p) =>
                p.name === participantName ? { ...p, settled: true, paidPaise: p.sharePaise } : p
              ),
            }
          : se
      )
    );
  };

  const updateFoodMenuDay = (day: string, patch: Partial<FoodMenuDay>) => {
    setFoodMenu((prev) => prev.map((d) => (d.day === day ? { ...d, ...patch } : d)));
  };

  const createComplaint = (cmp: Omit<ComplaintItem, 'id' | 'createdAt' | 'status'>) => {
    setComplaints((prev) => [
      { ...cmp, id: `cmp-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10), status: 'Open' },
      ...prev,
    ]);
    pushNotification('PG_OWNER', 'New complaint raised', `${cmp.tenantName}: ${cmp.title}`, '/owner/more');
  };

  const updateComplaintStatus = (
    id: string,
    status: ComplaintItem['status'],
    assignedStaff?: string,
    ownerResponse?: string
  ) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status,
              assignedStaff: assignedStaff ?? c.assignedStaff,
              ownerResponse: ownerResponse ?? c.ownerResponse,
            }
          : c
      )
    );
  };

  const createNotice = (notice: Omit<NoticeItem, 'id' | 'publishedAt' | 'readByTenantIds'>) => {
    setNotices((prev) => [
      {
        ...notice,
        id: `not-${Date.now()}`,
        publishedAt: new Date().toISOString().slice(0, 10),
        readByTenantIds: [],
      },
      ...prev,
    ]);
    pushNotification('TENANT', 'New PG notice', notice.title, '/tenant/my-pg');
  };

  const markNoticeRead = (noticeId: string, tenantId: string) => {
    setNotices((prev) =>
      prev.map((n) =>
        n.id === noticeId && !n.readByTenantIds.includes(tenantId)
          ? { ...n, readByTenantIds: [...n.readByTenantIds, tenantId] }
          : n
      )
    );
  };

  const addParcel = (parcel: Omit<ParcelItem, 'id' | 'receivedAt'>) => {
    setParcels((prev) => [
      { ...parcel, id: `prc-${Date.now()}`, receivedAt: new Date().toLocaleString('en-IN') },
      ...prev,
    ]);
    pushNotification('TENANT', 'Parcel received', `${parcel.description} is ready at reception.`, '/tenant/my-pg');
  };

  const updateParcelStatus = (parcelId: string, status: ParcelItem['status']) => {
    setParcels((prev) => prev.map((p) => (p.id === parcelId ? { ...p, status } : p)));
  };

  const requestCheckout = (stayId: string, requestedDate: string) => {
    const stay = stays.find((s) => s.id === stayId);
    const room = rooms.find((r) => r.id === stay?.roomId);
    const bed = beds.find((b) => b.id === stay?.bedId);
    if (!stay || !room || !bed) return;
    const pendingRent = rentInvoices
      .filter((i) => i.stayId === stayId)
      .reduce((sum, i) => sum + Math.max(0, i.rentAmount + i.additionalCharges - i.paidAmount), 0);
    setStays((prev) => prev.map((s) => (s.id === stayId ? { ...s, status: 'Checkout Requested' } : s)));
    setCheckouts((prev) => [
      {
        id: `chk-${Date.now()}`,
        stayId,
        tenantId: stay.tenantId,
        tenantName: stay.tenantName,
        propertyId: stay.propertyId,
        roomNumber: room.roomNumber,
        bedCode: bed.bedCode,
        requestedDate,
        pendingRent,
        depositHeld: stay.depositPaid,
        proposedDeductions: 0,
        status: 'Pending Review',
      },
      ...prev,
    ]);
    pushNotification('PG_OWNER', 'Checkout requested', `${stay.tenantName} requested checkout for ${requestedDate}.`, '/owner/tenants?tab=checkouts');
  };

  const completeCheckout = (checkoutId: string, deductions: number, reason: string) => {
    const chk = checkouts.find((c) => c.id === checkoutId);
    if (!chk) return;
    setCheckouts((prev) =>
      prev.map((c) =>
        c.id === checkoutId ? { ...c, proposedDeductions: deductions, deductionReason: reason, status: 'Completed' } : c
      )
    );
    const stay = stays.find((s) => s.id === chk.stayId);
    setStays((prev) =>
      prev.map((s) =>
        s.id === chk.stayId
          ? {
              ...s,
              status: 'Completed',
              depositDeductions: deductions,
              depositRefunded: Math.max(0, s.depositPaid - deductions),
              depositStatus: 'Refunded',
            }
          : s
      )
    );
    if (stay) {
      setBeds((prev) =>
        prev.map((b) => (b.id === stay.bedId ? { ...b, status: 'Available', tenantId: undefined } : b))
      );
    }
  };

  const addStaffMember = (member: Omit<StaffMember, 'id'>) => {
    setStaff((prev) => [{ ...member, id: `stf-${Date.now()}` }, ...prev]);
  };

  const createEvent = (evt: Omit<StartupEvent, 'id' | 'registeredCount'>) => {
    setEvents((prev) => [{ ...evt, id: `evt-${Date.now()}`, registeredCount: 0 }, ...prev]);
    if (evt.status === 'Published') {
      pushNotification('ALL', 'New startup event published', `${evt.title} in ${evt.city}`, '/tenant/events');
    }
  };

  const toggleEventStatus = (eventId: string, status: StartupEvent['status']) => {
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, status } : e)));
  };

  const toggleEventBookmark = (eventId: string) => {
    setSavedEventIds((prev) => (prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]));
  };

  const toggleEventRsvp = (eventId: string) => {
    const evt = events.find((e) => e.id === eventId);
    if (!evt) return;
    if (rsvpedEventIds.includes(eventId)) {
      setRsvpedEventIds((prev) => prev.filter((id) => id !== eventId));
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, registeredCount: Math.max(0, e.registeredCount - 1) } : e))
      );
      return;
    }
    if (evt.registeredCount >= evt.capacity) {
      setWaitlistedEventIds((prev) => (prev.includes(eventId) ? prev.filter((i) => i !== eventId) : [...prev, eventId]));
      return;
    }
    setRsvpedEventIds((prev) => [...prev, eventId]);
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e)));
  };

  const createSupportTicket = (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status' | 'lastReply'>) => {
    const nowDate = new Date().toISOString().slice(0, 10);
    const id = `tkt-${Date.now()}`;
    const code = `SUP-2026-${Math.floor(1100 + Math.random() * 8800)}`;
    setSupportTickets((prev) => [
      {
        ...ticket,
        id,
        ticketCode: code,
        userEmail: ticket.userEmail || currentUser?.email,
        userMobile: ticket.userMobile || currentUser?.mobile,
        createdAt: nowDate,
        updatedAt: nowDate,
        status: 'Open',
        lastReply: 'Awaiting support agent assignment.',
        messages: [
          {
            id: `msg-${Date.now()}`,
            senderName: ticket.userName,
            senderRole: ticket.userRole,
            body: ticket.description || ticket.subject,
            createdAt: new Date().toLocaleString('en-IN'),
          },
        ],
        internalNotes: [],
      },
      ...prev,
    ]);
    pushNotification('SUPER_ADMIN', `New support ticket ${code}`, `${ticket.userName}: ${ticket.subject}`, '/admin/support');
  };

  const updateTicketStatus = (ticketId: string, status: SupportTicket['status'], reply?: string) => {
    setSupportTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status, lastReply: reply || t.lastReply } : t))
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <PGFinderContext.Provider
      value={{
        users,
        currentUser,
        selectedCity,
        setSelectedCity,
        ownerSelectedPropertyId,
        setOwnerSelectedPropertyId,
        tenantPreviewSearching,
        setTenantPreviewSearching,
        switchDemoRole,
        loginUser,
        registerUser,
        updateCurrentUserProfile,
        logout,
        properties,
        floors,
        rooms,
        beds,
        stays,
        transfers,
        joiningRequests,
        rentInvoices,
        rentPayments,
        depositTransactions,
        ownerExpenses,
        maintenanceRequests,
        scheduledMaintenance,
        propertyRules,
        propertyReviews,
        locationRequests,
        tenantExpenses,
        tenantCategories,
        tenantBudget,
        autoImportConfirmedRent,
        setAutoImportConfirmedRent,
        sharedExpenses,
        foodMenu,
        complaints,
        notices,
        parcels,
        checkouts,
        staff,
        events,
        localBusinesses,
        supportTickets,
        auditLogs,
        notifications,
        savedPropertyIds,
        recentlyViewedIds,
        savedEventIds,
        rsvpedEventIds,
        waitlistedEventIds,
        toggleSaveProperty,
        markPropertyViewed,
        submitNewProperty,
        updatePropertyDetails,
        archiveOrDeleteProperty,
        updatePropertyListingStatus,
        togglePropertyQr,
        regeneratePropertyQr,
        adminReviewProperty,
        adminSuspendProperty,
        adminRestoreProperty,
        adminVerifyLocation,
        adminVerifyDocument,
        toggleUserStatus,
        adminUpdateUser,
        adminSuspendUser,
        adminRestoreUser,
        adminArchiveUser,
        unifiedDocuments,
        logDocumentAccess,
        adminReviewUnifiedDocument,
        archiveOrDeleteUnifiedDocument,
        planFeatures,
        addPlanFeature,
        updatePlanFeature,
        togglePlanFeatureStatus,
        subscriptionPlans,
        addSubscriptionPlan,
        updateSubscriptionPlan,
        duplicateSubscriptionPlan,
        deleteOrArchiveSubscriptionPlan,
        ownerSubscriptions,
        platformPayments,
        manageOwnerSubscription,
        featuredCampaigns,
        saveFeaturedCampaign,
        updateFeaturedCampaignStatus,
        deleteFeaturedCampaign,
        advertisers,
        localAdCampaigns,
        saveAdvertiser,
        updateAdvertiserStatus,
        saveLocalAdCampaign,
        updateLocalAdStatus,
        deleteLocalAdCampaign,
        adminNotifications,
        saveAdminNotification,
        updateAdminNotificationStatus,
        duplicateAdminNotification,
        adminReplySupportTicket,
        adminAddSupportInternalNote,
        adminUpdateSupportTicketMeta,
        moderateReviewStatus,
        addFloor,
        editFloor,
        deleteOrDeactivateFloor,
        addRoom,
        editRoom,
        deleteOrDeactivateRoom,
        addBedToRoom,
        updateBedStatus,
        submitJoiningRequest,
        approveJoiningRequest,
        assignBedAndActivateStay,
        rejectJoiningRequest,
        cancelJoiningRequest,
        updateTenantStayPermitted,
        archiveTenantStay,
        transferTenantBed,
        recordRentPayment,
        reverseRentPayment,
        sendRentReminder,
        generateMonthlyInvoices,
        recordDepositTransaction,
        addOwnerExpense,
        updateOwnerExpense,
        reverseOwnerExpense,
        addMaintenanceRequest,
        updateMaintenanceRequest,
        addScheduledMaintenance,
        updateScheduledMaintenance,
        addPropertyRule,
        updatePropertyRule,
        replyToReview,
        reportReviewToAdmin,
        submitLocationSharingRequest,
        adminReviewLocationRequest,
        tenantRespondLocationRequest,
        cancelLocationRequest,
        addTenantExpense,
        updateTenantExpense,
        deleteTenantExpense,
        confirmRecurringExpense,
        addTenantCustomCategory,
        updateTenantBudget,
        addSharedExpense,
        settleSharedParticipant,
        updateFoodMenuDay,
        createComplaint,
        updateComplaintStatus,
        createNotice,
        markNoticeRead,
        addParcel,
        updateParcelStatus,
        requestCheckout,
        completeCheckout,
        addStaffMember,
        createEvent,
        toggleEventStatus,
        toggleEventBookmark,
        toggleEventRsvp,
        createSupportTicket,
        updateTicketStatus,
        markNotificationRead,
      }}
    >
      {children}
    </PGFinderContext.Provider>
  );
};

export function usePGFinder(): PGFinderContextValue {
  const ctx = useContext(PGFinderContext);
  if (!ctx) throw new Error('usePGFinder must be used inside PGFinderProvider');
  return ctx;
}
