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
      setLoading(false);
      return;
    }

    try {
      // Calculate trial status first
      const now = new Date();
      const trialEndsAt = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
      const trialDaysLeft = trialEndsAt
        ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;
      const isTrialing = trialEndsAt ? now < trialEndsAt : false;

      // If user is trialing, they have access regardless of subscription status
      if (isTrialing) {
        setStatus({
          isActive: false,
          isTrialing: true,
          trialEndsAt,
          trialDaysLeft,
          hasAccess: true,
          subscription: null,
          currentProduct: null,
        });
        setLoading(false);
        return;
      }

      // Check for active subscription only if trial has expired
      const supabase = getSupabase();
      const { data: subscription, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading subscription:', error);
        // If there's an error but user had a trial, don't block access immediately
        setStatus({
          isActive: false,
          isTrialing: false,
          trialEndsAt,
          trialDaysLeft,
          hasAccess: false,
          subscription: null,
          currentProduct: null,
        });
        setLoading(false);
        return;
      }

      const isActive = subscription?.subscription_status === 'active';
      const currentProduct = subscription?.price_id
        ? stripeProducts.find(product => product.priceId === subscription.price_id) ?? null
        : null;

      setStatus({
        isActive,
        isTrialing: false,
        trialEndsAt,
        trialDaysLeft,
        hasAccess: isActive,
        subscription,
        currentProduct,
      });
    } catch (err) {
      console.error('Error checking subscription status:', err);
      
      // Fallback: check trial status even if subscription check fails
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