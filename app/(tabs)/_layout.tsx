import { Tabs } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Chrome as Home, MessageCircle, SquareCheck as CheckSquare, User, Crown, Shield } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surfaceElevated,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          shadowColor: colors.shadowMedium,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 12,
          borderRadius: 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color, focused }) => (
            <Home 
              size={focused ? size + 2 : size} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="memory"
        options={{
          title: 'Memory',
          tabBarIcon: ({ size, color, focused }) => (
            <MessageCircle 
              size={focused ? size + 2 : size} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ size, color, focused }) => (
            <CheckSquare 
              size={focused ? size + 2 : size} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="subscription"
        options={{
          title: 'Premium',
          tabBarIcon: ({ size, color, focused }) => (
            <Crown 
              size={focused ? size + 2 : size} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color, focused }) => (
            <User 
              size={focused ? size + 2 : size} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="privacy"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="data-retention"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}