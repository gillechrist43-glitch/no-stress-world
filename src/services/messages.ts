export type Message = {
  id: string;
  from: 'client' | 'admin';
  text: string;
  createdAt: string;
  conversationId: string;
};

const messages: Message[] = [];

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
