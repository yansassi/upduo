/*
  # Populate diamond packages table

  1. New Data
    - Insert diamond package records that match the frontend code
    - Package IDs: diamonds_165, diamonds_275, diamonds_565
    - Include count, price, currency, and color information

  2. Data Details
    - diamonds_165: 165 diamonds for R$ 16.00 (blue color)
    - diamonds_275: 275 diamonds for R$ 25.00 (purple color) 
    - diamonds_565: 565 diamonds for R$ 46.00 (amber color)
*/

-- Insert diamond packages that match the frontend DIAMOND_PACKAGES array
INSERT INTO diamond_packages (id, count, price, currency, color) VALUES
  ('diamonds_165', 165, 16.00, 'BRL', '#3B82F6'),
  ('diamonds_275', 275, 25.00, 'BRL', '#8B5CF6'),
  ('diamonds_565', 565, 46.00, 'BRL', '#F59E0B')
ON CONFLICT (id) DO UPDATE SET
  count = EXCLUDED.count,
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  color = EXCLUDED.color;