import React from 'react';
import { View } from 'react-native';
import Svg, { G, Rect, Circle, Path } from 'react-native-svg';

export const Logo: React.FC<{ size?: number }> = ({ size = 80 }) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G stroke="#000" strokeWidth={3} fill="none">
          <Rect x={15} y={35} width={50} height={35} rx={5} fill="#fff" stroke="#000" />
          <Circle cx={35} cy={50} r={12} fill="#fff" stroke="#000" />
          <Circle cx={35} cy={50} r={8} fill="#26c6da" stroke="#000" />
          <Circle cx={35} cy={50} r={4} fill="#000" />
          <Circle cx={38} cy={47} r={2} fill="#fff" stroke="none" />
          <Rect x={55} y={40} width={6} height={4} rx={2} fill="#ff4081" stroke="#000" />
          <Rect x={45} y={30} width={8} height={5} rx={2} fill="#26c6da" stroke="#000" />
          <Circle cx={50} cy={32} r={2} fill="#666" stroke="#000" />
          <Path d="M65 40 Q75 35 80 45" stroke="#000" strokeWidth={2} fill="none" />
        </G>
      </Svg>
    </View>
  );
};
