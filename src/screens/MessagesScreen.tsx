import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { colors } from '../theme';
import { messaging } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export const MessagesScreen: React.FC = ({ navigation }: any) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    (async () => {
      const c = await messaging.listConversations();
      setConversations(c);
    })();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Messages</Text>
        {user?.role === 'client' ? (
          <TouchableOpacity onPress={() => navigation.navigate('Conversation', { conversationId: `u${user.id.replace(/^u/, '')}:support` })}>
            <Text style={{ color: colors.accent }}>Nouveau</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(i) => i.id}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#222', marginVertical: 8 }} />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('Conversation', { conversationId: item.id })} style={{ paddingVertical: 10 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>Conversation {item.id}</Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>{item.last?.text}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ color: colors.muted, marginTop: 20 }}>Aucune conversation disponible.</Text>}
      />
    </View>
  );
};
