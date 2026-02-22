import React, { useState } from 'react';
import { Header, Footer } from './components/Layout';
import { Hero } from './components/Hero';
import { OrderFlow } from './components/OrderFlow';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [view, setView] = useState<'LANDING' | 'ORDER'>('LANDING');

  return (
    <div className="min-h-screen flex flex-col selection:bg-brand-accent selection:text-white">
      <Header onOrderClick={() => setView('ORDER')} onLogoClick={() => setView('LANDING')} />
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {view === 'LANDING' ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Hero onStart={() => setView('ORDER')} />
            </motion.div>
          ) : (
            <motion.div
              key="order"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <OrderFlow onBack={() => setView('LANDING')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
