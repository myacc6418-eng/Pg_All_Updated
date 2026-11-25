import React, { createContext, useContext, useState } from 'react';
import {
  AppNotification,
  AuditLogEntry,
  Bed,
  BedStatus,
  CheckoutRequest,
  ComplaintItem,
  DepositTransaction,
  Floor,
  FoodMenuDay,
  JoiningRequest,
  LocalBusiness,
  LocationSharingRequest,
  MaintenanceRequest,
  NoticeItem,
  OwnerExpense,
  PGProperty,
  ParcelItem,
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
  SupportTicket,
  TenantBudget,
  TenantExpense,
  TenantStay,
  TenantTransferRecord,
  UserAccount,
  UserRole,
} from '../types/pgfinder';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_BEDS,
  INITIAL_CHECKOUTS,
  INITIAL_COMPLAINTS,
  INITIAL_DEPOSIT_TRANSACTIONS,
  INITIAL_EVENTS,
  INITIAL_FLOORS,
  INITIAL_FOOD_MENU,
  INITIAL_JOINING_REQUESTS,
  INITIAL_LOCAL_BUSINESSES,
  INITIAL_LOCATION_SHARING_REQUESTS,
  INITIAL_MAINTENANCE_REQUESTS,
  INITIAL_NOTICES,
  INITIAL_NOTIFICATIONS,
  INITIAL_OWNER_EXPENSES,
  INITIAL_OWNER_TRANSFERS,
  INITIAL_PARCELS,
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
  INITIAL_SUPPORT_TICKETS,
  INITIAL_TENANT_BUDGET,
  INITIAL_TENANT_EXPENSES,
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
  adminVerifyLocation: (
    propertyId: string,
    decision: 'UNDER_REVIEW' | 'VERIFIED' | 'CORRECTIONS_REQUIRED' | 'REJECTED',
    comment?: string
  ) => void;
  adminVerifyDocument: (
    propertyId: string,
    docId: string,
    status: 'Verified' | 'Rejected' | 'Replacement Required',
    note?: string
  ) => void;
  toggleUserStatus: (userId: string) => void;

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

  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>(['prop-2', 'prop-4']);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(['prop-1', 'prop-2']);
  const [savedEventIds, setSavedEventIds] = useState<string[]>(['evt-1']);
  const [rsvpedEventIds, setRsvpedEventIds] = useState<string[]>(['evt-1']);
  const [waitlistedEventIds, setWaitlistedEventIds] = useState<string[]>([]);

  const pushAudit = (action: string, entityType: string, entityId: string, summary: string) => {
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        actorName: currentUser?.name || 'System',
        actorRole: currentUser?.role || 'SUPER_ADMIN',
        action,
        entityType,
        entityId,
        summary,
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
    const updated = { ...currentUser, ...patch };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
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
        return {
          ...p,
          approvalStatus: decision,
          listingStatus: nextListing,
          qrEnabled: decision === 'APPROVED' && p.locationVerificationStatus === 'VERIFIED' ? true : p.qrEnabled,
          adminComment: comment || p.adminComment,
        };
      })
    );
    pushAudit(`PROPERTY_${decision}`, 'Property', propertyId, comment || `Property status updated to ${decision}.`);
    pushNotification(
      'PG_OWNER',
      `Property ${decision.replace(/_/g, ' ').toLowerCase()}`,
      comment || `Super Admin updated property approval status to ${decision.replace(/_/g, ' ')}.`,
      '/owner/properties'
    );
  };

  const adminVerifyLocation = (
    propertyId: string,
    decision: 'UNDER_REVIEW' | 'VERIFIED' | 'CORRECTIONS_REQUIRED' | 'REJECTED',
    comment?: string
  ) => {
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
        };
      })
    );
    pushAudit(`LOCATION_${decision}`, 'Property', propertyId, comment || `Location verification updated to ${decision}.`);
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
    pushAudit('DOCUMENT_REVIEW', 'PropertyDocument', docId, `Document marked ${status}.`);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u))
    );
    pushAudit('TOGGLE_USER_STATUS', 'User', userId, 'Updated account active/suspended status.');
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
    setLocationRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: decision, adminNote: note } : r))
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
    setSupportTickets((prev) => [
      {
        ...ticket,
        id: `tkt-${Date.now()}`,
        createdAt: new Date().toISOString().slice(0, 10),
        status: 'Open',
        lastReply: 'Awaiting support agent assignment.',
      },
      ...prev,
    ]);
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
        adminVerifyLocation,
        adminVerifyDocument,
        toggleUserStatus,
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
