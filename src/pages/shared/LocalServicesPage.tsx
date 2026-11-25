import React, { useState } from 'react';
import { Clock, MapPin, Phone } from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import { INDIAN_CITIES } from '../../data/demoData';

const LOCAL_CATEGORIES = [
  'ALL',
  'Restaurants',
  'Tiffin Centers',
  'Grocery Stores',
  'Laundry',
  'Gyms',
  'Transportation',
  'Stationery',
  'Mobile Repair',
  'Essential Services',
];

export const LocalServicesPage: React.FC = () => {
  const { localBusinesses, selectedCity, setSelectedCity } = usePGFinder();
  const [category, setCategory] = useState('ALL');
  const [locality, setLocality] = useState('');

  const filtered = localBusinesses.filter((b) => {
    if (b.city !== selectedCity) return false;
    if (category !== 'ALL' && b.category !== category) return false;
    if (locality.trim() && !b.locality.toLowerCase().includes(locality.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold font-display">PG Finder Local</h1>
        <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
          Discover neighborhood tiffins, laundries, gyms, and essential services by selected city &amp; locality (precise tenant GPS is never shared with advertisers).
        </p>
      </div>

      <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
        >
          {INDIAN_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={locality}
          onChange={(e) => setLocality(e.target.value)}
          placeholder="Filter by locality (e.g., Koramangala)..."
          className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
        >
          {LOCAL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c === 'ALL' ? 'All Categories' : c}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-8 text-center text-xs text-[#64748B]">
          No local services listed in {selectedCity} for this filter yet. Try switching city to Bengaluru or Pune.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((biz) => (
            <div
              key={biz.id}
              className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#64748B] dark:text-[#9CA3AF]">{biz.category}</span>
                {biz.isSponsored && (
                  <span className="font-semibold text-[#D97706] dark:text-[#FBBF24]">Sponsored</span>
                )}
              </div>
              <h2 className="text-base font-semibold">{biz.name}</h2>
              <p className="text-[#64748B] dark:text-[#9CA3AF]">{biz.description}</p>
              <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#374151] flex flex-wrap gap-4 text-[#64748B] dark:text-[#9CA3AF]">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {biz.locality}, {biz.city}
                </span>
                <span className="inline-flex items-center gap-1 font-mono-num">
                  <Phone className="w-3.5 h-3.5" /> {biz.contact}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {biz.hours}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
