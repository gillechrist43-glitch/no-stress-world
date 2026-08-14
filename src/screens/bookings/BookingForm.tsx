import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme';

export const BookingFormScreen: React.FC = ({ navigation }: any) => {
  const [type, setType] = useState('Portrait');
  const [packageOption, setPackageOption] = useState('Premium');
  const [sessionLength, setSessionLength] = useState('1h30');
  const [people, setPeople] = useState(1);
  const [date, setDate] = useState('2026-09-10');
  const [time, setTime] = useState('14:00');
  const [location, setLocation] = useState('Studio A');
  const [style, setStyle] = useState('Naturel');
  const [notes, setNotes] = useState('');
  const [retouch, setRetouch] = useState(false);
  const [express, setExpress] = useState(false);

  const types = ['Portrait', 'Événement', 'Studio', 'Extérieur'];
  const packages = ['Standard', 'Premium', 'Deluxe'];
  const lengths = ['1h', '1h30', '2h'];
  const styles = ['Naturel', 'Dramatique', 'Lumineux', 'Minimaliste'];
  const locations = ['Studio A', 'Studio B', 'Extérieur', 'Chez vous'];

  const onNext = () => {
    navigation.navigate('BookingSummary', {
      payload: {
        type,
        package: packageOption,
        sessionLength,
        people,
        date,
        time,
        location,
        style,
        notes,
        options: ['Retouches supplémentaires', 'Livraison express'].filter((_, index) => (index === 0 ? retouch : express))
      }
    });
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Nouvelle réservation</Text>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: colors.muted, marginBottom: 8 }}>Type de séance</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {types.map((t) => (
            <TouchableOpacity key={t} onPress={() => setType(t)} style={{ marginRight: 8, marginBottom: 8 }}>
              <View style={{ padding: 12, borderRadius: 10, backgroundColor: type === t ? colors.accent : colors.card }}>
                <Text style={{ color: type === t ? '#121212' : colors.text }}>{t}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: colors.muted, marginBottom: 8 }}>Forfait</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {packages.map((item) => (
            <TouchableOpacity key={item} onPress={() => setPackageOption(item)} style={{ marginRight: 8, marginBottom: 8 }}>
              <View style={{ padding: 12, borderRadius: 10, backgroundColor: packageOption === item ? colors.accent : colors.card }}>
                <Text style={{ color: packageOption === item ? '#121212' : colors.text }}>{item}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={{ color: colors.muted, marginBottom: 8 }}>Session</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {lengths.map((item) => (
              <TouchableOpacity key={item} onPress={() => setSessionLength(item)} style={{ marginRight: 8, marginBottom: 8 }}>
                <View style={{ padding: 10, borderRadius: 10, backgroundColor: sessionLength === item ? colors.accent : colors.card }}>
                  <Text style={{ color: sessionLength === item ? '#121212' : colors.text }}>{item}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ width: 110 }}>
          <Text style={{ color: colors.muted, marginBottom: 8 }}>Participants</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, padding: 10, borderRadius: 10 }}>
            <TouchableOpacity onPress={() => setPeople((p) => Math.max(1, p - 1))}>
              <Text style={{ color: colors.accent, fontSize: 20 }}>–</Text>
            </TouchableOpacity>
            <Text style={{ color: colors.text, fontWeight: '700' }}>{people}</Text>
            <TouchableOpacity onPress={() => setPeople((p) => p + 1)}>
              <Text style={{ color: colors.accent, fontSize: 20 }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Input label="Date" value={date} onChangeText={setDate} />
      <Input label="Heure" value={time} onChangeText={setTime} />

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: colors.muted, marginBottom: 8 }}>Lieu préféré</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {locations.map((item) => (
            <TouchableOpacity key={item} onPress={() => setLocation(item)} style={{ marginRight: 8, marginBottom: 8 }}>
              <View style={{ padding: 12, borderRadius: 10, backgroundColor: location === item ? colors.accent : colors.card }}>
                <Text style={{ color: location === item ? '#121212' : colors.text }}>{item}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: colors.muted, marginBottom: 8 }}>Ambiance</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {styles.map((item) => (
            <TouchableOpacity key={item} onPress={() => setStyle(item)} style={{ marginRight: 8, marginBottom: 8 }}>
              <View style={{ padding: 12, borderRadius: 10, backgroundColor: style === item ? colors.accent : colors.card }}>
                <Text style={{ color: style === item ? '#121212' : colors.text }}>{item}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Input label="Notes spéciales" value={notes} onChangeText={setNotes} placeholder="Décrivez votre inspiration ou vos besoins" />

      <View style={{ marginTop: 12 }}>
        <Text style={{ color: colors.muted, marginBottom: 8 }}>Options complémentaires</Text>
        <TouchableOpacity onPress={() => setRetouch((s) => !s)}>
          <View style={{ padding: 12, borderRadius: 10, backgroundColor: retouch ? colors.accent : colors.card, marginBottom: 10 }}>
            <Text style={{ color: retouch ? '#121212' : colors.text }}>Retouches supplémentaires</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setExpress((s) => !s)}>
          <View style={{ padding: 12, borderRadius: 10, backgroundColor: express ? colors.accent : colors.card }}>
            <Text style={{ color: express ? '#121212' : colors.text }}>Livraison express</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 20 }}>
        <Button title="Suivant" onPress={onNext} />
      </View>
    </ScrollView>
  );
};
