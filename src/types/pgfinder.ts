export type UserRole = 'TENANT' | 'PG_OWNER' | 'SUPER_ADMIN';

export type ThemePreference = 'light' | 'dark' | 'system';

export type PropertyApprovalStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'UNDER_REVIEW'
  | 'CORRECTIONS_REQUIRED'
  | 'RESUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

export type LocationVerificationStatus =
  | 'NOT_SUBMITTED'
  | 'PENDING_VERIFICATION'
  | 'UNDER_REVIEW'
  | 'CORRECTIONS_REQUIRED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'REVERIFICATION_REQUIRED';

export type ListingStatus =
  | 'NOT_LISTED'
  | 'ELIGIBLE_FOR_LISTING'
  | 'PUBLISHED'
  | 'UNPUBLISHED'
  | 'SUSPENDED';

export type PropertyType = 'PG Accommodation' | 'Hostel' | 'Co-living Accommodation';
export type AccommodationCategory = "Men's PG" | "Women's PG" | 'Co-living PG';
export type TargetOccupants = 'Students' | 'Working Professionals' | 'Both';
export type SharingOption = 'Single' | 'Double' | 'Triple' | 'Four' | 'Five' | 'Six' | 'Custom';
export type BedStatus = 'Available' | 'Reserved' | 'Occupied' | 'Under Maintenance' | 'Inactive';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  mobile: string;
  alternateMobile?: string;
  businessName?: string;
  businessAddress?: string;
  role: UserRole;
  status: 'Active' | 'Suspended';
  city: string;
  registeredAt: string;
  avatarInitials: string;
  subscriptionPlan?: 'Basic' | 'Pro' | 'Business';
  languagePreference?: 'English' | 'Hindi' | 'Telugu' | 'Kannada' | 'Tamil';
}

export interface CapturedLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  capturedAt: string;
  ownerConfirmed: boolean;
}

export interface PropertyImage {
  id: string;
  url: string;
  category: 'Building front view' | 'Property entrance' | 'Reception or common area' | 'Additional overall view';
  isCover: boolean;
  caption?: string;
}

export interface PropertyDocument {
  id: string;
  name: string;
  type: 'Ownership authorization' | 'Lease or rental authorization' | 'Business registration' | 'Local licence';
  status: 'Pending' | 'Under Review' | 'Verified' | 'Rejected' | 'Replacement Required';
  uploadedAt: string;
  reviewNote?: string;
}

export interface PGProperty {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerMobile: string;
  ownerEmail: string;
  name: string;
  propertyType: PropertyType;
  category: AccommodationCategory;
  /** Preserved optionally for legacy records; no longer collected in Add Property wizard */
  targetOccupants?: TargetOccupants;
  foodAvailable: boolean;
  establishedYear: string;
  description: string;
  state: string;
  district: string;
  city: string;
  locality: string;
  address: string;
  pinCode: string;
  landmark: string;
  location?: CapturedLocation;
  amenities: string[];
  images: PropertyImage[];
  documents: PropertyDocument[];
  approvalStatus: PropertyApprovalStatus;
  locationVerificationStatus: LocationVerificationStatus;
  listingStatus: ListingStatus;
  listingEntitlementType?: 'NONE' | 'BASIC_299_PENDING' | 'SUBSCRIPTION' | 'LIFETIME_DEMO';
  isSponsored?: boolean;
  archived?: boolean;
  adminComment?: string;
  submittedAt?: string;
  qrEnabled: boolean;
  qrToken: string;
  houseRules: string[];
  noticePeriodDays: number;
  defaultRent: number;
  defaultDeposit: number;
  rating?: number;
  reviewCount: number;
}

export interface Floor {
  id: string;
  propertyId: string;
  name: string;
  floorNumber: number;
  description?: string;
  operational: boolean;
}

export interface Room {
  id: string;
  propertyId: string;
  floorId: string;
  roomNumber: string;
  roomName?: string;
  sharing: SharingOption;
  capacity: number;
  isAc: boolean;
  bathroomType: 'Attached' | 'Shared' | 'Common Floor';
  geyserAvailable: boolean;
  monthlyRent: number;
  securityDeposit: number;
  amenities: string[];
  imageUrl: string;
  bathroomImageUrl?: string;
  available: boolean;
}

export interface Bed {
  id: string;
  propertyId: string;
  roomId: string;
  bedCode: string;
  status: BedStatus;
  rentOverride?: number;
  tenantId?: string;
}

export type JoiningStatus =
  | 'New'
  | 'Under Review'
  | 'Approved'
  | 'Awaiting Bed Assignment'
  | 'Awaiting Documents'
  | 'Awaiting Agreement'
  | 'Accepted'
  | 'Rejected'
  | 'Cancelled'
  | 'Active Stay';

export interface JoiningRequest {
  id: string;
  propertyId: string;
  tenantId: string;
  tenantName: string;
  tenantMobile: string;
  tenantEmail: string;
  preferredSharing: SharingOption;
  moveInDate: string;
  source: 'EXPLORE' | 'QR' | 'OWNER_INVITE';
  status: JoiningStatus;
  assignedRoomId?: string;
  assignedBedId?: string;
  agreedRent?: number;
  agreedDeposit?: number;
  notes?: string;
  createdAt: string;
}

export interface TenantStay {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantMobile: string;
  tenantEmail: string;
  emergencyContact?: string;
  propertyId: string;
  floorId: string;
  roomId: string;
  bedId: string;
  joiningDate: string;
  monthlyRent: number;
  rentDueDay?: number;
  securityDeposit: number;
  depositPaid: number;
  depositDeductions?: number;
  depositRefunded?: number;
  depositStatus?: 'Pending' | 'Partially Received' | 'Received' | 'Refund Pending' | 'Partially Refunded' | 'Refunded' | 'Under Settlement';
  status: 'Active' | 'Checkout Requested' | 'Completed' | 'Archived';
  documentStatus: 'Pending' | 'Verified';
  agreementAccepted: boolean;
  ownerNotes?: string;
}

export interface TenantTransferRecord {
  id: string;
  stayId: string;
  tenantId: string;
  tenantName: string;
  fromPropertyId: string;
  fromRoomId: string;
  fromBedId: string;
  toPropertyId: string;
  toRoomId: string;
  toBedId: string;
  transferDate: string;
  reason: 'Tenant Request' | 'Room Upgrade' | 'Room Downgrade' | 'Maintenance' | 'Sharing Change' | 'Property Transfer' | 'Other';
  previousRent: number;
  newRent: number;
  notes?: string;
}

export type RentPaymentStatus = 'Upcoming' | 'Due' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled';

export interface RentInvoice {
  id: string;
  stayId: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  monthLabel: string;
  dueDate: string;
  rentAmount: number;
  additionalCharges: number;
  paidAmount: number;
  status: RentPaymentStatus;
  lastReminderAt?: string;
}

export interface RentPayment {
  id: string;
  invoiceId: string;
  tenantId: string;
  propertyId: string;
  amount: number;
  method: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Other';
  reference: string;
  paidAt: string;
  recordedBy: string;
  notes?: string;
  reversed?: boolean;
  reversalReason?: string;
  importedToPersonalTracker?: boolean;
}

export interface DepositTransaction {
  id: string;
  stayId: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  type: 'Payment' | 'Deduction' | 'Refund' | 'Adjustment';
  amount: number;
  date: string;
  method?: string;
  note: string;
}

export interface OwnerExpense {
  id: string;
  propertyId: string;
  title: string;
  category:
    | 'Electricity'
    | 'Water'
    | 'Food'
    | 'Groceries'
    | 'Staff Salaries'
    | 'Property Rent'
    | 'Internet'
    | 'Cleaning'
    | 'Maintenance'
    | 'Repairs'
    | 'Furniture'
    | 'Equipment'
    | 'Laundry'
    | 'Marketing'
    | 'Licences'
    | 'Other';
  amount: number;
  date: string;
  method: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Other';
  vendor: string;
  notes?: string;
  recurring: boolean;
  reversed?: boolean;
  reversalReason?: string;
}

export interface TenantExpense {
  id: string;
  tenantId: string;
  title: string;
  amountPaise: number;
  category: string;
  date: string;
  paymentMethod: 'Cash' | 'UPI' | 'Debit Card' | 'Credit Card' | 'Bank Transfer' | 'Other';
  notes?: string;
  isRecurring?: boolean;
  recurrenceCycle?: 'Daily' | 'Weekly' | 'Monthly';
  isConfirmed?: boolean;
  sourceRentPaymentId?: string;
  excludedFromAnalytics?: boolean;
}

export interface TenantBudget {
  monthlyLimitPaise: number;
  alertThresholdPct: number;
  categoryLimitsPaise: Record<string, number>;
}

export interface SharedExpenseParticipant {
  name: string;
  sharePaise: number;
  paidPaise: number;
  settled: boolean;
}

export interface SharedExpense {
  id: string;
  title: string;
  totalPaise: number;
  date: string;
  paidBy: string;
  splitMode: 'Equal' | 'Custom';
  participants: SharedExpenseParticipant[];
}

export interface FoodMenuDay {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

export interface ComplaintItem {
  id: string;
  propertyId: string;
  tenantId: string;
  tenantName: string;
  roomNumber: string;
  title: string;
  description: string;
  category: 'Electrical' | 'Plumbing' | 'Wi-Fi' | 'Cleaning' | 'Furniture' | 'Food' | 'Water' | 'Security' | 'Other';
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Acknowledged' | 'In Progress' | 'Resolved' | 'Closed' | 'Reopened';
  assignedStaff?: string;
  ownerResponse?: string;
  createdAt: string;
}

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  floorId?: string;
  roomId?: string;
  bedId?: string;
  commonArea?: string;
  title: string;
  category: string;
  description: string;
  reportedDate: string;
  reportedBy: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignedTo: string;
  expectedResolutionDate: string;
  estimatedCost: number;
  actualCost?: number;
  status:
    | 'Reported'
    | 'Under Review'
    | 'Assigned'
    | 'In Progress'
    | 'Waiting for Parts'
    | 'Scheduled'
    | 'Resolved'
    | 'Closed'
    | 'Reopened';
  notes?: string;
  inventoryMarkedUnavailable?: boolean;
}

export interface ScheduledMaintenance {
  id: string;
  propertyId: string;
  maintenanceType: string;
  scheduledDate: string;
  recurrence: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly' | 'Custom';
  assignedPerson: string;
  expectedCost: number;
  status: 'Scheduled' | 'Overdue' | 'Completed';
  notes?: string;
}

export interface PropertyRule {
  id: string;
  propertyId: string;
  title: string;
  category:
    | 'Entry and Exit Timings'
    | 'Visitor Policy'
    | 'Quiet Hours'
    | 'Food Timings'
    | 'Cleaning Policy'
    | 'Common Area Usage'
    | 'Laundry Policy'
    | 'Parking Policy'
    | 'Electricity Usage'
    | 'Internet Usage'
    | 'Room Maintenance'
    | 'Rent Payment Policy'
    | 'Deposit Policy'
    | 'Notice Period'
    | 'Checkout Policy'
    | 'Safety Rules'
    | 'Emergency Procedures'
    | 'Other';
  description: string;
  effectiveDate: string;
  status: 'Draft' | 'Published' | 'Archived';
  requiresAcknowledgement: boolean;
  version: number;
}

export interface PropertyReview {
  id: string;
  propertyId: string;
  tenantId: string;
  tenantDisplayName: string;
  date: string;
  overallRating: number;
  categoryRatings: {
    food?: number;
    hygiene?: number;
    cleanliness: number;
    roomQuality: number;
    bathroom: number;
    maintenance: number;
    service: number;
    safety: number;
    wifi: number;
    water: number;
    amenities: number;
    value: number;
    location: number;
  };
  message: string;
  ownerReply?: string;
  ownerReplyAt?: string;
  reportedStatus: 'None' | 'Reported' | 'Reviewed';
  reportReason?: string;
}

export interface LocationSharingRequest {
  id: string;
  propertyId: string;
  ownerId: string;
  ownerName: string;
  tenantId: string;
  tenantName: string;
  category: 'Safety Check' | 'Emergency Contact Unreachable' | 'Parcel / Key Handover Assistance';
  reason: string;
  explanation: string;
  requestedAt: string;
  requestedDurationHours: number;
  status:
    | 'Submitted'
    | 'Under Admin Review'
    | 'Additional Information Required'
    | 'Rejected'
    | 'Awaiting Tenant Permission'
    | 'Declined by Tenant'
    | 'Voluntarily Shared'
    | 'Expired'
    | 'Revoked';
  adminNote?: string;
  sharedSnapshot?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    sharedAt: string;
    expiresAt: string;
  };
}

export interface NoticeItem {
  id: string;
  propertyId: string;
  title: string;
  message: string;
  audience: 'All Tenants' | 'Specific Floor' | 'Specific Room';
  priority: 'Normal' | 'Important';
  publishedAt: string;
  readByTenantIds: string[];
}

export interface ParcelItem {
  id: string;
  propertyId: string;
  tenantId: string;
  tenantName: string;
  description: string;
  receivedAt: string;
  instructions: string;
  status: 'Received' | 'Ready for Collection' | 'Collected';
}

export interface CheckoutRequest {
  id: string;
  stayId: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  roomNumber: string;
  bedCode: string;
  requestedDate: string;
  pendingRent: number;
  depositHeld: number;
  proposedDeductions: number;
  deductionReason?: string;
  status: 'Pending Review' | 'Inspection Done' | 'Settlement Ready' | 'Completed';
}

export interface StaffMember {
  id: string;
  ownerId: string;
  propertyId: string;
  name: string;
  mobile: string;
  role: 'Property Manager' | 'Receptionist' | 'Cook' | 'Housekeeping' | 'Security' | 'Maintenance Staff';
  salary: number;
  attendancePct: number;
  activeTasks: number;
  status: 'Active' | 'On Leave';
}

export interface StartupEvent {
  id: string;
  title: string;
  category:
    | 'Startup Networking'
    | 'Entrepreneurship'
    | 'Technology'
    | 'AI and Innovation'
    | 'Founder Meetups'
    | 'Investor Events'
    | 'Workshops'
    | 'Hackathons';
  organizer: string;
  dateTime: string;
  venue: string;
  city: string;
  mode: 'Offline' | 'Online' | 'Hybrid';
  isFree: boolean;
  priceInr?: number;
  capacity: number;
  registeredCount: number;
  externalUrl?: string;
  imageUrl: string;
  description: string;
  speakers: string[];
  agenda: string[];
  status: 'Draft' | 'Published' | 'Cancelled';
}

export interface LocalBusiness {
  id: string;
  name: string;
  category:
    | 'Restaurants'
    | 'Tiffin Centers'
    | 'Grocery Stores'
    | 'Laundry'
    | 'Gyms'
    | 'Transportation'
    | 'Stationery'
    | 'Mobile Repair'
    | 'Essential Services';
  city: string;
  locality: string;
  description: string;
  contact: string;
  hours: string;
  website?: string;
  isSponsored: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  category: 'Account' | 'Property Verification' | 'Joining' | 'Rent' | 'Deposit' | 'Subscription' | 'Technical Issue' | 'Safety Concern';
  subject: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Assigned' | 'In Progress' | 'Awaiting Response' | 'Resolved' | 'Closed';
  createdAt: string;
  lastReply: string;
}

export interface AuditLogEntry {
  id: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  targetRole: UserRole | 'ALL';
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  route?: string;
}
