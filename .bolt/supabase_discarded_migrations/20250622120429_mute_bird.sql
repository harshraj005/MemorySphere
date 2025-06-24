/*
  # Fix Account Deletion and Signup Issues

  1. Security Updates
    - Add INSERT policy for users table to allow account creation
    - Add function to handle complete account deletion including auth user
    - Update RLS policies for proper data access

  2. Account Deletion
    - Create function to delete auth user (requires service role)
    - Ensure all user data is properly cleaned up
    - Handle foreign key constraints properly

  3. Signup Support
    - Allow authenticated users to insert their own profile
    - Ensure proper data flow during registration
*/

-- Add INSERT policy for users table (needed for signup)
CREATE POLICY "Allow insert for authenticated users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Function to completely delete a user account (including auth)
-- This function runs with elevated privileges to delete from auth.users
CREATE OR REPLACE FUNCTION delete_user_account(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete user data in correct order (respecting foreign keys)
  
  -- 1. Delete memories
  DELETE FROM memories WHERE memories.user_id = delete_user_account.user_id;
  
  -- 2. Delete tasks  
  DELETE FROM tasks WHERE tasks.user_id = delete_user_account.user_id;
  
  -- 3. Delete subscriptions
  DELETE FROM subscriptions WHERE subscriptions.user_id = delete_user_account.user_id;
  
  -- 4. Soft delete stripe customers (mark as deleted)
  UPDATE stripe_customers 
  SET deleted_at = now() 
  WHERE stripe_customers.user_id = delete_user_account.user_id;
  
  -- 5. Delete user profile
  DELETE FROM users WHERE users.id = delete_user_account.user_id;
  
  -- 6. Delete from auth.users (this requires service role privileges)
  DELETE FROM auth.users WHERE auth.users.id = delete_user_account.user_id;
  
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account(uuid) TO authenticated;

-- Create RPC function that users can call to delete their own account
CREATE OR REPLACE FUNCTION delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Call the main deletion function
  PERFORM delete_user_account(auth.uid());
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_my_account() TO authenticated;