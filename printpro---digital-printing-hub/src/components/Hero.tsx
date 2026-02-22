import React from 'react';
import { motion } from 'motion/react';
import { Zap, ShieldCheck, Activity, RotateCw } from 'lucide-react';
import { Printer3D } from './Printer3D';

export const Hero = ({ onStart }: { onStart: () => void }) => {
  return (
    <section className="relative pt-40 pb-24 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-50 rounded-full blur-[120px] -z-10 opacity-60"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[150px] -z-10 opacity-40"></div>

      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="flex-1 space-y-10 z-10"
        >
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] text-brand-accent">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-4 h-4 fill-brand-accent" />
            </motion.div>
            POWERED BY PRINCITY ENGINE
          </div>
          
          <h1 className="text-7xl lg:text-[100px] font-black font-display leading-[0.85] tracking-tighter text-brand-primary">
            The Future <br />
            of <span className="text-gradient italic">Printing.</span>
          </h1>
          
          <p className="text-xl text-gray-500 leading-relaxed max-w-xl font-medium">
            Optimal solution for managing printers, their servicing, costs, and consumables, regardless of their location.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-10">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStart}
              className="btn-accent px-12 py-6 text-lg flex items-center gap-4 group"
            >
              Start Your Order 
              <motion.span 
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-2xl"
              >
                ›
              </motion.span>
            </motion.button>
            
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400"
            >
              <RotateCw className="w-4 h-4" />
              <span className="tracking-[0.2em]">ROTATE THE MODEL</span>
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
          className="flex-1 relative w-full"
        >
          <div className="relative z-0 w-full h-full">
            <Printer3D />
            
            {/* Status Badges - Floating with animation */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -left-4 glass-card p-5 rounded-3xl flex items-center gap-5 z-20"
            >
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center shadow-inner">
                <Activity className="w-6 h-6 text-brand-success" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">TONER LEVEL</p>
                <p className="text-base font-black text-brand-primary">98% Optimized</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-1/2 -right-8 glass-card p-5 rounded-3xl flex items-center gap-5 z-20"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shadow-inner">
                <div className="w-3 h-3 rounded-full bg-brand-accent animate-pulse"></div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">STATUS</p>
                <p className="text-base font-black text-brand-primary">Device Online</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 right-12 glass-card p-5 rounded-3xl flex items-center gap-5 z-20"
            >
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">SECURITY</p>
                <p className="text-base font-black text-brand-primary">Encrypted Path</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      {/* Stats Section with staggered animation */}
      <div className="max-w-7xl mx-auto px-6 mt-40 grid grid-cols-1 md:grid-cols-3 gap-16">
        {[
          { label: 'UPTIME', value: '24/7' },
          { label: 'ACCURACY', value: '100%' },
          { label: 'ORDERS', value: '5k+' }
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + (i * 0.1), duration: 0.8 }}
            className="space-y-3 group"
          >
            <h3 className="text-6xl font-black font-display text-brand-primary group-hover:text-brand-accent transition-colors duration-300">{stat.value}</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">{stat.label}</p>
            <div className="w-12 h-1 bg-gray-100 group-hover:w-full group-hover:bg-brand-accent transition-all duration-500"></div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

