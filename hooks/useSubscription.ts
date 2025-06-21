import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { stripeProducts } from '@/src/stripe-config';

export interface SubscriptionStatus {
  isActive: boolean;
  isTrialing: boolean;
  trialEndsAt: Date | null;
  trialDaysLeft: number;
  hasAccess: boolean;
  subscription: any | null;
  currentProduct: any | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isActive: false,
    isTrialing: false,
    trialEndsAt: null,
    trialDaysLeft: 0,
    hasAccess: false,
    subscription: null,
    currentProduct: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  const checkSubscriptionStatus = async () => {
    if (!user) return;

    try {
      // Check Stripe subscription
      const { data: subscription, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading subscription:', error);
      }

      const now = new Date();
      const trialEndsAt = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
      const trialDaysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

      const isTrialing = trialEndsAt ? now < trialEndsAt : false;
      const isActive = subscription?.subscription_status === 'active';
      const hasAccess = isTrialing || isActive;

      // Get current product info
      const currentProduct = subscription?.price_id 
        ? stripeProducts.find(product => product.priceId === subscription.price_id)
        : null;

      setStatus({
        isActive,
        isTrialing,
        trialEndsAt,
        trialDaysLeft,
        hasAccess,
        subscription,
        currentProduct,
      });
    } catch (error) {
      console.error('Error checking subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = () => {
    setLoading(true);
    checkSubscriptionStatus();
  };

  return { status, loading, refreshStatus };
}