import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { colors, spacing, radii } from '../theme';
import { Card } from '../components/ui/Card';
import { api, GalleryItem } from '../services/api';

const defaultStats = [
  { id: 's1', title: 'Réservations', value: '0' },
  { id: 's2', title: 'Confirmées', value: '0' },
  { id: 's3', title: 'Messages', value: '3' },
];

export const HomeScreen: React.FC = ({ navigation }: any) => {
  const [stats, setStats] = useState(defaultStats);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  useEffect(() => {
    (async () => {
      const [items, dashboard] = await Promise.all([api.listGallery(), api.getDashboardStats()]);
      setGallery(items);
      setStats([
        { id: 's1', title: 'Réservations', value: String(dashboard.totalBookings) },
        { id: 's2', title: 'Confirmées', value: String(dashboard.confirmed) },
        { id: 's3', title: 'Demandes', value: String(dashboard.pending) }
      ]);
    })();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.md }}>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: '700', marginBottom: 6 }}>Bienvenue</Text>
        <Text style={{ color: colors.muted, marginBottom: 16 }}>Préparez votre prochaine séance et inspirez-vous.</Text>

        <FlatList
          data={stats}
          horizontal
          keyExtractor={(i) => i.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card style={{ width: 150, marginRight: 12, backgroundColor: '#161616' }}>
              <Text style={{ color: colors.muted }}>{item.title}</Text>
              <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700', marginTop: 8 }}>{item.value}</Text>
            </Card>
          )}
        />

        <View style={{ marginTop: 18 }}>
          <Card>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Prochaine session</Text>
            <Text style={{ color: colors.muted }}>Aucune session programmée pour le moment.</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BookingForm')} style={{ marginTop: 14 }}>
              <View style={{ backgroundColor: colors.accent, padding: 12, borderRadius: radii.sm }}>
                <Text style={{ color: '#121212', textAlign: 'center', fontWeight: '700' }}>Réserver une séance</Text>
              </View>
            </TouchableOpacity>
          </Card>
        </View>

        <View style={{ marginTop: 18 }}>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Inspirations récentes</Text>
          <FlatList
            data={gallery}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Card style={{ width: 220, marginRight: 12, backgroundColor: '#161616' }}>
                <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 8 }}>{item.title}</Text>
                <Text style={{ color: colors.muted, marginBottom: 10 }}>{item.category}</Text>
                <Text style={{ color: colors.text, fontSize: 14 }}>{item.description}</Text>
              </Card>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
