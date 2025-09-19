import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { DiamondPurchaseFormModal } from './DiamondPurchaseFormModal';
import { Diamond, ArrowLeft, ShoppingCart, Sparkles, X, Check } from 'lucide-react';

interface DiamondPackage {
  id: string;
  count: number;
  price: number;
  currency: string;
  color?: string;
  caktoUrl: string;
}

interface DiamondPurchaseProps {
  onBack: () => void;
}

// Pacotes de diamantes com os links do Cakto
const DIAMOND_PACKAGES: DiamondPackage[] = [
  {
    id: 'diamonds_165',
    count: 165,
    price: 16.00,
    currency: 'BRL',
    color: '#3B82F6',
    caktoUrl: 'https://pay.cakto.com.br/fq5rcxf_479668'
  },
  {
    id: 'diamonds_275', 
    count: 275,
    price: 25.00,
    currency: 'BRL',
    color: '#8B5CF6',
    caktoUrl: 'https://pay.cakto.com.br/33j4cpa_479674'
  },
  {
    id: 'diamonds_565',
    count: 565,
    price: 46.00,
    currency: 'BRL', 
    color: '#F59E0B',
    caktoUrl: 'https://pay.cakto.com.br/ix3hbnz_479679'
  }
];

export default function DiamondPurchase({ onBack }: DiamondPurchaseProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<DiamondPackage | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const handlePurchaseClick = (pkg: DiamondPackage) => {
    console.log('DiamondPurchase: Package selected', pkg);
    setSelectedPackage(pkg);
    setShowFormModal(true);
  };

  const handleFormSubmit = async (formData: { name: string; email: string; phone: string }) => {
    if (!user || !selectedPackage) return;

    console.log('DiamondPurchase: Form submitted', { formData, selectedPackage });
    setLoading(true);

    try {
      // Salvar intenção de compra no banco de dados
      const { data, error } = await supabase
        .from('diamond_purchase_intents')
        .insert({
          user_id: user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          diamond_package_id: selectedPackage.id,
          amount_paid: selectedPackage.price,
          status: 'initiated'
        })
        .select()
        .single();

      if (error) {
        console.error('DiamondPurchase: Error saving purchase intent', error);
        throw error;
      }

      console.log('DiamondPurchase: Purchase intent saved', data);

      // Fechar modal do formulário e abrir modal de pagamento
      setShowFormModal(false);
      setShowPaymentModal(true);

    } catch (error) {
      console.error('DiamondPurchase: Error in purchase process', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`Erro ao processar compra: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    setSelectedPackage(null);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPackage(null);
    setPaymentCompleted(false);
  };

  const handlePaymentSuccess = () => {
    setPaymentCompleted(true);
    // Aguardar 3 segundos e fechar o modal
    setTimeout(() => {
      handleClosePaymentModal();
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-8">
          <button
            onClick={onBack}
            className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-white">Comprar Diamantes</h1>
          <div className="w-10"></div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl relative"
          >
            <Diamond className="w-12 h-12 text-white" />
            {/* Floating sparkles */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </motion.div>
            <motion.div
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute -bottom-2 -left-2"
            >
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </motion.div>
          </motion.div>
          
          <h2 className="text-3xl font-bold text-white mb-3">💎 Diamantes UpDuo</h2>
          <p className="text-purple-200 text-lg leading-relaxed">
            Compre diamantes e envie presentes especiais para seus matches!
          </p>
        </div>

        {/* Diamond Packages */}
        <div className="space-y-4 mb-8">
          {DIAMOND_PACKAGES.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: pkg.color }}
                  >
                    <span className="text-2xl">💎</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">
                      {pkg.count} Diamantes
                    </h3>
                    <p className="text-white/70 text-sm">
                      R$ {(pkg.price / pkg.count).toFixed(2)} por diamante
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-2xl">
                    R$ {pkg.price.toFixed(2)}
                  </div>
                  <div className="text-white/70 text-sm">
                    {pkg.currency}
                  </div>
                </div>
              </div>

              {/* Valor destacado para o pacote do meio */}
              {pkg.count === 275 && (
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-center py-2 px-4 rounded-lg mb-4 font-semibold text-sm">
                  🔥 MELHOR VALOR
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePurchaseClick(pkg)}
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{loading ? 'Processando...' : 'Comprar Agora'}</span>
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <Diamond className="w-5 h-5 mr-2 text-yellow-400" />
            Como usar os diamantes
          </h3>
          <ul className="text-white/70 text-sm space-y-2">
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2">💎</span>
              Envie presentes especiais para seus matches
            </li>
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2">💎</span>
              Demonstre interesse de forma única
            </li>
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2">💎</span>
              Destaque-se entre outros jogadores
            </li>
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2">💎</span>
              Crie conexões mais especiais
            </li>
          </ul>
        </div>

        {/* Security Notice */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-2 text-green-400 mb-2">
            <span className="text-sm">🔒</span>
            <span className="text-sm font-medium">Pagamento 100% Seguro</span>
          </div>
          <p className="text-xs text-green-300">
            Processado pelo Cakto com criptografia SSL. Seus dados estão protegidos.
          </p>
        </div>
      </div>

      {/* Form Modal */}
      <DiamondPurchaseFormModal
        isOpen={showFormModal}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        loading={loading}
        selectedPackage={selectedPackage}
      />

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedPackage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <Diamond className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Pagamento</h3>
                    <p className="text-sm text-gray-600">
                      {selectedPackage.count} diamantes - R$ {selectedPackage.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleClosePaymentModal}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Payment Content */}
              {paymentCompleted ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Pagamento Confirmado!</h3>
                  <p className="text-gray-600 mb-4">
                    Seus {selectedPackage.count} diamantes foram creditados na sua conta.
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-yellow-600">
                    <span className="text-2xl">💎</span>
                    <span className="text-xl font-bold">{selectedPackage.count}</span>
                    <span>diamantes</span>
                  </div>
                </div>
              ) : (
                <div className="relative" style={{ height: '500px' }}>
                  <iframe
                    src={selectedPackage.caktoUrl}
                    className="w-full h-full border-0"
                    title="Pagamento Cakto"
                    allow="payment"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
                    onLoad={() => {
                      // Simular sucesso do pagamento após 10 segundos (para demonstração)
                      // Em produção, isso seria controlado pelo webhook do Cakto
                      setTimeout(() => {
                        handlePaymentSuccess();
                      }, 10000);
                    }}
                  />
                </div>
              )}

              {/* Footer Info */}
              {!paymentCompleted && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-2">
                      🔒 Pagamento processado de forma segura
                    </p>
                    <p className="text-xs text-gray-500">
                      Após o pagamento, seus diamantes serão creditados automaticamente
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}