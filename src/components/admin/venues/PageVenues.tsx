'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { venueApi } from '@/lib/api';
import { showToast } from '@/lib/toast';
import { css } from '@/styled-system/css';
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import Loading from '@/components/Loading';
import VenueCard from './VenueCard';
import type { Venue } from '@/types';

const REGION_GROUPS = [
  { label: '北部', cities: ['臺北', '新北', '基隆', '桃園', '新竹', '宜蘭'] },
  { label: '中部', cities: ['苗栗', '臺中', '彰化', '南投', '雲林'] },
  { label: '南部', cities: ['嘉義', '臺南', '高雄', '屏東'] },
  { label: '東部', cities: ['花蓮', '臺東'] },
  { label: '外島', cities: ['澎湖', '金門', '連江'] },
] as const;

type RegionGroup = (typeof REGION_GROUPS)[number]['label'];
type ActiveTab = 'pending' | 'management';
type ManagementStatusFilter = 'all' | 'active' | 'inactive';

const pageContainer = css({
  minHeight: '100vh',
  background: 'color.background.primary',
});

const mainContainer = css({
  maxWidth: '1200px',
  margin: '0 auto',
  paddingTop: '25',
  paddingX: '4',
  paddingBottom: '10',
  '@media (min-width: 768px)': {
    paddingX: '6',
  },
});

const topBar = css({
  display: 'flex',
  alignItems: 'center',
  gap: '3',
  marginBottom: '6',
});

const backBtn = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1.5',
  paddingY: '2',
  paddingX: '3',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'white',
  color: 'color.text.secondary',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 0.2s ease, color 0.2s ease',
  '&:hover': {
    background: 'gray.50',
    color: 'color.text.primary',
  },
  '& svg': {
    width: '14px',
    height: '14px',
  },
});

const pageTitle = css({
  textStyle: 'heading',
  color: 'color.text.primary',
  margin: 0,
});

const tabBar = css({
  display: 'flex',
  borderBottom: '2px solid',
  borderBottomColor: 'color.border.light',
  marginBottom: '5',
  gap: '0',
});

const tabButton = css({
  position: 'relative',
  paddingY: '3',
  paddingX: '5',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  background: 'transparent',
  border: 'none',
  color: 'color.text.secondary',
  transition: 'color 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  '&:hover': {
    color: 'color.text.primary',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-2px',
    left: 0,
    right: 0,
    height: '2px',
    background: 'transparent',
    transition: 'background 0.2s ease',
  },
});

const tabButtonActive = css({
  color: 'color.primary',
  '&::after': {
    background: 'color.primary',
  },
});

const pendingBadge = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '18px',
  height: '18px',
  paddingX: '1.5',
  borderRadius: 'full',
  background: 'orange.400',
  color: 'white',
  fontSize: '11px',
  fontWeight: 700,
  lineHeight: 1,
});

const filterBar = css({
  display: 'flex',
  gap: '3',
  marginBottom: '5',
  flexWrap: 'wrap',
  alignItems: 'center',
});

const searchWrapper = css({
  position: 'relative',
  flex: '1',
  minWidth: '200px',
  '& svg': {
    position: 'absolute',
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '16px',
    height: '16px',
    color: 'color.text.tertiary',
    pointerEvents: 'none',
  },
});

const searchInput = css({
  width: '100%',
  paddingY: '2.5',
  paddingLeft: '9',
  paddingRight: '3',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  textStyle: 'bodySmall',
  color: 'color.text.primary',
  background: 'white',
  outline: 'none',
  '&:focus-visible': {
    borderColor: 'color.primary',
    boxShadow: '0 0 0 2px var(--colors-stellar-blue-100)',
  },
  '&::placeholder': {
    color: 'color.text.tertiary',
  },
});

const dropdownContainer = css({
  position: 'relative',
  flexShrink: 0,
});

const dropdownButton = css({
  textStyle: 'bodySmall',
  minWidth: '120px',
  paddingY: '2.5',
  paddingX: '3',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'white',
  color: 'color.text.primary',
  cursor: 'pointer',
  textAlign: 'left',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '2',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    borderColor: 'color.primary',
  },
  '&:focus-visible': {
    outline: 'none',
    borderColor: 'color.primary',
    boxShadow: '0 0 0 2px var(--colors-stellar-blue-100)',
  },
});

const dropdownButtonActive = css({
  borderColor: 'color.primary',
  color: 'color.primary',
});

const dropdownArrow = css({
  width: '14px',
  height: '14px',
  flexShrink: 0,
  transition: 'transform 0.2s ease',
});

const dropdownArrowOpen = css({
  transform: 'rotate(180deg)',
});

const dropdownMenu = css({
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  minWidth: '100%',
  maxHeight: '240px',
  overflowY: 'auto',
  background: 'white',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
  boxShadow: 'shadow.md',
  zIndex: 20,
});

const dropdownOption = css({
  textStyle: 'bodySmall',
  paddingY: '2.5',
  paddingX: '3',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  transition: 'background 0.15s',
  whiteSpace: 'nowrap',
  '&:hover': {
    background: 'gray.50',
  },
});

const dropdownOptionSelected = css({
  color: 'color.primary',
  fontWeight: 'medium',
});

const statsBar = css({
  display: 'flex',
  gap: '4',
  marginBottom: '4',
  alignItems: 'center',
});

const selectAllBtn = css({
  marginLeft: 'auto',
  paddingY: '1.5',
  paddingX: '3',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'white',
  color: 'color.text.secondary',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'border-color 0.2s ease, color 0.2s ease',
  '&:hover': {
    borderColor: 'color.primary',
    color: 'color.primary',
  },
});

const statText = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  display: 'flex',
  alignItems: 'center',
  gap: '1.5',
  '& svg': {
    width: '14px',
    height: '14px',
  },
});

const inactiveDot = css({
  width: '8px',
  height: '8px',
  borderRadius: 'full',
  background: 'gray.400',
  flexShrink: 0,
});

const grid = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '5',
});

const emptyState = css({
  textAlign: 'center',
  paddingY: '20',
  paddingX: '4',
  color: 'color.text.secondary',
  '& h3': {
    textStyle: 'bodyStrong',
    color: 'color.text.primary',
    marginBottom: '2',
    marginTop: '0',
  },
  '& p': {
    textStyle: 'bodySmall',
    margin: 0,
  },
});

const actionBar = css({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'white',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
  paddingY: '4',
  paddingX: '6',
  display: 'flex',
  alignItems: 'center',
  gap: '3',
  zIndex: 50,
});

const actionBarCount = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  flexShrink: 0,
});

const actionBarSpacer = css({
  flex: 1,
});

const actionBarBtn = css({
  paddingY: '2.5',
  paddingX: '4',
  borderRadius: 'radius.md',
  border: '1px solid',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease',
  '&:disabled': {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
});

const actionBarBtnApprove = css({
  background: 'green.500',
  borderColor: 'green.500',
  color: 'white',
  '&:hover:not(:disabled)': {
    background: 'green.600',
    borderColor: 'green.600',
  },
});

const actionBarBtnReject = css({
  background: 'white',
  borderColor: 'red.300',
  color: 'red.700',
  '&:hover:not(:disabled)': {
    background: 'red.50',
    borderColor: 'red.400',
  },
});

const actionBarBtnActivate = css({
  background: 'color.primary',
  borderColor: 'color.primary',
  color: 'white',
  '&:hover:not(:disabled)': {
    background: 'stellarBlue.600',
    borderColor: 'stellarBlue.600',
  },
});

const actionBarBtnDeactivate = css({
  background: 'white',
  borderColor: 'gray.300',
  color: 'color.text.secondary',
  '&:hover:not(:disabled)': {
    background: 'gray.50',
    borderColor: 'gray.400',
  },
});

const actionBarBtnCancel = css({
  background: 'white',
  borderColor: 'color.border.light',
  color: 'color.text.secondary',
  '&:hover:not(:disabled)': {
    background: 'gray.50',
    color: 'color.text.primary',
  },
});

const topBarActions = css({
  marginLeft: 'auto',
  display: 'flex',
  gap: '2',
  alignItems: 'center',
});

const headerSecondaryBtn = css({
  paddingY: '2.5',
  paddingX: '4',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'white',
  color: 'color.text.secondary',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  cursor: 'pointer',
  transition: 'background 0.2s ease, color 0.2s ease',
  '&:hover': {
    background: 'gray.50',
    color: 'color.text.primary',
  },
});

const headerPrimaryBtn = css({
  paddingY: '2.5',
  paddingX: '4',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.primary',
  background: 'color.primary',
  color: 'white',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  cursor: 'pointer',
  transition: 'background 0.2s ease, border-color 0.2s ease',
  '&:hover': {
    background: 'stellarBlue.600',
    borderColor: 'stellarBlue.600',
  },
});

export default function PageVenues() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<ActiveTab>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<RegionGroup | ''>('');
  // Status filter only used in management tab (active/inactive)
  const [managementStatusFilter, setManagementStatusFilter] =
    useState<ManagementStatusFilter>('all');
  const [regionOpen, setRegionOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const regionRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && (!user || userData?.role !== 'admin')) {
      showToast.error('權限不足');
      router.push('/');
    }
  }, [user, userData, authLoading, router]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (regionRef.current && !regionRef.current.contains(e.target as Node)) setRegionOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const regionCities = regionFilter
    ? REGION_GROUPS.find((g) => g.label === regionFilter)?.cities
    : undefined;

  // Tab 1: pending venues
  const { data: pendingData, isLoading: isPendingLoading } = useQuery({
    queryKey: ['admin-venues', 'pending', regionFilter],
    queryFn: () =>
      venueApi.getVenues({
        region: regionCities ? [...regionCities] : undefined,
        status: 'pending',
      }),
    enabled: !!user && userData?.role === 'admin',
    staleTime: 5 * 60 * 1000,
  });

  // Tab 2: management venues (active + inactive via status=all)
  const { data: managementData, isLoading: isManagementLoading } = useQuery({
    queryKey: ['admin-venues', 'management', regionFilter, managementStatusFilter],
    queryFn: () =>
      venueApi.getVenues({
        region: regionCities ? [...regionCities] : undefined,
        status: managementStatusFilter !== 'all' ? managementStatusFilter : 'all',
      }),
    enabled: !!user && userData?.role === 'admin',
    staleTime: 5 * 60 * 1000,
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => venueApi.deleteVenue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-venues'] });
      showToast.success('場地已下架');
    },
    onError: () => {
      showToast.error('操作失敗');
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => venueApi.updateVenue(id, { status: 'active' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-venues'] });
      showToast.success('場地已上架');
    },
    onError: () => {
      showToast.error('操作失敗');
    },
  });

  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    // Exit select mode and clear selection on tab switch
    exitSelectMode();
    setSearchQuery('');
    setRegionFilter('');
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((v) => v.id)));
    }
  };

  const batchReviewMutation = useMutation({
    mutationFn: (updates: Array<{ venueId: string; status: 'active' | 'rejected' }>) =>
      venueApi.batchReviewVenues(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-venues'] });
      showToast.success('批次審核完成');
      exitSelectMode();
    },
    onError: () => {
      showToast.error('批次操作失敗');
    },
  });

  const batchStatusMutation = useMutation({
    mutationFn: (updates: Array<{ venueId: string; status: 'active' | 'inactive' }>) =>
      venueApi.batchStatusVenues(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-venues'] });
      showToast.success('批次狀態更新完成');
      exitSelectMode();
    },
    onError: () => {
      showToast.error('批次操作失敗');
    },
  });

  const pendingVenues = useMemo(() => pendingData?.venues ?? [], [pendingData]);
  const managementVenues = useMemo(() => managementData?.venues ?? [], [managementData]);

  const allVenues = activeTab === 'pending' ? pendingVenues : managementVenues;

  const filtered = searchQuery
    ? allVenues.filter((v) => {
        const q = searchQuery.toLowerCase();
        return (
          v.name.toLowerCase().includes(q) ||
          v.address.toLowerCase().includes(q) ||
          v.region.includes(q)
        );
      })
    : allVenues;

  const pendingCount = pendingVenues.length;
  const inactiveCount = managementVenues.filter((v) => v.status === 'inactive').length;

  const isUpdating = deactivateMutation.isPending || activateMutation.isPending;
  const isBatchUpdating = batchReviewMutation.isPending || batchStatusMutation.isPending;
  const isLoading = activeTab === 'pending' ? isPendingLoading : isManagementLoading;

  const handleSelect = (venueId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(venueId)) {
        next.delete(venueId);
      } else {
        next.add(venueId);
      }
      return next;
    });
  };

  const handleBatchApprove = () => {
    const count = selectedIds.size;
    if (!window.confirm(`確認要審核通過 ${count} 個場地嗎？`)) return;
    batchReviewMutation.mutate([...selectedIds].map((id) => ({ venueId: id, status: 'active' })));
  };

  const handleBatchReject = () => {
    const count = selectedIds.size;
    if (!window.confirm(`確認要拒絕 ${count} 個場地嗎？`)) return;
    batchReviewMutation.mutate([...selectedIds].map((id) => ({ venueId: id, status: 'rejected' })));
  };

  const handleBatchActivate = () => {
    const count = selectedIds.size;
    if (!window.confirm(`確認要上架 ${count} 個場地嗎？`)) return;
    batchStatusMutation.mutate([...selectedIds].map((id) => ({ venueId: id, status: 'active' })));
  };

  const handleBatchDeactivate = () => {
    const count = selectedIds.size;
    if (!window.confirm(`確認要下架 ${count} 個場地嗎？`)) return;
    batchStatusMutation.mutate([...selectedIds].map((id) => ({ venueId: id, status: 'inactive' })));
  };

  if (authLoading || (isPendingLoading && isManagementLoading)) {
    return <Loading description="載入中..." style={{ height: '100vh', width: '100%' }} />;
  }

  if (!user || userData?.role !== 'admin') return null;

  return (
    <div className={pageContainer}>
      <div className={mainContainer}>
        <div className={topBar}>
          <button className={backBtn} onClick={() => router.push('/admin')}>
            <ArrowLeftIcon />
            審核後台
          </button>
          <h1 className={pageTitle}>場地管理</h1>
          <div className={topBarActions}>
            {!isSelectMode && (
              <button
                type="button"
                className={headerSecondaryBtn}
                onClick={() => setIsSelectMode(true)}
              >
                批次操作
              </button>
            )}
            {isSelectMode && (
              <button type="button" className={headerSecondaryBtn} onClick={exitSelectMode}>
                取消選取
              </button>
            )}
            <button
              type="button"
              className={headerPrimaryBtn}
              onClick={() => router.push('/admin/venues/new')}
            >
              + 新增場地
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className={tabBar}>
          <button
            type="button"
            className={`${tabButton} ${activeTab === 'pending' ? tabButtonActive : ''}`}
            onClick={() => handleTabChange('pending')}
          >
            待審核
            {pendingCount > 0 && <span className={pendingBadge}>{pendingCount}</span>}
          </button>
          <button
            type="button"
            className={`${tabButton} ${activeTab === 'management' ? tabButtonActive : ''}`}
            onClick={() => handleTabChange('management')}
          >
            上線管理
          </button>
        </div>

        <div className={filterBar}>
          <div className={searchWrapper}>
            <MagnifyingGlassIcon />
            <input
              className={searchInput}
              type="text"
              placeholder="搜尋場地名稱、地址..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Region dropdown — shown in both tabs */}
          <div className={dropdownContainer} ref={regionRef}>
            <button
              type="button"
              className={`${dropdownButton} ${regionFilter ? dropdownButtonActive : ''}`}
              onClick={() => {
                setRegionOpen((o) => !o);
                setStatusOpen(false);
              }}
              aria-haspopup="listbox"
              aria-expanded={regionOpen}
            >
              <span>{regionFilter || '全部地區'}</span>
              <ChevronDownIcon
                className={`${dropdownArrow} ${regionOpen ? dropdownArrowOpen : ''}`}
              />
            </button>
            {regionOpen && (
              <div className={dropdownMenu} role="listbox">
                {[
                  { value: '' as const, label: '全部地區' },
                  ...REGION_GROUPS.map((g) => ({ value: g.label, label: g.label })),
                ].map((opt) => {
                  const isSelected = regionFilter === opt.value;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      className={`${dropdownOption} ${isSelected ? dropdownOptionSelected : ''}`}
                      onClick={() => {
                        setRegionFilter(opt.value);
                        setRegionOpen(false);
                      }}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <span>✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Status dropdown — only shown in management tab */}
          {activeTab === 'management' && (
            <div className={dropdownContainer} ref={statusRef}>
              <button
                type="button"
                className={`${dropdownButton} ${managementStatusFilter !== 'all' ? dropdownButtonActive : ''}`}
                onClick={() => {
                  setStatusOpen((o) => !o);
                  setRegionOpen(false);
                }}
                aria-haspopup="listbox"
                aria-expanded={statusOpen}
              >
                <span>
                  {
                    {
                      all: '全部狀態',
                      active: '開放中',
                      inactive: '已下架',
                    }[managementStatusFilter]
                  }
                </span>
                <ChevronDownIcon
                  className={`${dropdownArrow} ${statusOpen ? dropdownArrowOpen : ''}`}
                />
              </button>
              {statusOpen && (
                <div className={dropdownMenu} role="listbox">
                  {(
                    [
                      { value: 'all', label: '全部狀態' },
                      { value: 'active', label: '開放中' },
                      { value: 'inactive', label: '已下架' },
                    ] as const
                  ).map((opt) => {
                    const isSelected = managementStatusFilter === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={`${dropdownOption} ${isSelected ? dropdownOptionSelected : ''}`}
                        onClick={() => {
                          setManagementStatusFilter(opt.value);
                          setStatusOpen(false);
                        }}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={statsBar}>
          <span className={statText}>
            <FunnelIcon />
            顯示 {filtered.length} / {allVenues.length} 個場地
          </span>
          {activeTab === 'management' && inactiveCount > 0 && (
            <span className={statText}>
              <span className={inactiveDot} />
              {inactiveCount} 個已下架
            </span>
          )}
          {isSelectMode && filtered.length > 0 && (
            <button type="button" className={selectAllBtn} onClick={handleSelectAll}>
              {selectedIds.size === filtered.length ? '取消全選' : `全選 (${filtered.length})`}
            </button>
          )}
        </div>

        {isLoading ? (
          <Loading description="載入中..." style={{ width: '100%' }} />
        ) : filtered.length === 0 ? (
          <div className={emptyState}>
            <h3>沒有符合條件的場地</h3>
            <p>試試調整篩選條件</p>
          </div>
        ) : (
          <div className={grid}>
            {filtered.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                onEdit={(v: Venue) => router.push(`/admin/venues/${v.id}/edit`)}
                onDeactivate={(v) => deactivateMutation.mutate(v.id)}
                onActivate={(v) => activateMutation.mutate(v.id)}
                isUpdating={isUpdating}
                isSelectMode={isSelectMode}
                isSelected={selectedIds.has(venue.id)}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </div>

      {/* Batch action bar — visible only in select mode */}
      {isSelectMode && (
        <div className={actionBar}>
          <span className={actionBarCount}>已選 {selectedIds.size} 個場地</span>

          <div className={actionBarSpacer} />

          {activeTab === 'pending' && (
            <>
              <button
                type="button"
                className={`${actionBarBtn} ${actionBarBtnApprove}`}
                onClick={handleBatchApprove}
                disabled={selectedIds.size === 0 || isBatchUpdating}
              >
                批次審核通過
              </button>
              <button
                type="button"
                className={`${actionBarBtn} ${actionBarBtnReject}`}
                onClick={handleBatchReject}
                disabled={selectedIds.size === 0 || isBatchUpdating}
              >
                批次拒絕
              </button>
            </>
          )}

          {activeTab === 'management' && (
            <>
              <button
                type="button"
                className={`${actionBarBtn} ${actionBarBtnActivate}`}
                onClick={handleBatchActivate}
                disabled={selectedIds.size === 0 || isBatchUpdating}
              >
                批次上架
              </button>
              <button
                type="button"
                className={`${actionBarBtn} ${actionBarBtnDeactivate}`}
                onClick={handleBatchDeactivate}
                disabled={selectedIds.size === 0 || isBatchUpdating}
              >
                批次下架
              </button>
            </>
          )}

          <button
            type="button"
            className={`${actionBarBtn} ${actionBarBtnCancel}`}
            onClick={exitSelectMode}
            disabled={isBatchUpdating}
          >
            取消
          </button>
        </div>
      )}
    </div>
  );
}
