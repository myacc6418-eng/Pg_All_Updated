import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  MapPin,
  Search,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import { SafeImage, ThemeSwitch, ModalSheet } from '../../components/ui/Primitives';
import { formatINR } from '../../utils/formatters';
import { IMG_HERO, INDIAN_CITIES } from '../../data/demoData';

const FAQS = [
  {
    q: 'How does PG Finder verify PG properties and locations?',
    a: 'Every PG owner submits property photographs and captures device GPS coordinates while physically present at the premises. Our verification administrators independently review both documents and coordinates before approving the property.',
  },
  {
    q: 'Are personal expenses shared with my PG owner?',
    a: 'No. Your personal expense tracker, budgets, and roommate split records are strictly private to your tenant account.',
  },
  {
    q: 'Do PG owners need approval before managing rooms and tenants?',
    a: 'PG owners get immediate dashboard access to register properties, while internal floor, room, bed, and QR onboarding tools unlock per property once its approval and location verification are completed.',
  },
  {
    q: 'Can I join a PG directly by scanning a QR code at the property?',
    a: 'Yes. Approved, location-verified properties can generate a secure joining QR code that opens directly into the onboarding flow.',
  },
];

export const LandingPage: React.FC = () => {
  const { properties, beds, setSelectedCity, switchDemoRole } = usePGFinder();
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState('Bengaluru');
  const [searchLocality, setSearchLocality] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);

  const publishedProperties = properties.filter((p) => p.listingStatus === 'PUBLISHED');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedCity(searchCity);
    switchDemoRole('TENANT');
    navigate(`/tenant/explore?city=${encodeURIComponent(searchCity)}&q=${encodeURIComponent(searchLocality)}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] text-[#111827] dark:text-[#F9FAFB]">
      {/* Strict 3-zone Top Bar Contract */}
      <header className="sticky top-0 z-30 border-b border-[#E2E8F0] dark:border-[#374151] bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="text-lg font-bold font-display tracking-tight text-[#047857] dark:text-[#34D399] whitespace-nowrap shrink-0"
          >
            PG Finder
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#64748B] dark:text-[#9CA3AF]">
            <a href="#featured" className="hover:text-[#111827] dark:hover:text-[#F9FAFB] transition-colors whitespace-nowrap shrink-0">
              Explore PGs
            </a>
            <a href="#how-it-works" className="hover:text-[#111827] dark:hover:text-[#F9FAFB] transition-colors whitespace-nowrap shrink-0">
              How It Works
            </a>
            <a href="#owners" className="hover:text-[#111827] dark:hover:text-[#F9FAFB] transition-colors whitespace-nowrap shrink-0">
              For Owners
            </a>
            <a href="#faq" className="hover:text-[#111827] dark:hover:text-[#F9FAFB] transition-colors whitespace-nowrap shrink-0">
              FAQs
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="px-4 py-2 rounded-lg bg-[#047857] hover:bg-[#065F46] dark:bg-[#34D399] dark:hover:bg-[#10B981] text-white dark:text-[#0B1220] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
            >
              Login / Register
            </button>
          </div>
        </div>
      </header>

      {/* Hero Split */}
      <section id="top" className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 sm:pt-12 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <p className="text-xs font-medium text-[#047857] dark:text-[#34D399] mb-2">
              Verified Indian PG Accommodation &amp; Management Platform
            </p>
            <h1
              className="font-display font-bold tracking-tight text-[#111827] dark:text-[#F9FAFB] leading-[1.12]"
              style={{ fontSize: 'clamp(2.25rem, 4vw, 3.35rem)', textWrap: 'balance' }}
            >
              Find Your Perfect PG. Live Smarter.
            </h1>
            <p className="mt-4 text-base text-[#64748B] dark:text-[#9CA3AF] max-w-xl leading-relaxed">
              Discover location-verified paying guest residences, compare sharing rooms and amenities in INR, manage rent and private daily expenses, and connect with startup events across India.
            </p>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className="mt-6 p-2 rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] flex flex-col sm:flex-row gap-2"
            >
              <select
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                aria-label="Select city"
                className="h-11 px-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1F2937] border border-[#E2E8F0] dark:border-[#374151] text-sm font-medium text-[#111827] dark:text-[#F9FAFB] focus:outline-none"
              >
                {INDIAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchLocality}
                  onChange={(e) => setSearchLocality(e.target.value)}
                  placeholder="Search locality (Koramangala, Hinjewadi, Indiranagar...)"
                  className="w-full h-11 pl-9 pr-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1F2937] border border-[#E2E8F0] dark:border-[#374151] text-sm text-[#111827] dark:text-[#F9FAFB] placeholder:text-[#64748B] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="h-11 px-5 rounded-xl bg-[#047857] hover:bg-[#065F46] dark:bg-[#34D399] dark:hover:bg-[#10B981] text-white dark:text-[#0B1220] text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                Search PGs
              </button>
            </form>

            {/* Demo role preview shortcuts */}
            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-[#64748B] dark:text-[#9CA3AF]">
              <span>Explore interactive UI dashboards:</span>
              <button
                type="button"
                onClick={() => {
                  switchDemoRole('TENANT');
                  navigate('/tenant/home');
                }}
                className="font-semibold text-[#047857] dark:text-[#34D399] hover:underline whitespace-nowrap"
              >
                Tenant Dashboard
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => {
                  switchDemoRole('PG_OWNER');
                  navigate('/owner/dashboard');
                }}
                className="font-semibold text-[#047857] dark:text-[#34D399] hover:underline whitespace-nowrap"
              >
                PG Owner Console
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => {
                  switchDemoRole('SUPER_ADMIN');
                  navigate('/admin/dashboard');
                }}
                className="font-semibold text-[#047857] dark:text-[#34D399] hover:underline whitespace-nowrap"
              >
                Super Admin Console
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="h-full min-h-[260px] rounded-2xl overflow-hidden border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827]">
              <SafeImage
                src={IMG_HERO}
                alt="Modern Indian co-living PG courtyard and residence"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Popular localities strip */}
        <div className="mt-8 pt-6 border-t border-[#E2E8F0] dark:border-[#374151] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B] dark:text-[#9CA3AF]">
            <span className="font-medium text-[#111827] dark:text-[#F9FAFB]">Popular localities:</span>
            {['Koramangala', 'Indiranagar', 'HSR Layout', 'Hinjewadi', 'Madhapur', 'DLF Phase 3'].map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => {
                  switchDemoRole('TENANT');
                  navigate(`/tenant/explore?q=${encodeURIComponent(loc)}`);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] hover:border-[#047857] dark:hover:border-[#34D399] text-[#111827] dark:text-[#F9FAFB] transition-colors"
              >
                {loc}
              </button>
            ))}
          </div>
          <ThemeSwitch />
        </div>
      </section>

      {/* Featured Verified PGs */}
      <section id="featured" className="mx-auto max-w-6xl px-4 sm:px-6 py-10 border-t border-[#E2E8F0] dark:border-[#374151]">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold font-display text-[#111827] dark:text-[#F9FAFB]">
              Featured Verified PGs
            </h2>
            <p className="text-sm text-[#64748B] dark:text-[#9CA3AF] mt-1">
              Only location-verified, admin-approved, and publicly eligible residences appear here.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              switchDemoRole('TENANT');
              navigate('/tenant/explore');
            }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#047857] dark:text-[#34D399] hover:underline whitespace-nowrap shrink-0"
          >
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {publishedProperties.map((prop) => {
            const availBeds = beds.filter((b) => b.propertyId === prop.id && b.status === 'Available').length;
            const cover = prop.images.find((i) => i.isCover)?.url || prop.images[0]?.url;
            return (
              <div
                key={prop.id}
                className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] overflow-hidden flex flex-col"
              >
                <div className="aspect-4/3 bg-slate-100 dark:bg-slate-800 relative">
                  <SafeImage src={cover} alt={prop.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2 text-xs text-[#64748B] dark:text-[#9CA3AF]">
                    <span>
                      {prop.category} · {prop.locality}
                    </span>
                    {prop.isSponsored && (
                      <span className="font-medium text-[#D97706] dark:text-[#FBBF24]">Sponsored</span>
                    )}
                  </div>
                  <h3 className="mt-1 text-base font-semibold text-[#111827] dark:text-[#F9FAFB] line-clamp-1">
                    {prop.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-1 text-xs text-[#64748B] dark:text-[#9CA3AF]">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {prop.locality}, {prop.city}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-xs text-[#059669] dark:text-[#34D399]">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified PG
                    </span>
                    {prop.rating && (
                      <span className="inline-flex items-center gap-1 text-[#111827] dark:text-[#F9FAFB] font-mono-num">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {prop.rating} ({prop.reviewCount})
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#E2E8F0] dark:border-[#374151]">
                    <div>
                      <div className="text-[11px] text-[#64748B] dark:text-[#9CA3AF]">Starting from</div>
                      <div className="text-base font-bold font-mono-num text-[#111827] dark:text-[#F9FAFB]">
                        {formatINR(prop.defaultRent)}/mo
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        switchDemoRole('TENANT');
                        navigate(`/tenant/explore?property=${prop.id}`);
                      }}
                      className="px-3.5 py-2 rounded-lg bg-[#047857] hover:bg-[#065F46] dark:bg-[#34D399] dark:hover:bg-[#10B981] text-white dark:text-[#0B1220] text-xs font-semibold transition-colors"
                    >
                      {availBeds} Beds Open
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits & How It Works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-4 sm:px-6 py-10 border-t border-[#E2E8F0] dark:border-[#374151]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-6">
            <h3 className="text-lg font-bold font-display text-[#111827] dark:text-[#F9FAFB]">
              For Tenants &amp; Working Professionals
            </h3>
            <p className="text-sm text-[#64748B] dark:text-[#9CA3AF] mt-1">
              Find trusted accommodation and organize every rupee of monthly living costs.
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                'Search verified PGs by city, locality, sharing, food, and AC filters',
                'Join via published listings or reception QR code onboarding',
                'Track monthly rent invoices, receipts, food menus, parcels & notices',
                'Private Personal Expense Tracker, monthly budgets & roommate splits',
                'Discover local tiffins, laundries, and Bengaluru/Pune startup events',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#047857] dark:text-[#34D399] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div id="owners" className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-6">
            <h3 className="text-lg font-bold font-display text-[#111827] dark:text-[#F9FAFB]">
              For PG Owners &amp; Operators
            </h3>
            <p className="text-sm text-[#64748B] dark:text-[#9CA3AF] mt-1">
              Register your property in five guided steps and manage daily operations cleanly.
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                '5-step onboarding with GPS capture and 4 overall property photos first',
                'Unlock floors, rooms, bathrooms, and bed vacancy tracking after verification',
                'Review joining requests, assign available beds, and issue QR links',
                'Collect rent, manage security deposits, and track business expenses',
                'Handle complaints, weekly mess menus, notices, parcels, and staff tasks',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-[#047857] dark:text-[#34D399] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-6xl px-4 sm:px-6 py-10 border-t border-[#E2E8F0] dark:border-[#374151]">
        <h2 className="text-xl font-bold font-display text-[#111827] dark:text-[#F9FAFB] mb-5">
          Frequently Asked Questions
        </h2>
        <div className="divide-y divide-[#E2E8F0] dark:divide-[#374151] rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827]">
          {FAQS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left text-sm font-semibold text-[#111827] dark:text-[#F9FAFB]"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-sm text-[#64748B] dark:text-[#9CA3AF] leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="border-t border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#64748B] dark:text-[#9CA3AF]">
          <div>
            <span className="font-semibold text-[#111827] dark:text-[#F9FAFB]">PG Finder</span> · Bengaluru, India · support@pgfinder.in · +91 80 4120 8800
          </div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setLegalModal('privacy')} className="hover:underline">
              Privacy Policy
            </button>
            <button type="button" onClick={() => setLegalModal('terms')} className="hover:underline">
              Terms &amp; Conditions
            </button>
            <button type="button" onClick={() => navigate('/auth')} className="hover:underline">
              Account Login
            </button>
          </div>
        </div>
      </footer>

      <ModalSheet
        open={legalModal !== null}
        onClose={() => setLegalModal(null)}
        title={legalModal === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
      >
        <div className="space-y-3 text-sm text-[#64748B] dark:text-[#9CA3AF] leading-relaxed">
          {legalModal === 'privacy' ? (
            <>
              <p>
                PG Finder collects only the details required to verify paying guest properties, facilitate tenant stay agreements, and support personal financial tracking.
              </p>
              <p>
                Personal expenses entered in the Tenant Expense Tracker remain strictly private to the tenant and are never exposed to PG owners or advertisers.
              </p>
              <p>
                Private property verification documents are restricted to authorized verification administrators and are never published in public listings.
              </p>
            </>
          ) : (
            <>
              <p>
                All PG listings must pass independent property approval and GPS location verification before becoming eligible for public discovery or QR onboarding.
              </p>
              <p>
                Rent, security deposit, and checkout settlements follow the documented terms agreed between the tenant and PG owner in Asia/Kolkata timezone and INR currency.
              </p>
            </>
          )}
        </div>
      </ModalSheet>
    </div>
  );
};
