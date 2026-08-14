import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api, Booking } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme';

export const OrdersScreen: React.FC = ({ navigation }: any) => {
  const [items, setItems] = useState<Booking[]>([]);

  const refresh = async () => {
    const b = await api.listBookings();
    setItems(b);
  };

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [])
  );

  const updateStatus = async (id: string, status: Booking['status']) => {
    await api.updateBookingStatus(id, status);
    refresh();
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Réservations</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Card style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{item.type} • {item.package ?? 'Standard'}</Text>
              <Text style={{ color: colors.text, fontWeight: '700' }}>€{item.price ?? 0}</Text>
            </View>
            <Text style={{ color: colors.muted, marginTop: 6 }}>{item.date} • {item.time}</Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>{item.location} • {item.people ?? 1} pers.</Text>
            <Text style={{ color: colors.accent, marginTop: 8 }}>{item.status.toUpperCase()}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
              {item.status === 'pending' ? (
                <TouchableOpacity onPress={() => updateStatus(item.id, 'confirmed')} style={{ marginRight: 16, marginBottom: 8 }}>
                  <Text style={{ color: colors.accent }}>Confirmer</Text>
                </TouchableOpacity>
              ) : null}
              {item.status !== 'cancelled' ? (
                <TouchableOpacity onPress={() => updateStatus(item.id, 'completed')} style={{ marginRight: 16, marginBottom: 8 }}>
                  <Text style={{ color: colors.accent }}>Terminer</Text>
                </TouchableOpacity>
              ) : null}
              {item.status !== 'cancelled' ? (
                <TouchableOpacity onPress={() => updateStatus(item.id, 'cancelled')} style={{ marginBottom: 8 }}>
                  <Text style={{ color: colors.accent }}>Annuler</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </Card>
        )}
        ListEmptyComponent={<Text style={{ color: colors.muted, marginTop: 20 }}>Aucune réservation enregistrée.</Text>}
      />
    </View>
  );
};
