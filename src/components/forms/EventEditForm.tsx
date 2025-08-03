'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api';
import { CoffeeEvent, UpdateEventRequest } from '@/types';
import PlaceAutocomplete from './PlaceAutocomplete';
import styled from 'styled-components';
import { firebaseTimestampToDate } from '@/utils';

// Styled Components
const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;

  @media (min-width: 768px) {
    padding: 32px;
  }
`;

const FormHeader = styled.div`
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;

  h2 {
    font-size: 24px;
    font-weight: 700;
    color: #333;
    margin: 0 0 8px 0;

    @media (min-width: 768px) {
      font-size: 28px;
    }
  }

  p {
    font-size: 14px;
    color: #666;
    margin: 0 0 4px 0;

    @media (min-width: 768px) {
      font-size: 16px;
    }
  }

  .note {
    font-size: 12px;
    color: #888;
    margin: 0;

    @media (min-width: 768px) {
      font-size: 13px;
    }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  padding-top: 8px;
  border-top: 1px solid #f1f3f5;

  @media (min-width: 768px) {
    font-size: 20px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;

  @media (min-width: 768px) {
    font-size: 15px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  background: #fff;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &::placeholder {
    color: #999;
  }

  @media (min-width: 768px) {
    padding: 14px 18px;
    font-size: 15px;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  background: #fff;
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &::placeholder {
    color: #999;
  }

  @media (min-width: 768px) {
    padding: 14px 18px;
    font-size: 15px;
    min-height: 120px;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
`;

const TimeGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;

  @media (min-width: 480px) {
    flex-direction: row;
    justify-content: flex-end;
    gap: 16px;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid;

  ${(props) =>
    props.variant === 'primary'
      ? `
    background: #007bff;
    border-color: #007bff;
    color: white;
    
    &:hover:not(:disabled) {
      background: #0056b3;
      border-color: #0056b3;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
    }
    
    &:disabled {
      background: #6c757d;
      border-color: #6c757d;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  `
      : `
    background: #fff;
    border-color: #ddd;
    color: #666;
    
    &:hover {
      background: #f8f9fa;
      border-color: #adb5bd;
    }
  `}

  @media (min-width: 768px) {
    padding: 14px 28px;
    font-size: 15px;
  }
`;

const ErrorMessage = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  color: #721c24;
  font-size: 14px;
`;

interface EventEditFormProps {
  event: CoffeeEvent;
  onSuccess?: (updatedEvent: CoffeeEvent) => void;
  onCancel?: () => void;
}

export default function EventEditForm({ event, onSuccess, onCancel }: EventEditFormProps) {
  const queryClient = useQueryClient();

  // 表單狀態
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    locationName: event.location.name,
    address: event.location.address,
    coordinates: event.location.coordinates,
    startDate: firebaseTimestampToDate(event.datetime.start).toISOString().split('T')[0],
    endDate: firebaseTimestampToDate(event.datetime.end).toISOString().split('T')[0],
    instagram: event.socialMedia.instagram || '',
    x: event.socialMedia.x || '',
    threads: event.socialMedia.threads || '',
    mainImage: event.mainImage || '',
    detailImage: event.detailImage || '',
  });

  // 編輯活動 mutation
  const updateEventMutation = useMutation({
    mutationFn: (updateData: UpdateEventRequest) => eventsApi.update(event.id, updateData),
    onSuccess: (updatedEvent) => {
      // 清除相關的查詢快取
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
      queryClient.invalidateQueries({ queryKey: ['my-events'] });

      onSuccess?.(updatedEvent);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updateData: UpdateEventRequest = {
      title: formData.title,
      description: formData.description,
      location: {
        name: formData.locationName,
        address: formData.address,
        coordinates: formData.coordinates,
      },
      datetime: {
        start: {
          // startTime 為 00:00:00
          _seconds: new Date(`${formData.startDate}T00:00:00.000Z`).getTime() / 1000,
          _nanoseconds: 0,
        },
        end: {
          // endTime 為 23:59:59
          _seconds: new Date(`${formData.endDate}T23:59:59.000Z`).getTime() / 1000,
          _nanoseconds: 0,
        },
      },
      socialMedia: {
        instagram: formData.instagram || undefined,
        x: formData.x || undefined,
        threads: formData.threads || undefined,
      },
      mainImage: formData.mainImage || undefined,
      detailImage: formData.detailImage || undefined,
    };

    updateEventMutation.mutate(updateData);
  };

  const handleLocationSelect = (place: {
    name?: string;
    address: string;
    coordinates: { lat: number; lng: number };
  }) => {
    setFormData((prev) => ({
      ...prev,
      locationName: place.name || place.address,
      address: place.address,
      coordinates: place.coordinates,
    }));
  };

  return (
    <FormContainer>
      <FormHeader>
        <h2>編輯活動</h2>
        <p>
          編輯{' '}
          <span style={{ fontWeight: 600, color: '#6f42c1' }}>
            {event.artists.map((artist) => artist.name).join(', ')}
          </span>{' '}
          的應援活動
        </p>
        <p className="note">注意：無法修改活動的藝人資訊</p>
      </FormHeader>

      <Form onSubmit={handleSubmit}>
        {/* 活動標題 */}
        <FormGroup>
          <Label htmlFor="title">活動標題 *</Label>
          <Input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            required
            placeholder="例：IU 生日應援咖啡"
          />
        </FormGroup>

        {/* 活動描述 */}
        <FormGroup>
          <Label htmlFor="description">活動描述 *</Label>
          <TextArea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            required
            placeholder="詳細描述活動內容、特色等..."
          />
        </FormGroup>

        {/* 地點名稱 */}
        <FormGroup>
          <Label htmlFor="locationName">地點名稱 *</Label>
          <Input
            type="text"
            id="locationName"
            value={formData.locationName}
            onChange={(e) => setFormData((prev) => ({ ...prev, locationName: e.target.value }))}
            required
            placeholder="例：星巴克信義店"
          />
        </FormGroup>

        {/* 地點 */}
        <FormGroup>
          <Label>活動地址 *</Label>
          <PlaceAutocomplete
            defaultValue={formData.address}
            onPlaceSelect={handleLocationSelect}
            placeholder="搜尋咖啡廳或活動地址"
          />
        </FormGroup>

        {/* 時間設定 */}
        <FormSection>
          <GridContainer>
            <FormGroup>
              <Label>開始時間 *</Label>
              <TimeGridContainer>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </TimeGridContainer>
            </FormGroup>

            <FormGroup>
              <Label>結束時間 *</Label>
              <TimeGridContainer>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </TimeGridContainer>
            </FormGroup>
          </GridContainer>
        </FormSection>

        {/* 社群媒體 */}
        <FormSection>
          <SectionTitle>社群媒體連結</SectionTitle>

          <FormGroup>
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              type="text"
              id="instagram"
              value={formData.instagram}
              onChange={(e) => setFormData((prev) => ({ ...prev, instagram: e.target.value }))}
              placeholder="@username 或完整網址"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="x">X (前 Twitter)</Label>
            <Input
              type="text"
              id="x"
              value={formData.x}
              onChange={(e) => setFormData((prev) => ({ ...prev, x: e.target.value }))}
              placeholder="@username 或完整網址"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="threads">Threads</Label>
            <Input
              type="text"
              id="threads"
              value={formData.threads}
              onChange={(e) => setFormData((prev) => ({ ...prev, threads: e.target.value }))}
              placeholder="@username 或完整網址"
            />
          </FormGroup>
        </FormSection>

        {/* 活動圖片 */}
        <FormSection>
          <SectionTitle>活動圖片</SectionTitle>

          <FormGroup>
            <Label htmlFor="mainImage">主要圖片 URL</Label>
            <Input
              type="url"
              id="mainImage"
              value={formData.mainImage}
              onChange={(e) => setFormData((prev) => ({ ...prev, mainImage: e.target.value }))}
              placeholder="https://example.com/main-image.jpg"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="detailImage">詳細圖片 URL</Label>
            <Input
              type="url"
              id="detailImage"
              value={formData.detailImage}
              onChange={(e) => setFormData((prev) => ({ ...prev, detailImage: e.target.value }))}
              placeholder="https://example.com/detail-image.jpg"
            />
          </FormGroup>
        </FormSection>

        {/* 表單按鈕 */}
        <ButtonGroup>
          <Button type="button" variant="secondary" onClick={onCancel}>
            取消
          </Button>
          <Button type="submit" variant="primary" disabled={updateEventMutation.isPending}>
            {updateEventMutation.isPending ? '更新中...' : '更新活動'}
          </Button>
        </ButtonGroup>

        {/* 錯誤訊息 */}
        {updateEventMutation.isError && (
          <ErrorMessage>
            更新失敗：
            {updateEventMutation.error instanceof Error
              ? updateEventMutation.error.message
              : '未知錯誤'}
          </ErrorMessage>
        )}
      </Form>
    </FormContainer>
  );
}
