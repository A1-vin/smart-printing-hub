import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, CheckCircle2, Loader2, Minus, Plus, CreditCard, ShieldCheck, Printer, Layers, FileCheck } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Step = 'SOURCE' | 'CONFIG' | 'FINALIZE' | 'PROCESSING' | 'SUCCESS';

export const OrderFlow = ({ onBack }: { onBack: () => void }) => {
  const [step, setStep] = useState<Step>('SOURCE');
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [config, setConfig] = useState({
    range: 'ALL',
    rangeText: '',
    size: 'A4',
    orientation: 'PORTRAIT',
    mode: 'B&W',
    volume: 1
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setIsAnalyzing(true);

      if (selectedFile.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(selectedFile));
        setPageCount(1);
        setConfig(prev => ({ ...prev, rangeText: '1' }));
        setTimeout(() => setIsAnalyzing(false), 2000);
      } else if (selectedFile.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const typedarray = new Uint8Array(event.target?.result as ArrayBuffer);
            const loadingTask = pdfjsLib.getDocument({ data: typedarray });
            const pdf = await loadingTask.promise;
            const actualPageCount = pdf.numPages || 1;
            setPageCount(actualPageCount);
            setConfig(prev => ({ ...prev, rangeText: `1-${actualPageCount}` }));
            const page = await pdf.getPage(1);
            
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
              canvasContext: context!,
              viewport: viewport
            } as any).promise;

            setPreviewUrl(canvas.toDataURL());
          } catch (error) {
            console.error('Error rendering PDF preview:', error);
            setPreviewUrl(null);
          } finally {
            setIsAnalyzing(false);
          }
        };
        reader.readAsArrayBuffer(selectedFile);
      } else {
        setPreviewUrl(null);
        setTimeout(() => setIsAnalyzing(false), 2000);
      }
    }
  };

  const parseRange = (text: string, maxPages: number) => {
    if (!text.trim()) return 0;
    const parts = text.split(',').map(p => p.trim());
    const usedPages = new Set<number>();

    parts.forEach(part => {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr);
        const end = parseInt(endStr);
        if (!isNaN(start) && !isNaN(end)) {
          const s = Math.max(1, Math.min(start, maxPages));
          const e = Math.max(1, Math.min(end, maxPages));
          const actualStart = Math.min(s, e);
          const actualEnd = Math.max(s, e);
          for (let i = actualStart; i <= actualEnd; i++) {
            usedPages.add(i);
          }
        }
      } else {
        const page = parseInt(part);
        if (!isNaN(page) && page >= 1 && page <= maxPages) {
          usedPages.add(page);
        }
      }
    });
    return usedPages.size;
  };

  const calculateTotal = () => {
    let base = config.mode === 'COLOR' ? 10 : 2;
    if (config.size === 'A3') base *= 2;
    
    const pagesToPrint = config.range === 'ALL' 
      ? pageCount 
      : parseRange(config.rangeText, pageCount);
      
    return base * pagesToPrint * config.volume;
  };
const handlePayment = async () => {
    if (!file) { alert("Please select a file first"); return; }
    
    const BACKEND_URL = "https://nonfraudulently-nonreigning-laquita.ngrok-free.dev;"

    try {
      // 1. Tell the Pi to create a Razorpay Order
      const orderResponse = await fetch(`${BACKEND_URL}/create_order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: calculateTotal() * 100 })
      });
      const order = await orderResponse.json();

      // 2. Open Razorpay using the Order ID from the Pi
      const options = {
        key: 'rzp_test_SIrqVQ9QYwGEkZ', // Replace with your real ID
        amount: order.amount,
        currency: "INR",
        name: "SmartPrint Pi",
        order_id: order.id, // This links the payment to your Pi
        handler: async function (response: any) {
          setStep('PROCESSING');
          
          const formData = new FormData();
          formData.append('file', file);
          formData.append('razorpay_order_id', response.razorpay_order_id);
          formData.append('razorpay_payment_id', response.razorpay_payment_id);
          formData.append('razorpay_signature', response.razorpay_signature);
          formData.append('color', config.mode);

          // 3. Send the successful payment and file to the Pi
          const printResult = await fetch(`${BACKEND_URL}/verify_and_print`, {
            method: 'POST',
            body: formData
          });

          if (printResult.ok) { setStep('SUCCESS'); } 
          else { alert("Payment ok, but Printer failed."); setStep('CONFIG'); }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err) {
      alert("Could not connect to the Pi. Check if Ngrok is running.");
    }
  };
      prefill: {
        name: "Customer",
        email: "customer@example.com",
        contact: "9999999999"
      },
      notes: {
        address: "PrintPro Hub"
      },
      theme: {
        color: "#0F172A"
      },
      modal: {
        ondismiss: function() {
          console.log("Checkout closed");
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-24 relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: step === 'SOURCE' ? '0%' : step === 'CONFIG' ? '50%' : '100%' }}
              className="h-full bg-brand-accent"
            />
          </div>
          {[
            { id: 'SOURCE', label: 'SOURCE', num: 1 },
            { id: 'CONFIG', label: 'CONFIG', num: 2 },
            { id: 'FINALIZE', label: 'FINALIZE', num: 3 }
          ].map((s, i) => {
            const isActive = step === s.id;
            const isPast = ['CONFIG', 'FINALIZE', 'PROCESSING', 'SUCCESS'].includes(step) && i < (step === 'CONFIG' ? 1 : step === 'FINALIZE' ? 2 : 3);
            
            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center gap-5">
                <motion.div 
                  initial={false}
                  animate={{ 
                    scale: isActive ? 1.2 : 1,
                    backgroundColor: isActive ? '#0F172A' : isPast ? '#10B981' : '#F1F5F9'
                  }}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all duration-500 shadow-lg ${
                    isActive ? 'text-white' : isPast ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {isPast ? <CheckCircle2 className="w-7 h-7" /> : s.num}
                </motion.div>
                <span className={`text-[10px] font-black tracking-[0.4em] uppercase transition-colors duration-300 ${isActive ? 'text-brand-primary' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {step === 'SOURCE' && (
            <motion.div 
              key="source"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="text-center space-y-16"
            >
              <div className="space-y-4">
                <h2 className="text-6xl font-black font-display text-brand-primary tracking-tighter">Upload Source</h2>
                <p className="text-gray-500 font-medium text-lg">Select your document for high-fidelity processing.</p>
              </div>

              <motion.div 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => fileInputRef.current?.click()}
                className="max-w-3xl mx-auto aspect-[21/9] border-2 border-dashed border-gray-200 rounded-[48px] flex flex-col items-center justify-center gap-8 cursor-pointer hover:border-brand-accent hover:bg-blue-50/20 transition-all group relative overflow-hidden glass-card"
              >
                <div className="w-24 h-24 rounded-[32px] bg-brand-primary flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl">
                  <Upload className="w-10 h-10" />
                </div>
                <div className="space-y-3">
                  <p className="text-3xl font-black text-brand-primary tracking-tight">Drop your file here</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">PDF, DOCX, PNG UP TO 50MB</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".pdf,.docx,.png,.jpg"
                />
              </motion.div>

              {file && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-md mx-auto p-8 glass-card rounded-[32px] flex items-center justify-between gap-6 border border-gray-100"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-accent border border-gray-50">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div className="text-left">
                      <p className="text-base font-black text-brand-primary truncate max-w-[200px]">{file.name}</p>
                      <p className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">
                        {isAnalyzing ? 'ANALYZING...' : `${pageCount} ${pageCount === 1 ? 'PAGE' : 'PAGES'} DETECTED`}
                      </p>
                    </div>
                  </div>
                  {isAnalyzing ? (
                    <Loader2 className="w-6 h-6 text-brand-accent animate-spin" />
                  ) : (
                    <button onClick={() => setFile(null)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all font-black text-xl">×</button>
                  )}
                </motion.div>
              )}

              <div className="pt-10 flex justify-end">
                <button 
                  disabled={!file || isAnalyzing}
                  onClick={() => setStep('CONFIG')}
                  className="btn-primary px-16 py-6 text-lg flex items-center gap-4 disabled:opacity-30 disabled:translate-y-0 disabled:shadow-none group"
                >
                  Continue 
                  <motion.span 
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-2xl"
                  >
                    ›
                  </motion.span>
                </button>
              </div>
            </motion.div>
          )}

          {step === 'CONFIG' && (
            <motion.div 
              key="config"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="space-y-16"
            >
              <div className="text-center space-y-4">
                <h2 className="text-6xl font-black font-display text-brand-primary tracking-tighter">Configuration</h2>
                <p className="text-gray-500 font-medium text-lg">Fine-tune your output parameters.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Preview */}
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[10px] font-black text-brand-accent uppercase tracking-[0.3em]">
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-accent animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        LIVE PREVIEW
                      </div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">PAGE 1 OF {pageCount}</p>
                    </div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      className={`glass-card rounded-[48px] overflow-hidden p-8 relative group transition-all duration-500 bg-white/40 border border-white/20 shadow-2xl ${config.orientation === 'PORTRAIT' ? 'aspect-[3/4.5]' : 'aspect-[4.5/3]'}`}
                    >
                      <motion.div 
                        animate={{ filter: config.mode === 'B&W' ? 'grayscale(1)' : 'grayscale(0)' }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-gray-100/50"
                      >
                        <div className="flex-grow w-full bg-gray-50/50 flex items-center justify-center overflow-hidden relative">
                          {previewUrl ? (
                            <motion.img 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              src={previewUrl} 
                              alt="Preview" 
                              className="w-full h-full object-contain p-4"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-6 text-center p-10 w-full h-full justify-center bg-white">
                              <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center shadow-inner border border-gray-100">
                                <FileText className="w-10 h-10 text-brand-primary/20" />
                              </div>
                              <div className="space-y-2">
                                <p className="text-sm font-black text-brand-primary truncate max-w-[200px] mx-auto">
                                  {file?.name || 'Document'}
                                </p>
                                <div className="flex items-center justify-center gap-2">
                                  <span className="px-2 py-0.5 rounded-md bg-brand-primary/5 text-[8px] font-black text-brand-primary uppercase tracking-widest">
                                    {file?.type.split('/')[1]?.toUpperCase() || 'FILE'}
                                  </span>
                                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                                    {isAnalyzing ? 'Processing...' : 'Ready for Print'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* File Card below preview as seen in video */}
                    {file && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 glass-card rounded-[32px] flex items-center justify-between gap-6 border border-white/40 bg-white/20"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-accent border border-gray-100">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-black text-brand-primary truncate max-w-[180px]">{file.name}</p>
                            <p className="text-[9px] font-bold text-brand-accent uppercase tracking-widest">
                              {pageCount} {pageCount === 1 ? 'PAGE' : 'PAGES'} DETECTED • READY FOR PROCESSING
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <button onClick={() => setStep('SOURCE')} className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] hover:text-brand-primary flex items-center gap-3 transition-colors group pt-4">
                      <span className="group-hover:-translate-x-1 transition-transform text-lg">‹</span> BACK
                    </button>
                  </div>

                {/* Controls */}
                <div className="space-y-10">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">RANGE SELECTION</p>
                      <div className="space-y-6">
                        <div className="flex gap-4">
                          <button 
                            onClick={() => setConfig({...config, range: 'ALL'})}
                            className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-[32px] border-2 transition-all duration-300 ${config.range === 'ALL' ? 'bg-brand-primary border-brand-primary text-white shadow-2xl' : 'bg-white border-gray-100 text-gray-400 hover:border-brand-accent/30'}`}
                          >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${config.range === 'ALL' ? 'bg-white/10' : 'bg-gray-50'}`}>
                              <Layers className="w-6 h-6" />
                            </div>
                            <span className="font-black text-[10px] uppercase tracking-widest">ALL</span>
                          </button>
                          <button 
                            onClick={() => setConfig({...config, range: 'RANGE'})}
                            className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-[32px] border-2 transition-all duration-300 ${config.range === 'RANGE' ? 'bg-brand-primary border-brand-primary text-white shadow-2xl' : 'bg-white border-gray-100 text-gray-400 hover:border-brand-accent/30'}`}
                          >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${config.range === 'RANGE' ? 'bg-white/10' : 'bg-gray-50'}`}>
                              <FileCheck className="w-6 h-6" />
                            </div>
                            <span className="font-black text-[10px] uppercase tracking-widest">RANGE</span>
                          </button>
                        </div>
                        
                        <AnimatePresence>
                          {config.range === 'RANGE' && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="relative"
                            >
                              <input 
                                type="text"
                                placeholder="e.g., 1-5, 8, 11-13"
                                value={config.rangeText}
                                onChange={(e) => setConfig({...config, rangeText: e.target.value})}
                                className="w-full bg-gray-100/50 border-2 border-transparent focus:border-brand-accent rounded-2xl p-5 font-bold text-lg transition-all outline-none placeholder:text-gray-300"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <div className="space-y-5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">SUBSTRATE SIZE</p>
                      <div className="flex gap-3 p-1.5 bg-gray-100/50 rounded-2xl">
                        {['A4', 'A3'].map(s => (
                          <button 
                            key={s}
                            onClick={() => setConfig({...config, size: s})}
                            className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${config.size === s ? 'bg-brand-primary text-white shadow-xl' : 'text-gray-400 hover:text-brand-primary'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">ORIENTATION</p>
                      <div className="flex gap-3 p-1.5 bg-gray-100/50 rounded-2xl">
                        {['PORTRAIT', 'LANDSCAPE'].map(o => (
                          <button 
                            key={o}
                            onClick={() => setConfig({...config, orientation: o})}
                            className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${config.orientation === o ? 'bg-brand-primary text-white shadow-xl' : 'text-gray-400 hover:text-brand-primary'}`}
                          >
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">CHROMA MODE</p>
                    <div className="flex gap-6">
                      <motion.button 
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setConfig({...config, mode: 'B&W'})}
                        className={`flex-1 p-8 rounded-[32px] border-2 transition-all flex flex-col items-center gap-5 ${config.mode === 'B&W' ? 'bg-black border-black text-white shadow-2xl ring-4 ring-black/10' : 'glass-card border-transparent text-brand-primary'}`}
                      >
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-900 shadow-lg ${config.mode === 'B&W' ? 'ring-4 ring-white/20' : ''}`}></div>
                        <span className="text-xs font-black uppercase tracking-widest">B&W</span>
                      </motion.button>
                      <motion.button 
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setConfig({...config, mode: 'COLOR'})}
                        className={`flex-1 p-8 rounded-[32px] border-2 transition-all flex flex-col items-center gap-5 ${config.mode === 'COLOR' ? 'bg-gradient-to-br from-blue-600 via-red-500 to-yellow-500 border-transparent text-white shadow-2xl ring-4 ring-red-500/10' : 'glass-card border-transparent text-brand-primary'}`}
                      >
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 via-red-400 to-yellow-400 shadow-lg ${config.mode === 'COLOR' ? 'ring-4 ring-white/20' : ''}`}></div>
                        <span className="text-xs font-black uppercase tracking-widest">COLOR</span>
                      </motion.button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 items-end">
                    <div className="space-y-5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">VOLUME</p>
                      <div className="flex items-center gap-5 bg-gray-100/50 p-2 rounded-[24px]">
                        <motion.button 
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setConfig({...config, volume: Math.max(1, config.volume - 1)})}
                          className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand-primary hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="w-5 h-5" />
                        </motion.button>
                        <span className="flex-1 text-center font-black text-2xl">{config.volume}</span>
                        <motion.button 
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setConfig({...config, volume: config.volume + 1})}
                          className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand-primary hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                    <div className="p-8 bg-brand-primary rounded-[32px] text-white space-y-2 shadow-2xl shadow-brand-primary/20">
                      <p className="text-[10px] font-black opacity-50 uppercase tracking-[0.2em]">ESTIMATED TOTAL</p>
                      <p className="text-4xl font-black font-display">₹{calculateTotal()} <span className="text-xs opacity-50">INR</span></p>
                    </div>
                  </div>

                  <div className="pt-10 flex justify-end">
                    <button 
                      onClick={() => setStep('FINALIZE')}
                      className="btn-primary px-16 py-6 text-lg flex items-center gap-4 group"
                    >
                      Review Order 
                      <motion.span 
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-2xl"
                      >
                        ›
                      </motion.span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'FINALIZE' && (
            <motion.div 
              key="finalize"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="space-y-16"
            >
              <div className="text-center space-y-4">
                <h2 className="text-6xl font-black font-display text-brand-primary tracking-tighter">Finalize & Pay</h2>
                <p className="text-gray-500 font-medium text-lg">Review your order details before processing.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-10">
                  <div className="space-y-5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">MANIFEST</p>
                    <div className="glass-card rounded-[48px] p-10 space-y-8 border border-gray-100 shadow-2xl">
                      {[
                        { label: 'DOCUMENT', value: file?.name },
                        { 
                          label: 'PAGES', 
                          value: config.range === 'ALL' 
                            ? `${pageCount} ${pageCount === 1 ? 'PAGE' : 'PAGES'}` 
                            : `${parseRange(config.rangeText, pageCount)} ${parseRange(config.rangeText, pageCount) === 1 ? 'PAGE' : 'PAGES'} (${config.rangeText})`
                        },
                        { label: 'COLOR', value: config.mode },
                        { label: 'SIZE', value: config.size },
                        { label: 'COPIES', value: config.volume }
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between items-center group">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-brand-accent transition-colors">{item.label}</span>
                          <span className="text-base font-black text-brand-primary truncate max-w-[200px]">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setStep('CONFIG')} className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] hover:text-brand-primary flex items-center gap-3 transition-colors group">
                    <span className="group-hover:-translate-x-1 transition-transform">‹</span> BACK TO CONFIG
                  </button>
                </div>

                <div className="space-y-10">
                  <div className="space-y-5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">PAYMENT METHOD</p>
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-white border-2 border-brand-primary rounded-[40px] p-8 flex items-center justify-between shadow-2xl ring-8 ring-brand-primary/5"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center shadow-inner">
                          <CreditCard className="w-8 h-8 text-brand-primary" />
                        </div>
                        <div>
                          <p className="text-base font-black text-brand-primary uppercase tracking-widest">RAZORPAY</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">UPI / CARDS / NETBANKING</p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center shadow-lg">
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                      </div>
                    </motion.div>
                  </div>

                  <div className="p-10 glass-card rounded-[48px] space-y-8 border border-gray-100 shadow-2xl">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">GRAND TOTAL</p>
                      <p className="text-5xl font-black font-display text-brand-primary">₹{calculateTotal()}</p>
                    </div>
                    <button 
                      onClick={handlePayment}
                      className="btn-primary w-full py-6 text-lg flex items-center justify-center gap-4"
                    >
                      Confirm & Pay 
                      <motion.span 
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-2xl"
                      >
                        ›
                      </motion.span>
                    </button>
                    <div className="flex items-center justify-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      <ShieldCheck className="w-5 h-5 text-brand-success" />
                      ENCRYPTED CHECKOUT
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'PROCESSING' && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-16 py-24"
            >
              <motion.div 
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-40 h-40 glass-card rounded-[48px] flex items-center justify-center mx-auto shadow-2xl border border-gray-100"
              >
                <Printer className="w-16 h-16 text-brand-accent" />
              </motion.div>
              <div className="space-y-4">
                <h2 className="text-7xl font-black font-display text-brand-primary tracking-tighter">Printing...</h2>
                <p className="text-gray-500 font-medium text-xl max-w-md mx-auto">Your document is being processed by our high-fidelity hub.</p>
              </div>
              <div className="max-w-md mx-auto h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-brand-accent to-blue-400"
                />
              </div>
            </motion.div>
          )}

          {step === 'SUCCESS' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-16 py-24"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                className="w-40 h-40 bg-brand-success rounded-[48px] flex items-center justify-center mx-auto shadow-2xl shadow-green-500/30"
              >
                <CheckCircle2 className="w-20 h-20 text-white" />
              </motion.div>
              <div className="space-y-6">
                <h2 className="text-8xl font-black font-display text-brand-primary leading-[0.85] tracking-tighter">
                  Your document <br /> 
                  <span className="text-brand-success italic">has printed.</span>
                </h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">TRANSACTION COMPLETE • HIGH-FIDELITY OUTPUT</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="btn-primary px-16 py-6 text-lg"
              >
                Return to Hub
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
