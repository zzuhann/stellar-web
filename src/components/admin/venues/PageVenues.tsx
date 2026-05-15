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
import VenueEditModal from './VenueEditModal';
import VenueCreateModal from './VenueCreateModal';
import type { Venue, UpdateVenueData, CreateVenueData } from '@/types';

const REGION_GROUPS = [
  { label: '北部', cities: ['臺北', '新北', '基隆', '桃園', '新竹', '宜蘭'] },
  { label: '中部', cities: ['苗栗', '臺中', '彰化', '南投', '雲林'] },
  { label: '南部', cities: ['嘉義', '臺南', '高雄', '屏東'] },
  { label: '東部', cities: ['花蓮', '臺東'] },
  { label: '外島', cities: ['澎湖', '金門', '連江'] },
] as const;

type RegionGroup = (typeof REGION_GROUPS)[number]['label'];

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
  transition: 'all 0.2s ease',
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
  '&:focus': {
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
  transition: 'all 0.2s',
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

export default function PageVenues() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editingVenueId, setEditingVenueId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<RegionGroup | ''>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [regionOpen, setRegionOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
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

  const { data: venuesData, isLoading } = useQuery({
    queryKey: ['admin-venues', regionFilter, statusFilter],
    queryFn: () =>
      venueApi.getVenues({
        region: regionCities ? [...regionCities] : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      }),
    enabled: !!user && userData?.role === 'admin',
    staleTime: 5 * 60 * 1000,
  });

  const { data: editingVenue, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['venue-detail-edit', editingVenueId],
    queryFn: () => venueApi.getVenueById(editingVenueId ?? ''),
    enabled: !!editingVenueId,
    staleTime: 0,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVenueData }) =>
      venueApi.updateVenue(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-venues'] });
      setEditingVenueId(null);
      showToast.success('場地已更新');
    },
    onError: () => {
      showToast.error('更新失敗');
    },
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

  const createMutation = useMutation({
    mutationFn: (data: CreateVenueData) => venueApi.createVenue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-venues'] });
      setShowCreateModal(false);
      showToast.success('場地已新增');
    },
    onError: () => {
      showToast.error('新增失敗');
    },
  });

  const allVenues = useMemo(() => venuesData?.venues ?? [], [venuesData]);

  const filtered = useMemo(() => {
    if (!searchQuery) return allVenues;
    const q = searchQuery.toLowerCase();
    return allVenues.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.address.toLowerCase().includes(q) ||
        v.region.includes(q)
    );
  }, [allVenues, searchQuery]);

  const inactiveCount = allVenues.filter((v) => v.status === 'inactive').length;

  const isUpdating =
    updateMutation.isPending || deactivateMutation.isPending || activateMutation.isPending;

  if (authLoading || isLoading) {
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
          <button
            type="button"
            className={css({
              marginLeft: 'auto',
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
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'stellarBlue.600',
                borderColor: 'stellarBlue.600',
              },
            })}
            onClick={() => setShowCreateModal(true)}
          >
            + 新增場地
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

          {/* 地區 dropdown */}
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

          {/* 狀態 dropdown */}
          <div className={dropdownContainer} ref={statusRef}>
            <button
              type="button"
              className={`${dropdownButton} ${statusFilter !== 'all' ? dropdownButtonActive : ''}`}
              onClick={() => {
                setStatusOpen((o) => !o);
                setRegionOpen(false);
              }}
              aria-haspopup="listbox"
              aria-expanded={statusOpen}
            >
              <span>
                {statusFilter === 'all'
                  ? '全部狀態'
                  : statusFilter === 'active'
                    ? '開放中'
                    : '已下架'}
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
                  const isSelected = statusFilter === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${dropdownOption} ${isSelected ? dropdownOptionSelected : ''}`}
                      onClick={() => {
                        setStatusFilter(opt.value);
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
        </div>

        <div className={statsBar}>
          <span className={statText}>
            <FunnelIcon />
            顯示 {filtered.length} / {allVenues.length} 個場地
          </span>
          {inactiveCount > 0 && (
            <span className={statText}>
              <span className={inactiveDot} />
              {inactiveCount} 個已下架
            </span>
          )}
        </div>

        {filtered.length === 0 ? (
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
                onEdit={(v: Venue) => setEditingVenueId(v.id)}
                onDeactivate={(v) => deactivateMutation.mutate(v.id)}
                onActivate={(v) => activateMutation.mutate(v.id)}
                isUpdating={isUpdating}
              />
            ))}
          </div>
        )}
      </div>

      {editingVenueId && editingVenue && !isLoadingDetail && (
        <VenueEditModal
          venue={editingVenue}
          isOpen={true}
          isSaving={updateMutation.isPending}
          onClose={() => setEditingVenueId(null)}
          onSave={(id, data) => updateMutation.mutate({ id, data })}
        />
      )}

      <VenueCreateModal
        isOpen={showCreateModal}
        isSaving={createMutation.isPending}
        onClose={() => setShowCreateModal(false)}
        onSave={(data) => createMutation.mutate(data)}
      />
    </div>
  );
}
