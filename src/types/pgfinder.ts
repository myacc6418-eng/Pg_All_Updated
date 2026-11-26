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
  suspendedReason?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  archived?: boolean;
  adminNotes?: string;
  assignedAdminRole?: string;
  lastLoginAt?: string;
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
  reviewedBy?: string;
  reviewedAt?: string;
  locationReviewedBy?: string;
  locationReviewedAt?: string;
  locationNotes?: string;
  verificationHistory?: { id: string; status: string; actor: string; timestamp: string; comment?: string }[];
  locationHistory?: {
    id: string;
    status: string;
    actor: string;
    timestamp: string;
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    comment?: string;
  }[];
  suspensionDetails?: {
    category: string;
    reason: string;
    effectiveDate: string;
    reviewDate?: string;
    suspendedBy: string;
    suspendedAt: string;
  };
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

export interface SupportMessage {
  id: string;
  senderName: string;
  senderRole: UserRole;
  body: string;
  createdAt: string;
}

export interface SupportInternalNote {
  id: string;
  authorName: string;
  note: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketCode?: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userMobile?: string;
  userEmail?: string;
  category:
    | 'Account'
    | 'Property Verification'
    | 'Location Verification'
    | 'Document Verification'
    | 'Joining'
    | 'Rent'
    | 'Deposit'
    | 'Subscription'
    | 'Payment'
    | 'Listing'
    | 'Advertisement'
    | 'Featured PG'
    | 'Technical Issue'
    | 'Safety Concern'
    | 'Tenant Complaint Escalation'
    | 'Other';
  relatedEntityLabel?: string;
  subject: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status:
    | 'Open'
    | 'Under Review'
    | 'Assigned'
    | 'In Progress'
    | 'Awaiting Response'
    | 'Waiting for User'
    | 'Waiting for Admin'
    | 'Resolved'
    | 'Closed'
    | 'Reopened';
  assignedAdmin?: string;
  createdAt: string;
  updatedAt?: string;
  lastReply: string;
  resolutionSummary?: string;
  messages?: SupportMessage[];
  internalNotes?: SupportInternalNote[];
}

export type AuditCategory =
  | 'Auth'
  | 'PG Owner'
  | 'Tenant'
  | 'Property'
  | 'Administrator'
  | 'Financial'
  | 'Document Access'
  | 'Location Verification'
  | 'Location Sharing Requests'
  | 'Security Events';

export interface AuditLogEntry {
  id: string;
  actorName: string;
  actorRole: UserRole;
  category?: AuditCategory;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  beforeValue?: string;
  afterValue?: string;
  reason?: string;
  status?: 'Success' | 'Failed' | 'Blocked';
  ipOrDeviceSummary?: string;
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
  category?: string;
}

export interface PropertyHistoryEntry {
  id: string;
  status: string;
  actor: string;
  timestamp: string;
  comment?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
}

export interface PropertySuspensionDetails {
  category: string;
  reason: string;
  effectiveDate: string;
  reviewDate?: string;
  suspendedBy: string;
  suspendedAt: string;
}

export interface UnifiedDocumentRecord {
  id: string;
  category: 'Owner' | 'Property' | 'Tenant';
  ownerOrTenantName: string;
  ownerId?: string;
  propertyId?: string;
  propertyName?: string;
  tenantId?: string;
  stayId?: string;
  documentType: string;
  fileName: string;
  uploadedAt: string;
  verificationStatus: 'Pending' | 'Under Review' | 'Verified' | 'Rejected' | 'Replacement Required';
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionOrReplacementNote?: string;
  archived?: boolean;
  previewUrl?: string;
}

export interface PlanFeature {
  id: string;
  name: string;
  code: string;
  category:
    | 'Property Management'
    | 'Tenant Management'
    | 'Finance & Billing'
    | 'Analytics'
    | 'Support & Priority'
    | 'Listing & Promotion';
  description: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  description: string;
  billingCycle: 'Monthly' | 'Quarterly' | 'Yearly';
  priceInr: number;
  maxProperties: number;
  maxRooms: number;
  maxBeds: number;
  includedListingSlots: number;
  graceDays: number;
  featureIds: string[];
  status: 'Active' | 'Inactive' | 'Archived';
}

export interface OwnerSubscriptionRecord {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  planId: string;
  planName: string;
  status: 'Active' | 'Pending Payment' | 'Grace Period' | 'Expired' | 'Cancelled' | 'Suspended';
  startDate: string;
  endDate: string;
  renewalMode: 'Auto' | 'Manual';
  paymentStatus: 'Paid' | 'Pending' | 'Unconfigured' | 'Failed';
  amountInr: number;
  notes?: string;
}

export interface PlatformPaymentRecord {
  id: string;
  ownerId: string;
  ownerName: string;
  category: 'Subscription' | 'Listing Fee (₹299)' | 'Featured PG' | 'Local Ad';
  reference: string;
  amountInr: number;
  status: 'Paid' | 'Pending' | 'Refunded' | 'Failed';
  date: string;
  planOrCampaignName: string;
  note?: string;
}

export interface FeaturedCampaign {
  id: string;
  propertyId: string;
  propertyName: string;
  ownerId: string;
  ownerName: string;
  city: string;
  locality: string;
  packageName: 'Starter Boost (₹299)' | 'City Spotlight (₹799)' | 'Metro Premier (₹1,999)';
  placement:
    | 'Home Featured'
    | 'Explore Top Carousel'
    | 'City Search Top'
    | 'Locality Spotlight'
    | 'Suggested PGs';
  startDate: string;
  endDate: string;
  priorityWeight: number;
  priceInr: number;
  paymentStatus: 'Pending Demo' | 'Confirmed Demo' | 'Unpaid';
  status: 'Draft' | 'Scheduled' | 'Active' | 'Paused' | 'Expired' | 'Cancelled' | 'Archived';
  impressions: number;
  clicks: number;
}

export interface AdvertiserAccount {
  id: string;
  businessName: string;
  contactPerson: string;
  mobile: string;
  email: string;
  city: string;
  locality: string;
  category: LocalBusiness['category'];
  status: 'Active' | 'Paused' | 'Suspended' | 'Archived';
  createdAt: string;
}

export interface LocalAdCampaign {
  id: string;
  advertiserId: string;
  advertiserName: string;
  title: string;
  category: LocalBusiness['category'];
  description: string;
  ctaText: string;
  destinationUrl: string;
  targetCity: string;
  targetLocality: string;
  placement: 'PG Finder Local' | 'Tenant Home Area Card' | 'Explore Nearby Feed';
  startDate: string;
  endDate: string;
  packagePriceInr: number;
  status: 'Draft' | 'Pending Approval' | 'Active' | 'Paused' | 'Expired' | 'Rejected' | 'Archived';
  impressions: number;
  clicks: number;
}

export type AdminNotificationCategory =
  | 'System Maintenance'
  | 'Policy Update'
  | 'Property Verification'
  | 'Location Verification'
  | 'Document Action'
  | 'Subscription Reminder'
  | 'Payment Alert'
  | 'Feature Update'
  | 'Safety Advisory'
  | 'Event Announcement'
  | 'Promotional Update'
  | 'Support Update';

export type AdminAudienceMode =
  | 'All Users'
  | 'All PG Owners'
  | 'All Tenants'
  | 'Specific City Users'
  | 'Specific Property Owners'
  | 'Specific Property Tenants'
  | 'Active Subscribers'
  | 'Expired Subscribers'
  | 'Individual User';

export interface AdminNotificationRecord {
  id: string;
  title: string;
  message: string;
  category: AdminNotificationCategory;
  targetAudienceMode: AdminAudienceMode;
  targetFilterValue?: string;
  channels: ('In-App' | 'Push' | 'Email')[];
  status: 'Draft' | 'Scheduled' | 'Published' | 'Failed' | 'Withdrawn' | 'Archived';
  scheduledAt?: string;
  publishedAt?: string;
  createdBy: string;
  recipientEstimate: number;
  inAppReadCount: number;
}

