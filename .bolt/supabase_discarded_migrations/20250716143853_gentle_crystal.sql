/*
  # Adicionar suporte a múltiplos países na tabela locations

  1. Alterações na tabela
    - Adicionar coluna `country_code` para identificar o país
    - Tornar `state_abbr` opcional (nullable) para países sem estados
    - Renomear `region` para `subdivision` para ser mais genérico
    - Adicionar índices para melhor performance

  2. Segurança
    - Manter RLS existente
    - Adicionar índices para consultas por país

  3. Dados
    - Atualizar registros existentes para incluir 'BR' como country_code
*/

-- Adicionar coluna country_code (obrigatória)
ALTER TABLE locations 
ADD COLUMN country_code text NOT NULL DEFAULT 'BR';

-- Tornar state_abbr opcional para países que não usam estados
ALTER TABLE locations 
ALTER COLUMN state_abbr DROP NOT NULL;

-- Renomear region para subdivision (mais genérico)
ALTER TABLE locations 
RENAME COLUMN region TO subdivision;

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_locations_country_code ON locations(country_code);
CREATE INDEX IF NOT EXISTS idx_locations_country_subdivision ON locations(country_code, subdivision);
CREATE INDEX IF NOT EXISTS idx_locations_country_state ON locations(country_code, state_abbr) WHERE state_abbr IS NOT NULL;

-- Atualizar constraint para incluir country_code na chave única
DROP INDEX IF EXISTS locations_pkey;
ALTER TABLE locations DROP CONSTRAINT IF EXISTS locations_pkey;
ALTER TABLE locations ADD CONSTRAINT locations_pkey PRIMARY KEY (id, country_code);

-- Comentários para documentação
COMMENT ON COLUMN locations.country_code IS 'Código ISO 3166-1 alpha-2 do país (ex: BR, US, AR)';
COMMENT ON COLUMN locations.state_abbr IS 'Abreviação do estado/província (opcional para países sem subdivisões)';
COMMENT ON COLUMN locations.subdivision IS 'Região/subdivisão administrativa do país';