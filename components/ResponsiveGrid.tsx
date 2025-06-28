import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';

interface ResponsiveGridProps {
  children: React.ReactNode;
  minItemWidth?: number;
  gap?: number;
  style?: any;
}

export function ResponsiveGrid({ 
  children, 
  minItemWidth = 280, 
  gap = 16,
  style 
}: ResponsiveGridProps) {
  const { width } = useWindowDimensions();
  
  // Calculate number of columns based on screen width
  const availableWidth = width - (gap * 2); // Account for container padding
  const columns = Math.max(1, Math.floor(availableWidth / (minItemWidth + gap)));
  const itemWidth = (availableWidth - (gap * (columns - 1))) / columns;

  const gridStyle = {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: gap,
    justifyContent: columns === 1 ? 'center' as const : 'flex-start' as const,
  };

  const childrenArray = React.Children.toArray(children);

  return (
    <View style={[gridStyle, style]}>
      {childrenArray.map((child, index) => (
        <View key={index} style={{ width: columns === 1 ? '100%' : itemWidth }}>
          {child}
        </View>
      ))}
    </View>
  );
}