import { Button } from '../ui';

export function CTA() {
  return (
    <section className="py-20 bg-woli-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
          Pronto para transformar a educação corporativa da sua empresa?
        </h2>
        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Agende uma demonstração gratuita e descubra como a Woli pode impulsionar
          o desenvolvimento do seu time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-woli-pink hover:bg-woli-gray-light">
            Solicite demonstração
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white hover:text-woli-dark"
          >
            Fale pelo WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
}
