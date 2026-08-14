import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';

export const LoginScreen: React.FC = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((s) => s.login);

  const onLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Email et mot de passe sont requis.');
      return;
    }
    if (!email.includes('@')) {
      setError('Veuillez saisir une adresse email valide.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const u = await login(email, password);
      if (u?.role === 'admin') navigation.replace('Admin');
      else navigation.replace('Client');
    } catch (err: any) {
      setError(err?.message || 'Erreur de connexion. Vérifiez vos identifiants.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 20 }}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ color: colors.text, fontSize: 34, fontWeight: '700', marginBottom: 8 }}>Se connecter</Text>
        <Text style={{ color: colors.muted, marginBottom: 20 }}>Bienvenue — entrez vos informations pour continuer</Text>

        <Card style={{ padding: 18 }}>
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="ex: toto@example.com" />
          <Input label="Mot de passe" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
          {error ? <Text style={{ color: '#FF6B6B', marginBottom: 12, fontWeight: '500' }}>{error}</Text> : null}
          <View style={{ marginTop: 6 }} />
          <Button title={loading ? 'Connexion en cours...' : 'Se connecter'} onPress={onLogin} disabled={loading} />
        </Card>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 18 }}>
          <Text style={{ color: colors.muted }}>Pas de compte ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={{ color: colors.accent }}>S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
