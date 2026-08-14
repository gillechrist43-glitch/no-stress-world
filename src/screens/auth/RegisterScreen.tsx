import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';

export const RegisterScreen: React.FC = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const register = useAuthStore((s) => s.register);
  // role fixed to client for public registration

  const onRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Tous les champs sont requis.');
      return;
    }
    if (!email.includes('@')) {
      setError('Veuillez saisir une adresse email valide.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const u = await register(name, email, password);
      navigation.replace('Client');
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de l\'inscription. Vérifiez vos informations.');
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 20 }}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ color: colors.text, fontSize: 34, fontWeight: '700', marginBottom: 8 }}>S'inscrire</Text>
        <Text style={{ color: colors.muted, marginBottom: 20 }}>Créez un compte pour réserver et gérer vos séances</Text>

        <Card style={{ padding: 18 }}>
          <Input label="Nom" value={name} onChangeText={setName} placeholder="Votre nom" />
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="ex: toto@example.com" />
          <Input label="Mot de passe" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />

          {/* Registration always creates client accounts */}
          {error ? <Text style={{ color: '#FF6B6B', marginBottom: 12, fontWeight: '500' }}>{error}</Text> : null}

          <View style={{ marginTop: 6 }} />
          <Button title={loading ? 'Inscription en cours...' : "S'inscrire"} onPress={onRegister} disabled={loading} />
        </Card>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 18 }}>
          <Text style={{ color: colors.muted }}>Déjà inscrit ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{ color: colors.accent }}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
