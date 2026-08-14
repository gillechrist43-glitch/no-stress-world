import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme';

export const ForgotPassword: React.FC = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const onSend = async () => {
    // mock send
    navigation.navigate('VerifyOTP', { email });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 20 }}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: '700', marginBottom: 8 }}>Mot de passe oublié</Text>
        <Text style={{ color: colors.muted, marginBottom: 18 }}>Entrez votre email pour recevoir un code de vérification</Text>
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="ex: toto@example.com" />
        <View style={{ marginTop: 12 }}>
          <Button title="Envoyer le code" onPress={onSend} />
        </View>
      </View>
    </SafeAreaView>
  );
};
