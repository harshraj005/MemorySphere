import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Crown,
  Check,
  Sparkles,
  Brain,
  MessageCircle,
  SquareCheck as CheckSquare,
  Shield,
  Star,
  Clock,
  AlertTriangle,
} from 'lucide-react-native';

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
  revenueCatNotice: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.background,
    marginBottom: 8,
    textAlign: 'center',
  },
  noticeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
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
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  popularSubscribeButtonText: {
    color: colors.background,
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

const mockPlans = [
  {
    id: 'weekly',
    name: 'Weekly Plan',
    description: 'Perfect for trying out premium features',
    price: '₹49',
    period: '/week',
    popular: false,
  },
  {
    id: 'monthly',
    name: 'Monthly Plan',
    description: 'Great for regular users',
    price: '₹199',
    period: '/month',
    popular: true,
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    description: 'Best value - Save 50%!',
    price: '₹1,199',
    period: '/year',
    popular: false,
    savings: 'Save ₹1,189',
  },
];

export default function SubscriptionScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [error, setError] = useState<string | null>(null);

  const features = [
    { icon: Brain, text: 'Unlimited AI memory queries' },
    { icon: MessageCircle, text: 'Advanced conversation tracking' },
    { icon: CheckSquare, text: 'Smart task automation' },
    { icon: Sparkles, text: 'Daily AI insights & summaries' },
    { icon: Shield, text: 'Priority customer support' },
    { icon: Star, text: 'Export all your data' },
  ];

  const styles = createStyles(colors);

  const handleSubscribe = (planId: string) => {
    setError('RevenueCat integration required for mobile subscriptions. Please export this project to implement in-app purchases.');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={colors.gradient} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.crownIcon}>
            <Crown size={32} color={colors.background} strokeWidth={2} />
          </View>
          <Text style={styles.headerTitle}>MemorySphere Premium</Text>
          <Text style={styles.headerSubtitle}>
            Unlock the full power of your AI cognitive twin
          </Text>
        </View>

        {/* RevenueCat Notice */}
        <View style={styles.revenueCatNotice}>
          <Text style={styles.noticeTitle}>
            <AlertTriangle size={16} color={colors.background} /> Mobile Subscriptions
          </Text>
          <Text style={styles.noticeText}>
            For mobile app store compliance, this app requires RevenueCat integration for in-app purchases. 
            Export the project to implement proper mobile billing.
          </Text>
        </View>
      </LinearGradient>

      {/* Error Display */}
      {error && (
        <View style={styles.section}>
          <View style={{
            backgroundColor: colors.error + '15',
            borderRadius: 12,
            padding: 16,
            borderLeftWidth: 4,
            borderLeftColor: colors.error,
          }}>
            <Text style={{ color: colors.error, fontSize: 14, fontWeight: '500' }}>
              {error}
            </Text>
          </View>
        </View>
      )}

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

      {/* Pricing Plans */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Your Plan</Text>
        <View style={styles.plansList}>
          {mockPlans.map((plan) => (
            <View
              key={plan.id}
              style={[styles.planCard, plan.popular && styles.popularPlan]}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Sparkles size={12} color={colors.background} />
                  <Text style={styles.popularBadgeText}>Most Popular</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.planPrice}>
                  <Text style={styles.priceAmount}>{plan.price}</Text>
                  {plan.period && (
                    <Text style={styles.pricePeriod}>{plan.period}</Text>
                  )}
                </View>
                {plan.savings && (
                  <Text style={styles.planSavings}>{plan.savings}</Text>
                )}
                <Text style={styles.planDescription}>{plan.description}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.subscribeButton,
                  plan.popular && styles.popularSubscribeButton,
                ]}
                onPress={() => handleSubscribe(plan.id)}
              >
                <Text
                  style={[
                    styles.subscribeButtonText,
                    plan.popular && styles.popularSubscribeButtonText,
                  ]}
                >
                  Start Subscription
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* FAQ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqList}>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
            <Text style={styles.faqAnswer}>
              Yes, you can cancel your subscription at any time. Your premium
              features will remain active until the end of your billing period.
            </Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>What happens to my data?</Text>
            <Text style={styles.faqAnswer}>
              Your memories and tasks are always yours. You can export all your
              data at any time, even after canceling your subscription.
            </Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Is my data secure?</Text>
            <Text style={styles.faqAnswer}>
              Absolutely. We use enterprise-grade encryption and security
              measures to protect your personal data and memories.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}