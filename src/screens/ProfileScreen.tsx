import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { colors } from '../theme';

export const ProfileScreen: React.FC = ({ navigation }: any) => {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Profil</Text>
        <Text style={{ color: colors.muted, marginTop: 14 }}>Nom : <Text style={{ color: colors.text }}>{user?.name ?? 'Invité'}</Text></Text>
        <Text style={{ color: colors.muted, marginTop: 8 }}>Email : <Text style={{ color: colors.text }}>{user?.email ?? 'Non renseigné'}</Text></Text>
        <Text style={{ color: colors.muted, marginTop: 8 }}>Rôle : <Text style={{ color: colors.text }}>{user?.role ?? 'client'}</Text></Text>

        <TouchableOpacity onPress={() => navigation.navigate('Bookings')} style={{ marginTop: 24 }}>
          <Text style={{ color: colors.accent }}>Mes réservations</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#222' }}>
        <TouchableOpacity onPress={() => { logout(); navigation.replace('Auth'); }}>
          <Text style={{ color: colors.accent, textAlign: 'center', fontWeight: '700' }}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
