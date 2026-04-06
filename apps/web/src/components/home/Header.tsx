import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    {
      label: 'Plataforma',
      submenu: ['LMS/LXP', 'Microlearning', 'Gamificação', 'Relatórios', 'Woli Live', 'Author-AI'],
    },
    {
      label: 'Conteúdos',
      submenu: ['Catálogos', 'Ler e Agir', 'Fábrica Personalizada', 'Chatbot'],
    },
    { label: 'Aprenda', submenu: ['Blog', 'T&DX'] },
    { label: 'Cases' },
    { label: 'Empresa', submenu: ['Sobre', 'Carreiras', 'Contato'] },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <span className="text-3xl font-bold text-woli-pink">woli</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {menuItems.map((item) => (
              <div key={item.label} className="relative group">
                <button className="text-woli-dark hover:text-woli-pink font-medium transition-colors py-2">
                  {item.label}
                </button>
                {item.submenu && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      {item.submenu.map((subitem) => (
                        <a
                          key={subitem}
                          href="#"
                          className="block px-4 py-2 text-sm text-woli-gray hover:text-woli-pink hover:bg-woli-gray-light transition-colors"
                        >
                          {subitem}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Button>Solicite demonstração</Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href="#"
                  className="text-woli-dark hover:text-woli-pink font-medium transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <Button className="mt-4">Solicite demonstração</Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
