import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { Input } from '../../components/ui/Input';
import { api, Booking } from '../../services/api';
import { colors } from '../../theme';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/useAuthStore';
import { removeItem } from '../../services/db';

export const AdminDashboard: React.FC = ({ navigation }: any) => {
  const [stats, setStats] = useState({ totalBookings: 0, pending: 0, confirmed: 0, completed: 0, revenue: 0, packageRevenue: {} as Record<string, number> });
  const [latest, setLatest] = useState<Booking[]>([]);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [newAdminName, setNewAdminName] = React.useState('');
  const [newAdminEmail, setNewAdminEmail] = React.useState('');
  const [newAdminPassword, setNewAdminPassword] = React.useState('');
  const [creatingAdmin, setCreatingAdmin] = React.useState(false);

  useEffect(() => {
    (async () => {
      const dashboard = await api.getDashboardStats();
      const bookings = await api.listBookings();
      setStats(dashboard);
      setLatest(bookings.slice(0, 5));
    })();
  }, []);

  const onLogout = async () => {
    await removeItem('@app:token');
    logout();
    navigation.replace('Welcome');
  };

  const onCreateAdmin = async () => {
    if (!newAdminEmail.includes('@') || newAdminPassword.length < 6) {
      Alert.alert('Erreur', 'Email invalide ou mot de passe trop court.');
      return;
    }
    setCreatingAdmin(true);
    try {
      await api.createAdmin(newAdminName, newAdminEmail, newAdminPassword);
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      Alert.alert('Succès', 'Administrateur créé avec succès!');
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || 'Erreur lors de la création');
    }
    setCreatingAdmin(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Professional Header */}
      <View style={{ backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>📊 Dashboard</Text>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{user?.email}</Text>
          </View>
          <TouchableOpacity onPress={onLogout} style={{ backgroundColor: colors.accent, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>Déconnecter</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Stats Overview */}
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Vue d'ensemble</Text>
        <View style={{ flexDirection: 'row', marginBottom: 16, justifyContent: 'space-between' }}>
          {[
            { label: 'Total', value: stats.totalBookings, icon: '📅' },
            { label: 'Confirmées', value: stats.confirmed, icon: '✅' },
            { label: 'En attente', value: stats.pending, icon: '⏳' },
            { label: 'Terminées', value: stats.completed, icon: '🎉' }
          ].map((item) => (
            <Card key={item.label} style={{ flex: 1, marginRight: item.label !== 'Terminées' ? 8 : 0, padding: 12 }}>
              <Text style={{ color: colors.muted, fontSize: 11 }}>{item.label}</Text>
              <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700', marginTop: 8 }}>
                {item.icon} {item.value}
              </Text>
            </Card>
          ))}
        </View>

        {/* Revenue Card */}
        <Card style={{ padding: 16, marginBottom: 18 }}>
          <Text style={{ color: colors.muted, fontSize: 12 }}>💰 Revenu total</Text>
          <Text style={{ color: colors.accent, fontSize: 32, fontWeight: '700', marginTop: 8 }}>€{stats.revenue}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
            {Object.entries(stats.packageRevenue).map(([packageName, amount]) => (
              <View key={packageName} style={{ marginRight: 16, marginBottom: 8 }}>
                <Text style={{ color: colors.muted, fontSize: 11 }}>{packageName}</Text>
                <Text style={{ color: colors.text, fontWeight: '700' }}>€{amount}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Quick Actions */}
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Actions rapides</Text>
        <View style={{ flexDirection: 'row', marginBottom: 16, justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => navigation.navigate('AdminOrders')} style={{ flex: 1, marginRight: 8 }}>
            <Card style={{ padding: 14, alignItems: 'center' }}>
              <Text style={{ fontSize: 24, marginBottom: 6 }}>📋</Text>
              <Text style={{ color: colors.text, fontWeight: '600', fontSize: 12, textAlign: 'center' }}>Réservations</Text>
            </Card>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('GalleryManagement')} style={{ flex: 1, marginRight: 8 }}>
            <Card style={{ padding: 14, alignItems: 'center' }}>
              <Text style={{ fontSize: 24, marginBottom: 6 }}>🎨</Text>
              <Text style={{ color: colors.text, fontWeight: '600', fontSize: 12, textAlign: 'center' }}>Galerie</Text>
            </Card>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              try {
                const csv = await api.exportSurveysCsv();
                if (Platform.OS === 'web' && typeof window !== 'undefined') {
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'surveys.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                }
              } catch (e) {
                Alert.alert('Erreur', 'Impossible d\'exporter.');
              }
            }}
            style={{ flex: 1 }}
          >
            <Card style={{ padding: 14, alignItems: 'center' }}>
              <Text style={{ fontSize: 24, marginBottom: 6 }}>📊</Text>
              <Text style={{ color: colors.text, fontWeight: '600', fontSize: 12, textAlign: 'center' }}>Export</Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Create Admin Section */}
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>👤 Nouvel admin</Text>
        <Card style={{ padding: 14, marginBottom: 18 }}>
          <Input label="Nom" value={newAdminName} onChangeText={setNewAdminName} placeholder="Nom complet" />
          <Input label="Email" value={newAdminEmail} onChangeText={setNewAdminEmail} placeholder="admin@example.com" />
          <Input label="Mot de passe" value={newAdminPassword} onChangeText={setNewAdminPassword} placeholder="••••••••" secureTextEntry />
          <TouchableOpacity
            onPress={onCreateAdmin}
            disabled={creatingAdmin}
            style={{ backgroundColor: colors.accent, padding: 12, borderRadius: 8, marginTop: 12, opacity: creatingAdmin ? 0.6 : 1 }}
          >
            <Text style={{ color: colors.text, fontWeight: '600', textAlign: 'center' }}>
              {creatingAdmin ? 'Création...' : 'Créer'}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Recent Bookings */}
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>📅 Réservations récentes</Text>
        {latest.length > 0 ? (
          latest.map((item) => (
            <Card key={item.id} style={{ marginBottom: 12, padding: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>
                    {item.type} • {item.package ?? 'Standard'}
                  </Text>
                  <Text style={{ color: colors.muted, marginTop: 6, fontSize: 12 }}>
                    📅 {item.date} • 🕐 {item.time}
                  </Text>
                  <Text style={{ color: colors.muted, marginTop: 4, fontSize: 12 }}>📍 {item.location}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>€{item.price ?? 0}</Text>
                  <View
                    style={{
                      backgroundColor:
                        item.status === 'confirmed'
                          ? '#e6fffb'
                          : item.status === 'pending'
                          ? '#fff7e6'
                          : '#e6f7ff',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 4,
                      marginTop: 6
                    }}
                  >
                    <Text
                      style={{
                        color:
                          item.status === 'confirmed'
                            ? '#056162'
                            : item.status === 'pending'
                            ? '#b7741a'
                            : '#0050b3',
                        fontWeight: '600',
                        fontSize: 11
                      }}
                    >
                      {item.status === 'confirmed'
                        ? '✅ Confirmée'
                        : item.status === 'pending'
                        ? '⏳ Attente'
                        : '🎉 Terminée'}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <Text style={{ color: colors.muted, textAlign: 'center', marginVertical: 20 }}>Aucune réservation récente</Text>
        )}
      </ScrollView>
    </View>
  );
};
