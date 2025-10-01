'use client';

import { useState } from 'react';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import { useQuery } from '@tanstack/react-query';
import { css, cva } from '@/styled-system/css';
import api from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import showToast from '@/lib/toast';

interface PlaceAutocompleteProps {
  onPlaceSelect: (place: {
    address: string;
    coordinates: { lat: number; lng: number };
    name: string;
  }) => void;
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

const container = css({
  width: '100%',
});

const comboboxContainer = css({
  position: 'relative',
});

const comboboxInput = cva({
  base: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid',
    borderColor: 'color.border.light',
    borderRadius: 'radius.lg',
    background: 'color.background.primary',
    color: 'color.text.primary',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    paddingRight: '40px',
    '&::placeholder': {
      color: 'color.text.secondary',
    },
    '&:focus': {
      outline: 'none',
      borderColor: 'color.primary',
      boxShadow: '0 0 0 3px rgba(90, 125, 154, 0.1)',
    },
    '&:disabled': {
      background: 'color.background.secondary',
      color: 'color.text.disabled',
      cursor: 'not-allowed',
    },
    '@media (min-width: 768px)': {
      padding: '14px 18px',
      fontSize: '15px',
      paddingRight: '44px',
    },
  },
  variants: {
    isDisabled: {
      true: {
        background: 'color.background.secondary',
        color: 'color.text.disabled',
        cursor: 'not-allowed',
      },
    },
    isError: {
      true: {
        borderColor: '#ef4444',
        background: '#fef2f2',
        color: '#991b1b',
        '&:focus': {
          borderColor: '#ef4444',
          boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
        },
      },
    },
  },
});

const comboboxButton = css({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  right: '0',
  display: 'flex',
  alignItems: 'center',
  paddingRight: '12px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'color.text.secondary',
  '&:hover': {
    color: 'color.text.primary',
  },
  '@media (min-width: 768px)': {
    paddingRight: '14px',
  },
});

const comboboxOptions = css({
  position: 'absolute',
  zIndex: 10,
  marginTop: '4px',
  maxHeight: '240px',
  width: '100%',
  overflowY: 'auto',
  borderRadius: 'radius.lg',
  background: 'color.background.primary',
  border: '1px solid',
  borderColor: 'color.border.light',
  boxShadow: 'shadow.md',
  padding: '8px 0',
});

const loadingOption = css({
  position: 'relative',
  cursor: 'default',
  userSelect: 'none',
  padding: '12px 16px',
  color: 'color.text.secondary',
  fontSize: '14px',
  textAlign: 'center',
  '@media (min-width: 768px)': {
    padding: '14px 18px',
    fontSize: '15px',
  },
});

const comboboxOption = css({
  position: 'relative',
  cursor: 'default',
  userSelect: 'none',
  padding: '12px 16px',
  transition: 'all 0.2s ease',
  color: 'color.text.primary',
  '&:hover': {
    background: 'color.background.secondary',
  },
  '&[data-headlessui-state="active"]': {
    background: 'color.primary',
    color: 'white',
  },
});

const optionContent = cva({
  base: {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  variants: {
    isSelected: {
      true: {
        fontWeight: '600',
      },
      false: {
        fontWeight: '400',
      },
    },
  },
});

const optionMainText = css({
  fontWeight: '500',
  marginBottom: '2px',
});

const optionSecondaryText = css({
  fontSize: '13px',
  color: 'color.text.secondary',
});

const checkIconContainer = cva({
  base: {
    position: 'absolute',
    insetY: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '16px',
    '@media (min-width: 768px)': {
      paddingLeft: '18px',
    },
  },
  variants: {
    isActive: {
      true: {
        color: 'white',
      },
      false: {
        color: 'color.primary',
      },
    },
  },
});

const errorMessage = css({
  margin: '8px 0 0 0',
  fontSize: '12px',
  color: '#ef4444',
  '@media (min-width: 768px)': {
    fontSize: '13px',
  },
});

export default function PlaceAutocomplete({
  onPlaceSelect,
  defaultValue = '',
}: PlaceAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue);
  const [selectedPlace, setSelectedPlace] = useState<PlacePrediction | null>(null);
  const [isSelectedState, setIsSelectedState] = useState(false);

  const debouncedQuery = useDebounce(query, 800);

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
    enabled: debouncedQuery.length >= 2 && !isSelectedState,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const handlePlaceSelect = async (prediction: PlacePrediction | null) => {
    if (!prediction) {
      setSelectedPlace(null);
      setIsSelectedState(false);
      return;
    }

    setSelectedPlace(prediction);
    setIsSelectedState(true);
    setQuery(prediction.structured_formatting?.main_text || prediction.description);

    try {
      const response = await api.get(`/places/details/${prediction.place_id}`);
      const result = response.data;

      if (result.geometry?.location?.lat && result.geometry?.location?.lng) {
        const placeData = {
          address: result.formatted_address || prediction.description,
          coordinates: {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
          },
          name: result.name,
        };
        onPlaceSelect(placeData);
      }
    } catch {
      showToast.warning('地點詳情取得失敗');
    }
  };

  return (
    <div className={container}>
      <Combobox value={selectedPlace} onChange={handlePlaceSelect}>
        <div className={comboboxContainer}>
          <Combobox.Input
            className={comboboxInput({ isError, isDisabled: false })}
            displayValue={(prediction: PlacePrediction | null) =>
              prediction
                ? prediction.structured_formatting?.main_text || prediction.description
                : query
            }
            onChange={(event) => {
              setQuery(event.target.value);
              setIsSelectedState(false);
              setSelectedPlace(null);
            }}
          />
          <Combobox.Button className={comboboxButton}>
            {isError ? (
              <ExclamationTriangleIcon
                style={{ width: '20px', height: '20px', color: '#f87171' }}
                aria-hidden="true"
              />
            ) : (
              <ChevronUpDownIcon style={{ width: '20px', height: '20px' }} aria-hidden="true" />
            )}
          </Combobox.Button>

          {(predictions.length > 0 || isLoading) && (
            <Combobox.Options className={comboboxOptions}>
              {isLoading && <div className={loadingOption}>搜尋中...</div>}
              {predictions.map((prediction: PlacePrediction) => (
                <Combobox.Option
                  key={prediction.place_id}
                  value={prediction}
                  className={comboboxOption}
                >
                  {({ selected, active }) => (
                    <>
                      <div className={optionContent({ isSelected: selected })}>
                        {prediction.structured_formatting ? (
                          <>
                            <div className={optionMainText}>
                              {prediction.structured_formatting.main_text}
                            </div>
                            <div className={optionSecondaryText}>
                              {prediction.structured_formatting.secondary_text}
                            </div>
                          </>
                        ) : (
                          <span>{prediction.description}</span>
                        )}
                      </div>
                      {selected && (
                        <span className={checkIconContainer({ isActive: active })}>
                          <CheckIcon style={{ width: '20px', height: '20px' }} aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>

      {isError && <p className={errorMessage}>搜尋服務暫時無法使用，請稍後再試</p>}
    </div>
  );
}
