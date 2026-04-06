const steps = [
  {
    number: '01',
    title: 'Entendimento',
    description:
      'Mapeamos suas necessidades, desafios e objetivos para criar uma solução sob medida.',
  },
  {
    number: '02',
    title: 'Personalização',
    description:
      'Configuramos a plataforma com sua identidade visual e estrutura de trilhas de aprendizagem.',
  },
  {
    number: '03',
    title: 'Implementação',
    description:
      'Treinamos sua equipe e acompanhamos o lançamento para garantir uma adoção suave.',
  },
  {
    number: '04',
    title: 'Resultados',
    description:
      'Acompanhe métricas em tempo real e veja o impacto no desenvolvimento do seu time.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-woli-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">Como Funciona</h2>
          <p className="section-subtitle">
            Em 4 passos simples, transformamos a educação corporativa da sua empresa
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-woli-pink-light" />
              )}

              <div className="relative bg-white rounded-2xl p-6 shadow-lg">
                <div className="w-16 h-16 rounded-full bg-woli-pink text-white flex items-center justify-center text-2xl font-bold mb-4 mx-auto relative z-10">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-woli-dark mb-3 text-center">
                  {step.title}
                </h3>
                <p className="text-woli-gray text-center">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
