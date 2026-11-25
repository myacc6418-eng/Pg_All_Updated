import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bookmark,
  Grid,
  List,
  MapPin,
  RotateCcw,
  Search,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import { ModalSheet, SafeImage, StatusText } from '../../components/ui/Primitives';
import { formatINR } from '../../utils/formatters';
import { INDIAN_CITIES } from '../../data/demoData';
import { AccommodationCategory, PGProperty, SharingOption } from '../../types/pgfinder';

export const TenantExplorePage: React.FC = () => {
  const {
    properties,
    rooms,
    beds,
    savedPropertyIds,
    toggleSaveProperty,
    markPropertyViewed,
    submitJoiningRequest,
  } = usePGFinder();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [city, setCity] = useState(searchParams.get('city') || 'ALL');
  const [category, setCategory] = useState<'ALL' | AccommodationCategory>('ALL');
  const [maxRent, setMaxRent] = useState<number>(25000);
  const [foodOnly, setFoodOnly] = useState(false);
  const [acOnly, setAcOnly] = useState(false);
  const [wifiOnly, setWifiOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(searchParams.get('saved') === '1');
  const [sortBy, setSortBy] = useState<'recommended' | 'rent_asc' | 'rent_desc' | 'rating'>('recommended');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const initialSelectedId = searchParams.get('property');
  const [selectedProperty, setSelectedProperty] = useState<PGProperty | null>(
    initialSelectedId ? properties.find((p) => p.id === initialSelectedId && p.listingStatus === 'PUBLISHED') || null : null
  );
  const [joinSharing, setJoinSharing] = useState<SharingOption>('Double');
  const [joinDate, setJoinDate] = useState('2026-12-01');
  const [joinNotes, setJoinNotes] = useState('');
  const [joinFeedback, setJoinFeedback] = useState<string | null>(null);

  const publishedProperties = useMemo(
    () => properties.filter((p) => p.listingStatus === 'PUBLISHED'),
    [properties]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = publishedProperties.filter((p) => {
      if (city !== 'ALL' && p.city !== city) return false;
      if (category !== 'ALL' && p.category !== category) return false;
      if (p.defaultRent > maxRent) return false;
      if (foodOnly && !p.foodAvailable) return false;
      if (wifiOnly && !p.amenities.includes('Wi-Fi')) return false;
      if (acOnly && !rooms.some((r) => r.propertyId === p.id && r.isAc)) return false;
      if (savedOnly && !savedPropertyIds.includes(p.id)) return false;
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.locality.toLowerCase().includes(q) &&
        !p.city.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });

    if (sortBy === 'rent_asc') return [...list].sort((a, b) => a.defaultRent - b.defaultRent);
    if (sortBy === 'rent_desc') return [...list].sort((a, b) => b.defaultRent - a.defaultRent);
    if (sortBy === 'rating') return [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return [...list].sort((a, b) => Number(Boolean(b.isSponsored)) - Number(Boolean(a.isSponsored)));
  }, [publishedProperties, city, category, maxRent, foodOnly, acOnly, wifiOnly, savedOnly, query, sortBy, rooms, savedPropertyIds]);

  const resetFilters = () => {
    setQuery('');
    setCity('ALL');
    setCategory('ALL');
    setMaxRent(25000);
    setFoodOnly(false);
    setAcOnly(false);
    setWifiOnly(false);
    setSavedOnly(false);
    setSortBy('recommended');
  };

  const openDetail = (prop: PGProperty) => {
    markPropertyViewed(prop.id);
    setJoinFeedback(null);
    setSelectedProperty(prop);
  };

  const handleRequestJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;
    const res = submitJoiningRequest({
      propertyId: selectedProperty.id,
      preferredSharing: joinSharing,
      moveInDate: joinDate,
      source: 'EXPLORE',
      notes: joinNotes,
    });
    setJoinFeedback(res.message);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-display">Explore Verified PGs</h1>
          <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
            Showing only approved, location-verified, publicly listed properties.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            aria-label="Sort results"
            className="h-9 px-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] text-xs font-medium"
          >
            <option value="recommended">Sort: Recommended</option>
            <option value="rent_asc">Rent: Low to High</option>
            <option value="rent_desc">Rent: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
          <div className="inline-flex rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800' : 'text-[#64748B]'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800' : 'text-[#64748B]'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search PG or locality..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-sm"
            />
          </div>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-sm"
          >
            <option value="ALL">All Cities</option>
            {INDIAN_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-sm"
          >
            <option value="ALL">All Categories</option>
            <option value="Men's PG">Men&apos;s PG</option>
            <option value="Women's PG">Women&apos;s PG</option>
            <option value="Co-living PG">Co-living PG</option>
          </select>
          <div className="flex flex-col justify-center">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#64748B] dark:text-[#9CA3AF]">Max Monthly Rent</span>
              <span className="font-mono-num font-semibold">{formatINR(maxRent)}</span>
            </div>
            <input
              type="range"
              min={6000}
              max={25000}
              step={500}
              value={maxRent}
              onChange={(e) => setMaxRent(Number(e.target.value))}
              className="accent-[#047857]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: 'Food Included', active: foodOnly, toggle: () => setFoodOnly(!foodOnly) },
              { label: 'AC Rooms', active: acOnly, toggle: () => setAcOnly(!acOnly) },
              { label: 'Wi-Fi', active: wifiOnly, toggle: () => setWifiOnly(!wifiOnly) },
              { label: 'Saved Only', active: savedOnly, toggle: () => setSavedOnly(!savedOnly) },
            ].map((f) => (
              <button
                key={f.label}
                type="button"
                onClick={f.toggle}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  f.active
                    ? 'border-[#047857] dark:border-[#34D399] bg-[#047857]/10 dark:bg-[#34D399]/15 text-[#047857] dark:text-[#34D399]'
                    : 'border-[#E2E8F0] dark:border-[#374151] text-[#64748B] dark:text-[#9CA3AF]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#64748B] hover:text-[#111827] dark:hover:text-[#F9FAFB]"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
          </button>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-8 text-center">
          <h3 className="text-base font-semibold">No Matching PGs Found</h3>
          <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-1">
            Try clearing filters or increasing your monthly rent range.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-[#047857] text-white text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {filtered.map((prop) => {
            const propRooms = rooms.filter((r) => r.propertyId === prop.id);
            const availBeds = beds.filter((b) => b.propertyId === prop.id && b.status === 'Available').length;
            const sharingList = Array.from(new Set(propRooms.map((r) => r.sharing))).join(' · ') || 'Double';
            const isSaved = savedPropertyIds.includes(prop.id);
            const cover = prop.images.find((i) => i.isCover)?.url || prop.images[0]?.url;

            return (
              <div
                key={prop.id}
                className={`rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] overflow-hidden flex ${
                  viewMode === 'list' ? 'flex-col sm:flex-row' : 'flex-col'
                }`}
              >
                <div
                  onClick={() => openDetail(prop)}
                  className={`bg-slate-100 dark:bg-slate-800 cursor-pointer shrink-0 ${
                    viewMode === 'list' ? 'sm:w-60 aspect-4/3 sm:aspect-auto' : 'aspect-4/3'
                  }`}
                >
                  <SafeImage src={cover} alt={prop.name} className="w-full h-full object-cover" />
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs text-[#64748B] dark:text-[#9CA3AF] flex items-center gap-1.5">
                        <span>{prop.category}</span>
                        {prop.isSponsored && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-medium text-[#D97706] dark:text-[#FBBF24]">Sponsored</span>
                          </>
                        )}
                      </div>
                      <h3
                        onClick={() => openDetail(prop)}
                        className="text-base font-semibold mt-0.5 cursor-pointer hover:text-[#047857] dark:hover:text-[#34D399] truncate"
                      >
                        {prop.name}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSaveProperty(prop.id)}
                      aria-label={isSaved ? 'Remove from saved' : 'Save PG'}
                      className={`p-2 rounded-lg border transition-colors shrink-0 ${
                        isSaved
                          ? 'border-[#047857] text-[#047857] dark:border-[#34D399] dark:text-[#34D399]'
                          : 'border-[#E2E8F0] dark:border-[#374151] text-[#64748B]'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="mt-1 flex items-center gap-1 text-xs text-[#64748B] dark:text-[#9CA3AF]">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {prop.locality}, {prop.city}
                    </span>
                  </div>

                  <div className="mt-2.5 text-xs text-[#64748B] dark:text-[#9CA3AF]">
                    {sharingList} · {availBeds} beds available
                  </div>

                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1 text-[#059669] dark:text-[#34D399] font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" /> Location Verified
                    </span>
                    {prop.rating && (
                      <span className="inline-flex items-center gap-1 font-mono-num">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {prop.rating} ({prop.reviewCount})
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-3.5 flex items-center justify-between border-t border-[#E2E8F0] dark:border-[#374151]">
                    <div>
                      <span className="text-base font-bold font-mono-num">{formatINR(prop.defaultRent)}</span>
                      <span className="text-xs text-[#64748B] dark:text-[#9CA3AF]"> / month</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openDetail(prop)}
                      className="px-3.5 py-2 rounded-xl bg-[#047857] hover:bg-[#065F46] dark:bg-[#34D399] dark:text-[#0B1220] text-white text-xs font-semibold"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clearly labeled browser AdMob placeholder (discovery only, non-sensitive) */}
      <div className="rounded-xl border border-dashed border-[#E2E8F0] dark:border-[#374151] bg-white/70 dark:bg-[#111827]/70 p-3 flex items-center justify-between text-xs text-[#64748B] dark:text-[#9CA3AF]">
        <span>Sponsored Ad Placement Placeholder (Google AdMob Native/Banner — Browser Preview Mode)</span>
        <span className="font-mono-num">Test Ad Unit</span>
      </div>

      {/* Property Details Modal */}
      <ModalSheet
        open={selectedProperty !== null}
        onClose={() => setSelectedProperty(null)}
        title={selectedProperty?.name || ''}
        subtitle={selectedProperty ? `${selectedProperty.locality}, ${selectedProperty.city} · ${selectedProperty.category}` : ''}
        maxWidth="max-w-3xl"
      >
        {selectedProperty && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {selectedProperty.images.map((img) => (
                <div key={img.id} className="aspect-4/3 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <SafeImage src={img.url} alt={img.category} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <StatusText status="Approved & Location Verified" tone="success" />
              <span className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
                Notice Period: {selectedProperty.noticePeriodDays} days · Deposit: {formatINR(selectedProperty.defaultDeposit)}
              </span>
            </div>

            <p className="text-sm text-[#64748B] dark:text-[#9CA3AF] leading-relaxed">
              {selectedProperty.description}
            </p>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#9CA3AF] mb-2">
                Available Room Configurations
              </h4>
              <div className="space-y-2">
                {rooms
                  .filter((r) => r.propertyId === selectedProperty.id)
                  .map((r) => {
                    const roomAvail = beds.filter((b) => b.roomId === r.id && b.status === 'Available').length;
                    return (
                      <div
                        key={r.id}
                        className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-semibold">
                            Room {r.roomNumber} · {r.sharing} Sharing ({r.isAc ? 'AC' : 'Non-AC'})
                          </div>
                          <div className="text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
                            {r.bathroomType} Bathroom {r.geyserAvailable ? '· Geyser' : ''} · {r.amenities.join(', ')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold font-mono-num text-sm">{formatINR(r.monthlyRent)}/mo</div>
                          <div className="text-[#059669] dark:text-[#34D399] font-mono-num">{roomAvail} beds open</div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold mb-1.5">Property Amenities</h4>
                <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] leading-relaxed">
                  {selectedProperty.amenities.join(' · ')}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold mb-1.5">House Rules</h4>
                <ul className="text-xs text-[#64748B] dark:text-[#9CA3AF] space-y-1">
                  {selectedProperty.houseRules.map((rule) => (
                    <li key={rule}>• {rule}</li>
                  ))}
                </ul>
              </div>
            </div>

            <form
              onSubmit={handleRequestJoin}
              className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]/60 space-y-3"
            >
              <h4 className="text-sm font-semibold">Request to Join</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Preferred Sharing</label>
                  <select
                    value={joinSharing}
                    onChange={(e) => setJoinSharing(e.target.value as SharingOption)}
                    className="w-full h-9 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] text-xs"
                  >
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Triple">Triple</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Move-in Date</label>
                  <input
                    type="date"
                    value={joinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] text-xs"
                  />
                </div>
              </div>
              <input
                type="text"
                value={joinNotes}
                onChange={(e) => setJoinNotes(e.target.value)}
                placeholder="Optional note for the owner (workplace, shift timing)..."
                className="w-full h-9 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] text-xs"
              />
              {joinFeedback && (
                <div className="text-xs font-medium text-[#059669] dark:text-[#34D399]">{joinFeedback}</div>
              )}
              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-[#047857] hover:bg-[#065F46] dark:bg-[#34D399] dark:text-[#0B1220] text-white text-xs font-semibold"
              >
                Submit Joining Request
              </button>
            </form>
          </div>
        )}
      </ModalSheet>
    </div>
  );
};
