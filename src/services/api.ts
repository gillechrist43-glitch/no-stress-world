// Mocked API services for bookings, gallery, messages

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
};

let bookings: Booking[] = [
  {
    id: 'b1',
    type: 'Portrait',
    date: '2026-09-01',
    time: '10:00',
    location: 'Studio A',
    status: 'confirmed',
    people: 1,
    sessionLength: '1h30',
    notes: 'Portrait lifestyle',
    options: ['Retouches +'],
    package: 'Premium',
    price: 220
  }
];

const galleryItems: GalleryItem[] = [
  { id: 'g1', title: 'Portrait intemporel', category: 'Portrait', description: 'Couleurs chaudes et ambiance posée.' },
  { id: 'g2', title: 'Mariage en extérieur', category: 'Événement', description: 'Lumière dorée et émotions naturelles.' },
  { id: 'g3', title: 'Studio minimaliste', category: 'Studio', description: 'Jeu de textures et contraste subtil.' }
];

const packagePrices: Record<string, number> = {
  Standard: 120,
  Premium: 180,
  Deluxe: 240
};

const optionPrices: Record<string, number> = {
  'Retouches supplémentaires': 50,
  'Livraison express': 40,
  'Retouches +': 50
};

import { getItem, setItem } from './db';

const DEFAULT_BASE = 'http://localhost:4004';
// Determine whether to use remote API:
// - explicit env var REACT_APP_REMOTE_API=true|1
// - or running in the browser on localhost
const IS_REMOTE =
  (typeof process !== 'undefined' && (process.env.REACT_APP_REMOTE_API === 'true' || process.env.REACT_APP_REMOTE_API === '1')) ||
  (typeof window !== 'undefined' && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'));

const BASE_URL = (typeof process !== 'undefined' && process.env.REACT_APP_REMOTE_API_URL) || DEFAULT_BASE;

const TOKEN_KEY = '@app:token';

async function authFetch(path: string, opts: RequestInit = {}) {
  const token = await getItem(TOKEN_KEY);
  const headers = { ...(opts.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) } as any;
  return fetch(`${BASE_URL}${path}`, { ...opts, headers });
}

const BOOKINGS_KEY = '@app:bookings';
const GALLERY_KEY = '@app:gallery';

async function loadInitial() {
  try {
    const b = await getItem(BOOKINGS_KEY);
    if (b) bookings = JSON.parse(b);
  } catch (e) {}
  try {
    const g = await getItem(GALLERY_KEY);
    if (g) {
      // overwrite galleryItems only if stored
      // @ts-ignore
      galleryItems.splice(0, galleryItems.length, ...JSON.parse(g));
    }
  } catch (e) {}
}

loadInitial();

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
    // local mock: create user and return token-like object
    const u = { user: { id: 'u' + Date.now(), name, email, role: 'client' }, token: 'local-' + Date.now() };
    await setItem(TOKEN_KEY, u.token);
    return u;
  },
  login: async (email: string, password: string) => {
    if (IS_REMOTE) {
      const res = await fetch(`${BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      if (data.token) await setItem(TOKEN_KEY, data.token);
      return data;
    }
    const u = { user: { id: 'u' + Date.now(), name: email.split('@')[0], email, role: email.includes('admin') ? 'admin' : 'client' }, token: 'local-' + Date.now() };
    await setItem(TOKEN_KEY, u.token);
    return u;
  },
  createAdmin: async (name: string, email: string, password: string) => {
    if (IS_REMOTE) {
      const res = await authFetch('/admin/create-admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
      return await res.json();
    }
    return { id: 'u' + Date.now(), name, email, role: 'admin' };
  },

  listBookings: async (): Promise<Booking[]> => {
    if (IS_REMOTE) {
      const res = await authFetch('/bookings');
      return (await res.json()) as Booking[];
    }
    await new Promise((r) => setTimeout(r, 300));
    return bookings;
  },
  createBooking: async (b: Omit<Booking, 'id' | 'status'>) => {
    if (IS_REMOTE) {
      const res = await fetch(`${BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(b),
      });
      return (await res.json()) as Booking;
    }
    await new Promise((r) => setTimeout(r, 300));
    const basePrice = packagePrices[b.package ?? 'Standard'] ?? 120;
    const optionsPrice = (b.options ?? []).reduce((sum, option) => sum + (optionPrices[option] ?? 0), 0);
    const nb: Booking = {
      ...b,
      id: 'b' + (bookings.length + 1),
      status: 'pending',
      price: basePrice + optionsPrice,
    } as Booking;
    bookings.push(nb);
    try {
      await setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    } catch (e) {}
    return nb;
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
    const idx = bookings.findIndex((x) => x.id === id);
    if (idx >= 0) bookings[idx].status = status;
    try {
      await setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    } catch (e) {}
    return bookings[idx];
  },
  listGallery: async (): Promise<GalleryItem[]> => {
    if (IS_REMOTE) {
      const res = await authFetch('/gallery');
      return (await res.json()) as GalleryItem[];
    }
    await new Promise((r) => setTimeout(r, 200));
    return galleryItems;
  },
  addGalleryItem: async (item: Omit<GalleryItem, 'id'>) => {
    if (IS_REMOTE) {
      const res = await authFetch('/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      return (await res.json()) as GalleryItem;
    }
    await new Promise((r) => setTimeout(r, 200));
    const nextId = 'g' + (galleryItems.length + 1);
    const newItem: GalleryItem = { id: nextId, ...item };
    galleryItems.push(newItem);
    try {
      await setItem(GALLERY_KEY, JSON.stringify(galleryItems));
    } catch (e) {}
    return newItem;
  },
  removeGalleryItem: async (id: string) => {
    if (IS_REMOTE) {
      const res = await authFetch(`/gallery/${id}`, { method: 'DELETE' });
      return (await res.json()).id as string;
    }
    await new Promise((r) => setTimeout(r, 200));
    const index = galleryItems.findIndex((item) => item.id === id);
    if (index >= 0) galleryItems.splice(index, 1);
    try {
      await setItem(GALLERY_KEY, JSON.stringify(galleryItems));
    } catch (e) {}
    return id;
  },
  getDashboardStats: async () => {
    if (IS_REMOTE) {
      const res = await authFetch('/dashboard');
      return await res.json();
    }
    await new Promise((r) => setTimeout(r, 200));
    const completedBookings = bookings.filter((b) => b.status === 'completed');
    return {
      totalBookings: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      completed: completedBookings.length,
      revenue: completedBookings.reduce((sum, booking) => sum + (booking.price ?? 0), 0),
      packageRevenue: bookings.reduce((acc, booking) => {
        const pkg = booking.package ?? 'Standard';
        acc[pkg] = (acc[pkg] ?? 0) + (booking.price ?? 0);
        return acc;
      }, {} as Record<string, number>),
    };
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
    // local fallback: store in local storage
    const key = '@app:photographySurveys';
    try {
      const raw = await getItem(key) || '[]';
      const arr = JSON.parse(raw);
      const ref = payload.reference || 'NS' + Date.now();
      const entry = { id: 's' + (arr.length + 1), reference: ref, timestamp: new Date().toISOString(), ...payload };
      arr.push(entry);
      await setItem(key, JSON.stringify(arr));
      return entry;
    } catch (e) {
      return { error: 'failed' };
    }
  },
  listSurveys: async () => {
    if (IS_REMOTE) {
      const res = await authFetch('/admin/surveys');
      return await res.json();
    }
    const raw = await getItem('@app:photographySurveys');
    return raw ? JSON.parse(raw) : [];
  },
  exportSurveysCsv: async () => {
    if (IS_REMOTE) {
      const res = await authFetch('/admin/surveys/export');
      return await res.text();
    }
    const raw = await getItem('@app:photographySurveys');
    return raw || '[]';
  }
};

// Messages wrappers (use existing local messagesApi when not remote)
import { messagesApi } from './messages';

export const messaging = {
  listConversations: async () => {
    if (IS_REMOTE) {
      const res = await authFetch('/conversations');
      return await res.json();
    }
    return messagesApi.listConversations();
  },
  listMessages: async (conversationId: string) => {
    if (IS_REMOTE) {
      const res = await authFetch(`/conversations/${conversationId}/messages`);
      return await res.json();
    }
    return messagesApi.listMessages(conversationId);
  },
  sendMessage: async (conversationId: string, from: 'client' | 'admin', text: string) => {
    if (IS_REMOTE) {
      const res = await authFetch(`/conversations/${conversationId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      return await res.json();
    }
    return messagesApi.sendMessage(conversationId, from, text);
  }
};
