import React from 'react';
import { usePGFinder } from '../../context/PGFinderContext';
import { StatusText } from '../../components/ui/Primitives';

export const AdminPropertiesPage: React.FC = () => {
  const { properties, rooms, beds, stays } = usePGFinder();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold font-display">All Properties &amp; Inventory Oversight</h1>
        <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
          Platform-wide property statuses and bed occupancy oversight (bed assignments remain strictly owner-controlled).
        </p>
      </div>

      <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B] dark:text-[#9CA3AF]">
              <th className="py-2 pr-3 font-medium">Property</th>
              <th className="py-2 pr-3 font-medium">Owner</th>
              <th className="py-2 pr-3 font-medium">Approval</th>
              <th className="py-2 pr-3 font-medium">Location GPS</th>
              <th className="py-2 pr-3 font-medium">Listing</th>
              <th className="py-2 pr-3 font-medium text-right">Rooms / Beds</th>
              <th className="py-2 font-medium text-right">Active Stays</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
            {properties.map((p) => {
              const pRooms = rooms.filter((r) => r.propertyId === p.id).length;
              const pBeds = beds.filter((b) => b.propertyId === p.id);
              const pStays = stays.filter((s) => s.propertyId === p.id && s.status === 'Active').length;
              return (
                <tr key={p.id}>
                  <td className="py-3 pr-3">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-[11px] text-[#64748B]">
                      {p.locality}, {p.city}
                    </div>
                  </td>
                  <td className="py-3 pr-3">{p.ownerName}</td>
                  <td className="py-3 pr-3">
                    <StatusText status={p.approvalStatus} />
                  </td>
                  <td className="py-3 pr-3">
                    <StatusText status={p.locationVerificationStatus} />
                  </td>
                  <td className="py-3 pr-3">
                    <StatusText status={p.listingStatus} />
                  </td>
                  <td className="py-3 pr-3 text-right font-mono-num">
                    {pRooms} / {pBeds.length}
                  </td>
                  <td className="py-3 text-right font-mono-num">{pStays}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
