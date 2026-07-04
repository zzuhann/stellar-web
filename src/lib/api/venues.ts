import {
  VenueFilterParams,
  VenuesResponse,
  VenueDetail,
  UpdateVenueData,
  CreateVenueData,
} from '@/types';
import api from './client';

export const venueApi = {
  createVenue: async (data: CreateVenueData): Promise<VenueDetail> => {
    const response = await api.post<VenueDetail>('/venues', data);
    return response.data;
  },

  getVenueById: async (id: string): Promise<VenueDetail> => {
    const response = await api.get<VenueDetail>(`/venues/${id}`);
    return response.data;
  },

  getAdminVenueById: async (id: string): Promise<VenueDetail> => {
    const response = await api.get<VenueDetail>(`/venues/admin/${id}`);
    return response.data;
  },

  updateVenue: async (id: string, data: UpdateVenueData): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>(`/venues/${id}`, data);
    return response.data;
  },

  deleteVenue: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/venues/${id}`);
    return response.data;
  },

  permanentDeleteVenue: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/venues/admin/${id}/permanent`);
    return response.data;
  },

  getVenues: async (params: VenueFilterParams = {}): Promise<VenuesResponse> => {
    const searchParams = new URLSearchParams();

    if (params.region && params.region.length > 0) {
      params.region.forEach((r) => searchParams.append('region', r));
    }
    if (params.capacityRange !== undefined) {
      searchParams.set('capacityRange', params.capacityRange);
    }
    if (params.sort) {
      searchParams.set('sort', params.sort);
    }
    if (params.status) {
      searchParams.set('status', params.status);
    }

    const query = searchParams.toString();
    const response = await api.get<VenuesResponse>(`/venues${query ? `?${query}` : ''}`);
    return response.data;
  },

  batchReviewVenues: async (
    updates: Array<{ venueId: string; status: 'active' | 'rejected' }>
  ): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>(
      '/venues/batch-review',
      { updates },
      { timeout: 60000 }
    );
    return response.data;
  },

  batchStatusVenues: async (
    updates: Array<{ venueId: string; status: 'active' | 'inactive' }>
  ): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>('/venues/batch-status', { updates });
    return response.data;
  },
};
