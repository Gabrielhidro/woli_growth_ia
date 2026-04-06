const clients = [
  'BemBrasil',
  'Itaú',
  'GIO',
  'Bosch',
  'Inter',
  'Marisa',
  'Rede Tauá',
  'Farid',
];

export function ClientLogos() {
  return (
    <section className="py-16 bg-woli-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-woli-gray mb-8 text-lg">
          Empresas que confiam na Woli
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center">
          {clients.map((client) => (
            <div
              key={client}
              className="bg-white rounded-lg p-4 h-16 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-woli-gray font-semibold text-sm">{client}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
