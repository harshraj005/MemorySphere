import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface DeletionStatus {
  isScheduledForDeletion: boolean;
  scheduledDeletionDate: Date | null;
  daysUntilDeletion: number;
  warningsSent: {
    firstWarning: boolean;
    secondWarning: boolean;
    finalWarning: boolean;
  };
  canCancelDeletion: boolean;
}

export function useDataDeletionStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState<DeletionStatus>({
    isScheduledForDeletion: false,
    scheduledDeletionDate: null,
    daysUntilDeletion: 0,
    warningsSent: {
      firstWarning: false,
      secondWarning: false,
      finalWarning: false,
    },
    canCancelDeletion: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkDeletionStatus();
    } else {
      setStatus({
        isScheduledForDeletion: false,
        scheduledDeletionDate: null,
        daysUntilDeletion: 0,
        warningsSent: {
          firstWarning: false,
          secondWarning: false,
          finalWarning: false,
        },
        canCancelDeletion: false,
      });
      setLoading(false);
    }
  }, [user]);

  const checkDeletionStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const supabase = getSupabase();
      
      // Check if user is scheduled for deletion
      const { data: deletionSchedule, error } = await supabase
        .from('user_deletion_schedule')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking deletion status:', error);
        setLoading(false);
        return;
      }

      if (deletionSchedule) {
        const scheduledDate = new Date(deletionSchedule.scheduled_deletion_at);
        const now = new Date();
        const daysUntilDeletion = Math.max(0, Math.ceil((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

        setStatus({
          isScheduledForDeletion: true,
          scheduledDeletionDate: scheduledDate,
          daysUntilDeletion,
          warningsSent: {
            firstWarning: !!deletionSchedule.first_warning_sent_at,
            secondWarning: !!deletionSchedule.second_warning_sent_at,
            finalWarning: !!deletionSchedule.final_warning_sent_at,
          },
          canCancelDeletion: daysUntilDeletion > 0,
        });
      } else {
        setStatus({
          isScheduledForDeletion: false,
          scheduledDeletionDate: null,
          daysUntilDeletion: 0,
          warningsSent: {
            firstWarning: false,
            secondWarning: false,
            finalWarning: false,
          },
          canCancelDeletion: false,
        });
      }
    } catch (error) {
      console.error('Error checking deletion status:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelDeletion = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.rpc('cancel_scheduled_deletion', {
        target_user_id: user.id
      });

      if (error) {
        console.error('Error cancelling deletion:', error);
        return false;
      }

      // Refresh status after cancellation
      await checkDeletionStatus();
      return data;
    } catch (error) {
      console.error('Error cancelling deletion:', error);
      return false;
    }
  };

  const refreshStatus = () => {
    setLoading(true);
    checkDeletionStatus();
  };

  return { status, loading, cancelDeletion, refreshStatus };
}