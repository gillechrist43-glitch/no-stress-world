import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { colors } from '../../theme';
import { api, GalleryItem } from '../../services/api';
import { Card } from '../../components/ui/Card';

const sampleItems = [
  { title: 'Portrait urbain', category: 'Portrait', description: 'Lumière de rue et énergie spontanée.' },
  { title: 'Éclat studio', category: 'Studio', description: 'Ambiance premium avec fond texturé.' },
  { title: 'Moment naturel', category: 'Extérieur', description: 'Couleurs vives et nature ouverte.' }
];

export const GalleryManagement: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);

  const loadGallery = async () => {
    const list = await api.listGallery();
    setItems(list);
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const addMockItem = async () => {
    const nextSample = sampleItems[items.length % sampleItems.length];
    await api.addGalleryItem(nextSample);
    loadGallery();
  };

  const removeItem = async (id: string) => {
    await api.removeGalleryItem(id);
    loadGallery();
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Gestion de la galerie</Text>
      <Text style={{ color: colors.muted, marginTop: 12 }}>Découvrez les modèles d'inspiration actifs et ajoutez-en de nouveaux.</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 16 }}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{item.title}</Text>
                <Text style={{ color: colors.muted, marginTop: 6 }}>{item.category}</Text>
                <Text style={{ color: colors.text, marginTop: 8 }}>{item.description}</Text>
              </View>
              <TouchableOpacity onPress={() => removeItem(item.id)}>
                <Text style={{ color: colors.accent }}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ListEmptyComponent={<Text style={{ color: colors.muted, marginTop: 20 }}>Aucun élément de galerie disponible.</Text>}
      />

      <TouchableOpacity onPress={addMockItem} style={{ marginTop: 16 }}>
        <Text style={{ color: colors.accent }}>Ajouter un modèle</Text>
      </TouchableOpacity>
    </View>
  );
};
