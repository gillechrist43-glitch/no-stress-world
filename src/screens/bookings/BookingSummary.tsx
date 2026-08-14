import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { api } from '../../services/api';
import { colors } from '../../theme';

export const BookingSummaryScreen: React.FC = ({ route, navigation }: any) => {
  const { id, payload } = route.params || {};
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    (async () => {
      if (id) {
        const b = (await api.listBookings()).find((x) => x.id === id);
        setBooking(b);
      } else if (payload) {
        setBooking({ ...payload });
      }
    })();
  }, [id, payload]);

  const onConfirm = async () => {
    if (id) {
      await api.updateBookingStatus(id, 'confirmed');
      navigation.goBack();
    } else if (booking) {
      await api.createBooking({ ...booking } as any);
      navigation.navigate('Client', { screen: 'Bookings' });
    }
  };

  if (!booking) return null;

  const renderRow = (label: string, value: string | number | undefined) => (
    <View style={{ marginTop: 12 }}>
      <Text style={{ color: colors.muted }}>{label}</Text>
      <Text style={{ color: colors.text }}>{value ?? '—'}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Récapitulatif</Text>
      {renderRow('Type', booking.type)}
      {renderRow('Forfait', booking.package)}
      {renderRow('Durée', booking.sessionLength)}
      {renderRow('Participants', booking.people)}
      {renderRow('Date / Heure', `${booking.date} • ${booking.time}`)}
      {renderRow('Lieu', booking.location)}
      {renderRow('Ambiance', booking.style)}
      <View style={{ marginTop: 12 }}>
        <Text style={{ color: colors.muted }}>Options</Text>
        <Text style={{ color: colors.text }}>{booking.options?.length ? booking.options.join(' • ') : 'Aucune option choisie'}</Text>
      </View>
      {booking.notes ? (
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: colors.muted }}>Notes</Text>
          <Text style={{ color: colors.text }}>{booking.notes}</Text>
        </View>
      ) : null}

      <TouchableOpacity onPress={onConfirm} style={{ marginTop: 24 }}>
        <Text style={{ color: colors.accent, fontWeight: '700' }}>{id ? 'Mettre à jour le statut' : 'Confirmer la réservation'}</Text>
      </TouchableOpacity>
    </View>
  );
};
