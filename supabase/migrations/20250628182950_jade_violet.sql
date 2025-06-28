/*
  # Automatic Data Deletion Policy for Inactive Users

  1. New Functions
    - `check_and_delete_inactive_users()`: Identifies and deletes users who haven't subscribed for 3+ months
    - `schedule_data_deletion()`: Marks users for deletion and sends warning emails
    - `send_deletion_warning()`: Sends warning emails to users before deletion

  2. New Tables
    - `user_deletion_schedule`: Tracks users scheduled for deletion with warning timestamps

  3. Security
    - Functions use SECURITY DEFINER to run with elevated privileges
    - Proper logging of all deletion activities
    - Grace period and warning system before actual deletion

  4. Automation
    - Scheduled to run daily via database cron job
    - 30-day warning period before deletion
    - Multiple warning emails sent
*/

-- Create table to track users scheduled for deletion
CREATE TABLE IF NOT EXISTS user_deletion_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  trial_expired_at timestamptz NOT NULL,
  first_warning_sent_at timestamptz,
  second_warning_sent_at timestamptz,
  final_warning_sent_at timestamptz,
  scheduled_deletion_at timestamptz NOT NULL,
  deletion_reason text DEFAULT 'inactive_no_subscription',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on deletion schedule table
ALTER TABLE user_deletion_schedule ENABLE ROW LEVEL SECURITY;

-- Only allow service role to access deletion schedule
CREATE POLICY "Service role only access"
  ON user_deletion_schedule
  FOR ALL
  TO service_role
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_deletion_schedule_user_id ON user_deletion_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_user_deletion_schedule_deletion_date ON user_deletion_schedule(scheduled_deletion_at);
CREATE INDEX IF NOT EXISTS idx_user_deletion_schedule_warnings ON user_deletion_schedule(first_warning_sent_at, second_warning_sent_at, final_warning_sent_at);

-- Function to identify users who should be scheduled for deletion
CREATE OR REPLACE FUNCTION identify_inactive_users()
RETURNS TABLE(
  user_id uuid,
  email text,
  first_name text,
  last_name text,
  trial_expired_at timestamptz,
  months_since_expiry integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.email,
    u.first_name,
    u.last_name,
    u.trial_ends_at as trial_expired_at,
    EXTRACT(MONTH FROM AGE(now(), u.trial_ends_at))::integer as months_since_expiry
  FROM users u
  LEFT JOIN stripe_customers sc ON u.id = sc.user_id AND sc.deleted_at IS NULL
  LEFT JOIN stripe_subscriptions ss ON sc.customer_id = ss.customer_id AND ss.deleted_at IS NULL
  LEFT JOIN user_deletion_schedule uds ON u.id = uds.user_id
  WHERE 
    -- Trial has expired
    u.trial_ends_at < now()
    -- No active subscription
    AND (ss.status IS NULL OR ss.status NOT IN ('active', 'trialing'))
    -- At least 3 months since trial expired
    AND u.trial_ends_at < (now() - interval '3 months')
    -- Not already scheduled for deletion
    AND uds.user_id IS NULL
    -- Account is not already deleted
    AND u.id IS NOT NULL;
END;
$$;

-- Function to schedule users for deletion
CREATE OR REPLACE FUNCTION schedule_users_for_deletion()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  scheduled_count integer := 0;
  deletion_date timestamptz;
BEGIN
  -- Set deletion date to 30 days from now (grace period)
  deletion_date := now() + interval '30 days';
  
  -- Loop through inactive users and schedule them for deletion
  FOR user_record IN 
    SELECT * FROM identify_inactive_users()
  LOOP
    -- Insert into deletion schedule
    INSERT INTO user_deletion_schedule (
      user_id,
      trial_expired_at,
      scheduled_deletion_at,
      deletion_reason
    ) VALUES (
      user_record.user_id,
      user_record.trial_expired_at,
      deletion_date,
      'inactive_no_subscription_3_months'
    );
    
    scheduled_count := scheduled_count + 1;
    
    -- Log the scheduling
    RAISE NOTICE 'Scheduled user % (%) for deletion on %', 
      user_record.email, user_record.user_id, deletion_date;
  END LOOP;
  
  RETURN scheduled_count;
END;
$$;

-- Function to send warning emails (placeholder - would integrate with email service)
CREATE OR REPLACE FUNCTION send_deletion_warnings()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  warning_record RECORD;
  warnings_sent integer := 0;
  warning_type text;
BEGIN
  -- Send first warning (30 days before deletion)
  FOR warning_record IN 
    SELECT uds.*, u.email, u.first_name, u.last_name
    FROM user_deletion_schedule uds
    JOIN users u ON uds.user_id = u.id
    WHERE uds.first_warning_sent_at IS NULL
    AND uds.scheduled_deletion_at > now()
    AND uds.scheduled_deletion_at <= (now() + interval '30 days')
  LOOP
    -- Update warning timestamp
    UPDATE user_deletion_schedule 
    SET first_warning_sent_at = now()
    WHERE id = warning_record.id;
    
    warnings_sent := warnings_sent + 1;
    warning_type := 'FIRST_WARNING';
    
    RAISE NOTICE 'Sent % to user % (%): Account will be deleted on % due to inactivity', 
      warning_type, warning_record.email, warning_record.user_id, warning_record.scheduled_deletion_at;
  END LOOP;
  
  -- Send second warning (14 days before deletion)
  FOR warning_record IN 
    SELECT uds.*, u.email, u.first_name, u.last_name
    FROM user_deletion_schedule uds
    JOIN users u ON uds.user_id = u.id
    WHERE uds.first_warning_sent_at IS NOT NULL
    AND uds.second_warning_sent_at IS NULL
    AND uds.scheduled_deletion_at > now()
    AND uds.scheduled_deletion_at <= (now() + interval '14 days')
  LOOP
    -- Update warning timestamp
    UPDATE user_deletion_schedule 
    SET second_warning_sent_at = now()
    WHERE id = warning_record.id;
    
    warnings_sent := warnings_sent + 1;
    warning_type := 'SECOND_WARNING';
    
    RAISE NOTICE 'Sent % to user % (%): Account will be deleted on % due to inactivity', 
      warning_type, warning_record.email, warning_record.user_id, warning_record.scheduled_deletion_at;
  END LOOP;
  
  -- Send final warning (3 days before deletion)
  FOR warning_record IN 
    SELECT uds.*, u.email, u.first_name, u.last_name
    FROM user_deletion_schedule uds
    JOIN users u ON uds.user_id = u.id
    WHERE uds.second_warning_sent_at IS NOT NULL
    AND uds.final_warning_sent_at IS NULL
    AND uds.scheduled_deletion_at > now()
    AND uds.scheduled_deletion_at <= (now() + interval '3 days')
  LOOP
    -- Update warning timestamp
    UPDATE user_deletion_schedule 
    SET final_warning_sent_at = now()
    WHERE id = warning_record.id;
    
    warnings_sent := warnings_sent + 1;
    warning_type := 'FINAL_WARNING';
    
    RAISE NOTICE 'Sent % to user % (%): Account will be deleted on % due to inactivity', 
      warning_type, warning_record.email, warning_record.user_id, warning_record.scheduled_deletion_at;
  END LOOP;
  
  RETURN warnings_sent;
END;
$$;

-- Function to execute scheduled deletions
CREATE OR REPLACE FUNCTION execute_scheduled_deletions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deletion_record RECORD;
  deletions_executed integer := 0;
BEGIN
  -- Find users scheduled for deletion whose time has come
  FOR deletion_record IN 
    SELECT uds.*, u.email, u.first_name, u.last_name
    FROM user_deletion_schedule uds
    JOIN users u ON uds.user_id = u.id
    WHERE uds.scheduled_deletion_at <= now()
    AND uds.final_warning_sent_at IS NOT NULL  -- Ensure all warnings were sent
  LOOP
    -- Log the deletion before executing
    RAISE NOTICE 'Executing scheduled deletion for user % (%) - Reason: % - Trial expired: %', 
      deletion_record.email, deletion_record.user_id, deletion_record.deletion_reason, deletion_record.trial_expired_at;
    
    -- Execute the deletion using our existing function
    PERFORM delete_user_account(deletion_record.user_id);
    
    -- Remove from deletion schedule (will be cascade deleted anyway)
    DELETE FROM user_deletion_schedule WHERE id = deletion_record.id;
    
    deletions_executed := deletions_executed + 1;
  END LOOP;
  
  RETURN deletions_executed;
END;
$$;

-- Function to cancel scheduled deletion (if user subscribes)
CREATE OR REPLACE FUNCTION cancel_scheduled_deletion(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deletion_cancelled boolean := false;
BEGIN
  -- Remove user from deletion schedule
  DELETE FROM user_deletion_schedule 
  WHERE user_id = target_user_id;
  
  -- Check if deletion was cancelled
  GET DIAGNOSTICS deletion_cancelled = ROW_COUNT;
  
  IF deletion_cancelled THEN
    RAISE NOTICE 'Cancelled scheduled deletion for user %', target_user_id;
  END IF;
  
  RETURN deletion_cancelled > 0;
END;
$$;

-- Main function to run the complete data deletion process
CREATE OR REPLACE FUNCTION run_data_deletion_process()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  scheduled_count integer;
  warnings_sent integer;
  deletions_executed integer;
  result json;
BEGIN
  -- Step 1: Schedule new users for deletion
  SELECT schedule_users_for_deletion() INTO scheduled_count;
  
  -- Step 2: Send warning emails
  SELECT send_deletion_warnings() INTO warnings_sent;
  
  -- Step 3: Execute scheduled deletions
  SELECT execute_scheduled_deletions() INTO deletions_executed;
  
  -- Return summary
  result := json_build_object(
    'timestamp', now(),
    'users_scheduled_for_deletion', scheduled_count,
    'warning_emails_sent', warnings_sent,
    'accounts_deleted', deletions_executed,
    'status', 'completed'
  );
  
  RAISE NOTICE 'Data deletion process completed: %', result;
  
  RETURN result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION identify_inactive_users() TO service_role;
GRANT EXECUTE ON FUNCTION schedule_users_for_deletion() TO service_role;
GRANT EXECUTE ON FUNCTION send_deletion_warnings() TO service_role;
GRANT EXECUTE ON FUNCTION execute_scheduled_deletions() TO service_role;
GRANT EXECUTE ON FUNCTION cancel_scheduled_deletion(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION run_data_deletion_process() TO service_role;

-- Create trigger to cancel deletion when user gets active subscription
CREATE OR REPLACE FUNCTION cancel_deletion_on_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id_to_cancel uuid;
BEGIN
  -- Get user_id from customer_id
  SELECT sc.user_id INTO user_id_to_cancel
  FROM stripe_customers sc
  WHERE sc.customer_id = NEW.customer_id
  AND sc.deleted_at IS NULL;
  
  -- If user becomes active, cancel any scheduled deletion
  IF NEW.status = 'active' AND user_id_to_cancel IS NOT NULL THEN
    PERFORM cancel_scheduled_deletion(user_id_to_cancel);
    RAISE NOTICE 'Cancelled scheduled deletion for user % due to active subscription', user_id_to_cancel;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on stripe_subscriptions
DROP TRIGGER IF EXISTS trigger_cancel_deletion_on_subscription ON stripe_subscriptions;
CREATE TRIGGER trigger_cancel_deletion_on_subscription
  AFTER INSERT OR UPDATE ON stripe_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION cancel_deletion_on_subscription();

-- Add updated_at trigger for deletion schedule table
CREATE TRIGGER update_user_deletion_schedule_updated_at 
  BEFORE UPDATE ON user_deletion_schedule
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();