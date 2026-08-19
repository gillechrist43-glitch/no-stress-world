import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme';
import { api, GalleryItem } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

export const GalleryManagement: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [saving, setSaving] = useState(false);

  const loadGallery = async () => {
    const list = await api.listGallery();
    setItems(list);
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const addGalleryItem = async () => {
    if (!title.trim() || !category.trim() || !selectedImage) return;
    setSaving(true);
    try {
      await api.addGalleryItem({ title: title.trim(), category: category.trim(), description: description.trim(), imageUri: selectedImage.uri, fileName: selectedImage.fileName || 'gallery-image.jpg', mimeType: selectedImage.type === 'image' ? 'image/jpeg' : undefined });
      setTitle('');
      setCategory('');
      setDescription('');
      setSelectedImage(null);
      await loadGallery();
    } finally {
      setSaving(false);
    }
  };

  const chooseImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled) setSelectedImage(result.assets[0]);
  };

  const removeItem = async (id: string) => {
    await api.removeGalleryItem(id);
    loadGallery();
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Gestion de la galerie</Text>
      <Text style={{ color: colors.muted, marginTop: 12 }}>Publiez les images qui seront visibles par les clients.</Text>

      <Card style={{ marginTop: 16 }}>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 12 }}>Ajouter une photo</Text>
        <Input label="Titre" value={title} onChangeText={setTitle} placeholder="Portrait en lumière naturelle" />
        <Input label="Catégorie" value={category} onChangeText={setCategory} placeholder="Portrait, mariage, studio..." />
        <TouchableOpacity onPress={chooseImage} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 14, marginBottom: 12 }}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>{selectedImage ? 'Remplacer la photo' : 'Choisir une photo sur l’appareil'}</Text>
          <Text style={{ color: colors.muted, marginTop: 5, fontSize: 12 }}>{selectedImage?.fileName || 'JPG, PNG ou WEBP, 10 Mo maximum'}</Text>
        </TouchableOpacity>
        {selectedImage ? <Image source={{ uri: selectedImage.uri }} style={{ width: '100%', height: 160, borderRadius: 8, marginBottom: 12 }} resizeMode="cover" /> : null}
        <Input label="Description" value={description} onChangeText={setDescription} placeholder="Décrivez cette image" />
        <TouchableOpacity onPress={addGalleryItem} disabled={saving} style={{ marginTop: 8, backgroundColor: colors.accent, padding: 12, borderRadius: 8, opacity: saving ? 0.6 : 1 }}>
          <Text style={{ color: colors.text, textAlign: 'center', fontWeight: '700' }}>{saving ? 'Publication...' : 'Publier dans la galerie'}</Text>
        </TouchableOpacity>
      </Card>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 16 }}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Image source={{ uri: item.imageUrl }} style={{ width: 120, height: 72, borderRadius: 6, marginBottom: 10, backgroundColor: colors.border }} resizeMode="cover" />
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

    </View>
  );
};
