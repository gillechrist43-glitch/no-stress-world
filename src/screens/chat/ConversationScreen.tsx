import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { messaging } from '../../services/api';
import { ChatBubble } from '../../components/ui/ChatBubble';
import { colors } from '../../theme';

export const ConversationScreen: React.FC = ({ route, navigation }: any) => {
  const { conversationId } = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    (async () => {
      const m = await messaging.listMessages(conversationId);
      setMessages(m);
    })();
  }, [conversationId]);

  const send = async () => {
    if (!text.trim()) return;
    const m = await messaging.sendMessage(conversationId, 'client', text.trim());
    setMessages((s) => [...s, m]);
    setText('');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList data={messages} keyExtractor={(i) => i.id} renderItem={({ item }) => <ChatBubble text={item.text} from={item.from} />} contentContainerStyle={{ padding: 16 }} />

      <View style={{ flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#222' }}>
        <TextInput value={text} onChangeText={setText} placeholder="Écrire un message" placeholderTextColor={colors.muted} style={{ flex: 1, color: colors.text, backgroundColor: colors.card, padding: 10, borderRadius: 12, marginRight: 8 }} />
        <TouchableOpacity onPress={send} style={{ alignSelf: 'center' }}>
          <Text style={{ color: colors.accent, fontWeight: '700' }}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
