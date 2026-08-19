export type Booking = {
  id: string;
  type: string;
  date: string;
  time: string;
  location: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  people?: number;
  sessionLength?: string;
  notes?: string;
  options?: string[];
  package?: string;
  price?: number;
};

export type GalleryItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
};

export type GalleryUpload = {
  title: string;
  category: string;
  description: string;
  imageUri: string;
  fileName?: string;
  mimeType?: string;
};

import { getItem, setItem } from './db';
import { Platform } from 'react-native';

const DEFAULT_BASE = 'http://localhost:4004';
const CONFIGURED_BASE = typeof process !== 'undefined' ? process.env.REACT_APP_REMOTE_API_URL : undefined;
const IS_LOCAL_HOST = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
const IS_REMOTE = true;
const BASE_URL = CONFIGURED_BASE || (IS_LOCAL_HOST ? DEFAULT_BASE : '/api');

if (IS_REMOTE && !BASE_URL && typeof window !== 'undefined') {
  console.warn('REACT_APP_REMOTE_API_URL is required for deployed web builds.');
}

const TOKEN_KEY = '@app:token';

async function authFetch(path: string, opts: RequestInit = {}) {
  const token = await getItem(TOKEN_KEY);
  const headers = { ...(opts.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) } as any;
  return fetch(`${BASE_URL}${path}`, { ...opts, headers });
}

export const api = {
  // Authentication
  register: async (name: string, email: string, password: string) => {
    if (IS_REMOTE) {
      const res = await fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      if (data.token) await setItem(TOKEN_KEY, data.token);
      return data;
    }
  },
  login: async (email: string, password: string) => {
    if (IS_REMOTE) {
      const res = await fetch(`${BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      if (data.token) await setItem(TOKEN_KEY, data.token);
      return data;
    }
  },
  createAdmin: async (name: string, email: string, password: string) => {
    if (IS_REMOTE) {
      const res = await authFetch('/admin/create-admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
      return await res.json();
    }
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await authFetch('/auth/password', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Unable to change password');
    return data;
  },
  deleteAccount: async (password: string) => {
    const res = await authFetch('/auth/account', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Unable to delete account');
    await setItem(TOKEN_KEY, '');
    return data;
  },

  listBookings: async (): Promise<Booking[]> => {
    if (IS_REMOTE) {
      const res = await authFetch('/bookings');
      return (await res.json()) as Booking[];
    }
    throw new Error('Backend API is not configured');
  },
  createBooking: async (b: Omit<Booking, 'id' | 'status'>) => {
    if (IS_REMOTE) {
      const res = await authFetch('/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(b),
      });
      return (await res.json()) as Booking;
    }
  },
  updateBookingStatus: async (id: string, status: Booking['status']) => {
    if (IS_REMOTE) {
      const res = await authFetch(`/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return (await res.json()) as Booking;
    }
  },
  listGallery: async (): Promise<GalleryItem[]> => {
    if (IS_REMOTE) {
      const res = await authFetch('/gallery');
      return (await res.json()) as GalleryItem[];
    }
    throw new Error('Backend API is not configured');
  },
  addGalleryItem: async (item: GalleryUpload) => {
    if (IS_REMOTE) {
      const formData = new FormData();
      formData.append('title', item.title);
      formData.append('category', item.category);
      formData.append('description', item.description);
      if (Platform.OS === 'web') {
        const imageResponse = await fetch(item.imageUri);
        if (!imageResponse.ok) throw new Error('Unable to read selected image');
        const imageBlob = await imageResponse.blob();
        formData.append('image', imageBlob, item.fileName || 'gallery-image.jpg');
      } else {
        formData.append('image', { uri: item.imageUri, name: item.fileName || 'gallery-image.jpg', type: item.mimeType || 'image/jpeg' } as any);
      }
      const res = await authFetch('/gallery', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to publish image');
      return data as GalleryItem;
    }
  },
  removeGalleryItem: async (id: string) => {
    if (IS_REMOTE) {
      const res = await authFetch(`/gallery/${id}`, { method: 'DELETE' });
      return (await res.json()).id as string;
    }
  },
  getDashboardStats: async () => {
    if (IS_REMOTE) {
      const res = await authFetch('/dashboard');
      return await res.json();
    }
  }
  ,
  // Surveys
  createSurvey: async (payload: any) => {
    if (IS_REMOTE) {
      const res = await fetch(`${BASE_URL}/surveys`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create survey');
      return data;
    }
  },
  listSurveys: async () => {
    if (IS_REMOTE) {
      const res = await authFetch('/admin/surveys');
      return await res.json();
    }
  },
  exportSurveysCsv: async () => {
    if (IS_REMOTE) {
      const res = await authFetch('/admin/surveys/export');
      return await res.text();
    }
  }
};

export const messaging = {
  listConversations: async () => {
    if (IS_REMOTE) {
      const res = await authFetch('/conversations');
      return await res.json();
    }
  },
  listMessages: async (conversationId: string) => {
    if (IS_REMOTE) {
      const res = await authFetch(`/conversations/${conversationId}/messages`);
      return await res.json();
    }
  },
  sendMessage: async (conversationId: string, from: 'client' | 'admin', text: string) => {
    if (IS_REMOTE) {
      const res = await authFetch(`/conversations/${conversationId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      return await res.json();
    }
  }
};
