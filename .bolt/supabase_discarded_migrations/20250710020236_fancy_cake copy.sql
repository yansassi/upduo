/*
  # Add Sample Profiles for Testing

  1. Sample Data
    - Create diverse sample profiles with different ranks, heroes, and locations
    - Include both male and female names for variety
    - Cover different Brazilian cities and ranks
    - Add realistic bios and hero combinations

  2. Security
    - These are test profiles that can be swiped by real users
    - They won't be able to log in (no auth.users entries)
    - Just for demonstration and testing purposes
*/

-- Insert sample profiles for testing
-- Note: These use fake UUIDs that don't correspond to real auth.users
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
),

-- Profile 6: Fighter player from Fortaleza
(
  '66666666-6666-6666-6666-666666666666',
  'camila.fighter@example.com',
  'Camila',
  21,
  'Fortaleza',
  'Epic',
  ARRAY['Chou', 'Benedetta', 'Paquito'],
  ARRAY['exp', 'jungle'],
  'Fighter/Jungle flex. Boa mecânica e game sense. Procuro time para trio rank.',
  'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
  false
),

-- Profile 7: Versatile player from Brasília
(
  '77777777-7777-7777-7777-777777777777',
  'lucas.flex@example.com',
  'Lucas',
  26,
  'Brasília',
  'Mythical Glory',
  ARRAY['Gusion', 'Johnson', 'Granger'],
  ARRAY['jungle', 'roam', 'gold'],
  'Player versátil que joga todas as posições. Mythical Glory há 3 temporadas.',
  'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400',
  true
),

-- Profile 8: Beginner player from Recife
(
  '88888888-8888-8888-8888-888888888888',
  'maria.newbie@example.com',
  'Maria',
  19,
  'Recife',
  'Grandmaster',
  ARRAY['Layla', 'Miya', 'Eudora'],
  ARRAY['gold', 'mid'],
  'Ainda aprendendo, mas muito dedicada! Procuro alguém paciente para me ensinar.',
  'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=400',
  false
),

-- Profile 9: Experienced player from Porto Alegre
(
  '99999999-9999-9999-9999-999999999999',
  'diego.veteran@example.com',
  'Diego',
  28,
  'Porto Alegre',
  'Mythic',
  ARRAY['Hayabusa', 'Ling', 'Lancelot'],
  ARRAY['jungle'],
  'Jungle main desde a Season 1. Conheço todos os timings e rotações.',
  'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=400',
  false
),

-- Profile 10: Casual player from Florianópolis
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'isabela.casual@example.com',
  'Isabela',
  23,
  'Florianópolis',
  'Master',
  ARRAY['Chang\'e', 'Odette', 'Aurora'],
  ARRAY['mid', 'roam'],
  'Jogo mais casual, mas sempre dou meu melhor! Procuro pessoas legais para jogar.',
  'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400',
  false
);