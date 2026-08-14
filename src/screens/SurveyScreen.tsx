import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing } from '../theme';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { getItem, setItem } from '../services/db';
import { api } from '../services/api';

const STORAGE_KEY = '@app:photographySurveys';

export const SurveyScreen: React.FC = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [typeSeance, setTypeSeance] = useState('portrait');
  const [lieu, setLieu] = useState('studio');
  const [lieuSpecifique, setLieuSpecifique] = useState('');
  const [budget, setBudget] = useState('');
  const [dateSouhaitee, setDateSouhaitee] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  const generateReference = () => {
    const d = new Date();
    const ts = d.getFullYear().toString().slice(-2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    const rnd = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return 'NS' + ts + rnd;
  };

  const onSubmit = async () => {
    if (!name.trim() || !email.includes('@')) {
      Alert.alert('Erreur', 'Veuillez entrer un nom et une adresse email valide.');
      return;
    }
    setSubmitting(true);
    const ref = generateReference();
    const data = { reference: ref, timestamp: new Date().toISOString(), name, email, telephone, typeSeance, lieu, lieuSpecifique, budget, dateSouhaitee, details };
    try {
      // local storage
      const raw = (await getItem(STORAGE_KEY)) || '[]';
      const arr = JSON.parse(raw);
      arr.push(data);
      await setItem(STORAGE_KEY, JSON.stringify(arr));

      // try send to server (api handles remote toggle)
      let serverResult = null;
      try {
        serverResult = await api.createSurvey({ reference: ref, timestamp: data.timestamp, name: name, email, telephone, typeSeance, lieu, lieuSpecifique, budget, dateSouhaitee, details });
      } catch (e) {
        console.warn('Failed to send survey to server', e);
      }

      // Show inline success UI instead of immediate navigation
      setSubmittedRef(ref);
      if (serverResult && typeof serverResult === 'object') {
        if (serverResult.emailSent) setEmailStatus('Email envoyé');
        else setEmailStatus(serverResult.emailError ? `Email failed: ${serverResult.emailError}` : 'Email non envoyé');
      } else {
        setEmailStatus('Envoi serveur non confirmé');
      }
      setShowSuccess(true);
      // reset form after short delay
      setTimeout(() => {
        setName(''); setEmail(''); setTelephone(''); setTypeSeance('portrait'); setLieu('studio'); setLieuSpecifique(''); setBudget(''); setDateSouhaitee(''); setDetails('');
        setShowSuccess(false);
        navigation.goBack();
      }, 8000);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d\'enregistrer la demande');
    }
    setSubmitting(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: spacing.md }}>
      <Card>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: 8 }}>Demande de séance</Text>
        <Text style={{ color: colors.muted, marginBottom: 12 }}>Complétez le formulaire et nous vous contacterons.</Text>

        <Input label="Nom" value={name} onChangeText={setName} placeholder="Votre nom complet" />
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="votre@email.com" />
        <Input label="Téléphone" value={telephone} onChangeText={setTelephone} placeholder="Téléphone (optionnel)" />

        <View style={{ marginTop: 8 }}>
          <Text style={{ color: colors.muted, marginBottom: 6 }}>Type de séance</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {['portrait','couple','famille','mariage','evenement','corporate'].map((t) => (
              <TouchableOpacity key={t} onPress={() => setTypeSeance(t)} style={{ padding: 8, marginRight: 8, marginBottom: 8, backgroundColor: typeSeance===t?colors.accent:colors.card, borderRadius: 8 }}>
                <Text style={{ color: typeSeance===t?colors.text:colors.text }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Input label="Lieu spécifique (optionnel)" value={lieuSpecifique} onChangeText={setLieuSpecifique} placeholder="Précisez le lieu" />
        <Input label="Date souhaitée" value={dateSouhaitee} onChangeText={setDateSouhaitee} placeholder="YYYY-MM-DD" />
        <Input label="Budget" value={budget} onChangeText={setBudget} placeholder="Votre budget" />
        <Input label="Détails" value={details} onChangeText={setDetails} placeholder="Décrivez votre projet" />

        {!showSuccess ? (
          <View style={{ marginTop: 12 }}>
            <Button title={submitting ? 'Envoi...' : 'Envoyer ma demande'} onPress={onSubmit} />
          </View>
        ) : (
          <View style={{ marginTop: 12, padding: 18, borderRadius: 12, backgroundColor: '#e6fffb', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#056162' }}>🎉 Demande envoyée !</Text>
            <Text style={{ color: '#056162', marginTop: 8 }}>Référence : {submittedRef}</Text>
            <Text style={{ color: '#056162', marginTop: 6, fontSize: 12 }}>{emailStatus}</Text>
            <Text style={{ color: '#056162', marginTop: 6, fontSize: 12 }}>Nous vous contacterons bientôt.</Text>
          </View>
        )}
      </Card>
    </ScrollView>
  );
};
