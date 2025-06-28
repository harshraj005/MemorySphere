import { useWindowDimensions } from 'react-native';
import { useMemo } from 'react';

export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  largeDesktop: number;
}

export interface ResponsiveLayout {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  columns: number;
  padding: number;
  fontSize: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
}

const defaultBreakpoints: ResponsiveBreakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1440,
};

export function useResponsiveLayout(breakpoints: ResponsiveBreakpoints = defaultBreakpoints): ResponsiveLayout {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const isMobile = width < breakpoints.mobile;
    const isTablet = width >= breakpoints.mobile && width < breakpoints.desktop;
    const isDesktop = width >= breakpoints.desktop && width < breakpoints.largeDesktop;
    const isLargeDesktop = width >= breakpoints.largeDesktop;
    const orientation = width > height ? 'landscape' : 'portrait';

    // Calculate responsive values
    const columns = isMobile ? 1 : isTablet ? 2 : isDesktop ? 3 : 4;
    const padding = isMobile ? 16 : isTablet ? 20 : 24;

    const fontSize = {
      small: isMobile ? 12 : 14,
      medium: isMobile ? 14 : 16,
      large: isMobile ? 18 : isTablet ? 20 : 22,
      xlarge: isMobile ? 24 : isTablet ? 28 : 32,
    };

    return {
      isMobile,
      isTablet,
      isDesktop,
      isLargeDesktop,
      width,
      height,
      orientation,
      columns,
      padding,
      fontSize,
    };
  }, [width, height, breakpoints]);
}