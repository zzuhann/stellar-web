'use client';

import { useState, useEffect, useCallback } from 'react';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';

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
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlacePrediction | null>(null);
  const [loading, setLoading] = useState(false);

  // 搜尋地點建議
  useEffect(() => {
    if (query.length < 2) {
      setPredictions([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      try {
        setLoading(true);

        // 使用 POST 請求並發送正確的 request body
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          throw new Error('Google Maps API key not configured');
        }

        const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
          },
          body: JSON.stringify({
            input: query,
            locationRestriction: {
              circle: {
                center: {
                  latitude: 25.033, // 台北市中心
                  longitude: 121.5654,
                },
                radius: 50000, // 50公里範圍
              },
            },
          }),
        });

        const data = await response.json();

        if (response.ok && data.suggestions) {
          // 轉換 Google Places API 回應格式
          const predictions = data.suggestions
            .filter((suggestion: any) => suggestion.placePrediction)
            .map((suggestion: any) => {
              const place = suggestion.placePrediction;
              return {
                place_id: place.placeId,
                description: place.text?.text || '',
                structured_formatting: {
                  main_text: place.structuredFormat?.mainText?.text || '',
                  secondary_text: place.structuredFormat?.secondaryText?.text || '',
                },
              };
            });

          setPredictions(predictions);
        } else {
          setPredictions([]);
        }
      } catch {
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  // 處理地點選擇
  const handlePlaceSelect = useCallback(
    async (prediction: PlacePrediction | null) => {
      if (!prediction) {
        setSelectedPlace(null);
        return;
      }

      setSelectedPlace(prediction);
      setQuery(prediction.description);

      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          throw new Error('Google Maps API key not configured');
        }

        const response = await fetch(
          `https://places.googleapis.com/v1/places/${prediction.place_id}`,
          {
            method: 'GET',
            headers: {
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask': 'location,formattedAddress,displayName',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          // 轉換為相容格式
          const result = {
            geometry: {
              location: {
                lat: data.location?.latitude || 0,
                lng: data.location?.longitude || 0,
              },
            },
            formatted_address: data.formattedAddress || '',
            name: data.displayName?.text || '',
          };

          if (result.geometry.location.lat && result.geometry.location.lng) {
            const placeData = {
              address: result.formatted_address || prediction.description,
              coordinates: {
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
              },
            };
            onPlaceSelect(placeData);
          }
        }
      } catch {
        // 錯誤處理 - 靜默處理
      }
    },
    [onPlaceSelect]
  );

  return (
    <Combobox value={selectedPlace} onChange={handlePlaceSelect}>
      <div className="relative">
        <Combobox.Input
          className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
          displayValue={(prediction: PlacePrediction | null) =>
            prediction ? prediction.description : query
          }
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>

        {(predictions.length > 0 || loading) && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {loading && (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                搜尋中...
              </div>
            )}
            {predictions.map((prediction) => (
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
  );
}
