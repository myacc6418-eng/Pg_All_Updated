import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BedDouble,
  Check,
  Copy,
  Crosshair,
  ImagePlus,
  Layers,
  Lock,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import { ActionBtn, ModalSheet, SafeImage, StatusText } from '../../components/ui/Primitives';
import { formatINR } from '../../utils/formatters';
import {
  AccommodationCategory,
  PGProperty,
  PropertyDocument,
  PropertyImage,
  PropertyType,
} from '../../types/pgfinder';
import { IMG_DOUBLE, IMG_HERO, IMG_LOUNGE, IMG_SINGLE, INDIAN_CITIES } from '../../data/demoData';

const AMENITY_GROUPS = {
  General: [
    'Wi-Fi',
    'Power Backup',
    'Lift',
    'Parking',
    'Drinking Water',
    'Housekeeping',
    'Laundry',
    'Common TV',
    'Common Study Area',
    'Common Lounge',
    'Gym',
    'Terrace Access',
  ],
  Food: ['Breakfast', 'Lunch', 'Dinner', 'Vegetarian Food', 'Non-Vegetarian Food'],
  Safety: [
    'CCTV in Common Areas',
    'Security Guard',
    'Controlled Entry',
    'Fire Safety Equipment',
    'Emergency Exits',
    'First Aid',
  ],
};

export const OwnerPropertiesPage: React.FC = () => {
  const {
    currentUser,
    properties,
    floors,
    rooms,
    beds,
    stays,
    submitNewProperty,
    updatePropertyDetails,
    archiveOrDeleteProperty,
    togglePropertyQr,
    regeneratePropertyQr,
    updatePropertyListingStatus,
    setOwnerSelectedPropertyId,
  } = usePGFinder();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [wizardOpen, setWizardOpen] = useState(searchParams.get('wizard') === '1');
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showArchived, setShowArchived] = useState(false);

  const [viewProp, setViewProp] = useState<PGProperty | null>(null);
  const [editProp, setEditProp] = useState<PGProperty | null>(null);
  const [deleteProp, setDeleteProp] = useState<PGProperty | null>(null);
  const [actionBanner, setActionBanner] = useState<{ ok: boolean; text: string } | null>(null);

  const ownerProperties = useMemo(
    () => properties.filter((p) => p.ownerId === (currentUser?.id || 'usr-owner-1')),
    [properties, currentUser]
  );

  const [qrPropId, setQrPropId] = useState<string | null>(
    searchParams.get('qr') === 'open' ? ownerProperties.find((p) => p.approvalStatus === 'APPROVED')?.id || null : null
  );
  const qrProp = properties.find((p) => p.id === qrPropId) || null;
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Edit Property permitted fields state
  const [eName, setEName] = useState('');
  const [eManager, setEManager] = useState('');
  const [eMobile, setEMobile] = useState('');
  const [eLandmark, setELandmark] = useState('');
  const [eDesc, setEDesc] = useState('');
  const [eFood, setEFood] = useState(true);
  const [eNoticeDays, setENoticeDays] = useState('30');

  // 5-Step Add Property Wizard State (Target Occupants removed per specification)
  const [step, setStep] = useState(1);
  const [wName, setWName] = useState('');
  const [wType, setWType] = useState<PropertyType>('PG Accommodation');
  const [wCategory, setWCategory] = useState<AccommodationCategory>('Co-living PG');
  const [wFood, setWFood] = useState(true);
  const [wYear, setWYear] = useState('2024');
  const [wManager, setWManager] = useState(currentUser?.name || 'Vikram Reddy');
  const [wMobile, setWMobile] = useState(currentUser?.mobile || '+91 99001 44580');
  const [wAltMobile, setWAltMobile] = useState('');
  const [wEmail, setWEmail] = useState(currentUser?.email || '');
  const [wDesc, setWDesc] = useState('');

  const [wState, setWState] = useState('Karnataka');
  const [wDistrict, setWDistrict] = useState('Bengaluru Urban');
  const [wCity, setWCity] = useState('Bengaluru');
  const [wLocality, setWLocality] = useState('');
  const [wAddress, setWAddress] = useState('');
  const [wPin, setWPin] = useState('');
  const [wLandmark, setWLandmark] = useState('');
  const [wGps, setWGps] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    capturedAt: string;
  } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string>('');
  const [wLocationConfirmed, setWLocationConfirmed] = useState(false);

  const [wAmenities, setWAmenities] = useState<string[]>(['Wi-Fi', 'Power Backup', 'Drinking Water', 'CCTV in Common Areas']);
  const [wImages, setWImages] = useState<PropertyImage[]>([]);
  const [wDocs, setWDocs] = useState<PropertyDocument[]>([
    {
      id: 'wdoc-1',
      name: 'Property_Authorization_Document.pdf',
      type: 'Lease or rental authorization',
      status: 'Pending',
      uploadedAt: new Date().toISOString().slice(0, 10),
    },
  ]);
  const [wDeclaration, setWDeclaration] = useState(false);
  const [wError, setWError] = useState('');

  const filteredProps = useMemo(() => {
    return ownerProperties.filter((p) => {
      if (!showArchived && p.archived) return false;
      if (cityFilter !== 'ALL' && p.city !== cityFilter) return false;
      if (statusFilter !== 'ALL' && p.approvalStatus !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.locality.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [ownerProperties, showArchived, cityFilter, statusFilter, search]);

  const isUnlockedForOps = (p: PGProperty) =>
    p.approvalStatus === 'APPROVED' && p.locationVerificationStatus === 'VERIFIED' && !p.archived;

  const openEditModal = (p: PGProperty) => {
    setEditProp(p);
    setEName(p.name);
    setEManager(p.ownerName);
    setEMobile(p.ownerMobile);
    setELandmark(p.landmark);
    setEDesc(p.description);
    setEFood(p.foodAvailable);
    setENoticeDays(String(p.noticePeriodDays));
  };

  const handleCaptureGps = () => {
    setGpsStatus('Requesting device GPS location...');
    if (!navigator.geolocation) {
      setGpsStatus('Browser geolocation unavailable. Use preview GPS capture below.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setWGps({
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy * 10) / 10,
          capturedAt: new Date(pos.timestamp).toISOString(),
        });
        setGpsStatus('GPS location captured successfully.');
      },
      (err) => {
        setGpsStatus(`Location error (${err.message}). You can use Demo Premises Coordinates below in preview mode.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, category: PropertyImage['category']) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      setWImages((prev) => [
        ...prev,
        {
          id: `up-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          url,
          category,
          isCover: prev.length === 0,
        },
      ]);
    });
    e.target.value = '';
  };

  const addSamplePhoto = (category: PropertyImage['category'], sampleUrl: string) => {
    setWImages((prev) => [
      ...prev,
      {
        id: `smp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        url: sampleUrl,
        category,
        isCover: prev.length === 0,
      },
    ]);
  };

  const handleWizardSubmit = (asDraft: boolean) => {
    setWError('');
    if (!wName.trim() || !wLocality.trim() || !wAddress.trim()) {
      setWError('Property name, locality, and address are required.');
      return;
    }
    if (!asDraft) {
      if (!wGps || !wLocationConfirmed) {
        setWError('Please capture GPS location and confirm you are at the PG premises.');
        return;
      }
      if (wImages.length < 4) {
        setWError(`Minimum 4 overall property photographs required (${wImages.length} of 4 uploaded).`);
        return;
      }
      if (!wDeclaration) {
        setWError('Please accept the owner accuracy declaration.');
        return;
      }
    }

    const created = submitNewProperty({
      ownerId: currentUser?.id || 'usr-owner-1',
      ownerName: wManager,
      ownerMobile: wMobile,
      ownerEmail: wEmail,
      name: wName.trim(),
      propertyType: wType,
      category: wCategory,
      foodAvailable: wFood,
      establishedYear: wYear,
      description: wDesc.trim() || `${wName} in ${wLocality}, ${wCity}.`,
      state: wState,
      district: wDistrict,
      city: wCity,
      locality: wLocality.trim(),
      address: wAddress.trim(),
      pinCode: wPin.trim() || '560001',
      landmark: wLandmark.trim(),
      location: wGps ? { ...wGps, ownerConfirmed: wLocationConfirmed } : undefined,
      amenities: wAmenities,
      images: wImages,
      documents: wDocs,
      approvalStatus: asDraft ? 'DRAFT' : 'PENDING_APPROVAL',
      locationVerificationStatus: asDraft ? 'NOT_SUBMITTED' : 'PENDING_VERIFICATION',
      listingStatus: 'NOT_LISTED',
      submittedAt: asDraft ? undefined : new Date().toISOString(),
      qrEnabled: false,
      houseRules: ['30 days advance checkout notice required'],
      noticePeriodDays: 30,
      defaultRent: 10000,
      defaultDeposit: 20000,
    });

    setWizardOpen(false);
    setSearchParams({});
    setStep(1);
    setWName('');
    setWImages([]);
    setWGps(null);
    setWDeclaration(false);
    setActionBanner({
      ok: true,
      text: asDraft
        ? `Saved draft "${created.name}".`
        : `Submitted "${created.name}" for Super Admin approval and location verification.`,
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-display">My Properties</h1>
          <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
            Register PGs, track approval and GPS verification status, manage floors/rooms/beds, tenants, vacancies, and QR onboarding.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setWizardOpen(true);
            setStep(1);
            setWError('');
          }}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#047857] hover:bg-[#065F46] dark:bg-[#34D399] dark:text-[#0B1220] text-white text-xs font-semibold shrink-0 self-start"
        >
          <Plus className="w-4 h-4" /> Add PG Property
        </button>
      </div>

      {actionBanner && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
            actionBanner.ok
              ? 'border-[#059669]/30 bg-[#059669]/10 text-[#059669] dark:text-[#34D399]'
              : 'border-[#DC2626]/30 bg-[#DC2626]/10 text-[#DC2626] dark:text-[#F87171]'
          }`}
        >
          <span>{actionBanner.text}</span>
          <button type="button" onClick={() => setActionBanner(null)} className="font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search PG name, locality, city, or ID..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-xs"
            />
          </div>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-xs"
          >
            <option value="ALL">All Cities</option>
            {Array.from(new Set(ownerProperties.map((p) => p.city))).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-xs"
          >
            <option value="ALL">All Approval Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="CORRECTIONS_REQUIRED">Corrections Required</option>
            <option value="DRAFT">Draft</option>
          </select>
          <label className="inline-flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#9CA3AF]">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="accent-[#047857]"
            />
            <span>Show Archived</span>
          </label>
        </div>

        {/* Table-First Property List */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B] dark:text-[#9CA3AF]">
                <th className="py-2.5 pr-3 font-medium">Property</th>
                <th className="py-2.5 pr-3 font-medium">City &amp; Locality</th>
                <th className="py-2.5 pr-3 font-medium">Approval &amp; GPS</th>
                <th className="py-2.5 pr-3 font-medium">Listing</th>
                <th className="py-2.5 pr-3 font-medium font-mono-num">Floors / Rooms</th>
                <th className="py-2.5 pr-3 font-medium font-mono-num">Beds (Occ / Avail)</th>
                <th className="py-2.5 pr-3 font-medium font-mono-num">Tenants / Occ %</th>
                <th className="py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
              {filteredProps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#64748B] dark:text-[#9CA3AF]">
                    No properties match your filters.
                  </td>
                </tr>
              ) : (
                filteredProps.map((prop) => {
                  const unlocked = isUnlockedForOps(prop);
                  const propFloors = floors.filter((f) => f.propertyId === prop.id);
                  const propRooms = rooms.filter((r) => r.propertyId === prop.id);
                  const propBeds = beds.filter((b) => b.propertyId === prop.id);
                  const occ = propBeds.filter((b) => b.status === 'Occupied').length;
                  const avail = propBeds.filter((b) => b.status === 'Available').length;
                  const activeTenants = stays.filter((s) => s.propertyId === prop.id && s.status === 'Active').length;
                  const occPct = propBeds.length > 0 ? Math.round((occ / propBeds.length) * 100) : 0;
                  const cover = prop.images.find((i) => i.isCover)?.url || prop.images[0]?.url;

                  return (
                    <tr key={prop.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1F2937]/40 align-top">
                      <td className="py-3 pr-3 min-w-[210px]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                            <SafeImage src={cover} alt={prop.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-[#111827] dark:text-[#F9FAFB] truncate">
                              {prop.name} {prop.archived ? '(Archived)' : ''}
                            </div>
                            <div className="text-[11px] text-[#64748B] dark:text-[#9CA3AF]">
                              <span className="font-mono-num">{prop.id}</span> · {prop.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-3 whitespace-nowrap">
                        <div className="font-medium">{prop.city}</div>
                        <div className="text-[11px] text-[#64748B] dark:text-[#9CA3AF]">{prop.locality}</div>
                      </td>
                      <td className="py-3 pr-3 space-y-1">
                        <div><StatusText status={prop.approvalStatus} /></div>
                        <div><StatusText status={prop.locationVerificationStatus} /></div>
                      </td>
                      <td className="py-3 pr-3">
                        <StatusText status={prop.listingStatus} />
                      </td>
                      <td className="py-3 pr-3 font-mono-num whitespace-nowrap">
                        {propFloors.length}F · {propRooms.length}R
                      </td>
                      <td className="py-3 pr-3 font-mono-num whitespace-nowrap">
                        <span className="font-semibold">{propBeds.length}</span>{' '}
                        <span className="text-[#64748B]">({occ} / {avail})</span>
                      </td>
                      <td className="py-3 pr-3 font-mono-num whitespace-nowrap">
                        <span className="font-semibold">{activeTenants}</span> · {occPct}%
                      </td>
                      <td className="py-3 text-right min-w-[330px]">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <ActionBtn kind="view" onClick={() => setViewProp(prop)} />
                          <ActionBtn kind="edit" onClick={() => openEditModal(prop)} />
                          <ActionBtn
                            kind="delete"
                            label={prop.approvalStatus === 'DRAFT' ? 'Delete' : 'Archive'}
                            onClick={() => setDeleteProp(prop)}
                          />
                          {unlocked ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setOwnerSelectedPropertyId(prop.id);
                                  navigate(`/owner/vacancies?propertyId=${prop.id}`);
                                }}
                                className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] dark:border-[#374151] px-2.5 py-1.5 text-xs font-medium hover:border-[#047857] min-h-[34px]"
                              >
                                <Layers className="w-3.5 h-3.5 text-[#047857] dark:text-[#34D399]" />
                                <span>Floors &amp; Vacancies</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOwnerSelectedPropertyId(prop.id);
                                  navigate(`/owner/tenants?propertyId=${prop.id}`);
                                }}
                                className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] dark:border-[#374151] px-2.5 py-1.5 text-xs font-medium hover:border-[#047857] min-h-[34px]"
                              >
                                <Users className="w-3.5 h-3.5 text-[#047857] dark:text-[#34D399]" />
                                <span>Tenants</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setQrPropId(prop.id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] dark:border-[#374151] px-2.5 py-1.5 text-xs font-medium hover:border-[#047857] min-h-[34px]"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                <span>QR Code</span>
                              </button>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#D97706] dark:text-[#FBBF24] px-2">
                              <Lock className="w-3 h-3" /> Awaiting verification
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Property Modal */}
      <ModalSheet
        open={viewProp !== null}
        onClose={() => setViewProp(null)}
        title={viewProp?.name || ''}
        subtitle={viewProp ? `${viewProp.locality}, ${viewProp.city} · ID: ${viewProp.id}` : ''}
        maxWidth="max-w-3xl"
      >
        {viewProp && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]/40">
              <div>
                <div className="text-[#64748B]">Approval Status</div>
                <div className="mt-1"><StatusText status={viewProp.approvalStatus} /></div>
              </div>
              <div>
                <div className="text-[#64748B]">GPS Verification</div>
                <div className="mt-1"><StatusText status={viewProp.locationVerificationStatus} /></div>
              </div>
              <div>
                <div className="text-[#64748B]">Public Listing</div>
                <div className="mt-1"><StatusText status={viewProp.listingStatus} /></div>
              </div>
            </div>

            {viewProp.adminComment && (
              <div className="p-3 rounded-xl bg-[#D97706]/10 text-[#D97706] dark:text-[#FBBF24]">
                Admin Feedback: {viewProp.adminComment}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-1">
                <div className="font-semibold">Basic Details</div>
                <div>Type: {viewProp.propertyType} · {viewProp.category}</div>
                <div>Established: {viewProp.establishedYear} · Food: {viewProp.foodAvailable ? 'Available' : 'Not included'}</div>
                <div>Notice Period: {viewProp.noticePeriodDays} days</div>
                <div>Manager: {viewProp.ownerName} ({viewProp.ownerMobile})</div>
              </div>
              <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-1">
                <div className="font-semibold">Address &amp; Coordinates</div>
                <div>{viewProp.address}</div>
                <div>{viewProp.locality}, {viewProp.city} - {viewProp.pinCode}</div>
                <div>Landmark: {viewProp.landmark || '—'}</div>
                <div className="font-mono-num">
                  GPS: {viewProp.location ? `${viewProp.location.latitude}, ${viewProp.location.longitude}` : 'Not captured'}
                </div>
              </div>
            </div>

            <div>
              <div className="font-semibold mb-1.5">Amenities ({viewProp.amenities.length})</div>
              <div className="text-[#64748B] dark:text-[#9CA3AF]">{viewProp.amenities.join(' · ')}</div>
            </div>

            {viewProp.listingStatus !== 'PUBLISHED' && isUnlockedForOps(viewProp) && (
              <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex flex-wrap items-center justify-between gap-2">
                <span>Internal operations require ₹0. Publish to public PG Finder listing when ready:</span>
                <button
                  type="button"
                  onClick={() => updatePropertyListingStatus(viewProp.id, 'PUBLISHED')}
                  className="px-3 py-1.5 rounded-lg bg-[#047857] text-white font-semibold"
                >
                  Publish Public Listing
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#374151]">
              {isUnlockedForOps(viewProp) && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setOwnerSelectedPropertyId(viewProp.id);
                      setViewProp(null);
                      navigate(`/owner/vacancies?propertyId=${viewProp.id}`);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#047857] text-white font-semibold"
                  >
                    <BedDouble className="w-3.5 h-3.5" /> Manage Floors, Rooms &amp; Beds
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOwnerSelectedPropertyId(viewProp.id);
                      setViewProp(null);
                      navigate(`/owner/tenants?propertyId=${viewProp.id}`);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] font-semibold"
                  >
                    <Users className="w-3.5 h-3.5" /> View Tenants
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </ModalSheet>

      {/* Edit Property Modal */}
      <ModalSheet
        open={editProp !== null}
        onClose={() => setEditProp(null)}
        title={`Edit Property — ${editProp?.name || ''}`}
        subtitle="Permitted property details (GPS coordinates require Super Admin re-verification)"
      >
        {editProp && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updatePropertyDetails(editProp.id, {
                name: eName.trim() || editProp.name,
                ownerName: eManager.trim() || editProp.ownerName,
                ownerMobile: eMobile.trim() || editProp.ownerMobile,
                landmark: eLandmark.trim(),
                description: eDesc.trim(),
                foodAvailable: eFood,
                noticePeriodDays: Number(eNoticeDays) || 30,
              });
              setActionBanner({ ok: true, text: `Updated details for "${eName.trim() || editProp.name}".` });
              setEditProp(null);
            }}
            className="space-y-3 text-xs"
          >
            <div>
              <label className="block font-medium mb-1">Property Name</label>
              <input
                type="text"
                required
                value={eName}
                onChange={(e) => setEName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">Owner / Manager Name</label>
                <input
                  type="text"
                  value={eManager}
                  onChange={(e) => setEManager(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Manager Mobile</label>
                <input
                  type="tel"
                  value={eMobile}
                  onChange={(e) => setEMobile(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">Landmark</label>
                <input
                  type="text"
                  value={eLandmark}
                  onChange={(e) => setELandmark(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Checkout Notice Period (Days)</label>
                <input
                  type="number"
                  value={eNoticeDays}
                  onChange={(e) => setENoticeDays(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Description</label>
              <textarea
                rows={3}
                value={eDesc}
                onChange={(e) => setEDesc(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={eFood} onChange={(e) => setEFood(e.target.checked)} className="accent-[#047857]" />
              <span>Food / Mess Available</span>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditProp(null)}
                className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] font-semibold"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-[#047857] text-white font-semibold">
                Save Changes
              </button>
            </div>
          </form>
        )}
      </ModalSheet>

      {/* Delete / Archive Confirmation Modal */}
      <ModalSheet
        open={deleteProp !== null}
        onClose={() => setDeleteProp(null)}
        title={deleteProp?.approvalStatus === 'DRAFT' ? 'Delete Draft Property' : 'Archive Property'}
        subtitle={deleteProp?.name || ''}
      >
        {deleteProp && (
          <div className="space-y-4 text-xs">
            <p className="text-[#64748B] dark:text-[#9CA3AF]">
              {deleteProp.approvalStatus === 'DRAFT'
                ? 'This empty draft property will be permanently removed.'
                : 'Properties with historical stays or financial records are safely archived rather than erased. If active tenants currently live here, complete checkout or transfer them first.'}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteProp(null)}
                className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const res = archiveOrDeleteProperty(deleteProp.id);
                  setActionBanner({ ok: res.ok, text: res.message });
                  setDeleteProp(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#DC2626] text-white font-semibold"
              >
                {deleteProp.approvalStatus === 'DRAFT' ? 'Confirm Delete' : 'Confirm Archive'}
              </button>
            </div>
          </div>
        )}
      </ModalSheet>

      {/* QR Onboarding Management Modal */}
      <ModalSheet
        open={qrProp !== null}
        onClose={() => setQrPropId(null)}
        title="Property QR Onboarding"
        subtitle={qrProp ? `${qrProp.name} · Contains only opaque joining URL` : ''}
      >
        {qrProp && (
          <div className="space-y-4 text-center">
            <div className="inline-flex p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white">
              <svg width="160" height="160" viewBox="0 0 21 21" aria-label={`QR Code for ${qrProp.name}`}>
                <rect width="21" height="21" fill="#ffffff" />
                {[
                  [0, 0],
                  [14, 0],
                  [0, 14],
                ].map(([x, y], idx) => (
                  <g key={idx}>
                    <rect x={x} y={y} width="7" height="7" fill="#111827" />
                    <rect x={x + 1} y={y + 1} width="5" height="5" fill="#ffffff" />
                    <rect x={x + 2} y={y + 2} width="3" height="3" fill="#111827" />
                  </g>
                ))}
                {Array.from({ length: 49 }).map((_, idx) => {
                  const gx = 8 + (idx % 5);
                  const gy = 2 + Math.floor(idx / 5) * 2;
                  const seed = (qrProp.qrToken.charCodeAt(idx % qrProp.qrToken.length) + idx) % 2 === 0;
                  return seed && gy < 19 ? <rect key={idx} x={gx} y={gy} width="1" height="1" fill="#111827" /> : null;
                })}
                <rect x="9" y="9" width="3" height="3" fill="#047857" />
              </svg>
            </div>

            <div className="text-xs font-mono-num text-[#64748B] dark:text-[#9CA3AF]">
              Joining URL: {window.location.origin}/#/join/{qrProp.id}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(`${window.location.origin}/#/join/${qrProp.id}`);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] text-xs font-semibold"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedUrl ? 'Copied Link' : 'Copy Link'}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] text-xs font-semibold"
              >
                <Printer className="w-3.5 h-3.5" /> Print QR
              </button>
              <button
                type="button"
                onClick={() => regeneratePropertyQr(qrProp.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] text-xs font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </button>
              <button
                type="button"
                onClick={() => togglePropertyQr(qrProp.id)}
                className="px-3 py-2 rounded-xl bg-[#047857] text-white text-xs font-semibold"
              >
                {qrProp.qrEnabled ? 'Disable QR' : 'Enable QR'}
              </button>
            </div>
          </div>
        )}
      </ModalSheet>

      {/* 5-Step Add Property Wizard (Target Occupants removed per specification) */}
      <ModalSheet
        open={wizardOpen}
        onClose={() => {
          setWizardOpen(false);
          setSearchParams({});
        }}
        title={`Add PG Property — Step ${step} of 5`}
        subtitle={
          step === 1
            ? 'Property Details (rooms, beds & rent are configured after approval)'
            : step === 2
            ? 'Automatic Property Location Capture'
            : step === 3
            ? 'Property-Level Amenities'
            : step === 4
            ? 'Property Photographs (Min 4) & Verification Documents'
            : 'Review & Submit for Super Admin Approval'
        }
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full ${
                  s <= step ? 'bg-[#047857] dark:bg-[#34D399]' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">PG Property Name *</label>
                  <input
                    type="text"
                    value={wName}
                    onChange={(e) => setWName(e.target.value)}
                    placeholder="e.g., Koramangala Banyan Residence"
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-sm"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Property Type</label>
                  <select
                    value={wType}
                    onChange={(e) => setWType(e.target.value as PropertyType)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-sm"
                  >
                    <option value="PG Accommodation">PG Accommodation</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Co-living Accommodation">Co-living Accommodation</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Category</label>
                  <select
                    value={wCategory}
                    onChange={(e) => setWCategory(e.target.value as AccommodationCategory)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                  >
                    <option value="Men's PG">Men&apos;s PG</option>
                    <option value="Women's PG">Women&apos;s PG</option>
                    <option value="Co-living PG">Co-living PG</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Established Year</label>
                  <input
                    type="text"
                    value={wYear}
                    onChange={(e) => setWYear(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium mb-1">Owner / Manager Name</label>
                  <input
                    type="text"
                    value={wManager}
                    onChange={(e) => setWManager(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Primary Mobile</label>
                  <input
                    type="tel"
                    value={wMobile}
                    onChange={(e) => setWMobile(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Alternate Mobile</label>
                  <input
                    type="tel"
                    value={wAltMobile}
                    onChange={(e) => setWAltMobile(e.target.value)}
                    placeholder="Optional"
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={wEmail}
                    onChange={(e) => setWEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={wFood} onChange={(e) => setWFood(e.target.checked)} className="accent-[#047857]" />
                    <span className="font-medium">Food / Mess Available</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Property Description</label>
                <textarea
                  rows={2}
                  value={wDesc}
                  onChange={(e) => setWDesc(e.target.value)}
                  placeholder="Describe surroundings, metro proximity, and building facilities..."
                  className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]/60 space-y-2.5">
                <div className="font-semibold">Please capture your location while physically present at your PG property.</div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCaptureGps}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#047857] text-white font-semibold"
                  >
                    <Crosshair className="w-4 h-4" /> Use My Current Location
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWGps({
                        latitude: 12.934812,
                        longitude: 77.626145,
                        accuracy: 8.4,
                        capturedAt: new Date().toISOString(),
                      });
                      setGpsStatus('Demo coordinates captured (Koramangala premises).');
                    }}
                    className="px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] font-medium"
                  >
                    Capture Demo GPS (Preview)
                  </button>
                </div>
                {gpsStatus && <div className="text-[#047857] dark:text-[#34D399] font-medium">{gpsStatus}</div>}
                {wGps && (
                  <div className="grid grid-cols-3 gap-2 pt-1 font-mono-num text-[11px]">
                    <div>Lat: {wGps.latitude}</div>
                    <div>Lng: {wGps.longitude}</div>
                    <div>Accuracy: ±{wGps.accuracy}m</div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={wState}
                  onChange={(e) => setWState(e.target.value)}
                  placeholder="State"
                  className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                />
                <input
                  type="text"
                  value={wDistrict}
                  onChange={(e) => setWDistrict(e.target.value)}
                  placeholder="District"
                  className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                />
                <select
                  value={wCity}
                  onChange={(e) => setWCity(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                >
                  {INDIAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={wLocality}
                  onChange={(e) => setWLocality(e.target.value)}
                  placeholder="Locality *"
                  className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                />
                <input
                  type="text"
                  value={wPin}
                  onChange={(e) => setWPin(e.target.value)}
                  placeholder="PIN Code (e.g., 560034)"
                  className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
                />
                <input
                  type="text"
                  value={wLandmark}
                  onChange={(e) => setWLandmark(e.target.value)}
                  placeholder="Nearby Landmark"
                  className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                />
              </div>
              <input
                type="text"
                value={wAddress}
                onChange={(e) => setWAddress(e.target.value)}
                placeholder="Complete Street Address *"
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              />
              <label className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  checked={wLocationConfirmed}
                  onChange={(e) => setWLocationConfirmed(e.target.checked)}
                  className="mt-0.5 accent-[#047857]"
                />
                <span>
                  I confirm the captured GPS coordinates represent the actual PG property. Super Admin will independently verify this location.
                </span>
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {Object.entries(AMENITY_GROUPS).map(([grp, list]) => (
                <div key={grp}>
                  <div className="font-semibold mb-2">{grp} Facilities</div>
                  <div className="flex flex-wrap gap-2">
                    {list.map((item) => {
                      const active = wAmenities.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() =>
                            setWAmenities((prev) =>
                              prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
                            )
                          }
                          className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                            active
                              ? 'border-[#047857] dark:border-[#34D399] bg-[#047857]/10 dark:bg-[#34D399]/15 text-[#047857] dark:text-[#34D399]'
                              : 'border-[#E2E8F0] dark:border-[#374151] text-[#64748B] dark:text-[#9CA3AF]'
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  {wImages.length} of 4 required property photographs uploaded.
                </span>
                <span className="text-[#64748B]">Room &amp; bathroom photos come after approval</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(
                  [
                    { cat: 'Building front view', smp: IMG_HERO },
                    { cat: 'Property entrance', smp: IMG_SINGLE },
                    { cat: 'Reception or common area', smp: IMG_LOUNGE },
                    { cat: 'Additional overall view', smp: IMG_DOUBLE },
                  ] as { cat: PropertyImage['category']; smp: string }[]
                ).map((slot) => (
                  <div
                    key={slot.cat}
                    className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex items-center justify-between gap-2"
                  >
                    <span className="font-medium">{slot.cat}</span>
                    <div className="flex items-center gap-1.5">
                      <label className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] cursor-pointer font-medium hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1">
                        <ImagePlus className="w-3.5 h-3.5" /> Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(e, slot.cat)}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => addSamplePhoto(slot.cat, slot.smp)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#047857]/10 text-[#047857] dark:text-[#34D399] font-medium"
                      >
                        + Sample
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {wImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {wImages.map((img) => (
                    <div key={img.id} className="rounded-xl border border-[#E2E8F0] dark:border-[#374151] overflow-hidden">
                      <div className="aspect-4/3 bg-slate-100">
                        <SafeImage src={img.url} alt={img.category} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-2 flex items-center justify-between gap-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() =>
                            setWImages((prev) => prev.map((x) => ({ ...x, isCover: x.id === img.id })))
                          }
                          className={img.isCover ? 'font-bold text-[#047857] dark:text-[#34D399]' : 'text-[#64748B]'}
                        >
                          {img.isCover ? 'Cover' : 'Set Cover'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setWImages((prev) => prev.filter((x) => x.id !== img.id))}
                          aria-label="Remove photo"
                          className="text-[#DC2626]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#374151] space-y-2">
                <div className="font-semibold">Private Property Verification Documents</div>
                <p className="text-[#64748B]">Kept private to verification admins; never shown publicly.</p>
                <div className="flex flex-wrap items-center gap-2">
                  {wDocs.map((d) => (
                    <span
                      key={d.id}
                      className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                    >
                      {d.name} ({d.type})
                    </span>
                  ))}
                  <label className="px-3 py-1.5 rounded-lg border border-dashed border-[#047857] text-[#047857] dark:text-[#34D399] cursor-pointer font-medium">
                    + Attach Document
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setWDocs((prev) => [
                            ...prev,
                            {
                              id: `wdoc-${Date.now()}`,
                              name: f.name,
                              type: 'Local licence',
                              status: 'Pending',
                              uploadedAt: new Date().toISOString().slice(0, 10),
                            },
                          ]);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] space-y-1.5">
                <div className="font-semibold text-sm">{wName || 'Untitled Property'}</div>
                <div className="text-[#64748B]">
                  {wType} · {wCategory} · {wLocality}, {wCity}
                </div>
                <div>Address: {wAddress} — {wPin}</div>
                <div className="font-mono-num">
                  GPS: {wGps ? `${wGps.latitude}, ${wGps.longitude} (±${wGps.accuracy}m)` : 'Not captured yet'}
                </div>
                <div>Amenities: {wAmenities.join(', ')}</div>
                <div>
                  Photos uploaded: {wImages.length} (minimum 4 required) · Documents: {wDocs.length}
                </div>
              </div>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={wDeclaration}
                  onChange={(e) => setWDeclaration(e.target.checked)}
                  className="mt-0.5 accent-[#047857]"
                />
                <span>
                  I declare that all submitted property details, photographs, coordinates, and authorization documents are accurate.
                </span>
              </label>
            </div>
          )}

          {wError && (
            <div className="p-2.5 rounded-xl bg-[#DC2626]/10 text-[#DC2626] dark:text-[#F87171] font-medium">
              {wError}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E2E8F0] dark:border-[#374151]">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {step === 5 && (
                <button
                  type="button"
                  onClick={() => handleWizardSubmit(true)}
                  className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] font-semibold"
                >
                  Save Draft
                </button>
              )}
              {step < 5 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(5, s + 1))}
                  className="px-4 py-2 rounded-xl bg-[#047857] text-white font-semibold"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleWizardSubmit(false)}
                  className="px-4 py-2 rounded-xl bg-[#047857] text-white font-semibold"
                >
                  Submit for Approval
                </button>
              )}
            </div>
          </div>
        </div>
      </ModalSheet>
    </div>
  );
};
