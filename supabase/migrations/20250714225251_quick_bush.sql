/*
  # Insert diamond packages data

  1. New Data
    - Insert default diamond packages for purchase
    - Packages with different amounts and prices
    - Brazilian Real (BRL) currency

  2. Security
    - Public read access already configured
*/

-- Insert diamond packages if they don't exist
INSERT INTO public.diamond_packages (id, count, price, currency, color) VALUES
  ('small', 100, 15.00, 'BRL', '#3B82F6'),
  ('medium', 250, 35.00, 'BRL', '#10B981'),
  ('large', 500, 65.00, 'BRL', '#8B5CF6'),
  ('mega', 1000, 120.00, 'BRL', '#F59E0B')
ON CONFLICT (id) DO UPDATE SET
  count = EXCLUDED.count,
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  color = EXCLUDED.color;