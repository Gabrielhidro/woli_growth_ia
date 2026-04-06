import { Users, Briefcase, Building2, Rocket } from 'lucide-react';
import { Card } from '../ui';

const audiences = [
  {
    icon: Users,
    title: 'RH e Times de Treinamento',
    description:
      'Para equipes de RH que precisam escalar treinamentos, medir resultados e engajar colaboradores de forma eficiente.',
  },
  {
    icon: Briefcase,
    title: 'Gestores e Líderes',
    description:
      'Líderes que querem desenvolver suas equipes com conteúdos relevantes e acompanhar a evolução em tempo real.',
  },
  {
    icon: Building2,
    title: 'Operações Distribuídas',
    description:
      'Empresas com operações em múltiplas localidades que precisam padronizar conhecimento e garantir compliance.',
  },
  {
    icon: Rocket,
    title: 'Transformação Digital',
    description:
      'Organizações em jornada de transformação digital que buscam uma plataforma moderna e integrada.',
  },
];

export function ForWho() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">Para Quem É</h2>
          <p className="section-subtitle">
            A Woli foi desenvolvida para empresas que levam o desenvolvimento de pessoas
            a sério
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {audiences.map((audience) => (
            <Card key={audience.title} className="text-center">
              <div className="w-16 h-16 rounded-full bg-woli-pink-light mx-auto mb-4 flex items-center justify-center">
                <audience.icon className="w-8 h-8 text-woli-pink" />
              </div>
              <h3 className="text-xl font-semibold text-woli-dark mb-3">
                {audience.title}
              </h3>
              <p className="text-woli-gray">{audience.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
