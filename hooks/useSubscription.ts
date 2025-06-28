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
  isExpired: boolean;
  accessBlocked: boolean;
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
    isExpired: false,
    accessBlocked: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
      
      // Set up interval to check subscription status every minute
      const interval = setInterval(checkSubscriptionStatus, 60000);
      return () => clearInterval(interval);
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
        isExpired: false,
        accessBlocked: true,
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
      const now = new Date();
      const trialEndsAt = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
      
      // Calculate trial status with precise timing
      const trialDaysLeft = trialEndsAt
        ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;
      
      const isTrialing = trialEndsAt ? now < trialEndsAt : false;
      const isTrialExpired = trialEndsAt ? now >= trialEndsAt : true;

      // Check for active subscription
      const supabase = getSupabase();
      const { data: subscription, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading subscription:', error);
        // On error, be restrictive with access
        setStatus({
          isActive: false,
          isTrialing: isTrialing,
          trialEndsAt,
          trialDaysLeft,
          hasAccess: isTrialing, // Only allow access if trial is still active
          subscription: null,
          currentProduct: null,
          isExpired: isTrialExpired,
          accessBlocked: isTrialExpired,
        });
        setLoading(false);
        return;
      }

      const isActive = subscription?.subscription_status === 'active';
      const currentProduct = subscription?.price_id
        ? stripeProducts.find(product => product.priceId === subscription.price_id) ?? null
        : null;

      // Determine access based on strict rules
      const hasAccess = isActive || isTrialing;
      const accessBlocked = !hasAccess;

      // Update user subscription status in database if trial has expired
      if (isTrialExpired && user.subscription_status === 'trial') {
        try {
          await supabase
            .from('users')
            .update({ subscription_status: 'expired' })
            .eq('id', user.id);
        } catch (updateError) {
          console.error('Error updating user subscription status:', updateError);
        }
      }

      setStatus({
        isActive,
        isTrialing,
        trialEndsAt,
        trialDaysLeft,
        hasAccess,
        subscription,
        currentProduct,
        isExpired: isTrialExpired && !isActive,
        accessBlocked,
      });
    } catch (err) {
      console.error('Error checking subscription status:', err);
      
      // Fallback: be very restrictive on errors
      const now = new Date();
      const trialEndsAt = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
      const isTrialing = trialEndsAt ? now < trialEndsAt : false;
      const isTrialExpired = trialEndsAt ? now >= trialEndsAt : true;

      setStatus({
        isActive: false,
        isTrialing,
        trialEndsAt,
        trialDaysLeft: trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0,
        hasAccess: isTrialing, // Only trial access on errors
        subscription: null,
        currentProduct: null,
        isExpired: isTrialExpired,
        accessBlocked: isTrialExpired,
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