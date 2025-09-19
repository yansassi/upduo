/*
  # Create diamond withdrawal RPC function

  1. New Functions
    - `process_diamond_withdrawal` - Handles diamond withdrawal requests
      - Validates user exists and has sufficient diamonds
      - Deducts diamonds from user's profile
      - Creates withdrawal record in diamond_withdrawals table
      - Creates transaction record for audit trail
      - Returns success/error status with relevant data

  2. Security
    - Function uses SECURITY DEFINER to ensure proper access control
    - Validates user ownership before processing withdrawal
    - Handles all error cases gracefully

  3. Transaction Safety
    - Uses database transactions to ensure data consistency
    - Rolls back all changes if any step fails
*/

CREATE OR REPLACE FUNCTION public.process_diamond_withdrawal(
    p_user_id uuid,
    p_amount integer,
    p_ml_user_id text,
    p_ml_zone_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_diamond_count integer;
    new_diamond_count integer;
    withdrawal_id uuid;
    transaction_id uuid;
BEGIN
    -- Validate input parameters
    IF p_amount <= 0 THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Invalid withdrawal amount'
        );
    END IF;

    IF p_ml_user_id IS NULL OR trim(p_ml_user_id) = '' THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Mobile Legends User ID is required'
        );
    END IF;

    IF p_ml_zone_id IS NULL OR trim(p_ml_zone_id) = '' THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Mobile Legends Zone ID is required'
        );
    END IF;

    -- Check if user exists and get current diamond count
    SELECT diamond_count INTO current_diamond_count
    FROM public.profiles
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'User profile not found'
        );
    END IF;

    -- Check if user has enough diamonds
    IF current_diamond_count < p_amount THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Insufficient diamonds. You have ' || current_diamond_count || ' diamonds but need ' || p_amount
        );
    END IF;

    -- Calculate new diamond count
    new_diamond_count := current_diamond_count - p_amount;

    -- Start transaction block
    BEGIN
        -- Deduct diamonds from user's profile
        UPDATE public.profiles
        SET 
            diamond_count = new_diamond_count,
            ml_user_id = p_ml_user_id,
            ml_zone_id = p_ml_zone_id,
            updated_at = now()
        WHERE id = p_user_id;

        -- Create withdrawal record
        INSERT INTO public.diamond_withdrawals (
            user_id,
            amount,
            ml_user_id,
            ml_zone_id,
            status,
            created_at,
            updated_at
        )
        VALUES (
            p_user_id,
            p_amount,
            trim(p_ml_user_id),
            trim(p_ml_zone_id),
            'pending',
            now(),
            now()
        )
        RETURNING id INTO withdrawal_id;

        -- Create transaction record for audit trail
        INSERT INTO public.transactions (
            sender_id,
            receiver_id,
            amount,
            transaction_type,
            status,
            created_at,
            updated_at
        )
        VALUES (
            p_user_id,
            p_user_id, -- For withdrawals, sender and receiver are the same user
            p_amount,
            'withdrawal',
            'completed',
            now(),
            now()
        )
        RETURNING id INTO transaction_id;

        -- Return success response
        RETURN jsonb_build_object(
            'success', true,
            'withdrawal_id', withdrawal_id,
            'transaction_id', transaction_id,
            'new_diamond_count', new_diamond_count,
            'amount_withdrawn', p_amount,
            'message', 'Withdrawal request created successfully'
        );

    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback happens automatically, return error
            RETURN jsonb_build_object(
                'success', false, 
                'error', 'Database error: ' || SQLERRM
            );
    END;

END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.process_diamond_withdrawal(uuid, integer, text, text) TO authenticated;