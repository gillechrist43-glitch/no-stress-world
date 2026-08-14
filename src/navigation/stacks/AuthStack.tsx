import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../../screens/auth/LoginScreen';
import { RegisterScreen } from '../../screens/auth/RegisterScreen';
import { ForgotPassword } from '../../screens/auth/ForgotPassword';
import { VerifyOTP } from '../../screens/auth/VerifyOTP';

const Stack = createNativeStackNavigator();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true, headerBackTitleVisible: false }}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "S'inscrire" }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ title: 'Mot de passe oublié' }} />
      <Stack.Screen name="VerifyOTP" component={VerifyOTP} options={{ title: 'Vérifier le code' }} />
    </Stack.Navigator>
  );
}
