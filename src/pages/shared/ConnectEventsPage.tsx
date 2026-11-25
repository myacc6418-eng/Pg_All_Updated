import React, { useMemo, useState } from 'react';
import { Bookmark, CalendarDays, ExternalLink, MapPin, Search, Users } from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import { ModalSheet, SafeImage } from '../../components/ui/Primitives';
import { formatIndianDateTime, formatINR } from '../../utils/formatters';
import { INDIAN_CITIES } from '../../data/demoData';
import { StartupEvent } from '../../types/pgfinder';

export const ConnectEventsPage: React.FC = () => {
  const {
    events,
    savedEventIds,
    rsvpedEventIds,
    waitlistedEventIds,
    toggleEventBookmark,
    toggleEventRsvp,
  } = usePGFinder();

  const [query, setQuery] = useState('');
  const [city, setCity] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState<StartupEvent | null>(null);

  const publishedEvents = useMemo(
    () =>
      events.filter((e) => {
        if (e.status !== 'Published') return false;
        if (city !== 'ALL' && e.city !== city) return false;
        if (category !== 'ALL' && e.category !== category) return false;
        if (query.trim() && !e.title.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      }),
    [events, city, category, query]
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold font-display">Connect — Startup Events</h1>
        <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
          Curated startup networking, founder meetups, workshops, and incubator events published by PG Finder.
        </p>
      </div>

      <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search startup events..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-xs"
          />
        </div>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-xs"
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
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-xs"
        >
          <option value="ALL">All Categories</option>
          {['Startup Networking', 'Entrepreneurship', 'Technology', 'AI and Innovation', 'Founder Meetups', 'Investor Events', 'Workshops', 'Hackathons'].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {publishedEvents.map((evt) => {
          const isSaved = savedEventIds.includes(evt.id);
          const isRsvped = rsvpedEventIds.includes(evt.id);
          const isWaitlisted = waitlistedEventIds.includes(evt.id);
          const isFull = evt.registeredCount >= evt.capacity;

          return (
            <div
              key={evt.id}
              className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] overflow-hidden flex flex-col"
            >
              <div onClick={() => setSelectedEvent(evt)} className="aspect-16/9 bg-slate-100 cursor-pointer">
                <SafeImage src={evt.imageUrl} alt={evt.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 flex-1 flex flex-col text-xs">
                <div className="flex items-center justify-between text-[#64748B] dark:text-[#9CA3AF]">
                  <span>
                    {evt.category} · {evt.mode}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleEventBookmark(evt.id)}
                    aria-label="Bookmark event"
                    className={isSaved ? 'text-[#047857] dark:text-[#34D399]' : 'text-[#64748B]'}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <h2
                  onClick={() => setSelectedEvent(evt)}
                  className="text-sm font-semibold mt-1 cursor-pointer hover:text-[#047857]"
                >
                  {evt.title}
                </h2>
                <div className="mt-1.5 text-[#64748B] dark:text-[#9CA3AF] space-y-1">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5 shrink-0" /> {formatIndianDateTime(evt.dateTime)}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{evt.venue}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono-num">
                    <Users className="w-3.5 h-3.5 shrink-0" /> {evt.registeredCount}/{evt.capacity} seats
                  </div>
                </div>

                <div className="mt-auto pt-3 flex items-center justify-between border-t border-[#E2E8F0] dark:border-[#374151]">
                  <span className="font-bold font-mono-num">
                    {evt.isFree ? 'Free RSVP' : formatINR(evt.priceInr || 0)}
                  </span>
                  {evt.isFree ? (
                    <button
                      type="button"
                      onClick={() => toggleEventRsvp(evt.id)}
                      className={`px-3 py-1.5 rounded-lg font-semibold ${
                        isRsvped
                          ? 'border border-[#047857] text-[#047857] dark:border-[#34D399] dark:text-[#34D399]'
                          : 'bg-[#047857] text-white dark:bg-[#34D399] dark:text-[#0B1220]'
                      }`}
                    >
                      {isRsvped ? 'Cancel RSVP' : isFull ? (isWaitlisted ? 'Waitlisted' : 'Join Waitlist') : 'Free RSVP'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedEvent(evt)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] font-semibold"
                    >
                      Official Link <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ModalSheet
        open={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || ''}
        subtitle={selectedEvent ? `${selectedEvent.organizer} · ${selectedEvent.city}` : ''}
      >
        {selectedEvent && (
          <div className="space-y-3 text-xs">
            <p className="text-sm text-[#64748B] dark:text-[#9CA3AF]">{selectedEvent.description}</p>
            <div>
              <strong>Speakers:</strong> {selectedEvent.speakers.join(', ')}
            </div>
            <div>
              <strong>Agenda:</strong>
              <ul className="mt-1 space-y-1 text-[#64748B] dark:text-[#9CA3AF]">
                {selectedEvent.agenda.map((a) => (
                  <li key={a}>• {a}</li>
                ))}
              </ul>
            </div>
            {!selectedEvent.isFree && selectedEvent.externalUrl && (
              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#1F2937] text-[#64748B]">
                Paid event tickets are handled externally at: <span className="font-mono-num">{selectedEvent.externalUrl}</span>
              </div>
            )}
          </div>
        )}
      </ModalSheet>
    </div>
  );
};
