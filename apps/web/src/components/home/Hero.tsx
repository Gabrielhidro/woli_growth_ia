import { Button } from '../ui';
import { useChatStore } from '../../stores/chatStore';

export function Hero() {
  const { toggleChat } = useChatStore();

  return (
    <section className="pt-32 pb-20 bg-gradient-to-br from-white via-woli-pink-light/20 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-woli-dark leading-tight mb-6">
            A plataforma definitiva para{' '}
            <span className="text-woli-pink">transformar a educação corporativa</span>{' '}
            da sua empresa
          </h1>
          <p className="text-xl text-woli-gray mb-10 max-w-2xl mx-auto">
            Potencialize o desenvolvimento do seu time com nossa plataforma completa de
            LMS/LXP, gamificação, microlearning e inteligência artificial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">Solicite demonstração</Button>
            <Button variant="outline" size="lg">
              Saiba mais
            </Button>
          </div>
        </div>

        {/* Chat Interativo - Wolerzito */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-woli-gray-light hover:shadow-3xl transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                <span className="text-white text-xl">🤖</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-woli-dark mb-2">Wolerzito - Assistente Virtual</p>
                <p className="text-woli-gray">
                  Olá! 👋 Sou o Wolerzito, assistente virtual da Woli. Estou aqui para
                  entender os desafios da sua empresa com treinamentos e mostrar como podemos
                  ajudar. Que tal conversarmos?
                </p>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={toggleChat}
                className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                💬 Iniciar conversa com o Wolerzito
              </button>
              <p className="text-xs text-center text-gray-500 mt-3">
                ⚡ Chat inteligente • Qualificação em tempo real • Sem formulários chatos
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
