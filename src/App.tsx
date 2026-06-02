/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Instagram, Facebook, Mail, Sparkles, Paintbrush, Palette, Layout, MessageSquare } from 'lucide-react';
import Home from './pages/Home';
import Configurator from './pages/Configurator';
import Consultation from './pages/Consultation';
import Disclaimer from './pages/Disclaimer';
import Impressum from './pages/Impressum';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Visualisierung', path: '#visualisierung-cta', icon: Sparkles, isScroll: true },
    { name: 'Stilberatung', path: '/beratung', icon: Paintbrush },
  ];

  const handleNavClick = (e: React.MouseEvent, path: string, isScroll?: boolean) => {
    if (isScroll) {
      e.preventDefault();
      if (location.pathname === '/') {
        const element = document.getElementById('visualisierung-cta');
        element?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = '/#visualisierung-cta';
      }
      setIsOpen(false);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-paper/90 backdrop-blur-md border-b border-ink/10">
      <div className="max-w-7xl mx-auto px-10 h-24 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-6 group" onClick={(e) => handleNavClick(e, '/')}>
          <img 
            src="https://malermeisterfrankfurt.de/wp-content/uploads/2025/03/Heidecker-Fraknfurt-Pfade-1-schwarz.svg" 
            alt="Heidecker Frankfurt" 
            className="h-14 w-auto" 
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={(e) => handleNavClick(e, link.path, (link as any).isScroll)}
              className={`nav-label text-[20px] transition-opacity hover:opacity-100 ${
                location.pathname === link.path ? 'opacity-100 border-b border-ink' : 'opacity-40'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Action Button */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/anfrage" className="bg-ink text-white px-6 py-2 nav-label text-[20px] font-bold tracking-[0.2em] hover:bg-accent transition-colors">
            Projekt Starten
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-ink" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-0 w-full bg-paper border-b border-ink/5 md:hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={(e) => handleNavClick(e, link.path, (link as any).isScroll)}
                  className="flex items-center gap-3 text-[20px] font-medium p-2"
                >
                  <link.icon size={20} />
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-white border-t border-ink/10 py-16 px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12">
        <div className="col-span-1 md:col-span-2">
          <img 
            src="https://malermeisterfrankfurt.de/wp-content/uploads/2025/03/Heidecker-Fraknfurt-Pfade-1-schwarz.svg" 
            alt="Heidecker Frankfurt" 
            className="h-12 w-auto mb-10" 
          />
          <p className="text-ink/50 max-w-sm leading-relaxed text-sm italic">
            Die durch diese Anwendung erzeugten Bilder dienen ausschließlich der visuellen Inspiration und ersten Ideenfindung für die anspruchsvolle Gestaltung Ihrer Räumlichkeiten oder Fassaden. Bitte beachten Sie hierzu unsere Seite <Link to="/haftungsausschluss" className="underline">Haftungsausschluss und Nutzungshinweise</Link>.
          </p>
          <div className="flex gap-6 mt-8 opacity-40">
            <Instagram size={20} className="cursor-pointer hover:text-accent transition-colors" />
            <Facebook size={20} className="cursor-pointer hover:text-accent transition-colors" />
            <Mail size={20} className="cursor-pointer hover:text-accent transition-colors" />
          </div>
        </div>
        <div>
          <h4 className="nav-label opacity-40 mb-6">Navigation</h4>
          <ul className="flex flex-col gap-4 text-ink/70 text-xs font-medium tracking-wide uppercase">
            <li><a href="/#visualisierung-cta" className="hover:text-accent transition-colors">Visualisierung</a></li>
            <li><Link to="/beratung" className="hover:text-accent transition-colors">Stilberatung</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="nav-label opacity-40 mb-6">Adressen</h4>
          <p className="text-ink/60 text-xs font-medium tracking-wide uppercase leading-loose">
            Heidecker Maler- & Lackierermeister<br />
            Offenbacher Landstraße 322C<br />
            60599 Frankfurt am Main<br />
            <br />
            Weitere Anschrift:<br />
            Sandgasse 8a<br />
            63457 Hanau<br />
          </p>
        </div>
        <div>
          <h4 className="nav-label opacity-40 mb-6">Rechtliches</h4>
          <ul className="flex flex-col gap-4 text-ink/70 text-xs font-medium tracking-wide uppercase mb-8">
            <li><Link to="/impressum" className="hover:text-accent transition-colors">Impressum</Link></li>
            <li><Link to="/datenschutz" className="hover:text-accent transition-colors">Datenschutzerklärung</Link></li>
          </ul>
          <h4 className="nav-label opacity-40 mb-6">Kontakt</h4>
          <ul className="flex flex-col gap-4 text-ink/70 text-xs font-medium tracking-wide uppercase">
            <li><a href="tel:+4961839298472" className="hover:text-accent transition-colors">0 61 83 9 29 84 72</a></li>
            <li><a href="mailto:info@heidecker.de" className="hover:text-accent transition-colors">info@heidecker.de</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-ink/5 flex justify-between items-center text-[9px] uppercase tracking-[0.2em] opacity-40 font-bold">
        <span>© 2025 Heidecker Frankfurt. All rights reserved.</span>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow pt-24">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/konfigurator" element={<Configurator />} />
            <Route path="/beratung" element={<Consultation />} />
            <Route path="/haftungsausschluss" element={<Disclaimer />} />
            <Route path="/impressum" element={<Impressum />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
