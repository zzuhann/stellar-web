import { CoffeeEvent, Artist, Venue } from '@/types';
import api from './client';

export interface AdminPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const adminApi = {
  getEvents: (params: {
    search?: string;
    slug?: string;
    id?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => api.get<{ data: CoffeeEvent[]; pagination: AdminPagination }>('/admin/events', { params }),

  getArtists: (params: {
    search?: string;
    slug?: string;
    id?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => api.get<{ data: Artist[]; pagination: AdminPagination }>('/admin/artists', { params }),

  deleteArtistsBatch: (ids: string[]) =>
    api.delete<{ deleted: number }>('/admin/artists/batch', { data: { ids } }),

  deleteEvent: (id: string) => api.delete<{ message: string }>(`/events/${id}`),

  deleteArtist: (id: string) => api.delete<{ message: string }>(`/artists/${id}`),

  getVenues: (params: { search?: string; status?: string; page?: number; limit?: number }) =>
    api.get<{ data: Venue[]; pagination: AdminPagination }>('/admin/venues', { params }),
};
