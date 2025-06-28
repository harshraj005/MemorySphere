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
import { Lock, Crown, Sparkles, Clock, TriangleAlert as AlertTriangle } from 'lucide-react-native';

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
            {status.isExpired ? (
              <AlertTriangle size={64} color={colors.background} strokeWidth={1.5} />
            ) : (
              <Lock size={64} color={colors.background} strokeWidth={1.5} />
            )}
          </View>

          <Text style={styles.title}>
            {status.isExpired ? 'Trial Expired' : 'Premium Required'}
          </Text>
          
          <Text style={styles.subtitle}>
            {status.isExpired 
              ? 'Your 3-day free trial has ended. Subscribe now to continue using MemorySphere and keep all your data.'
              : 'You need an active subscription to access MemorySphere\'s powerful features.'
            }
          </Text>

          {status.isExpired && (
            <View style={styles.urgencyBanner}>
              <Clock size={20} color={colors.background} strokeWidth={1.5} />
              <Text style={styles.urgencyText}>
                Subscribe now to prevent data loss and restore full access
              </Text>
            </View>
          )}

          <View style={styles.features}>
            <View style={styles.featureItem}>
              <Sparkles size={20} color="rgba(255, 255, 255, 0.8)" strokeWidth={1.5} />
              <Text style={styles.featureText}>Unlimited AI memory queries</Text>
            </View>
            <View style={styles.featureItem}>
              <Crown size={20} color="rgba(255, 255, 255, 0.8)" strokeWidth={1.5} />
              <Text style={styles.featureText}>Smart task automation</Text>
            </View>
            <View style={styles.featureItem}>
              <Sparkles size={20} color="rgba(255, 255, 255, 0.8)" strokeWidth={1.5} />
              <Text style={styles.featureText}>Daily AI insights & summaries</Text>
            </View>
            <View style={styles.featureItem}>
              <Lock size={20} color="rgba(255, 255, 255, 0.8)" strokeWidth={1.5} />
              <Text style={styles.featureText}>Secure data storage & backup</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => router.push('/(tabs)/subscription')}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
                style={styles.upgradeButtonGradient}
              >
                <Text style={styles.upgradeButtonText}>
                  {status.isExpired ? 'Restore Access Now' : 'Upgrade to Premium'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewPricingButton}
              onPress={() => router.push('/(tabs)/subscription')}
            >
              <Text style={styles.viewPricingButtonText}>View All Plans</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>
            {status.isExpired 
              ? 'Your data is safe. Subscribe to restore full access immediately.'
              : 'Plans start from just ₹49/week with a 3-day free trial'
            }
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
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.background,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  urgencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  urgencyText: {
    fontSize: 14,
    color: colors.background,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
    textAlign: 'center',
  },
  features: {
    alignSelf: 'stretch',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 16,
    fontWeight: '500',
  },
  actions: {
    alignSelf: 'stretch',
    gap: 16,
    marginBottom: 24,
  },
  upgradeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 12,
  },
  upgradeButtonGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: '700',
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
    fontWeight: '500',
  },
});