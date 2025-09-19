/*
  # Fix sample profiles and database issues

  1. Clean up any problematic data
  2. Add proper sample profiles that work with the auth system
  3. Ensure all constraints are properly handled

  This migration is safe to run multiple times.
*/

-- First, let's clean up any existing sample data that might be causing issues
DELETE FROM matches WHERE user1_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888',
  '99999999-9999-9999-9999-999999999999',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
);

DELETE FROM swipes WHERE swiper_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888',
  '99999999-9999-9999-9999-999999999999',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
);

DELETE FROM daily_swipe_counts WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888',
  '99999999-9999-9999-9999-999999999999',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
);

DELETE FROM profiles WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888',
  '99999999-9999-9999-9999-999999999999',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
);

-- Now let's create proper auth users first, then profiles
-- We'll use a function to safely create these test users

DO $$
DECLARE
  test_user_id uuid;
BEGIN
  -- Create test users in auth.users (this is a simplified approach)
  -- In production, users would be created through the auth system
  
  -- User 1: Carlos
  test_user_id := '11111111-1111-1111-1111-111111111111';
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    test_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'carlos.gamer@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    '',
    '',
    '',
    ''
  ) ON CONFLICT (id) DO NOTHING;

  -- User 2: Ana
  test_user_id := '22222222-2222-2222-2222-222222222222';
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    test_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'ana.support@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    '',
    '',
    '',
    ''
  ) ON CONFLICT (id) DO NOTHING;

  -- User 3: Pedro
  test_user_id := '33333333-3333-3333-3333-333333333333';
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    test_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'pedro.tank@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    '',
    '',
    '',
    ''
  ) ON CONFLICT (id) DO NOTHING;

  -- User 4: Julia
  test_user_id := '44444444-4444-4444-4444-444444444444';
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    test_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'julia.adc@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    '',
    '',
    '',
    ''
  ) ON CONFLICT (id) DO NOTHING;

  -- User 5: Rafael
  test_user_id := '55555555-5555-5555-5555-555555555555';
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    test_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rafael.mage@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    '',
    '',
    '',
    ''
  ) ON CONFLICT (id) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    -- If we can't create auth users (which is expected in some setups),
    -- we'll just skip this part and create profiles without auth users
    NULL;
END $$;

-- Now create the profiles (these will work even if auth users weren't created)
INSERT INTO profiles (
  id, 
  email, 
  name, 
  age, 
  city, 
  current_rank, 
  favorite_heroes, 
  favorite_lines, 
  bio,
  avatar_url,
  is_premium
) VALUES 
-- Profile 1: High rank player from São Paulo
(
  '11111111-1111-1111-1111-111111111111',
  'carlos.gamer@example.com',
  'Carlos',
  23,
  'São Paulo',
  'Mythic',
  ARRAY['Gusion', 'Lancelot', 'Fanny'],
  ARRAY['mid', 'jungle'],
  'Main assassino, procuro duo para subir para Mythical Glory. Jogo todos os dias à noite!',
  'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
  false
),

-- Profile 2: Support player from Rio
(
  '22222222-2222-2222-2222-222222222222',
  'ana.support@example.com',
  'Ana',
  20,
  'Rio de Janeiro',
  'Legend',
  ARRAY['Angela', 'Rafaela', 'Estes'],
  ARRAY['roam'],
  'Support main que sabe proteger o carry! Procuro ADC ou jungle para duo rank.',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
  true
),

-- Profile 3: Tank player from Belo Horizonte
(
  '33333333-3333-3333-3333-333333333333',
  'pedro.tank@example.com',
  'Pedro',
  25,
  'Belo Horizonte',
  'Epic',
  ARRAY['Tigreal', 'Johnson', 'Atlas'],
  ARRAY['roam', 'exp'],
  'Tank/Roam experiente. Sei quando iniciar e quando recuar. Vamos subir juntos!',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
  false
),

-- Profile 4: ADC player from Curitiba
(
  '44444444-4444-4444-4444-444444444444',
  'julia.adc@example.com',
  'Julia',
  22,
  'Curitiba',
  'Mythic',
  ARRAY['Granger', 'Bruno', 'Clint'],
  ARRAY['gold'],
  'ADC main com boa farm e posicionamento. Procuro support ou roam para duo.',
  'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
  true
),

-- Profile 5: Mage player from Salvador
(
  '55555555-5555-5555-5555-555555555555',
  'rafael.mage@example.com',
  'Rafael',
  24,
  'Salvador',
  'Legend',
  ARRAY['Kagura', 'Lunox', 'Pharsa'],
  ARRAY['mid'],
  'Mage player que domina combos. Boa rotação e teamfight. Bora rankear!',
  'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400',
  false
)
ON CONFLICT (id) DO NOTHING;