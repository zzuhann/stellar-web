'use client';

import { useState, useCallback } from 'react';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';

interface PlaceAutocompleteProps {
  onPlaceSelect: (place: { address: string; coordinates: { lat: number; lng: number } }) => void;
  placeholder?: string;
  defaultValue?: string;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

export default function PlaceAutocomplete({
  onPlaceSelect,
  placeholder = '活動地點名稱',
  defaultValue = '',
}: PlaceAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue);
  const [selectedPlace, setSelectedPlace] = useState<PlacePrediction | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isSelectedState, setIsSelectedState] = useState(false); // 追蹤是否為選擇狀態

  // 使用 debounce 來減少 API 請求
  const debouncedQuery = useDebounce(query, 500);

  // 使用 React Query 進行自動完成搜尋，帶有快取
  const {
    data: predictions = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['places-autocomplete', debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery.length < 2) return [];

      const response = await api.post(`/places/autocomplete`, {
        input: debouncedQuery,
      });

      return response.data.predictions || [];
    },
    enabled: debouncedQuery.length >= 2 && !isDisabled && !isSelectedState,
    staleTime: 1000 * 60 * 5, // 5 分鐘快取
    retry: (failureCount) => {
      // 如果連續失敗 3 次，暫時禁用搜尋
      if (failureCount >= 2) {
        setIsDisabled(true);
        // 30 秒後重新啟用
        setTimeout(() => setIsDisabled(false), 30000);
        return false;
      }
      return true;
    },
  });

  // 處理地點選擇
  const handlePlaceSelect = useCallback(
    async (prediction: PlacePrediction | null) => {
      if (!prediction || isDisabled) {
        setSelectedPlace(null);
        setIsSelectedState(false); // 清除選擇時重置狀態
        return;
      }

      setSelectedPlace(prediction);
      setIsSelectedState(true); // 設定為選擇狀態
      setQuery(prediction.description);

      try {
        // 取得地點詳情
        const response = await api.get(`/places/details/${prediction.place_id}`);
        const result = response.data;

        if (result.geometry?.location?.lat && result.geometry?.location?.lng) {
          const placeData = {
            address: result.formatted_address || prediction.description,
            coordinates: {
              lat: result.geometry.location.lat,
              lng: result.geometry.location.lng,
            },
          };
          onPlaceSelect(placeData);
        }
      } catch {
        // 如果地點詳情取得失敗，使用預設座標
        onPlaceSelect({
          address: prediction.description,
          coordinates: { lat: 25.033, lng: 121.5654 }, // 台北市中心
        });
      }
    },
    [onPlaceSelect, isDisabled]
  );

  return (
    <div>
      <Combobox value={selectedPlace} onChange={handlePlaceSelect}>
        <div className="relative">
          <Combobox.Input
            className={`w-full rounded-md border-0 py-1.5 pl-3 pr-10 shadow-sm ring-1 ring-inset sm:text-sm sm:leading-6 ${
              isDisabled
                ? 'bg-gray-100 text-gray-500 ring-gray-200 cursor-not-allowed'
                : isError
                  ? 'bg-red-50 text-gray-900 ring-red-300 focus:ring-2 focus:ring-inset focus:ring-red-600'
                  : 'bg-white text-gray-900 ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-purple-600'
            }`}
            displayValue={(prediction: PlacePrediction | null) =>
              prediction ? prediction.description : query
            }
            onChange={(event) => {
              setQuery(event.target.value);
              setIsSelectedState(false); // 手動輸入時重置選擇狀態
              setSelectedPlace(null); // 清除已選擇的地點
            }}
            placeholder={isDisabled ? '搜尋暫時無法使用，請稍後再試' : placeholder}
            disabled={isDisabled}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            {isError && !isDisabled ? (
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            ) : (
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            )}
          </Combobox.Button>

          {(predictions.length > 0 || isLoading) && !isDisabled && (
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {isLoading && (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  搜尋中...
                </div>
              )}
              {predictions.map((prediction: PlacePrediction) => (
                <Combobox.Option
                  key={prediction.place_id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-purple-600 text-white' : 'text-gray-900'
                    }`
                  }
                  value={prediction}
                >
                  {({ selected, active }) => (
                    <>
                      <div className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {prediction.structured_formatting ? (
                          <>
                            <div className="font-medium">
                              {prediction.structured_formatting.main_text}
                            </div>
                            <div className="text-sm text-gray-500">
                              {prediction.structured_formatting.secondary_text}
                            </div>
                          </>
                        ) : (
                          <span>{prediction.description}</span>
                        )}
                      </div>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? 'text-white' : 'text-purple-600'
                          }`}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>

      {/* 錯誤訊息 */}
      {isError && !isDisabled && (
        <p className="mt-1 text-sm text-red-600">搜尋服務暫時無法使用，請稍後再試</p>
      )}

      {isDisabled && (
        <p className="mt-1 text-sm text-yellow-600">搜尋服務暫時停用中，30 秒後自動重新啟用</p>
      )}
    </div>
  );
}
