import React from 'react';
import { Printer, Mail, Phone, MapPin, Twitter, Facebook, Instagram } from 'lucide-react';
import { motion } from 'motion/react';

export const Header = ({ onOrderClick, onLogoClick }: { onOrderClick: () => void, onLogoClick: () => void }) => {
  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-7xl">
      <div className="glass-card rounded-[32px] px-8 h-20 flex items-center justify-between border border-white/20 shadow-2xl">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={onLogoClick}
        >
          <div className="bg-brand-primary p-2 rounded-2xl group-hover:rotate-12 transition-transform duration-500 shadow-lg">
            <Printer className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter font-display text-brand-primary">Print<span className="text-brand-accent">Pro</span></span>
        </motion.div>
        
        <nav className="flex items-center gap-10">
          <button 
            onClick={onLogoClick}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-brand-primary transition-colors"
          >
            Home
          </button>
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOrderClick}
            className="btn-accent px-8 py-3 text-xs"
          >
            Order Online
          </motion.button>
        </nav>
      </div>
    </header>
  );
};

export const Footer = () => {
  return (
    <footer className="bg-white pt-32 pb-16 border-t border-gray-100 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-20 mb-24">
          <div className="lg:col-span-2 space-y-10">
            <div className="flex items-center gap-3">
              <div className="bg-brand-primary p-2 rounded-2xl shadow-lg">
                <Printer className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-black tracking-tighter font-display text-brand-primary">Print<span className="text-brand-accent">Pro</span></span>
            </div>
            <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-md">
              Redefining the digital printing landscape with precision engineering and seamless high-fidelity user experiences.
            </p>
            <div className="flex gap-6">
              {[Twitter, Facebook, Instagram].map((Icon, i) => (
                <motion.a 
                  key={i} 
                  href="#" 
                  whileHover={{ y: -5, scale: 1.1 }}
                  className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center text-gray-400 hover:text-brand-primary hover:border-brand-primary transition-all shadow-sm"
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>
          
          <div className="space-y-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Navigation</h4>
            <ul className="space-y-6">
              {['Home', 'Order Online', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-500 hover:text-brand-primary font-bold text-sm transition-colors uppercase tracking-widest">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Get in Touch</h4>
            <div className="space-y-6">
              {[
                { Icon: Mail, text: 'support@printpro.tech', color: 'bg-blue-50 text-blue-600' },
                { Icon: Phone, text: '+91 75107 27874', color: 'bg-green-50 text-green-600' },
                { Icon: MapPin, text: '123 Printing Ave, Tech City', color: 'bg-orange-50 text-orange-600' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-5 group cursor-pointer">
                  <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                    <item.Icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-black text-brand-primary tracking-tight">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">© 2024 PRINTPRO DIGITAL SOLUTIONS • ALL RIGHTS RESERVED</p>
          <div className="flex gap-10">
            <a href="#" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] hover:text-brand-primary transition-colors">Privacy</a>
            <a href="#" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] hover:text-brand-primary transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
