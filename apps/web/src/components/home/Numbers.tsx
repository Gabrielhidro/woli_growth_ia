const stats = [
  { value: '23', label: 'Anos de experiência', suffix: '+' },
  { value: '5.000', label: 'Cursos desenvolvidos', suffix: '+' },
  { value: '6M', label: 'Profissionais treinados', suffix: '+' },
  { value: '700K', label: 'Usuários ativos', suffix: '+' },
];

export function Numbers() {
  return (
    <section className="py-16 bg-woli-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-woli-pink mb-2">
                {stat.value}
                <span className="text-3xl">{stat.suffix}</span>
              </div>
              <p className="text-white/80 text-sm md:text-base">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
