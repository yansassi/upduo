/*
  # Add Brazilian States and Cities Data

  1. New Tables
    - Populate `locations` table with Brazilian states and major cities
    - Add proper state abbreviations and city names
    - Include regional information

  2. Data Structure
    - `id` (text) - Unique identifier for each city
    - `name` (text) - City name
    - `state_abbr` (text) - State abbreviation (SP, RJ, MG, etc.)
    - `region` (text) - Brazilian region (Sudeste, Sul, etc.)

  3. Sample Data
    - Major cities from all Brazilian states
    - Proper state abbreviations matching Brazilian standards
*/

-- Clear existing data if any
DELETE FROM locations;

-- Insert major Brazilian cities by state
INSERT INTO locations (id, name, state_abbr, region) VALUES
-- São Paulo
('sp_sao_paulo', 'São Paulo', 'SP', 'Sudeste'),
('sp_campinas', 'Campinas', 'SP', 'Sudeste'),
('sp_santos', 'Santos', 'SP', 'Sudeste'),
('sp_sao_bernardo', 'São Bernardo do Campo', 'SP', 'Sudeste'),
('sp_guarulhos', 'Guarulhos', 'SP', 'Sudeste'),
('sp_osasco', 'Osasco', 'SP', 'Sudeste'),
('sp_ribeirao_preto', 'Ribeirão Preto', 'SP', 'Sudeste'),
('sp_sorocaba', 'Sorocaba', 'SP', 'Sudeste'),
('sp_sao_jose_campos', 'São José dos Campos', 'SP', 'Sudeste'),
('sp_piracicaba', 'Piracicaba', 'SP', 'Sudeste'),

-- Rio de Janeiro
('rj_rio_janeiro', 'Rio de Janeiro', 'RJ', 'Sudeste'),
('rj_niteroi', 'Niterói', 'RJ', 'Sudeste'),
('rj_nova_iguacu', 'Nova Iguaçu', 'RJ', 'Sudeste'),
('rj_duque_caxias', 'Duque de Caxias', 'RJ', 'Sudeste'),
('rj_sao_goncalo', 'São Gonçalo', 'RJ', 'Sudeste'),
('rj_volta_redonda', 'Volta Redonda', 'RJ', 'Sudeste'),
('rj_petropolis', 'Petrópolis', 'RJ', 'Sudeste'),
('rj_campos', 'Campos dos Goytacazes', 'RJ', 'Sudeste'),

-- Minas Gerais
('mg_belo_horizonte', 'Belo Horizonte', 'MG', 'Sudeste'),
('mg_uberlandia', 'Uberlândia', 'MG', 'Sudeste'),
('mg_contagem', 'Contagem', 'MG', 'Sudeste'),
('mg_juiz_fora', 'Juiz de Fora', 'MG', 'Sudeste'),
('mg_betim', 'Betim', 'MG', 'Sudeste'),
('mg_montes_claros', 'Montes Claros', 'MG', 'Sudeste'),
('mg_ribeirao_preto', 'Ribeirão das Neves', 'MG', 'Sudeste'),
('mg_uberaba', 'Uberaba', 'MG', 'Sudeste'),

-- Espírito Santo
('es_vitoria', 'Vitória', 'ES', 'Sudeste'),
('es_vila_velha', 'Vila Velha', 'ES', 'Sudeste'),
('es_cariacica', 'Cariacica', 'ES', 'Sudeste'),
('es_serra', 'Serra', 'ES', 'Sudeste'),
('es_cachoeiro', 'Cachoeiro de Itapemirim', 'ES', 'Sudeste'),

-- Rio Grande do Sul
('rs_porto_alegre', 'Porto Alegre', 'RS', 'Sul'),
('rs_caxias_sul', 'Caxias do Sul', 'RS', 'Sul'),
('rs_pelotas', 'Pelotas', 'RS', 'Sul'),
('rs_canoas', 'Canoas', 'RS', 'Sul'),
('rs_santa_maria', 'Santa Maria', 'RS', 'Sul'),
('rs_gravataí', 'Gravataí', 'RS', 'Sul'),
('rs_viamao', 'Viamão', 'RS', 'Sul'),
('rs_novo_hamburgo', 'Novo Hamburgo', 'RS', 'Sul'),

-- Paraná
('pr_curitiba', 'Curitiba', 'PR', 'Sul'),
('pr_londrina', 'Londrina', 'PR', 'Sul'),
('pr_maringa', 'Maringá', 'PR', 'Sul'),
('pr_ponta_grossa', 'Ponta Grossa', 'PR', 'Sul'),
('pr_cascavel', 'Cascavel', 'PR', 'Sul'),
('pr_sao_jose_pinhais', 'São José dos Pinhais', 'PR', 'Sul'),
('pr_foz_iguacu', 'Foz do Iguaçu', 'PR', 'Sul'),

-- Santa Catarina
('sc_florianopolis', 'Florianópolis', 'SC', 'Sul'),
('sc_joinville', 'Joinville', 'SC', 'Sul'),
('sc_blumenau', 'Blumenau', 'SC', 'Sul'),
('sc_sao_jose', 'São José', 'SC', 'Sul'),
('sc_criciuma', 'Criciúma', 'SC', 'Sul'),
('sc_chapeco', 'Chapecó', 'SC', 'Sul'),
('sc_itajai', 'Itajaí', 'SC', 'Sul'),

-- Bahia
('ba_salvador', 'Salvador', 'BA', 'Nordeste'),
('ba_feira_santana', 'Feira de Santana', 'BA', 'Nordeste'),
('ba_vitoria_conquista', 'Vitória da Conquista', 'BA', 'Nordeste'),
('ba_camaçari', 'Camaçari', 'BA', 'Nordeste'),
('ba_juazeiro', 'Juazeiro', 'BA', 'Nordeste'),
('ba_ilheus', 'Ilhéus', 'BA', 'Nordeste'),
('ba_itabuna', 'Itabuna', 'BA', 'Nordeste'),

-- Pernambuco
('pe_recife', 'Recife', 'PE', 'Nordeste'),
('pe_jaboatao', 'Jaboatão dos Guararapes', 'PE', 'Nordeste'),
('pe_olinda', 'Olinda', 'PE', 'Nordeste'),
('pe_caruaru', 'Caruaru', 'PE', 'Nordeste'),
('pe_petrolina', 'Petrolina', 'PE', 'Nordeste'),
('pe_paulista', 'Paulista', 'PE', 'Nordeste'),

-- Ceará
('ce_fortaleza', 'Fortaleza', 'CE', 'Nordeste'),
('ce_caucaia', 'Caucaia', 'CE', 'Nordeste'),
('ce_juazeiro_norte', 'Juazeiro do Norte', 'CE', 'Nordeste'),
('ce_maracanau', 'Maracanaú', 'CE', 'Nordeste'),
('ce_sobral', 'Sobral', 'CE', 'Nordeste'),

-- Goiás
('go_goiania', 'Goiânia', 'GO', 'Centro-Oeste'),
('go_aparecida', 'Aparecida de Goiânia', 'GO', 'Centro-Oeste'),
('go_anapolis', 'Anápolis', 'GO', 'Centro-Oeste'),
('go_rio_verde', 'Rio Verde', 'GO', 'Centro-Oeste'),

-- Distrito Federal
('df_brasilia', 'Brasília', 'DF', 'Centro-Oeste'),

-- Mato Grosso
('mt_cuiaba', 'Cuiabá', 'MT', 'Centro-Oeste'),
('mt_varzea_grande', 'Várzea Grande', 'MT', 'Centro-Oeste'),
('mt_rondonopolis', 'Rondonópolis', 'MT', 'Centro-Oeste'),

-- Mato Grosso do Sul
('ms_campo_grande', 'Campo Grande', 'MS', 'Centro-Oeste'),
('ms_dourados', 'Dourados', 'MS', 'Centro-Oeste'),
('ms_tres_lagoas', 'Três Lagoas', 'MS', 'Centro-Oeste'),

-- Amazonas
('am_manaus', 'Manaus', 'AM', 'Norte'),
('am_parintins', 'Parintins', 'AM', 'Norte'),
('am_itacoatiara', 'Itacoatiara', 'AM', 'Norte'),

-- Pará
('pa_belem', 'Belém', 'PA', 'Norte'),
('pa_ananindeua', 'Ananindeua', 'PA', 'Norte'),
('pa_santarem', 'Santarém', 'PA', 'Norte'),
('pa_maraba', 'Marabá', 'PA', 'Norte'),

-- Acre
('ac_rio_branco', 'Rio Branco', 'AC', 'Norte'),
('ac_cruzeiro_sul', 'Cruzeiro do Sul', 'AC', 'Norte'),

-- Rondônia
('ro_porto_velho', 'Porto Velho', 'RO', 'Norte'),
('ro_ji_parana', 'Ji-Paraná', 'RO', 'Norte'),

-- Roraima
('rr_boa_vista', 'Boa Vista', 'RR', 'Norte'),

-- Amapá
('ap_macapa', 'Macapá', 'AP', 'Norte'),
('ap_santana', 'Santana', 'AP', 'Norte'),

-- Tocantins
('to_palmas', 'Palmas', 'TO', 'Norte'),
('to_araguaina', 'Araguaína', 'TO', 'Norte'),

-- Maranhão
('ma_sao_luis', 'São Luís', 'MA', 'Nordeste'),
('ma_imperatriz', 'Imperatriz', 'MA', 'Nordeste'),
('ma_sao_jose_ribamar', 'São José de Ribamar', 'MA', 'Nordeste'),

-- Piauí
('pi_teresina', 'Teresina', 'PI', 'Nordeste'),
('pi_parnaiba', 'Parnaíba', 'PI', 'Nordeste'),

-- Alagoas
('al_maceio', 'Maceió', 'AL', 'Nordeste'),
('al_arapiraca', 'Arapiraca', 'AL', 'Nordeste'),

-- Sergipe
('se_aracaju', 'Aracaju', 'SE', 'Nordeste'),
('se_nossa_senhora_socorro', 'Nossa Senhora do Socorro', 'SE', 'Nordeste'),

-- Paraíba
('pb_joao_pessoa', 'João Pessoa', 'PB', 'Nordeste'),
('pb_campina_grande', 'Campina Grande', 'PB', 'Nordeste'),

-- Rio Grande do Norte
('rn_natal', 'Natal', 'RN', 'Nordeste'),
('rn_mossoró', 'Mossoró', 'RN', 'Nordeste');