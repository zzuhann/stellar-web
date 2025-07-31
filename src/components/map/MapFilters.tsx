'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Artist } from '@/types';

interface MapFiltersProps {
  artists: Artist[];
  onFiltersChange: (filters: {
    search: string;
    artistId: string;
    status: 'all' | 'active' | 'upcoming' | 'ended';
    region: string;
    page: number;
    limit: number;
  }) => void;
}

export default function MapFilters({ artists, onFiltersChange }: MapFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedArtist, setSelectedArtist] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'upcoming' | 'ended'>(
    'all'
  );
  const [selectedRegion, setSelectedRegion] = useState('');

  // 台灣主要縣市
  const regions = [
    '台北市',
    '新北市',
    '桃園市',
    '台中市',
    '台南市',
    '高雄市',
    '新竹市',
    '新竹縣',
    '苗栗縣',
    '彰化縣',
    '南投縣',
    '雲林縣',
    '嘉義市',
    '嘉義縣',
    '屏東縣',
    '宜蘭縣',
    '花蓮縣',
    '台東縣',
  ];

  interface FilterUpdate {
    search?: string;
    artistId?: string;
    status?: 'all' | 'active' | 'upcoming' | 'ended';
    region?: string;
    page?: number;
    limit?: number;
  }

  const handleFiltersUpdate = (updates: FilterUpdate) => {
    const newFilters = {
      search: updates.hasOwnProperty('search') ? updates.search! : search,
      artistId: updates.hasOwnProperty('artistId') ? updates.artistId! : selectedArtist,
      status: updates.hasOwnProperty('status') ? updates.status! : selectedStatus,
      region: updates.hasOwnProperty('region') ? updates.region! : selectedRegion,
      page: updates.hasOwnProperty('page') ? updates.page! : 1,
      limit: updates.hasOwnProperty('limit') ? updates.limit! : 50,
    };

    onFiltersChange(newFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    handleFiltersUpdate({ search: value });
  };

  const handleArtistChange = (value: string) => {
    setSelectedArtist(value);
    handleFiltersUpdate({ artistId: value });
  };

  const handleStatusChange = (value: 'all' | 'active' | 'upcoming' | 'ended') => {
    setSelectedStatus(value);
    handleFiltersUpdate({ status: value });
  };

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    handleFiltersUpdate({ region: value });
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedArtist('');
    setSelectedStatus('all');
    setSelectedRegion('');
    onFiltersChange({
      search: '',
      artistId: '',
      status: 'all',
      region: '',
      page: 1,
      limit: 50,
    });
  };

  const hasActiveFilters = search || selectedArtist || selectedStatus !== 'all' || selectedRegion;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      {/* 基本篩選列 */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* 搜尋框 */}
        <div className="flex-1 min-w-[200px] relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋活動名稱或地點..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
          />
        </div>

        {/* 展開/收合按鈕 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isExpanded || hasActiveFilters
              ? 'bg-amber-100 text-amber-700 border border-amber-200'
              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          <FunnelIcon className="h-4 w-4" />
          篩選
          {hasActiveFilters && (
            <span className="bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
              {
                [search, selectedArtist, selectedStatus !== 'all', selectedRegion].filter(Boolean)
                  .length
              }
            </span>
          )}
        </button>

        {/* 清除篩選按鈕 */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            <XMarkIcon className="h-4 w-4" />
            清除
          </button>
        )}
      </div>

      {/* 詳細篩選選項 */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 藝人篩選 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">應援藝人</label>
            <select
              value={selectedArtist}
              onChange={(e) => handleArtistChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
            >
              <option value="">所有藝人</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.stageName}
                  {artist.realName && ` (${artist.realName})`}
                </option>
              ))}
            </select>
          </div>

          {/* 活動狀態篩選 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活動狀態</label>
            <select
              value={selectedStatus}
              onChange={(e) =>
                handleStatusChange(e.target.value as 'all' | 'active' | 'upcoming' | 'ended')
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
            >
              <option value="all">所有活動</option>
              <option value="active">進行中</option>
              <option value="upcoming">即將開始</option>
              <option value="ended">已結束</option>
            </select>
          </div>

          {/* 地區篩選 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">地區</label>
            <select
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
            >
              <option value="">所有地區</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
