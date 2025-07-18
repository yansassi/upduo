// ARQUIVO DESABILITADO - Migração para servidor PHP
// Este arquivo foi desabilitado durante a migração para o servidor PHP
// Todas as funcionalidades do Supabase foram substituídas por chamadas HTTP

console.warn('Supabase client desabilitado - usando servidor PHP')

// Exportar um objeto vazio para evitar erros de importação
export const supabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ error: { message: 'Supabase desabilitado' } }),
    signUp: () => Promise.resolve({ error: { message: 'Supabase desabilitado' } }),
    signOut: () => Promise.resolve({ error: { message: 'Supabase desabilitado' } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => ({
    select: () => Promise.resolve({ data: null, error: { message: 'Supabase desabilitado' } }),
    insert: () => Promise.resolve({ data: null, error: { message: 'Supabase desabilitado' } }),
    update: () => Promise.resolve({ data: null, error: { message: 'Supabase desabilitado' } }),
    delete: () => Promise.resolve({ data: null, error: { message: 'Supabase desabilitado' } })
  }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: { message: 'Supabase desabilitado' } }),
      getPublicUrl: () => ({ data: { publicUrl: '' } })
    })
  }
}

export type Database = any // Manter para compatibilidade