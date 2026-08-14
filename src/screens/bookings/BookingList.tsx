import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api, Booking } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme';

export const BookingsListScreen: React.FC = ({ navigation }: any) => {
  const [items, setItems] = useState<Booking[]>([]);

  const loadBookings = async () => {
    const b = await api.listBookings();
    setItems(b);
  };

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [])
  );

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Réservations</Text>
        <TouchableOpacity onPress={() => navigation.navigate('BookingForm')}>
          <Text style={{ color: colors.accent }}>Nouvelle</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('BookingSummary', { id: item.id })}>
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{item.type}</Text>
                <Text style={{ color: colors.accent }}>{item.status.toUpperCase()}</Text>
              </View>
              <Text style={{ color: colors.muted, marginTop: 6 }}>{item.date} • {item.time}</Text>
              <Text style={{ color: colors.muted, marginTop: 4 }}>{item.location} • {item.package ?? 'Standard'}</Text>
              {item.options?.length ? <Text style={{ color: colors.text, marginTop: 8 }}>{item.options.join(' • ')}</Text> : null}
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ color: colors.muted, marginTop: 20 }}>Aucune réservation pour le moment.</Text>}
      />
    </View>
  );
};
