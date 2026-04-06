import { MapPin, Mail, Phone, Instagram, Facebook, Linkedin, Youtube } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    plataforma: ['LMS/LXP', 'Microlearning', 'Gamificação', 'Relatórios', 'Woli Live', 'Author-AI'],
    conteudos: ['Catálogos', 'Ler e Agir', 'Fábrica Personalizada', 'Chatbot'],
    empresa: ['Sobre', 'Carreiras', 'Blog', 'Contato'],
  };

  return (
    <footer className="bg-woli-dark-light pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Logo & Contact */}
          <div className="lg:col-span-2">
            <span className="text-3xl font-bold text-woli-pink">woli</span>
            <p className="text-white/70 mt-4 mb-6 max-w-sm">
              Transformando a educação corporativa com tecnologia e inovação há mais de 23 anos.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white/70">
                <MapPin className="w-5 h-5 text-woli-pink" />
                <span>Araxá - MG, Brasil</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <Mail className="w-5 h-5 text-woli-pink" />
                <a href="mailto:contato@woli.com.br" className="hover:text-woli-pink transition-colors">
                  contato@woli.com.br
                </a>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <Phone className="w-5 h-5 text-woli-pink" />
                <span>WhatsApp</span>
              </div>
            </div>
          </div>

          {/* Plataforma */}
          <div>
            <h4 className="text-white font-semibold mb-4">Plataforma</h4>
            <ul className="space-y-2">
              {links.plataforma.map((link) => (
                <li key={link}>
                  <a href="#" className="text-white/70 hover:text-woli-pink transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Conteúdos */}
          <div>
            <h4 className="text-white font-semibold mb-4">Conteúdos</h4>
            <ul className="space-y-2">
              {links.conteudos.map((link) => (
                <li key={link}>
                  <a href="#" className="text-white/70 hover:text-woli-pink transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="text-white font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2">
              {links.empresa.map((link) => (
                <li key={link}>
                  <a href="#" className="text-white/70 hover:text-woli-pink transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/50 text-sm">
            © {currentYear} Woli. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-white/50 hover:text-woli-pink transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-white/50 hover:text-woli-pink transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-white/50 hover:text-woli-pink transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-white/50 hover:text-woli-pink transition-colors">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
          <a href="#" className="text-white/50 hover:text-woli-pink text-sm transition-colors">
            Política de Privacidade
          </a>
        </div>
      </div>
    </footer>
  );
}
