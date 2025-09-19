import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Shield, Eye, Users, AlertCircle, Mail } from 'lucide-react'

interface TermsOfUseProps {
  isOpen: boolean
  onClose: () => void
}

export const TermsOfUse: React.FC<TermsOfUseProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Termos de Uso</h2>
                  <p className="text-sm text-gray-600">UpDuo - Encontre seu Duo</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Última atualização */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-blue-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Última atualização: {new Date().toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            {/* Seção 1: Aceitação dos Termos */}
            <section>
              <div className="flex items-center space-x-2 mb-3">
                <Shield className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">1. Aceitação dos Termos</h3>
              </div>
              <div className="text-gray-600 space-y-3 text-sm leading-relaxed">
                <p>
                  Ao acessar e usar o UpDuo ("Aplicativo"), você concorda em cumprir e estar vinculado a estes Termos de Uso. 
                  Se você não concordar com qualquer parte destes termos, não deve usar nosso aplicativo.
                </p>
                <p>
                  O UpDuo é uma plataforma que conecta jogadores de Mobile Legends para formar duplas e encontrar companheiros de jogo compatíveis.
                </p>
              </div>
            </section>

            {/* Seção 2: Descrição do Serviço */}
            <section>
              <div className="flex items-center space-x-2 mb-3">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">2. Descrição do Serviço</h3>
              </div>
              <div className="text-gray-600 space-y-3 text-sm leading-relaxed">
                <p>
                  O UpDuo oferece os seguintes serviços:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Sistema de matching baseado em compatibilidade de jogo</li>
                  <li>Chat entre usuários que deram match</li>
                  <li>Sistema de filtros para encontrar jogadores específicos</li>
                  <li>Recursos premium com funcionalidades adicionais</li>
                  <li>Sistema de diamantes para interações especiais</li>
                </ul>
              </div>
            </section>

            {/* Seção 3: Conta do Usuário */}
            <section>
              <div className="flex items-center space-x-2 mb-3">
                <Eye className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800">3. Conta do Usuário</h3>
              </div>
              <div className="text-gray-600 space-y-3 text-sm leading-relaxed">
                <p>
                  Para usar o UpDuo, você deve:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Ter pelo menos 18 anos de idade</li>
                  <li>Fornecer informações precisas e atualizadas</li>
                  <li>Manter a segurança de sua conta e senha</li>
                  <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
                  <li>Ser responsável por todas as atividades em sua conta</li>
                </ul>
              </div>
            </section>

            {/* Seção 4: Conduta do Usuário */}
            <section>
              <div className="flex items-center space-x-2 mb-3">
                <Shield className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-800">4. Conduta do Usuário</h3>
              </div>
              <div className="text-gray-600 space-y-3 text-sm leading-relaxed">
                <p>
                  Você concorda em NÃO:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Usar linguagem ofensiva, discriminatória ou inadequada</li>
                  <li>Assediar, intimidar ou ameaçar outros usuários</li>
                  <li>Compartilhar conteúdo sexual, violento ou ilegal</li>
                  <li>Criar perfis falsos ou usar informações de terceiros</li>
                  <li>Tentar burlar sistemas de segurança ou filtros</li>
                  <li>Usar o aplicativo para fins comerciais não autorizados</li>
                  <li>Spam ou envio de mensagens em massa</li>
                </ul>
              </div>
            </section>

            {/* Seção 5: Privacidade */}
            <section>
              <div className="flex items-center space-x-2 mb-3">
                <Eye className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-800">5. Privacidade e Dados</h3>
              </div>
              <div className="text-gray-600 space-y-3 text-sm leading-relaxed">
                <p>
                  Respeitamos sua privacidade e protegemos seus dados pessoais:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Coletamos apenas informações necessárias para o funcionamento do app</li>
                  <li>Não vendemos ou compartilhamos seus dados com terceiros</li>
                  <li>Você pode solicitar a exclusão de seus dados a qualquer momento</li>
                  <li>Usamos criptografia para proteger informações sensíveis</li>
                  <li>Mensagens são privadas entre os usuários</li>
                </ul>
              </div>
            </section>

            {/* Seção 6: Pagamentos e Reembolsos */}
            <section>
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-800">6. Pagamentos e Reembolsos</h3>
              </div>
              <div className="text-gray-600 space-y-3 text-sm leading-relaxed">
                <p>
                  Sobre nossos serviços pagos:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Assinatura Premium: R$ 25,00/mês com renovação automática</li>
                  <li>Diamantes: Valores variáveis conforme pacote escolhido</li>
                  <li>Pagamentos processados via PIX de forma segura</li>
                  <li>Reembolsos analisados caso a caso em até 7 dias úteis</li>
                  <li>Cancelamento da assinatura pode ser feito a qualquer momento</li>
                </ul>
              </div>
            </section>

            {/* Seção 7: Propriedade Intelectual */}
            <section>
              <div className="flex items-center space-x-2 mb-3">
                <Shield className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-800">7. Propriedade Intelectual</h3>
              </div>
              <div className="text-gray-600 space-y-3 text-sm leading-relaxed">
                <p>
                  O UpDuo e todo seu conteúdo são protegidos por direitos autorais:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>O aplicativo, design e funcionalidades são de nossa propriedade</li>
                  <li>Você mantém os direitos sobre o conteúdo que compartilha</li>
                  <li>Ao usar o app, você nos concede licença para usar seu conteúdo</li>
                  <li>Não é permitido copiar, modificar ou distribuir nosso código</li>
                </ul>
              </div>
            </section>

            {/* Seção 8: Limitação de Responsabilidade */}
            <section>
              <div className="flex items-center space-x-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-800">8. Limitação de Responsabilidade</h3>
              </div>
              <div className="text-gray-600 space-y-3 text-sm leading-relaxed">
                <p>
                  O UpDuo é fornecido "como está" e:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Não garantimos que o serviço será ininterrupto ou livre de erros</li>
                  <li>Não somos responsáveis por interações entre usuários</li>
                  <li>Usuários são responsáveis por suas próprias ações e segurança</li>
                  <li>Recomendamos cautela ao encontrar pessoas pessoalmente</li>
                  <li>Nossa responsabilidade é limitada ao valor pago pelos serviços</li>
                </ul>
              </div>
            </section>

            {/* Seção 9: Modificações */}
            <section>
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-semibold text-gray-800">9. Modificações dos Termos</h3>
              </div>
              <div className="text-gray-600 space-y-3 text-sm leading-relaxed">
                <p>
                  Reservamos o direito de modificar estes termos a qualquer momento. 
                  Alterações significativas serão notificadas através do aplicativo ou por email. 
                  O uso continuado após as modificações constitui aceitação dos novos termos.
                </p>
              </div>
            </section>

            {/* Seção 10: Encerramento */}
            <section>
              <div className="flex items-center space-x-2 mb-3">
                <X className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-800">10. Encerramento</h3>
              </div>
              <div className="text-gray-600 space-y-3 text-sm leading-relaxed">
                <p>
                  Podemos suspender ou encerrar sua conta se:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Você violar estes termos de uso</li>
                  <li>Houver atividade suspeita ou fraudulenta</li>
                  <li>Por solicitação sua através do suporte</li>
                  <li>Por razões técnicas ou de segurança</li>
                </ul>
              </div>
            </section>

            {/* Contato */}
            <section className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Contato</h3>
              </div>
              <div className="text-gray-600 space-y-2 text-sm">
                <p>
                  Para dúvidas sobre estes termos ou suporte:
                </p>
                <div className="space-y-1">
                  <p><strong>WhatsApp:</strong> +55 (45) 98834-9638</p>
                  <p><strong>Instagram:</strong> @upduo.top</p>
                  <p><strong>Website:</strong> upduo.top</p>
                </div>
              </div>
            </section>

            {/* Disclaimer Mobile Legends */}
            <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-yellow-800 text-sm">
                  <p className="font-semibold mb-1">Aviso Importante:</p>
                  <p>
                    O UpDuo é um aplicativo independente e não é afiliado, endossado ou patrocinado pela Moonton, 
                    desenvolvedora do Mobile Legends: Bang Bang. Mobile Legends é uma marca registrada da Moonton.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                © 2025 UpDuo. Todos os direitos reservados.
              </div>
              <button
                onClick={onClose}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}