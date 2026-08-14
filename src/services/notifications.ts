export type Notification = {
  id: string;
  title: string;
  body: string;
  read?: boolean;
  createdAt: string;
};

let notifications: Notification[] = [
  { id: 'n1', title: 'Réservation confirmée', body: 'Votre séance du 01/09 est confirmée.', read: false, createdAt: new Date().toISOString() }
];

export const notificationsApi = {
  list: async () => {
    await new Promise((r) => setTimeout(r, 150));
    return notifications;
  },
  send: async (title: string, body: string) => {
    const n: Notification = { id: 'n' + (notifications.length + 1), title, body, read: false, createdAt: new Date().toISOString() };
    notifications.unshift(n);
    return n;
  },
  markRead: async (id: string) => {
    const idx = notifications.findIndex((n) => n.id === id);
    if (idx >= 0) notifications[idx].read = true;
    return notifications[idx];
  }
};
