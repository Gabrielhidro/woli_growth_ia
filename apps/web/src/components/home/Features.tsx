import {
  BookOpen,
  Zap,
  Trophy,
  BarChart3,
  Bot,
  Palette,
  Video,
  Sparkles,
  MonitorPlay,
} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'LMS/LXP',
    description:
      'Plataforma completa de gestão e experiência de aprendizagem em um só lugar.',
  },
  {
    icon: Zap,
    title: 'Microlearning',
    description:
      'Conteúdos em formato curto e objetivo para aprendizado rápido e eficiente.',
  },
  {
    icon: Trophy,
    title: 'Gamificação',
    description:
      'Engaje seus colaboradores com pontos, rankings, conquistas e recompensas.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description:
      'Dashboards e relatórios completos para medir o impacto dos treinamentos.',
  },
  {
    icon: Bot,
    title: 'Chatbot IA',
    description:
      'Assistente virtual inteligente para tirar dúvidas e recomendar conteúdos.',
  },
  {
    icon: Palette,
    title: 'Fábrica de Conteúdo',
    description:
      'Crie conteúdos personalizados com nossa equipe de especialistas.',
  },
  {
    icon: Video,
    title: 'Woli Live',
    description:
      'Aulas ao vivo, webinars e treinamentos síncronos integrados à plataforma.',
  },
  {
    icon: Sparkles,
    title: 'Author-AI',
    description:
      'Crie conteúdos automaticamente com inteligência artificial generativa.',
  },
  {
    icon: MonitorPlay,
    title: 'Woliflix',
    description:
      'Catálogo de conteúdos premium estilo streaming para seu time.',
  },
];

export function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">Funcionalidades</h2>
          <p className="section-subtitle">
            Tudo que você precisa para uma educação corporativa de excelência
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl border border-woli-gray-light hover:border-woli-pink hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-woli-pink-light group-hover:bg-woli-pink flex items-center justify-center transition-colors">
                  <feature.icon className="w-6 h-6 text-woli-pink group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-woli-dark mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-woli-gray text-sm">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
