import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { colors } from '../theme';

const notifications = [
  { id: 'n1', title: 'Nouvelle disponibilité', body: 'Votre photographe est disponible mercredi à 14h.' },
  { id: 'n2', title: 'Réservation confirmée', body: 'Votre séance Portrait a été confirmée.' },
  { id: 'n3', title: 'Suggestion', body: 'Ajoutez un format livrable numérique pour votre prochaine séance.' }
];

export const NotificationsScreen: React.FC = () => {
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#222', marginVertical: 12 }} />}
        renderItem={({ item }) => (
          <View>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>{item.title}</Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>{item.body}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: colors.muted, marginTop: 20 }}>Aucune notification récente.</Text>}
      />
    </View>
  );
};
