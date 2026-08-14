import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, gradient } from '../theme';
import { Card } from '../components/ui/Card';
import { Logo } from '../components/ui/Logo';


export const LandingScreen: React.FC = ({ navigation }: any) => {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: spacing.md, backgroundColor: gradient[0] }}>
      <View style={{ alignItems: 'center', paddingTop: 40, paddingBottom: 20 }}>
        <Logo size={96} />
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 12, textAlign: 'center' }}>NO STRESS{"\n"}WORLD COMPANY</Text>
        <Text style={{ color: 'rgba(255,255,255,0.9)', marginTop: 6, textAlign: 'center' }}>Votre Vision, Notre Expertise</Text>
      </View>

      <View style={{ padding: spacing.md }}>
        <Card>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Réservez sans stress</Text>
          <Text style={{ color: colors.muted, marginTop: 8 }}>Gérez vos demandes, consultez la galerie et contactez-nous en quelques clics.</Text>

          <View style={{ marginTop: 16 }}>
            <TouchableOpacity onPress={() => navigation.navigate('Auth')}>
              <View style={{ backgroundColor: colors.accent, padding: 12, borderRadius: 12 }}>
                <Text style={{ color: colors.text, textAlign: 'center', fontWeight: '700' }}>Se connecter / S'inscrire</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 12 }}>
            <TouchableOpacity onPress={() => navigation.navigate('Survey')}>
              <Text style={{ color: colors.accent, textAlign: 'center' }}>Remplir le formulaire de demande</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};
