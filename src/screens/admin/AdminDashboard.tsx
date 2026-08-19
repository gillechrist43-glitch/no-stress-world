import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Alert, useWindowDimensions } from 'react-native';
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
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 32, 1180);
  const compactGrid = width < 720;

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
      <View style={{ backgroundColor: colors.surface, paddingHorizontal: 20, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View style={{ width: contentWidth, alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' }}>Espace administration</Text>
            <Text style={{ color: colors.text, fontSize: 26, fontWeight: '700', marginTop: 4 }}>Dashboard</Text>
            <Text style={{ color: colors.muted, fontSize: 13, marginTop: 5 }}>{user?.email}</Text>
          </View>
          <TouchableOpacity onPress={onLogout} style={{ backgroundColor: colors.accent, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}>
            <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>Déconnecter</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 28, paddingBottom: 48 }}>
        <View style={{ width: contentWidth, alignSelf: 'center' }}>
        {/* Stats Overview */}
        <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>Vue d'ensemble</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, marginHorizontal: -5 }}>
          {[
            { label: 'Total', value: stats.totalBookings },
            { label: 'Confirmées', value: stats.confirmed },
            { label: 'En attente', value: stats.pending },
            { label: 'Terminées', value: stats.completed }
          ].map((item) => (
            <Card key={item.label} style={{ width: compactGrid ? '50%' : '25%', padding: 16, borderRadius: 10, shadowOpacity: 0.04 }}>
              <View style={{ borderLeftWidth: 3, borderLeftColor: colors.accent, paddingLeft: 10 }}>
                <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '600' }}>{item.label}</Text>
                <Text style={{ color: colors.text, fontSize: 28, fontWeight: '700', marginTop: 8 }}>{item.value}</Text>
              </View>
            </Card>
          ))}
        </View>

        {/* Revenue Card */}
        <Card style={{ padding: 16, marginBottom: 18 }}>
          <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 }}>Revenu total</Text>
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
        <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>Actions rapides</Text>
        <View style={{ flexDirection: compactGrid ? 'column' : 'row', marginBottom: 20 }}>
          <TouchableOpacity onPress={() => navigation.navigate('AdminOrders')} style={{ flex: 1, marginRight: compactGrid ? 0 : 8, marginBottom: compactGrid ? 8 : 0 }}>
            <Card style={{ padding: 16, borderRadius: 10 }}>
              <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>Gestion</Text>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginTop: 8 }}>Réservations</Text>
            </Card>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('GalleryManagement')} style={{ flex: 1, marginRight: compactGrid ? 0 : 8, marginBottom: compactGrid ? 8 : 0 }}>
            <Card style={{ padding: 16, borderRadius: 10 }}>
              <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>Contenu</Text>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginTop: 8 }}>Galerie</Text>
            </Card>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('AdminMessages')} style={{ flex: 1, marginRight: compactGrid ? 0 : 8, marginBottom: compactGrid ? 8 : 0 }}>
            <Card style={{ padding: 16, borderRadius: 10 }}>
              <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>Relation client</Text>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginTop: 8 }}>Messages</Text>
            </Card>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('AdminProfile')} style={{ flex: 1, marginRight: compactGrid ? 0 : 8, marginBottom: compactGrid ? 8 : 0 }}>
            <Card style={{ padding: 16, borderRadius: 10 }}>
              <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>Sécurité</Text>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginTop: 8 }}>Mon compte</Text>
            </Card>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              try {
                const csv = await api.exportSurveysCsv();
                if (Platform.OS === 'web' && typeof window !== 'undefined') {
                  const blob = new Blob([csv || ''], { type: 'text/csv' });
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
            <Card style={{ padding: 16, borderRadius: 10 }}>
              <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>Données</Text>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginTop: 8 }}>Export CSV</Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Create Admin Section */}
        <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>Nouvel administrateur</Text>
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
        <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>Réservations récentes</Text>
        {latest.length > 0 ? (
          latest.map((item) => (
            <Card key={item.id} style={{ marginBottom: 12, padding: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>
                    {item.type} / {item.package ?? 'Standard'}
                  </Text>
                  <Text style={{ color: colors.muted, marginTop: 6, fontSize: 12 }}>
                    {item.date} / {item.time}
                  </Text>
                  <Text style={{ color: colors.muted, marginTop: 4, fontSize: 12 }}>{item.location}</Text>
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
                        ? 'Confirmée'
                        : item.status === 'pending'
                        ? 'En attente'
                        : 'Terminée'}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <Text style={{ color: colors.muted, textAlign: 'center', marginVertical: 20 }}>Aucune réservation récente</Text>
        )}
        </View>
      </ScrollView>
    </View>
  );
};
