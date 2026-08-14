import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../../theme';

export const ChatBubble: React.FC<{ text: string; from: 'client' | 'admin' }> = ({ text, from }) => {
  const isClient = from === 'client';
  return (
    <View style={{ marginVertical: 6, alignItems: isClient ? 'flex-end' : 'flex-start' }}>
      <View style={{ backgroundColor: isClient ? colors.accent : colors.card, padding: 10, borderRadius: 12, maxWidth: '80%' }}>
        <Text style={{ color: isClient ? '#121212' : colors.text }}>{text}</Text>
      </View>
    </View>
  );
};
