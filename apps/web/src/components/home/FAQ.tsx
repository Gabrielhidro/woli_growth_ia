import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'O que é educação corporativa?',
    answer:
      'Educação corporativa é o conjunto de práticas de aprendizagem e desenvolvimento que uma empresa implementa para capacitar seus colaboradores, alinhando conhecimentos e habilidades aos objetivos estratégicos do negócio.',
  },
  {
    question: 'Quais são os principais benefícios para as empresas?',
    answer:
      'Os principais benefícios incluem: aumento da produtividade, redução de turnover, padronização de processos, desenvolvimento de competências críticas, maior engajamento dos colaboradores e vantagem competitiva no mercado.',
  },
  {
    question: 'Como funciona a implementação da plataforma?',
    answer:
      'A implementação é feita em etapas: diagnóstico inicial, personalização da plataforma, migração de conteúdos existentes, treinamento da equipe administrativa e lançamento gradual para os usuários, com acompanhamento contínuo.',
  },
  {
    question: 'Como medir o impacto dos treinamentos?',
    answer:
      'Nossa plataforma oferece dashboards completos com métricas de engajamento, conclusão, avaliações de conhecimento, feedback dos usuários e integrações com indicadores de negócio para medir ROI.',
  },
  {
    question: 'A Woli serve para empresas de qualquer tamanho?',
    answer:
      'Sim! Temos planos e configurações adequadas para empresas de todos os portes, desde startups até grandes corporações com milhares de colaboradores.',
  },
  {
    question: 'Posso integrar conteúdos próprios da minha empresa?',
    answer:
      'Absolutamente! Você pode fazer upload de seus próprios conteúdos em diversos formatos (vídeos, PDFs, SCORM, etc.) e também contratar nossa Fábrica de Conteúdo para criar materiais personalizados.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-woli-gray-light">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">Perguntas Frequentes</h2>
          <p className="section-subtitle">
            Tire suas dúvidas sobre a Woli
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-woli-dark">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-woli-pink transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-woli-gray">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
