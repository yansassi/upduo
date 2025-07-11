/*
  # Corrigir preços dos pacotes de diamantes

  1. Atualizações
    - Corrigir valores dos pacotes de diamantes conforme especificado:
      - 55 diamantes = R$ 5
      - 165 diamantes = R$ 14
      - 275 diamantes = R$ 22
      - 565 diamantes = R$ 44

  2. Dados
    - Limpar dados existentes incorretos
    - Inserir valores corretos
*/

-- Limpar dados existentes e inserir os valores corretos
DELETE FROM diamond_packages;

INSERT INTO diamond_packages (id, count, price, currency, color) VALUES
('small', 55, 5, 'BRL', 'blue'),
('medium', 165, 14, 'BRL', 'green'),
('large', 275, 22, 'BRL', 'purple'),
('mega', 565, 44, 'BRL', 'orange');