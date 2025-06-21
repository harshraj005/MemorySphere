import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';
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
    } else {
      // Reset status if no user
      setStatus({
        isActive: false,
        isTrialing: false,
        trialEndsAt: null,
        trialDaysLeft: 0,
        hasAccess: false,
        subscription: null,
        currentProduct: null,
      });
      setLoading(false);
    }
  }, [user]);

  const checkSubscriptionStatus = async () => {
    if (!user) {
      console.warn('No user found. Skipping subscription check.');
      setLoading(false);
      return;
    }

    const supabase = getSupabase();

    try {
      // First, check if user has trial access
      const now = new Date();
      const trialEndsAt = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
      const trialDaysLeft = trialEndsAt
        ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;
      const isTrialing = trialEndsAt ? now < trialEndsAt : false;

      // Check for active subscription via the view
      const { data: subscription, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading subscription:', error);
      }

      const isActive = subscription?.subscription_status === 'active';
      const hasAccess = isTrialing || isActive;

      const currentProduct = subscription?.price_id
        ? stripeProducts.find(product => product.priceId === subscription.price_id) ?? null
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
    } catch (err) {
      console.error('Error checking subscription status:', err);
      
      // Fallback to trial-only access if subscription check fails
      const now = new Date();
      const trialEndsAt = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
      const trialDaysLeft = trialEndsAt
        ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;
      const isTrialing = trialEndsAt ? now < trialEndsAt : false;

      setStatus({
        isActive: false,
        isTrialing,
        trialEndsAt,
        trialDaysLeft,
        hasAccess: isTrialing,
        subscription: null,
        currentProduct: null,
      });
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