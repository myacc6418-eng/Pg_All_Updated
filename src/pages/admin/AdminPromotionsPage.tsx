import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Plus, Radio, Sparkles, Store } from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import {
  ActionBtn,
  ConfirmDialog,
  KpiCard,
  ModalSheet,
  StatusText,
} from '../../components/ui/Primitives';
import { AdminDataTable, TableColumn } from '../../components/ui/AdminDataTable';
import {
  AdvertiserAccount,
  FeaturedCampaign,
  LocalAdCampaign,
  LocalBusiness,
} from '../../types/pgfinder';
import { INDIAN_CITIES } from '../../data/demoData';
import { formatINR } from '../../utils/formatters';

const FEATURED_PACKAGES: {
  label: FeaturedCampaign['packageName'];
  price: number;
}[] = [
  { label: 'Starter Boost (₹299)', price: 299 },
  { label: 'City Spotlight (₹799)', price: 799 },
  { label: 'Metro Premier (₹1,999)', price: 1999 },
];

const FEATURED_PLACEMENTS: FeaturedCampaign['placement'][] = [
  'Home Featured',
  'Explore Top Carousel',
  'City Search Top',
  'Locality Spotlight',
  'Suggested PGs',
];

const LOCAL_CATEGORIES: LocalBusiness['category'][] = [
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

export const AdminPromotionsPage: React.FC<{
  forcedSection?: 'featured' | 'local-ads';
}> = ({ forcedSection }) => {
  const {
    properties,
    featuredCampaigns,
    saveFeaturedCampaign,
    updateFeaturedCampaignStatus,
    deleteFeaturedCampaign,
    advertisers,
    localAdCampaigns,
    saveAdvertiser,
    updateAdvertiserStatus,
    saveLocalAdCampaign,
    updateLocalAdStatus,
    deleteLocalAdCampaign,
  } = usePGFinder();

  const navigate = useNavigate();
  const [section, setSection] = useState<'featured' | 'local-ads'>(forcedSection || 'featured');
  const activeSection = forcedSection || section;

  const [banner, setBanner] = useState('');

  // Featured PG modal
  const [featModalOpen, setFeatModalOpen] = useState(false);
  const [editingFeat, setEditingFeat] = useState<FeaturedCampaign | null>(null);
  const [fPropId, setFPropId] = useState('');
  const [fPackage, setFPackage] = useState<FeaturedCampaign['packageName']>('Starter Boost (₹299)');
  const [fPlacement, setFPlacement] = useState<FeaturedCampaign['placement']>('Home Featured');
  const [fStart, setFStart] = useState('2026-11-26');
  const [fEnd, setFEnd] = useState('2026-12-26');
  const [fWeight, setFWeight] = useState('5');
  const [fPayStatus, setFPayStatus] = useState<FeaturedCampaign['paymentStatus']>('Pending Demo');
  const [fStatus, setFStatus] = useState<FeaturedCampaign['status']>('Draft');
  const [detailFeat, setDetailFeat] = useState<FeaturedCampaign | null>(null);
  const [deleteFeatTarget, setDeleteFeatTarget] = useState<FeaturedCampaign | null>(null);

  // Local Ads tabs & modals
  const [adTab, setAdTab] = useState<
    'all' | 'Active' | 'Pending Approval' | 'Draft' | 'Paused' | 'Expired' | 'Rejected' | 'advertisers'
  >('all');
  const [advModalOpen, setAdvModalOpen] = useState(false);
  const [editingAdv, setEditingAdv] = useState<AdvertiserAccount | null>(null);
  const [aBiz, setABiz] = useState('');
  const [aContact, setAContact] = useState('');
  const [aMobile, setAMobile] = useState('');
  const [aEmail, setAEmail] = useState('');
  const [aCity, setACity] = useState('Bengaluru');
  const [aLocality, setALocality] = useState('');
  const [aCat, setACat] = useState<LocalBusiness['category']>('Tiffin Centers');

  const [adModalOpen, setAdModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<LocalAdCampaign | null>(null);
  const [adAdvId, setAdAdvId] = useState('');
  const [adTitle, setAdTitle] = useState('');
  const [adCat, setAdCat] = useState<LocalBusiness['category']>('Tiffin Centers');
  const [adDesc, setAdDesc] = useState('');
  const [adCta, setAdCta] = useState('View Offer');
  const [adUrl, setAdUrl] = useState('https://');
  const [adUrlErr, setAdUrlErr] = useState('');
  const [adCity, setAdCity] = useState('Bengaluru');
  const [adLocality, setAdLocality] = useState('');
  const [adPlacement, setAdPlacement] = useState<LocalAdCampaign['placement']>('PG Finder Local');
  const [adStart, setAdStart] = useState('2026-11-26');
  const [adEnd, setAdEnd] = useState('2026-12-26');
  const [adPrice, setAdPrice] = useState('1499');
  const [adStatus, setAdStatus] = useState<LocalAdCampaign['status']>('Pending Approval');
  const [deleteAdTarget, setDeleteAdTarget] = useState<LocalAdCampaign | null>(null);

  // Strictly eligible properties for Featured PGs: APPROVED + VERIFIED + non-archived
  const eligibleProperties = useMemo(
    () =>
      properties.filter(
        (p) =>
          !p.archived &&
          p.approvalStatus === 'APPROVED' &&
          p.locationVerificationStatus === 'VERIFIED'
      ),
    [properties]
  );

  const featuredKpis = useMemo(() => {
    const active = featuredCampaigns.filter((c) => c.status === 'Active').length;
    const scheduled = featuredCampaigns.filter((c) => c.status === 'Scheduled').length;
    const paused = featuredCampaigns.filter((c) => c.status === 'Paused').length;
    const expired = featuredCampaigns.filter((c) => c.status === 'Expired').length;
    const demoRev = featuredCampaigns
      .filter((c) => c.paymentStatus === 'Confirmed Demo')
      .reduce((s, c) => s + c.priceInr, 0);
    return { total: featuredCampaigns.length, active, scheduled, paused, expired, demoRev };
  }, [featuredCampaigns]);

  const adKpis = useMemo(() => {
    const active = localAdCampaigns.filter((a) => a.status === 'Active').length;
    const pending = localAdCampaigns.filter((a) => a.status === 'Pending Approval').length;
    const paused = localAdCampaigns.filter((a) => a.status === 'Paused').length;
    const impressions = localAdCampaigns.reduce((s, a) => s + a.impressions, 0);
    const clicks = localAdCampaigns.reduce((s, a) => s + a.clicks, 0);
    return {
      total: localAdCampaigns.length,
      active,
      pending,
      paused,
      advertisers: advertisers.length,
      ctr: impressions > 0 ? `${((clicks / impressions) * 100).toFixed(1)}%` : '0%',
    };
  }, [localAdCampaigns, advertisers]);

  const openCreateFeatured = () => {
    setEditingFeat(null);
    setFPropId(eligibleProperties[0]?.id || '');
    setFPackage('Starter Boost (₹299)');
    setFPlacement('Home Featured');
    setFStart('2026-11-26');
    setFEnd('2026-12-26');
    setFWeight('5');
    setFPayStatus('Pending Demo');
    setFStatus('Draft');
    setFeatModalOpen(true);
  };

  const openEditFeatured = (c: FeaturedCampaign) => {
    setEditingFeat(c);
    setFPropId(c.propertyId);
    setFPackage(c.packageName);
    setFPlacement(c.placement);
    setFStart(c.startDate);
    setFEnd(c.endDate);
    setFWeight(String(c.priorityWeight));
    setFPayStatus(c.paymentStatus);
    setFStatus(c.status);
    setFeatModalOpen(true);
  };

  const openCreateAdv = () => {
    setEditingAdv(null);
    setABiz('');
    setAContact('');
    setAMobile('');
    setAEmail('');
    setACity('Bengaluru');
    setALocality('');
    setACat('Tiffin Centers');
    setAdvModalOpen(true);
  };

  const openEditAdv = (a: AdvertiserAccount) => {
    setEditingAdv(a);
    setABiz(a.businessName);
    setAContact(a.contactPerson);
    setAMobile(a.mobile);
    setAEmail(a.email);
    setACity(a.city);
    setALocality(a.locality);
    setACat(a.category);
    setAdvModalOpen(true);
  };

  const openCreateAd = () => {
    setEditingAd(null);
    setAdAdvId(advertisers[0]?.id || '');
    setAdTitle('');
    setAdCat('Tiffin Centers');
    setAdDesc('');
    setAdCta('View Offer');
    setAdUrl('https://');
    setAdUrlErr('');
    setAdCity('Bengaluru');
    setAdLocality('');
    setAdPlacement('PG Finder Local');
    setAdStart('2026-11-26');
    setAdEnd('2026-12-26');
    setAdPrice('1499');
    setAdStatus('Pending Approval');
    setAdModalOpen(true);
  };

  const openEditAd = (ad: LocalAdCampaign) => {
    setEditingAd(ad);
    setAdAdvId(ad.advertiserId);
    setAdTitle(ad.title);
    setAdCat(ad.category);
    setAdDesc(ad.description);
    setAdCta(ad.ctaText);
    setAdUrl(ad.destinationUrl);
    setAdUrlErr('');
    setAdCity(ad.targetCity);
    setAdLocality(ad.targetLocality);
    setAdPlacement(ad.placement);
    setAdStart(ad.startDate);
    setAdEnd(ad.endDate);
    setAdPrice(String(ad.packagePriceInr));
    setAdStatus(ad.status);
    setAdModalOpen(true);
  };

  const featColumns: TableColumn<FeaturedCampaign>[] = [
    {
      key: 'propertyName',
      label: 'Property & Owner',
      sortable: true,
      sortValue: (c) => c.propertyName,
      csvValue: (c) => `${c.propertyName} (${c.ownerName})`,
      render: (c) => (
        <div>
          <div className="font-semibold">{c.propertyName}</div>
          <div className="text-[11px] text-[#64748B]">{c.ownerName} · {c.locality}, {c.city}</div>
        </div>
      ),
    },
    {
      key: 'packageName',
      label: 'Package & Placement',
      sortable: true,
      sortValue: (c) => c.priceInr,
      csvValue: (c) => `${c.packageName} · ${c.placement}`,
      render: (c) => (
        <div>
          <div className="font-medium">{c.packageName}</div>
          <div className="text-[11px] text-[#64748B]">{c.placement} · Weight {c.priorityWeight}</div>
        </div>
      ),
    },
    {
      key: 'endDate',
      label: 'Schedule',
      sortable: true,
      sortValue: (c) => c.endDate,
      csvValue: (c) => `${c.startDate} to ${c.endDate}`,
      render: (c) => (
        <span className="font-mono-num text-[11px] text-[#64748B]">
          {c.startDate} → {c.endDate}
        </span>
      ),
    },
    {
      key: 'impressions',
      label: 'Reach (Demo)',
      sortable: true,
      sortValue: (c) => c.impressions,
      csvValue: (c) => `${c.impressions} views / ${c.clicks} clicks`,
      render: (c) => (
        <span className="font-mono-num text-[11px]">
          {c.impressions} views · {c.clicks} clicks
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      label: 'Demo Billing',
      sortable: true,
      sortValue: (c) => c.paymentStatus,
      csvValue: (c) => c.paymentStatus,
      render: (c) => <StatusText status={c.paymentStatus === 'Confirmed Demo' ? 'Verified' : 'Pending'} />,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      sortValue: (c) => c.status,
      csvValue: (c) => c.status,
      render: (c) => <StatusText status={c.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1">
          <ActionBtn kind="view" compact onClick={() => setDetailFeat(c)} />
          <ActionBtn kind="edit" compact onClick={() => openEditFeatured(c)} />
          {c.status === 'Active' ? (
            <button
              type="button"
              onClick={() => updateFeaturedCampaignStatus(c.id, 'Paused')}
              className="px-2 py-1 rounded-lg border border-[#E2E8F0] dark:border-[#374151] font-medium"
            >
              Pause
            </button>
          ) : c.status !== 'Archived' ? (
            <button
              type="button"
              onClick={() => updateFeaturedCampaignStatus(c.id, 'Active')}
              className="px-2 py-1 rounded-lg border border-[#059669] text-[#059669] font-medium"
            >
              Activate
            </button>
          ) : null}
          <ActionBtn kind="delete" compact onClick={() => setDeleteFeatTarget(c)} />
        </div>
      ),
    },
  ];

  const filteredLocalAds = useMemo(() => {
    if (adTab === 'all' || adTab === 'advertisers') return localAdCampaigns;
    return localAdCampaigns.filter((a) => a.status === adTab);
  }, [localAdCampaigns, adTab]);

  const localAdColumns: TableColumn<LocalAdCampaign>[] = [
    {
      key: 'title',
      label: 'Campaign & Advertiser',
      sortable: true,
      sortValue: (a) => a.title,
      csvValue: (a) => `${a.title} (${a.advertiserName})`,
      render: (a) => (
        <div>
          <div className="font-semibold">{a.title}</div>
          <div className="text-[11px] text-[#64748B]">
            {a.advertiserName} · {a.category}
          </div>
        </div>
      ),
    },
    {
      key: 'targetCity',
      label: 'Target Area & Placement',
      sortable: true,
      sortValue: (a) => a.targetCity,
      csvValue: (a) => `${a.targetLocality}, ${a.targetCity} (${a.placement})`,
      render: (a) => (
        <div>
          <div>{a.targetLocality}, {a.targetCity}</div>
          <div className="text-[11px] text-[#64748B]">{a.placement}</div>
        </div>
      ),
    },
    {
      key: 'packagePriceInr',
      label: 'Package',
      sortable: true,
      sortValue: (a) => a.packagePriceInr,
      csvValue: (a) => a.packagePriceInr,
      render: (a) => <span className="font-mono-num font-semibold">{formatINR(a.packagePriceInr)}</span>,
    },
    {
      key: 'impressions',
      label: 'Performance',
      sortable: true,
      sortValue: (a) => a.impressions,
      csvValue: (a) => `${a.impressions} imp / ${a.clicks} clicks`,
      render: (a) => (
        <span className="font-mono-num text-[11px]">
          {a.impressions} imp · {a.clicks} clicks
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      sortValue: (a) => a.status,
      csvValue: (a) => a.status,
      render: (a) => <StatusText status={a.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (a) => (
        <div className="flex items-center justify-end gap-1">
          <ActionBtn kind="edit" compact onClick={() => openEditAd(a)} />
          {(a.status === 'Pending Approval' || a.status === 'Paused') && (
            <ActionBtn
              kind="approve"
              compact
              title="Approve & Activate"
              onClick={() => updateLocalAdStatus(a.id, 'Active')}
            />
          )}
          {a.status === 'Active' && (
            <button
              type="button"
              onClick={() => updateLocalAdStatus(a.id, 'Paused')}
              className="px-2 py-1 rounded-lg border border-[#E2E8F0] dark:border-[#374151] font-medium"
            >
              Pause
            </button>
          )}
          <ActionBtn kind="delete" compact onClick={() => setDeleteAdTarget(a)} />
        </div>
      ),
    },
  ];

  const advertiserColumns: TableColumn<AdvertiserAccount>[] = [
    {
      key: 'businessName',
      label: 'Business Name',
      sortable: true,
      sortValue: (a) => a.businessName,
      csvValue: (a) => a.businessName,
      render: (a) => (
        <div>
          <div className="font-semibold">{a.businessName}</div>
          <div className="text-[11px] text-[#64748B]">{a.category}</div>
        </div>
      ),
    },
    {
      key: 'contactPerson',
      label: 'Contact',
      sortable: true,
      sortValue: (a) => a.contactPerson,
      csvValue: (a) => `${a.contactPerson} | ${a.mobile}`,
      render: (a) => (
        <div>
          <div>{a.contactPerson}</div>
          <div className="font-mono-num text-[11px] text-[#64748B]">{a.mobile}</div>
        </div>
      ),
    },
    {
      key: 'city',
      label: 'Location',
      sortable: true,
      sortValue: (a) => a.city,
      csvValue: (a) => `${a.locality}, ${a.city}`,
      render: (a) => <span>{a.locality}, {a.city}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      sortValue: (a) => a.status,
      csvValue: (a) => a.status,
      render: (a) => <StatusText status={a.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (a) => (
        <div className="flex items-center justify-end gap-1">
          <ActionBtn kind="edit" compact onClick={() => openEditAdv(a)} />
          {a.status === 'Active' ? (
            <ActionBtn kind="suspend" compact onClick={() => updateAdvertiserStatus(a.id, 'Paused')} />
          ) : (
            <ActionBtn kind="restore" compact onClick={() => updateAdvertiserStatus(a.id, 'Active')} />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold font-display">
            {activeSection === 'featured'
              ? 'Featured PG Campaigns'
              : 'Local Business Ads & Advertisers'}
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-0.5">
            {activeSection === 'featured'
              ? 'Promote only Approved and GPS-Verified PG properties across Explore and Home placements.'
              : 'Manage direct PG Finder Local business sponsorships, distinct from Google AdMob SDK ad units.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!forcedSection && (
            <div className="flex items-center gap-1 p-1 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827]">
              <button
                type="button"
                onClick={() => setSection('featured')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  activeSection === 'featured'
                    ? 'bg-[#047857] text-white dark:bg-[#34D399] dark:text-[#0B1220]'
                    : 'text-[#64748B]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Featured PGs
              </button>
              <button
                type="button"
                onClick={() => setSection('local-ads')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  activeSection === 'local-ads'
                    ? 'bg-[#047857] text-white dark:bg-[#34D399] dark:text-[#0B1220]'
                    : 'text-[#64748B]'
                }`}
              >
                <Store className="w-3.5 h-3.5" /> Local Ads
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate('/admin/more?section=admob')}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] text-xs font-medium"
          >
            <Radio className="w-3.5 h-3.5 text-[#D97706]" /> View AdMob Config
          </button>

          {activeSection === 'featured' ? (
            <button
              type="button"
              onClick={openCreateFeatured}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[#047857] dark:bg-[#34D399] text-white dark:text-[#0B1220] text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Create Featured Campaign
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={openCreateAdv}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Advertiser
              </button>
              <button
                type="button"
                onClick={openCreateAd}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[#047857] dark:bg-[#34D399] text-white dark:text-[#0B1220] text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Create Local Ad
              </button>
            </div>
          )}
        </div>
      </div>

      {banner && (
        <div className="p-3 rounded-xl border border-[#059669]/30 bg-[#059669]/10 text-[#059669] dark:text-[#34D399] text-xs flex items-center justify-between gap-2">
          <span>{banner}</span>
          <button type="button" onClick={() => setBanner('')} className="font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {activeSection === 'featured' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard label="Total Campaigns" value={featuredKpis.total} />
            <KpiCard label="Active Featured" value={featuredKpis.active} tone="success" />
            <KpiCard label="Scheduled" value={featuredKpis.scheduled} tone="info" />
            <KpiCard label="Paused" value={featuredKpis.paused} tone="warning" />
            <KpiCard label="Expired" value={featuredKpis.expired} />
            <KpiCard label="Demo Confirmed Rev" value={formatINR(featuredKpis.demoRev)} tone="primary" />
          </div>

          <AdminDataTable
            data={featuredCampaigns}
            columns={featColumns}
            rowKey={(c) => c.id}
            searchPlaceholder="Search featured property, owner, city, package..."
            searchExtractor={(c) => `${c.propertyName} ${c.ownerName} ${c.city} ${c.locality} ${c.packageName}`}
            exportFilename="featured-pg-campaigns.csv"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] text-xs text-[#64748B]">
            Local Business Ads target broad City &amp; Locality context only (never individual tenant tracking) and are clearly badged as &ldquo;Sponsored&rdquo;. Managed separately from Google AdMob test units.
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard label="Total Local Ads" value={adKpis.total} onClick={() => setAdTab('all')} />
            <KpiCard label="Active Ads" value={adKpis.active} tone="success" onClick={() => setAdTab('Active')} />
            <KpiCard label="Pending Approval" value={adKpis.pending} tone="warning" onClick={() => setAdTab('Pending Approval')} />
            <KpiCard label="Paused" value={adKpis.paused} onClick={() => setAdTab('Paused')} />
            <KpiCard label="Advertisers" value={adKpis.advertisers} tone="info" onClick={() => setAdTab('advertisers')} />
            <KpiCard label="Avg CTR (Demo)" value={adKpis.ctr} tone="primary" />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {(
              [
                { id: 'all', label: 'All Ads' },
                { id: 'Active', label: 'Active' },
                { id: 'Pending Approval', label: 'Pending Approval' },
                { id: 'Draft', label: 'Drafts' },
                { id: 'Paused', label: 'Paused' },
                { id: 'Expired', label: 'Expired' },
                { id: 'Rejected', label: 'Rejected' },
                { id: 'advertisers', label: `Advertisers (${advertisers.length})` },
              ] as { id: typeof adTab; label: string }[]
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setAdTab(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 ${
                  adTab === t.id
                    ? 'bg-[#047857] text-white dark:bg-[#34D399] dark:text-[#0B1220]'
                    : 'bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#374151] text-[#64748B]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {adTab === 'advertisers' ? (
            <AdminDataTable
              data={advertisers}
              columns={advertiserColumns}
              rowKey={(a) => a.id}
              searchPlaceholder="Search advertiser business, contact, locality, city..."
              searchExtractor={(a) => `${a.businessName} ${a.contactPerson} ${a.city} ${a.locality}`}
              exportFilename="local-advertisers.csv"
            />
          ) : (
            <AdminDataTable
              data={filteredLocalAds}
              columns={localAdColumns}
              rowKey={(a) => a.id}
              searchPlaceholder="Search campaign title, advertiser, locality, city..."
              searchExtractor={(a) => `${a.title} ${a.advertiserName} ${a.targetCity} ${a.targetLocality}`}
              exportFilename="local-business-ads.csv"
            />
          )}
        </div>
      )}

      {/* Featured Campaign Create/Edit Modal */}
      <ModalSheet
        open={featModalOpen}
        onClose={() => setFeatModalOpen(false)}
        title={editingFeat ? 'Edit Featured PG Campaign' : 'Create Featured PG Campaign'}
        subtitle="Only Approved & GPS-Verified properties are eligible."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const prop = eligibleProperties.find((p) => p.id === fPropId);
            if (!prop) {
              setBanner('Select an Approved & GPS-Verified property.');
              return;
            }
            const pkg = FEATURED_PACKAGES.find((pk) => pk.label === fPackage) || FEATURED_PACKAGES[0];
            const res = saveFeaturedCampaign(
              {
                propertyId: prop.id,
                propertyName: prop.name,
                ownerId: prop.ownerId,
                ownerName: prop.ownerName,
                city: prop.city,
                locality: prop.locality,
                packageName: fPackage,
                placement: fPlacement,
                startDate: fStart,
                endDate: fEnd,
                priorityWeight: Number(fWeight) || 5,
                priceInr: pkg.price,
                paymentStatus: fPayStatus,
                status: fStatus,
              },
              editingFeat?.id
            );
            setBanner(res.message);
            if (res.ok) setFeatModalOpen(false);
          }}
          className="space-y-3 text-xs"
        >
          <div>
            <label className="block font-medium mb-1">Eligible Property *</label>
            <select
              value={fPropId}
              onChange={(e) => setFPropId(e.target.value)}
              className="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            >
              {eligibleProperties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.locality}, {p.city}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Package</label>
              <select
                value={fPackage}
                onChange={(e) => setFPackage(e.target.value as FeaturedCampaign['packageName'])}
                className="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                {FEATURED_PACKAGES.map((pk) => (
                  <option key={pk.label} value={pk.label}>{pk.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Placement</label>
              <select
                value={fPlacement}
                onChange={(e) => setFPlacement(e.target.value as FeaturedCampaign['placement'])}
                className="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                {FEATURED_PLACEMENTS.map((pl) => (
                  <option key={pl} value={pl}>{pl}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Start Date</label>
              <input type="date" required value={fStart} onChange={(e) => setFStart(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num" />
            </div>
            <div>
              <label className="block font-medium mb-1">End Date</label>
              <input type="date" required value={fEnd} onChange={(e) => setFEnd(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num" />
            </div>
            <div>
              <label className="block font-medium mb-1">Priority Weight (1-10)</label>
              <input type="number" min={1} max={10} value={fWeight} onChange={(e) => setFWeight(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num" />
            </div>
            <div>
              <label className="block font-medium mb-1">Billing State (Prototype)</label>
              <select
                value={fPayStatus}
                onChange={(e) => setFPayStatus(e.target.value as FeaturedCampaign['paymentStatus'])}
                className="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              >
                <option value="Pending Demo">Pending Demo</option>
                <option value="Confirmed Demo">Confirmed Demo</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Campaign Status</label>
            <select
              value={fStatus}
              onChange={(e) => setFStatus(e.target.value as FeaturedCampaign['status'])}
              className="w-full h-9 px-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
            >
              {['Draft', 'Scheduled', 'Active', 'Paused'].map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold">
            {editingFeat ? 'Save Campaign Changes' : 'Save Featured Campaign'}
          </button>
        </form>
      </ModalSheet>

      {/* Featured Detail Modal */}
      <ModalSheet
        open={Boolean(detailFeat)}
        onClose={() => setDetailFeat(null)}
        title={detailFeat ? `Featured Campaign · ${detailFeat.propertyName}` : 'Campaign Details'}
        maxWidth="max-w-lg"
      >
        {detailFeat && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151]">
              <div><span className="text-[#64748B]">Package:</span> {detailFeat.packageName}</div>
              <div><span className="text-[#64748B]">Placement:</span> {detailFeat.placement}</div>
              <div><span className="text-[#64748B]">City:</span> {detailFeat.locality}, {detailFeat.city}</div>
              <div><span className="text-[#64748B]">Status:</span> <StatusText status={detailFeat.status} /></div>
              <div><span className="text-[#64748B]">Impressions:</span> <span className="font-mono-num">{detailFeat.impressions}</span></div>
              <div><span className="text-[#64748B]">Clicks:</span> <span className="font-mono-num">{detailFeat.clicks}</span></div>
            </div>
          </div>
        )}
      </ModalSheet>

      {/* Advertiser Modal */}
      <ModalSheet
        open={advModalOpen}
        onClose={() => setAdvModalOpen(false)}
        title={editingAdv ? `Edit Advertiser · ${editingAdv.businessName}` : 'Add Local Business Advertiser'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveAdvertiser(
              {
                businessName: aBiz.trim(),
                contactPerson: aContact.trim(),
                mobile: aMobile.trim(),
                email: aEmail.trim(),
                city: aCity,
                locality: aLocality.trim(),
                category: aCat,
                status: editingAdv?.status || 'Active',
              },
              editingAdv?.id
            );
            setBanner(`Saved advertiser ${aBiz.trim()}.`);
            setAdvModalOpen(false);
          }}
          className="space-y-3 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Business Name *</label>
              <input type="text" required value={aBiz} onChange={(e) => setABiz(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]" />
            </div>
            <div>
              <label className="block font-medium mb-1">Category</label>
              <select value={aCat} onChange={(e) => setACat(e.target.value as LocalBusiness['category'])} className="w-full h-9 px-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]">
                {LOCAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Contact Person *</label>
              <input type="text" required value={aContact} onChange={(e) => setAContact(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]" />
            </div>
            <div>
              <label className="block font-medium mb-1">Mobile *</label>
              <input type="tel" required value={aMobile} onChange={(e) => setAMobile(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num" />
            </div>
            <div>
              <label className="block font-medium mb-1">Email *</label>
              <input type="email" required value={aEmail} onChange={(e) => setAEmail(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]" />
            </div>
            <div>
              <label className="block font-medium mb-1">City</label>
              <select value={aCity} onChange={(e) => setACity(e.target.value)} className="w-full h-9 px-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]">
                {INDIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Locality *</label>
            <input type="text" required value={aLocality} onChange={(e) => setALocality(e.target.value)} placeholder="e.g. Koramangala, Hinjewadi" className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]" />
          </div>
          <button type="submit" className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold">
            Save Advertiser
          </button>
        </form>
      </ModalSheet>

      {/* Local Ad Modal + Live Preview */}
      <ModalSheet
        open={adModalOpen}
        onClose={() => setAdModalOpen(false)}
        title={editingAd ? 'Edit Local Business Ad' : 'Create Local Business Ad'}
        maxWidth="max-w-2xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!/^https?:\/\/.+/i.test(adUrl.trim())) {
              setAdUrlErr('Destination URL must start with https:// or http://');
              return;
            }
            const adv = advertisers.find((a) => a.id === adAdvId);
            saveLocalAdCampaign(
              {
                advertiserId: adAdvId || 'adv-custom',
                advertiserName: adv?.businessName || 'Local Partner',
                title: adTitle.trim(),
                category: adCat,
                description: adDesc.trim(),
                ctaText: adCta.trim() || 'View Offer',
                destinationUrl: adUrl.trim(),
                targetCity: adCity,
                targetLocality: adLocality.trim() || adCity,
                placement: adPlacement,
                startDate: adStart,
                endDate: adEnd,
                packagePriceInr: Number(adPrice) || 499,
                status: adStatus,
              },
              editingAd?.id
            );
            setBanner(`Saved Local Ad "${adTitle.trim()}".`);
            setAdModalOpen(false);
          }}
          className="space-y-3 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1">Advertiser</label>
              <select value={adAdvId} onChange={(e) => setAdAdvId(e.target.value)} className="w-full h-9 px-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]">
                {advertisers.map((a) => (
                  <option key={a.id} value={a.id}>{a.businessName} ({a.city})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Category</label>
              <select value={adCat} onChange={(e) => setAdCat(e.target.value as LocalBusiness['category'])} className="w-full h-9 px-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]">
                {LOCAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-medium mb-1">Ad Headline *</label>
              <input type="text" required value={adTitle} onChange={(e) => setAdTitle(e.target.value)} placeholder="e.g. Monthly Home-Style Tiffin Plans @ ₹2,700" className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-medium mb-1">Offer Description *</label>
              <textarea rows={2} required value={adDesc} onChange={(e) => setAdDesc(e.target.value)} className="w-full p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]" />
            </div>
            <div>
              <label className="block font-medium mb-1">CTA Label</label>
              <input type="text" value={adCta} onChange={(e) => setAdCta(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]" />
            </div>
            <div>
              <label className="block font-medium mb-1">Destination URL *</label>
              <input
                type="url"
                required
                value={adUrl}
                onChange={(e) => {
                  setAdUrl(e.target.value);
                  setAdUrlErr('');
                }}
                className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]"
              />
              {adUrlErr && <div className="text-[#DC2626] mt-0.5">{adUrlErr}</div>}
            </div>
            <div>
              <label className="block font-medium mb-1">Target City</label>
              <select value={adCity} onChange={(e) => setAdCity(e.target.value)} className="w-full h-9 px-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]">
                {INDIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Target Locality *</label>
              <input type="text" required value={adLocality} onChange={(e) => setAdLocality(e.target.value)} placeholder="Koramangala" className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]" />
            </div>
            <div>
              <label className="block font-medium mb-1">Placement</label>
              <select value={adPlacement} onChange={(e) => setAdPlacement(e.target.value as LocalAdCampaign['placement'])} className="w-full h-9 px-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]">
                <option value="PG Finder Local">PG Finder Local</option>
                <option value="Tenant Home Area Card">Tenant Home Area Card</option>
                <option value="Explore Nearby Feed">Explore Nearby Feed</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Package Tier (INR ₹)</label>
              <select value={adPrice} onChange={(e) => setAdPrice(e.target.value)} className="w-full h-9 px-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num">
                <option value="499">Local Starter — ₹499</option>
                <option value="1499">Locality Plus — ₹1,499</option>
                <option value="3999">City Network — ₹3,999</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Start Date</label>
              <input type="date" required value={adStart} onChange={(e) => setAdStart(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num" />
            </div>
            <div>
              <label className="block font-medium mb-1">End Date</label>
              <input type="date" required value={adEnd} onChange={(e) => setAdEnd(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] font-mono-num" />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-medium mb-1">Status</label>
              <select value={adStatus} onChange={(e) => setAdStatus(e.target.value as LocalAdCampaign['status'])} className="w-full h-9 px-2 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937]">
                {['Draft', 'Pending Approval', 'Active', 'Paused'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Sponsored Card Preview */}
          <div className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#0B1220] space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#D97706]">
              <span>LIVE PREVIEW · SPONSORED</span>
              <span>{adPlacement}</span>
            </div>
            <div className="font-semibold text-sm">{adTitle || 'Your Local Ad Headline'}</div>
            <p className="text-[#64748B]">{adDesc || 'Business offer description appears here for residents in the selected area.'}</p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[#64748B]">{adLocality || 'Locality'}, {adCity} · {adCat}</span>
              <span className="inline-flex items-center gap-1 font-semibold text-[#047857]">
                {adCta || 'View Offer'} <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>

          <button type="submit" className="w-full h-10 rounded-xl bg-[#047857] text-white font-semibold">
            {editingAd ? 'Save Ad Changes' : 'Save Local Ad Campaign'}
          </button>
        </form>
      </ModalSheet>

      <ConfirmDialog
        open={Boolean(deleteFeatTarget)}
        onClose={() => setDeleteFeatTarget(null)}
        title="Delete or Archive Featured Campaign"
        description="Draft campaigns can be deleted; active/completed campaigns are archived to preserve analytics and billing records."
        confirmLabel="Confirm"
        tone="warning"
        onConfirm={() => {
          if (deleteFeatTarget) {
            const res = deleteFeaturedCampaign(deleteFeatTarget.id);
            setBanner(res.message);
          }
          setDeleteFeatTarget(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteAdTarget)}
        onClose={() => setDeleteAdTarget(null)}
        title="Delete or Archive Local Ad"
        description="Draft ads are deleted; published or paused ads are archived."
        confirmLabel="Confirm"
        tone="warning"
        onConfirm={() => {
          if (deleteAdTarget) {
            const res = deleteLocalAdCampaign(deleteAdTarget.id);
            setBanner(res.message);
          }
          setDeleteAdTarget(null);
        }}
      />
    </div>
  );
};
