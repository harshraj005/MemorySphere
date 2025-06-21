import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { View, StyleSheet } from 'react-native';
import { Brain } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function IndexScreen() {
  const { user, loading: authLoading } = useAuth();
  const { status, loading: subscriptionLoading } = useSubscription();
  const { colors } = useTheme();

  useEffect(() => {
    if (authLoading || subscriptionLoading) return;

    if (!user) {
      router.replace('/(auth)/login');
      return;
    }

    if (!status.hasAccess) {
      router.replace('/locked');
      return;
    }

    router.replace('/(tabs)');
  }, [user, status.hasAccess, authLoading, subscriptionLoading]);

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Brain size={48} color={colors.primary} />
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
});