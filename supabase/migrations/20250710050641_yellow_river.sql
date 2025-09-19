/*
  # Função para transferência segura de diamantes

  1. Nova função PostgreSQL
    - `transfer_diamonds` - Função segura para transferir diamantes entre usuários
    - Executa com privilégios elevados (SECURITY DEFINER)
    - Operação atômica com rollback automático em caso de erro
    - Registra todas as transações na tabela transactions

  2. Segurança
    - Verifica saldo suficiente do remetente
    - Valida existência do destinatário
    - Operação atômica (tudo ou nada)
    - Logs detalhados de erro
*/

-- Criar função para transferência segura de diamantes
CREATE OR REPLACE FUNCTION public.transfer_diamonds(
    p_sender_id uuid,
    p_receiver_id uuid,
    p_amount integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- ESSENCIAL: Permite que a função ignore as políticas de RLS
AS $$
DECLARE
    sender_current_diamonds integer;
    receiver_current_diamonds integer;
    transaction_id uuid;
    result jsonb;
BEGIN
    -- Define o caminho de busca para garantir que as tabelas sejam encontradas
    SET search_path = public, pg_temp;

    -- Validações básicas
    IF p_amount <= 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Amount must be greater than 0',
            'transaction_id', null
        );
    END IF;

    IF p_sender_id = p_receiver_id THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Cannot transfer diamonds to yourself',
            'transaction_id', null
        );
    END IF;

    -- 1. Registra a transação como 'pending'
    INSERT INTO public.transactions (sender_id, receiver_id, amount, transaction_type, status)
    VALUES (p_sender_id, p_receiver_id, p_amount, 'diamond_transfer', 'pending')
    RETURNING id INTO transaction_id;

    -- 2. Obtém e bloqueia o perfil do remetente
    SELECT diamond_count INTO sender_current_diamonds
    FROM public.profiles
    WHERE id = p_sender_id
    FOR UPDATE;

    -- Verifica se o remetente existe e tem diamantes suficientes
    IF sender_current_diamonds IS NULL THEN
        UPDATE public.transactions
        SET status = 'failed', error_message = 'Sender profile not found'
        WHERE id = transaction_id;
        
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Sender profile not found',
            'transaction_id', transaction_id
        );
    END IF;

    IF sender_current_diamonds < p_amount THEN
        UPDATE public.transactions
        SET status = 'failed', error_message = 'Insufficient diamonds'
        WHERE id = transaction_id;
        
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Insufficient diamonds',
            'transaction_id', transaction_id
        );
    END IF;

    -- 3. Obtém e bloqueia o perfil do destinatário
    SELECT diamond_count INTO receiver_current_diamonds
    FROM public.profiles
    WHERE id = p_receiver_id
    FOR UPDATE;

    -- Verifica se o destinatário existe
    IF receiver_current_diamonds IS NULL THEN
        UPDATE public.transactions
        SET status = 'failed', error_message = 'Receiver profile not found'
        WHERE id = transaction_id;
        
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Receiver profile not found',
            'transaction_id', transaction_id
        );
    END IF;

    -- 4. Executa a transferência
    -- Deduz diamantes do remetente
    UPDATE public.profiles
    SET diamond_count = sender_current_diamonds - p_amount, updated_at = now()
    WHERE id = p_sender_id;

    -- Adiciona diamantes ao destinatário
    UPDATE public.profiles
    SET diamond_count = receiver_current_diamonds + p_amount, updated_at = now()
    WHERE id = p_receiver_id;

    -- 5. Marca a transação como concluída
    UPDATE public.transactions
    SET status = 'completed'
    WHERE id = transaction_id;

    -- 6. Retorna sucesso com os novos saldos
    RETURN jsonb_build_object(
        'success', true,
        'error', null,
        'transaction_id', transaction_id,
        'sender_new_balance', sender_current_diamonds - p_amount,
        'receiver_new_balance', receiver_current_diamonds + p_amount
    );

EXCEPTION
    WHEN OTHERS THEN
        -- Captura qualquer erro e marca a transação como falha
        IF transaction_id IS NOT NULL THEN
            UPDATE public.transactions
            SET status = 'failed', error_message = SQLERRM
            WHERE id = transaction_id;
        END IF;
        
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'transaction_id', transaction_id
        );
END;
$$;

-- Concede permissão de execução para usuários autenticados
GRANT EXECUTE ON FUNCTION public.transfer_diamonds(uuid, uuid, integer) TO authenticated;

-- Comentário da função
COMMENT ON FUNCTION public.transfer_diamonds(uuid, uuid, integer) IS 
'Transfere diamantes de forma segura entre dois usuários. Executa operação atômica com rollback automático em caso de erro.';