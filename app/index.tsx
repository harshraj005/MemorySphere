import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { View, StyleSheet, Text } from 'react-native';
import { Brain } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function IndexScreen() {
  const { user, loading: authLoading } = useAuth();
  const { status, loading: subscriptionLoading } = useSubscription();
  const { colors } = useTheme();

  useEffect(() => {
    // Wait for both auth and subscription to finish loading
    if (authLoading || subscriptionLoading) return;

    if (!user) {
      router.replace('/(auth)/login');
      return;
    }

    // Give a small delay to ensure all data is loaded
    const timer = setTimeout(() => {
      // Strict access control - only allow access if user has valid subscription or active trial
      if (status.hasAccess && !status.accessBlocked) {
        router.replace('/(tabs)');
      } else {
        // Force user to locked screen if no access
        router.replace('/locked');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, status.hasAccess, status.accessBlocked, authLoading, subscriptionLoading]);

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Brain size={48} color={colors.primary} />
      <Text style={styles.loadingText}>Loading MemorySphere...</Text>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
});