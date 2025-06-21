import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getSupabase } from '@/lib/supabase';
import { stripeProducts } from '@/src/stripe-config';
import { Crown, Check, Sparkles, Brain, MessageCircle, SquareCheck as CheckSquare, Shield, Star, Clock } from 'lucide-react-native';

interface SubscriptionData {
  subscription_status: string | null;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
}

export default function SubscriptionScreen() {
  const { user, session } = useAuth();
  const { colors } = useTheme();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status, price_id, current_period_end, cancel_at_period_end')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading subscription:', error);
        return;
      }

      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (priceId: string) => {
    if (!session?.access_token) {
      Alert.alert('Error', 'Please log in to subscribe');
      return;
    }

    setCheckoutLoading(priceId);

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          mode: 'subscription',
          success_url: `${window.location.origin}/subscription-success`,
          cancel_url: `${window.location.origin}/subscription`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      Alert.alert('Error', error.message || 'Failed to start subscription process');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageSubscription = () => {
    Alert.alert(
      'Manage Subscription',
      'To manage your subscription, please contact our support team.',
      [{ text: 'OK' }]
    );
  };

  const getCurrentProduct = () => {
    if (!subscription?.price_id) return null;
    return stripeProducts.find(product => product.priceId === subscription.price_id);
  };

  const isActiveSubscription = subscription?.subscription_status === 'active';
  const currentProduct = getCurrentProduct();

  const features = [
    { icon: Brain, text: 'Unlimited AI memory queries' },
    { icon: MessageCircle, text: 'Advanced conversation tracking' },
    { icon: CheckSquare, text: 'Smart task automation' },
    { icon: Sparkles, text: 'Daily AI insights & summaries' },
    { icon: Shield, text: 'Priority customer support' },
    { icon: Star, text: 'Export all your data' },
  ];

  const styles = createStyles(colors);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading subscription...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={colors.gradient}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.crownIcon}>
            <Crown size={32} color={colors.background} strokeWidth={2} />
          </View>
          <Text style={styles.headerTitle}>MemorySphere Premium</Text>
          <Text style={styles.headerSubtitle}>
            Unlock the full power of your AI cognitive twin
          </Text>
        </View>

        {/* Subscription Status */}
        {isActiveSubscription && currentProduct && (
          <View style={styles.activeStatus}>
            <Check size={16} color={colors.success} />
            <Text style={styles.activeText}>
              {currentProduct.name} - Active
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Premium Features</Text>
        <View style={styles.featuresList}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <feature.icon size={20} color={colors.primary} />
              </View>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Current Subscription */}
      {isActiveSubscription && currentProduct && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Subscription</Text>
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionInfo}>
              <Text style={styles.subscriptionPlan}>{currentProduct.name}</Text>
              <Text style={styles.subscriptionStatus}>Active</Text>
              {subscription.current_period_end && (
                <Text style={styles.subscriptionDate}>
                  {subscription.cancel_at_period_end ? 'Expires' : 'Renews'} on{' '}
                  {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.manageButton}
              onPress={handleManageSubscription}
            >
              <Text style={styles.manageButtonText}>Manage</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Pricing Plans */}
      {!isActiveSubscription && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          <View style={styles.plansList}>
            {stripeProducts.map((product) => (
              <View
                key={product.id}
                style={[
                  styles.planCard,
                  product.popular && styles.popularPlan,
                ]}
              >
                {product.popular && (
                  <View style={styles.popularBadge}>
                    <Sparkles size={12} color={colors.background} />
                    <Text style={styles.popularBadgeText}>Most Popular</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{product.name}</Text>
                  <View style={styles.planPrice}>
                    <Text style={styles.priceAmount}>{product.price}</Text>
                    {product.period && (
                      <Text style={styles.pricePeriod}>{product.period}</Text>
                    )}
                  </View>
                  {product.savings && (
                    <Text style={styles.planSavings}>{product.savings}</Text>
                  )}
                  <Text style={styles.planDescription}>{product.description}</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.subscribeButton,
                    product.popular && styles.popularSubscribeButton,
                    checkoutLoading === product.priceId && styles.subscribeButtonLoading,
                  ]}
                  onPress={() => handleSubscribe(product.priceId)}
                  disabled={checkoutLoading === product.priceId}
                >
                  {checkoutLoading === product.priceId ? (
                    <ActivityIndicator size="small" color={product.popular ? colors.background : colors.primary} />
                  ) : (
                    <Text style={[
                      styles.subscribeButtonText,
                      product.popular && styles.popularSubscribeButtonText,
                    ]}>
                      Start Subscription
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* FAQ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqList}>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
            <Text style={styles.faqAnswer}>
              Yes, you can cancel your subscription at any time. Your premium features will remain active until the end of your billing period.
            </Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>What happens to my data?</Text>
            <Text style={styles.faqAnswer}>
              Your memories and tasks are always yours. You can export all your data at any time, even after canceling your subscription.
            </Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Is my data secure?</Text>
            <Text style={styles.faqAnswer}>
              Absolutely. We use enterprise-grade encryption and security measures to protect your personal data and memories.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
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
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  crownIcon: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.background,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  activeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
  },
  activeText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 36,
    height: 36,
    backgroundColor: colors.primary + '15',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  plansList: {
    gap: 16,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  popularPlan: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 24,
    right: 24,
    height: 24,
    backgroundColor: colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularBadgeText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  pricePeriod: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  planSavings: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  subscribeButton: {
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  popularSubscribeButton: {
    backgroundColor: colors.primary,
  },
  subscribeButtonLoading: {
    opacity: 0.7,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  popularSubscribeButtonText: {
    color: colors.background,
  },
  subscriptionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionPlan: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  subscriptionStatus: {
    fontSize: 14,
    color: colors.success,
    marginTop: 4,
  },
  subscriptionDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  manageButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  manageButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '500',
  },
  faqList: {
    gap: 20,
  },
  faqItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});