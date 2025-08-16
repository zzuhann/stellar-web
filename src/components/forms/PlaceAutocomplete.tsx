'use client';

import { useState } from 'react';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
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

// Styled Components - 與 EventSubmissionForm 保持一致的設計風格
const Container = styled.div`
  width: 100%;
`;

const ComboboxContainer = styled.div`
  position: relative;
`;

const ComboboxInput = styled(Combobox.Input)<{ isDisabled: boolean; isError: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 16px;
  transition: all 0.2s ease;
  padding-right: 40px;

  &::placeholder {
    color: var(--color-text-secondary);
  }

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(90, 125, 154, 0.1);
  }

  &:disabled {
    background: var(--color-bg-secondary);
    color: var(--color-text-disabled);
    cursor: not-allowed;
  }

  ${(props) =>
    props.isDisabled &&
    `
    background: var(--color-bg-secondary);
    color: var(--color-text-disabled);
    cursor: not-allowed;
  `}

  ${(props) =>
    props.isError &&
    `
    border-color: #ef4444;
    background: #fef2f2;
    color: #991b1b;
    
    &:focus {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  `}

  @media (min-width: 768px) {
    padding: 14px 18px;
    font-size: 15px;
    padding-right: 44px;
  }
`;

const ComboboxButton = styled(Combobox.Button)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 0;
  display: flex;
  align-items: center;
  padding-right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);

  &:hover {
    color: var(--color-text-primary);
  }

  @media (min-width: 768px) {
    padding-right: 14px;
  }
`;

const ComboboxOptions = styled(Combobox.Options)`
  position: absolute;
  z-index: 10;
  margin-top: 4px;
  max-height: 240px;
  width: 100%;
  overflow-y: auto;
  border-radius: var(--radius-lg);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-md);
  padding: 8px 0;
`;

const LoadingOption = styled.div`
  position: relative;
  cursor-default;
  select-none;
  padding: 12px 16px;
  color: var(--color-text-secondary);
  font-size: 14px;
  text-align: center;

  @media (min-width: 768px) {
    padding: 14px 18px;
    font-size: 15px;
  }
`;

const ComboboxOption = styled(Combobox.Option)`
  position: relative;
  cursor-default;
  select-none;
  padding: 12px 16px;
  transition: all 0.2s ease;
  color: var(--color-text-primary);
  
  &:hover {
    background: var(--color-bg-secondary);
  }

  &[data-headlessui-state="active"] {
    background: var(--color-primary);
    color: white;
  }

`;

const OptionContent = styled.div<{ isSelected: boolean }>`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: ${(props) => (props.isSelected ? '600' : '400')};
`;

const OptionMainText = styled.div`
  font-weight: 500;
  margin-bottom: 2px;
`;

const OptionSecondaryText = styled.div<{ isActive: boolean }>`
  font-size: 13px;
  color: var(--color-text-secondary);
`;

const CheckIconContainer = styled.span<{ isActive: boolean }>`
  position: absolute;
  inset-y: 0;
  left: 0;
  display: flex;
  align-items: center;
  padding-left: 16px;
  color: ${(props) => (props.isActive ? 'white' : 'var(--color-primary)')};

  @media (min-width: 768px) {
    padding-left: 18px;
  }
`;

const ErrorMessage = styled.p`
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #ef4444;

  @media (min-width: 768px) {
    font-size: 13px;
  }
`;

export default function PlaceAutocomplete({
  onPlaceSelect,
  defaultValue = '',
}: PlaceAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue);
  const [selectedPlace, setSelectedPlace] = useState<PlacePrediction | null>(null);
  const [isSelectedState, setIsSelectedState] = useState(false);

  const debouncedQuery = useDebounce(query, 500);

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
    <Container>
      <Combobox value={selectedPlace} onChange={handlePlaceSelect}>
        <ComboboxContainer>
          <ComboboxInput
            isError={isError}
            isDisabled={false}
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
          <ComboboxButton>
            {isError ? (
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            ) : (
              <ChevronUpDownIcon className="h-5 w-5" aria-hidden="true" />
            )}
          </ComboboxButton>

          {(predictions.length > 0 || isLoading) && (
            <ComboboxOptions>
              {isLoading && <LoadingOption>搜尋中...</LoadingOption>}
              {predictions.map((prediction: PlacePrediction) => (
                <ComboboxOption key={prediction.place_id} value={prediction}>
                  {({ selected, active }) => (
                    <>
                      <OptionContent isSelected={selected}>
                        {prediction.structured_formatting ? (
                          <>
                            <OptionMainText>
                              {prediction.structured_formatting.main_text}
                            </OptionMainText>
                            <OptionSecondaryText isActive={active}>
                              {prediction.structured_formatting.secondary_text}
                            </OptionSecondaryText>
                          </>
                        ) : (
                          <span>{prediction.description}</span>
                        )}
                      </OptionContent>
                      {selected && (
                        <CheckIconContainer isActive={active}>
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </CheckIconContainer>
                      )}
                    </>
                  )}
                </ComboboxOption>
              ))}
            </ComboboxOptions>
          )}
        </ComboboxContainer>
      </Combobox>

      {isError && <ErrorMessage>搜尋服務暫時無法使用，請稍後再試</ErrorMessage>}
    </Container>
  );
}
