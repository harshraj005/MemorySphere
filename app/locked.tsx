import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Lock, Crown, Sparkles } from 'lucide-react-native';

export default function LockedScreen() {
  const { colors } = useTheme();
  const { status } = useSubscription();

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.gradient}
        style={styles.background}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Lock size={64} color={colors.background} strokeWidth={1.5} />
          </View>

          <Text style={styles.title}>Unlock Your AI Brain</Text>
          <Text style={styles.subtitle}>
            Your {status.isTrialing ? 'free trial has expired' : 'subscription is required'} to access MemorySphere's powerful features.
          </Text>

          <View style={styles.features}>
            <View style={styles.featureItem}>
              <Sparkles size={20} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.featureText}>Unlimited AI memory queries</Text>
            </View>
            <View style={styles.featureItem}>
              <Crown size={20} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.featureText}>Smart task automation</Text>
            </View>
            <View style={styles.featureItem}>
              <Sparkles size={20} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.featureText}>Daily AI insights</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => router.push('/(tabs)/subscription')}
            >
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewPricingButton}
              onPress={() => router.push('/(tabs)/subscription')}
            >
              <Text style={styles.viewPricingButtonText}>View Pricing</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>
            Plans start from just ₹49/week with a 3-day free trial
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.background,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
  },
  features: {
    alignSelf: 'stretch',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 16,
  },
  actions: {
    alignSelf: 'stretch',
    gap: 16,
    marginBottom: 24,
  },
  upgradeButton: {
    height: 56,
    backgroundColor: colors.background,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  viewPricingButton: {
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  viewPricingButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.background,
  },
  disclaimer: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});