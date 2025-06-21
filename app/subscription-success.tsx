import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/lib/supabase';
import { stripeProducts } from '@/src/stripe-config';
import { CircleCheck as CheckCircle, Crown, Sparkles } from 'lucide-react-native';

export default function SubscriptionSuccessScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      // Wait a moment for webhook to process, then check subscription
      const timer = setTimeout(() => {
        checkSubscription();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  const checkSubscription = async () => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status, price_id')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading subscription:', error);
        return;
      }

      setSubscriptionData(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentProduct = () => {
    if (!subscriptionData?.price_id) return null;
    return stripeProducts.find(product => product.priceId === subscriptionData.price_id);
  };

  const currentProduct = getCurrentProduct();
  const isActive = subscriptionData?.subscription_status === 'active';

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.gradient}
        style={styles.background}
      >
        <View style={styles.content}>
          {loading ? (
            <>
              <ActivityIndicator size="large" color={colors.background} />
              <Text style={styles.loadingText}>Processing your subscription...</Text>
            </>
          ) : (
            <>
              <View style={styles.iconContainer}>
                <CheckCircle size={64} color={colors.background} strokeWidth={1.5} />
              </View>

              <Text style={styles.title}>Welcome to Premium!</Text>
              
              {isActive && currentProduct ? (
                <Text style={styles.subtitle}>
                  Your {currentProduct.name} subscription is now active. Enjoy unlimited access to all premium features!
                </Text>
              ) : (
                <Text style={styles.subtitle}>
                  Your subscription is being processed. You'll receive a confirmation email shortly.
                </Text>
              )}

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
                  style={styles.primaryButton}
                  onPress={() => router.replace('/(tabs)')}
                >
                  <Text style={styles.primaryButtonText}>Start Using Premium</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => router.push('/(tabs)/subscription')}
                >
                  <Text style={styles.secondaryButtonText}>Manage Subscription</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.disclaimer}>
                You can manage your subscription anytime from your profile settings.
              </Text>
            </>
          )}
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
  loadingText: {
    fontSize: 18,
    color: colors.background,
    marginTop: 16,
    textAlign: 'center',
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
  primaryButton: {
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
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  secondaryButton: {
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
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