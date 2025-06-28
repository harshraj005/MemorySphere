import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

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

      // For now, we'll use a simple subscription check based on user status
      // This will be replaced with RevenueCat integration
      const isActive = user.subscription_status === 'active';

      // Determine access based on strict rules
      const hasAccess = isActive || isTrialing;
      const accessBlocked = !hasAccess;

      setStatus({
        isActive,
        isTrialing,
        trialEndsAt,
        trialDaysLeft,
        hasAccess,
        subscription: null, // Will be populated with RevenueCat data
        currentProduct: null, // Will be populated with RevenueCat data
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