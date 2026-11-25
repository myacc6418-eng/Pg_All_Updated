import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, LogOut } from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import { ActionBtn, StatusText, ThemeSwitch } from '../../components/ui/Primitives';
import { formatINR } from '../../utils/formatters';
import { ComplaintItem, StaffMember } from '../../types/pgfinder';

type Section = 'complaints' | 'food' | 'notices' | 'parcels' | 'staff' | 'subscription' | 'profile';

export const OwnerMorePage: React.FC = () => {
  const {
    currentUser,
    properties,
    foodMenu,
    updateFoodMenuDay,
    complaints,
    updateComplaintStatus,
    notices,
    createNotice,
    parcels,
    addParcel,
    updateParcelStatus,
    staff,
    addStaffMember,
    stays,
    ownerSelectedPropertyId,
    setOwnerSelectedPropertyId,
    logout,
  } = usePGFinder();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSection = (searchParams.get('section') as Section) || 'complaints';
  const [section, setSection] = useState<Section>(
    ['complaints', 'food', 'notices', 'parcels', 'staff', 'subscription', 'profile'].includes(initialSection)
      ? initialSection
      : 'complaints'
  );

  useEffect(() => {
    const pid = searchParams.get('propertyId');
    if (pid) setOwnerSelectedPropertyId(pid);
    const sec = searchParams.get('section') as Section | null;
    if (sec === ('tracking' as string)) {
      navigate('/owner/tracking');
      return;
    }
    if (sec && ['complaints', 'food', 'notices', 'parcels', 'staff', 'subscription', 'profile'].includes(sec)) {
      setSection(sec);
    }
  }, [searchParams, setOwnerSelectedPropertyId, navigate]);

  const ownerProps = useMemo(
    () => properties.filter((p) => p.ownerId === (currentUser?.id || 'usr-owner-1') && !p.archived),
    [properties, currentUser]
  );
  const scopedPropIds = useMemo(
    () => (ownerSelectedPropertyId === 'ALL' ? ownerProps.map((p) => p.id) : [ownerSelectedPropertyId]),
    [ownerSelectedPropertyId, ownerProps]
  );

  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMsg, setNoticeMsg] = useState('');
  const [noticePropId, setNoticePropId] = useState(ownerProps[0]?.id || 'prop-1');

  const [parcelDesc, setParcelDesc] = useState('');
  const [parcelTenantId, setParcelTenantId] = useState('usr-tenant-1');

  const [staffName, setStaffName] = useState('');
  const [staffMobile, setStaffMobile] = useState('');
  const [staffRole, setStaffRole] = useState<StaffMember['role']>('Housekeeping');
  const [staffSalary, setStaffSalary] = useState('16000');

  const [planNotice, setPlanNotice] = useState('');

  const switchSection = (s: Section) => {
    setSection(s);
    setSearchParams({
      section: s,
      ...(ownerSelectedPropertyId !== 'ALL' ? { propertyId: ownerSelectedPropertyId } : {}),
    });
  };

  const navButtons: { id: Section; label: string }[] = [
    { id: 'complaints', label: 'Complaints' },
    { id: 'food', label: 'Food & Mess' },
    { id: 'notices', label: 'Notices' },
    { id: 'parcels', label: 'Parcels' },
    { id: 'staff', label: 'Staff Management' },
    { id: 'subscription', label: 'Plans & Listing' },
    { id: 'profile', label: 'Quick Settings' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-display">Daily Operations, Staff &amp; Plans</h1>
          <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
            Manage complaints, weekly mess menus, tenant notices, parcel handovers, staff, and subscription slots.
          </p>
        </div>

        <select
          value={ownerSelectedPropertyId}
          onChange={(e) => setOwnerSelectedPropertyId(e.target.value)}
          aria-label="Filter by property"
          className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] text-xs font-medium self-start"
        >
          <option value="ALL">All Properties ({ownerProps.length})</option>
          {ownerProps.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {navButtons.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => switchSection(b.id)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 ${
              section === b.id
                ? 'bg-[#047857] text-white dark:bg-[#34D399] dark:text-[#0B1220]'
                : 'bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#374151] text-[#64748B] dark:text-[#9CA3AF]'
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {section === 'complaints' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
                <th className="py-2 pr-3 font-medium">Complaint</th>
                <th className="py-2 pr-3 font-medium">Resident &amp; Room</th>
                <th className="py-2 pr-3 font-medium">Category / Priority</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 font-medium text-right">Update &amp; Assign Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
              {complaints
                .filter((c) => scopedPropIds.includes(c.propertyId))
                .map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 pr-3 max-w-[260px]">
                      <div className="font-semibold">{c.title}</div>
                      <div className="text-[11px] text-[#64748B] line-clamp-1">{c.description}</div>
                    </td>
                    <td className="py-2.5 pr-3 whitespace-nowrap">
                      <div>{c.tenantName}</div>
                      <div className="text-[11px] text-[#64748B]">
                        {properties.find((p) => p.id === c.propertyId)?.name} · Room {c.roomNumber}
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 whitespace-nowrap">
                      {c.category} · {c.priority}
                    </td>
                    <td className="py-2.5 pr-3">
                      <StatusText status={c.status} />
                    </td>
                    <td className="py-2.5 text-right min-w-[260px]">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <select
                          value={c.status}
                          onChange={(e) =>
                            updateComplaintStatus(c.id, e.target.value as ComplaintItem['status'], c.assignedStaff, c.ownerResponse)
                          }
                          className="h-8 px-2 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                        >
                          {['Open', 'Acknowledged', 'In Progress', 'Resolved', 'Closed', 'Reopened'].map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                        <select
                          value={c.assignedStaff || ''}
                          onChange={(e) => updateComplaintStatus(c.id, c.status, e.target.value, c.ownerResponse)}
                          className="h-8 px-2 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                        >
                          <option value="">Assign staff...</option>
                          {staff.map((stf) => (
                            <option key={stf.id} value={`${stf.name} (${stf.role})`}>
                              {stf.name} ({stf.role})
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {section === 'food' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3 text-xs">
          <h2 className="text-sm font-semibold">Weekly Mess Menu Editor</h2>
          <div className="space-y-2.5">
            {foodMenu.map((d) => (
              <div key={d.day} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151]">
                <div className="font-semibold flex items-center">{d.day}</div>
                <input
                  type="text"
                  value={d.breakfast}
                  onChange={(e) => updateFoodMenuDay(d.day, { breakfast: e.target.value })}
                  className="h-8 px-2 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                />
                <input
                  type="text"
                  value={d.lunch}
                  onChange={(e) => updateFoodMenuDay(d.day, { lunch: e.target.value })}
                  className="h-8 px-2 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                />
                <input
                  type="text"
                  value={d.dinner}
                  onChange={(e) => updateFoodMenuDay(d.day, { dinner: e.target.value })}
                  className="h-8 px-2 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'notices' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!noticeTitle.trim() || !noticeMsg.trim()) return;
              createNotice({
                propertyId: noticePropId,
                title: noticeTitle.trim(),
                message: noticeMsg.trim(),
                audience: 'All Tenants',
                priority: 'Important',
              });
              setNoticeTitle('');
              setNoticeMsg('');
            }}
            className="lg:col-span-5 rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3"
          >
            <h2 className="text-sm font-semibold">Publish Notice</h2>
            <select
              value={noticePropId}
              onChange={(e) => setNoticePropId(e.target.value)}
              className="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            >
              {ownerProps.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={noticeTitle}
              onChange={(e) => setNoticeTitle(e.target.value)}
              placeholder="Notice headline"
              className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            />
            <textarea
              rows={3}
              value={noticeMsg}
              onChange={(e) => setNoticeMsg(e.target.value)}
              placeholder="Announcement details..."
              className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            />
            <button type="submit" className="w-full h-9 rounded-xl bg-[#047857] text-white font-semibold">
              Publish to Tenants
            </button>
          </form>

          <div className="lg:col-span-7 rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 overflow-x-auto">
            <h2 className="text-sm font-semibold mb-3">Published Notices</h2>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
                  <th className="py-2 pr-3 font-medium">PG Name</th>
                  <th className="py-2 pr-3 font-medium">Title &amp; Message</th>
                  <th className="py-2 pr-3 font-medium font-mono-num">Published</th>
                  <th className="py-2 font-medium font-mono-num">Reads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
                {notices
                  .filter((n) => scopedPropIds.includes(n.propertyId))
                  .map((n) => (
                    <tr key={n.id}>
                      <td className="py-2.5 pr-3">{properties.find((p) => p.id === n.propertyId)?.name}</td>
                      <td className="py-2.5 pr-3">
                        <div className="font-semibold">{n.title}</div>
                        <div className="text-[11px] text-[#64748B]">{n.message}</div>
                      </td>
                      <td className="py-2.5 pr-3 font-mono-num">{n.publishedAt}</td>
                      <td className="py-2.5 font-mono-num">{n.readByTenantIds.length}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {section === 'parcels' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3 text-xs">
          <h2 className="text-sm font-semibold">Parcel Desk Log</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!parcelDesc.trim()) return;
              const tStay = stays.find((s) => s.tenantId === parcelTenantId);
              addParcel({
                propertyId: tStay?.propertyId || ownerProps[0]?.id || 'prop-1',
                tenantId: parcelTenantId,
                tenantName: tStay?.tenantName || 'Aarav Sharma',
                description: parcelDesc.trim(),
                instructions: 'Collect from Ground Floor Reception',
                status: 'Ready for Collection',
              });
              setParcelDesc('');
            }}
            className="flex flex-wrap gap-2"
          >
            <select
              value={parcelTenantId}
              onChange={(e) => setParcelTenantId(e.target.value)}
              className="h-9 px-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            >
              {stays
                .filter((s) => scopedPropIds.includes(s.propertyId))
                .map((s) => (
                  <option key={s.id} value={s.tenantId}>
                    {s.tenantName}
                  </option>
                ))}
            </select>
            <input
              type="text"
              value={parcelDesc}
              onChange={(e) => setParcelDesc(e.target.value)}
              placeholder="Courier & description (e.g., Flipkart Box)"
              className="flex-1 h-9 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            />
            <button type="submit" className="px-3.5 h-9 rounded-lg bg-[#047857] text-white font-semibold">
              Log Parcel
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
                  <th className="py-2 pr-3 font-medium">Tenant</th>
                  <th className="py-2 pr-3 font-medium">Parcel Details</th>
                  <th className="py-2 pr-3 font-medium font-mono-num">Received At</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 font-medium text-right">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
                {parcels
                  .filter((p) => scopedPropIds.includes(p.propertyId))
                  .map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 pr-3 font-semibold">{p.tenantName}</td>
                      <td className="py-2.5 pr-3">{p.description}</td>
                      <td className="py-2.5 pr-3 font-mono-num">{p.receivedAt}</td>
                      <td className="py-2.5 pr-3"><StatusText status={p.status} /></td>
                      <td className="py-2.5 text-right">
                        <select
                          value={p.status}
                          onChange={(e) => updateParcelStatus(p.id, e.target.value as typeof p.status)}
                          className="h-8 px-2 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
                        >
                          <option value="Received">Received</option>
                          <option value="Ready for Collection">Ready for Collection</option>
                          <option value="Collected">Collected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {section === 'staff' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3 text-xs">
          <div>
            <h2 className="text-sm font-semibold">Staff Directory (Business Plan Module)</h2>
            <p className="text-[#64748B]">Staff operate as restricted owner subaccounts, not a separate public role.</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!staffName.trim()) return;
              addStaffMember({
                ownerId: currentUser?.id || 'usr-owner-1',
                propertyId: ownerSelectedPropertyId !== 'ALL' ? ownerSelectedPropertyId : ownerProps[0]?.id || 'prop-1',
                name: staffName.trim(),
                mobile: staffMobile.trim() || '+91 98450 00000',
                role: staffRole,
                salary: Number(staffSalary) || 15000,
                attendancePct: 100,
                activeTasks: 0,
                status: 'Active',
              });
              setStaffName('');
              setStaffMobile('');
            }}
            className="grid grid-cols-1 sm:grid-cols-5 gap-2"
          >
            <input
              type="text"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="Staff name"
              className="h-9 px-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            />
            <input
              type="text"
              value={staffMobile}
              onChange={(e) => setStaffMobile(e.target.value)}
              placeholder="Mobile"
              className="h-9 px-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            />
            <select
              value={staffRole}
              onChange={(e) => setStaffRole(e.target.value as StaffMember['role'])}
              className="h-9 px-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            >
              {['Property Manager', 'Receptionist', 'Cook', 'Housekeeping', 'Security', 'Maintenance Staff'].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={staffSalary}
              onChange={(e) => setStaffSalary(e.target.value)}
              placeholder="Salary INR"
              className="h-9 px-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num"
            />
            <button type="submit" className="h-9 rounded-lg bg-[#047857] text-white font-semibold">
              Add Staff
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-[#374151] text-[#64748B]">
                  <th className="py-2 pr-3 font-medium">Staff Member</th>
                  <th className="py-2 pr-3 font-medium">Role &amp; PG</th>
                  <th className="py-2 pr-3 font-medium font-mono-num">Attendance</th>
                  <th className="py-2 pr-3 font-medium font-mono-num">Monthly Salary</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#374151]">
                {staff
                  .filter((stf) => scopedPropIds.includes(stf.propertyId))
                  .map((stf) => (
                    <tr key={stf.id}>
                      <td className="py-2.5 pr-3">
                        <div className="font-semibold">{stf.name}</div>
                        <div className="text-[11px] text-[#64748B] font-mono-num">{stf.mobile}</div>
                      </td>
                      <td className="py-2.5 pr-3">
                        {stf.role} · {properties.find((p) => p.id === stf.propertyId)?.name}
                      </td>
                      <td className="py-2.5 pr-3 font-mono-num">{stf.attendancePct}% ({stf.activeTasks} tasks)</td>
                      <td className="py-2.5 pr-3 font-mono-num font-semibold">{formatINR(stf.salary)}/mo</td>
                      <td className="py-2.5"><StatusText status={stf.status} /></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {section === 'subscription' && (
        <div className="space-y-4 text-xs">
          {planNotice && (
            <div className="p-3 rounded-xl border border-[#D97706]/40 bg-[#D97706]/10 text-[#111827] dark:text-[#F9FAFB]">
              {planNotice}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: 'Basic',
                price: '₹0/month',
                target: 'For single-PG internal operations',
                features: [
                  'Add properties, approvals & QR onboarding',
                  'Rooms, beds, tenant stays & rent collection',
                  'Owner expense tracker & complaints',
                  'Future ₹299 one-time listing fee per eligible PG',
                ],
              },
              {
                name: 'Pro',
                price: '₹199/month',
                target: 'For growing PG operators',
                features: [
                  'Everything in Basic',
                  'Up to 5 subscription-covered public listings',
                  'Advanced tracking center & rent reminders',
                  'Dues reports & maintenance follow-ups',
                ],
              },
              {
                name: 'Business',
                price: '₹499/month',
                target: 'For multi-property teams',
                features: [
                  'Everything in Pro',
                  'Up to 20 subscription-covered public listings',
                  'Staff roles, attendance & task management',
                  'Bulk reminders & priority support',
                ],
              },
            ].map((pl) => (
              <div
                key={pl.name}
                className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="text-sm font-bold font-display">{pl.name}</div>
                  <div className="text-lg font-bold font-mono-num text-[#047857] dark:text-[#34D399] mt-1">
                    {pl.price}
                  </div>
                  <div className="text-[#64748B] mt-0.5">{pl.target}</div>
                  <ul className="mt-3 space-y-1.5">
                    {pl.features.map((f) => (
                      <li key={f} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#047857] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPlanNotice(
                      `Payment gateway is not configured in UI prototype mode. ${pl.name} entitlement changes will use verified payment webhooks in production.`
                    )
                  }
                  className="mt-4 w-full py-2 rounded-xl border border-[#047857] text-[#047857] dark:border-[#34D399] dark:text-[#34D399] font-semibold"
                >
                  {currentUser?.subscriptionPlan === pl.name ? 'Current Plan (Demo)' : `Select ${pl.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'profile' && (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">{currentUser?.name}</div>
              <div className="text-[#64748B]">
                {currentUser?.email} · {currentUser?.mobile}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ActionBtn kind="view" label="Full Profile" onClick={() => navigate('/owner/profile')} />
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/auth');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] text-[#DC2626] font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0] dark:border-[#374151]">
            <span>Theme Preference</span>
            <ThemeSwitch />
          </div>
        </div>
      )}
    </div>
  );
};
