import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
  padding?: number;
  style?: any;
}

export function ResponsiveContainer({ 
  children, 
  maxWidth = 1200, 
  padding = 24,
  style 
}: ResponsiveContainerProps) {
  const { width } = useWindowDimensions();
  
  const containerStyle = {
    width: '100%',
    maxWidth: Math.min(width, maxWidth),
    alignSelf: 'center' as const,
    paddingHorizontal: width > 768 ? Math.max(padding, (width - maxWidth) / 2) : padding,
  };

  return (
    <View style={[containerStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});