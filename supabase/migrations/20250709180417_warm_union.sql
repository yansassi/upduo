/*
  # Enable RLS on missing tables

  1. Security Updates
    - Enable RLS on heroes, ranks, diamond_packages, lanes, and locations tables
    - Add appropriate policies for public read access to game data
  
  2. Tables Updated
    - `heroes` - Enable RLS with public read policy
    - `ranks` - Enable RLS with public read policy  
    - `diamond_packages` - Enable RLS with public read policy
    - `lanes` - Enable RLS with public read policy
    - `locations` - Enable RLS with public read policy
*/

-- Enable RLS on game data tables
ALTER TABLE heroes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE diamond_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lanes ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to game data
CREATE POLICY "Public read access to heroes"
  ON heroes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access to ranks"
  ON ranks
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access to diamond packages"
  ON diamond_packages
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access to lanes"
  ON lanes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access to locations"
  ON locations
  FOR SELECT
  TO public
  USING (true);