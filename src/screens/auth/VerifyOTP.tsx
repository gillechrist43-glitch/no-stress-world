import React, { useState } from 'react';
import { SafeAreaView, View, Text } from 'react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { colors } from '../../theme';

export const VerifyOTP: React.FC = ({ route, navigation }: any) => {
  const { email } = route.params || {};
  const [code, setCode] = useState('');
  const verifyOtp = useAuthStore((s) => s.verifyOtp);

  const onVerify = async () => {
    const ok = await verifyOtp(email, code);
    if (ok) {
      navigation.replace('Login');
    } else {
      // could show error; mock accept 123456
      alert('Code invalide. Utilisez 123456 pour test.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 20 }}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: '700', marginBottom: 8 }}>Vérifier le code</Text>
        <Text style={{ color: colors.muted, marginBottom: 18 }}>Entrez le code envoyé sur {email}</Text>
        <Input label="Code" value={code} onChangeText={setCode} placeholder="123456" />
        <View style={{ marginTop: 12 }}>
          <Button title="Vérifier" onPress={onVerify} />
        </View>
      </View>
    </SafeAreaView>
  );
};
