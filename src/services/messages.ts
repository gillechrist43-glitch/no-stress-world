export type Message = {
  id: string;
  from: 'client' | 'admin';
  text: string;
  createdAt: string;
  conversationId: string;
};

let messages: Message[] = [
  { id: 'm1', from: 'client', text: 'Bonjour, je souhaite réserver une séance.', createdAt: new Date().toISOString(), conversationId: 'c1' },
  { id: 'm2', from: 'admin', text: 'Bonjour ! Nous avons des disponibilités la semaine prochaine.', createdAt: new Date().toISOString(), conversationId: 'c1' }
];

export const messagesApi = {
  listConversations: async () => {
    await new Promise((r) => setTimeout(r, 200));
    // return unique conversation ids with last message
    const map = new Map<string, Message>();
    messages.forEach((m) => map.set(m.conversationId, m));
    return Array.from(map.keys()).map((id) => ({ id, last: map.get(id) }));
  },
  listMessages: async (conversationId: string) => {
    await new Promise((r) => setTimeout(r, 150));
    return messages.filter((m) => m.conversationId === conversationId);
  },
  sendMessage: async (conversationId: string, from: Message['from'], text: string) => {
    const m: Message = { id: 'm' + (messages.length + 1), from, text, createdAt: new Date().toISOString(), conversationId };
    messages.push(m);
    await new Promise((r) => setTimeout(r, 100));
    return m;
  }
};
