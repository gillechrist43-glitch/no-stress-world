import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { colors } from '../theme';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { api } from '../services/api';
import { removeItem } from '../services/db';

export const ProfileScreen: React.FC = ({ navigation }: any) => {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [saving, setSaving] = useState(false);

  const changePassword = async () => {
    if (newPassword.length < 6) return Alert.alert('Mot de passe invalide', 'Le nouveau mot de passe doit contenir au moins 6 caractères.');
    setSaving(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert('Mot de passe modifié', 'Votre nouveau mot de passe est actif.');
    } catch (error: any) {
      Alert.alert('Modification impossible', error?.message || 'Vérifiez votre mot de passe actuel.');
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    setSaving(true);
    try {
      await api.deleteAccount(deletePassword);
      await removeItem('@app:token');
      logout();
      navigation.replace('Welcome');
    } catch (error: any) {
      Alert.alert('Suppression impossible', error?.message || 'Vérifiez votre mot de passe.');
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Profil</Text>
        <Text style={{ color: colors.muted, marginTop: 14 }}>Nom : <Text style={{ color: colors.text }}>{user?.name ?? 'Invité'}</Text></Text>
        <Text style={{ color: colors.muted, marginTop: 8 }}>Email : <Text style={{ color: colors.text }}>{user?.email ?? 'Non renseigné'}</Text></Text>
        <Text style={{ color: colors.muted, marginTop: 8 }}>Rôle : <Text style={{ color: colors.text }}>{user?.role ?? 'client'}</Text></Text>

        {user?.role === 'client' ? <TouchableOpacity onPress={() => navigation.navigate('Bookings')} style={{ marginTop: 24 }}>
          <Text style={{ color: colors.accent }}>Mes réservations</Text>
        </TouchableOpacity> : null}

        <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700', marginTop: 32, marginBottom: 12 }}>Modifier le mot de passe</Text>
        <Input label="Mot de passe actuel" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry placeholder="Votre mot de passe actuel" />
        <Input label="Nouveau mot de passe" value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="6 caractères minimum" />
        <Button title={saving ? 'Enregistrement...' : 'Modifier le mot de passe'} onPress={changePassword} disabled={saving} />

        <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700', marginTop: 32, marginBottom: 12 }}>Supprimer le compte</Text>
        <Text style={{ color: colors.muted, marginBottom: 10 }}>Cette action supprime définitivement vos réservations et conversations.</Text>
        <Input label="Confirmer avec votre mot de passe" value={deletePassword} onChangeText={setDeletePassword} secureTextEntry placeholder="Mot de passe" />
        <TouchableOpacity onPress={deleteAccount} disabled={saving} style={{ borderWidth: 1, borderColor: colors.error, padding: 13, borderRadius: 8, opacity: saving ? 0.6 : 1 }}>
          <Text style={{ color: colors.error, textAlign: 'center', fontWeight: '700' }}>Supprimer définitivement</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#222' }}>
        <TouchableOpacity onPress={() => { logout(); navigation.replace('Auth'); }}>
          <Text style={{ color: colors.accent, textAlign: 'center', fontWeight: '700' }}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
