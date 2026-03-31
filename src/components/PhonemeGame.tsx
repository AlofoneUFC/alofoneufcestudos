import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CONSONANTS_GRID } from '../constants';
import { cn } from '../lib/utils';
import { Trophy, RefreshCw } from 'lucide-react';

type GameMode = 'type-to-phoneme' | 'phoneme-to-type';

export const PhonemeGame: React.FC = () => {
  const [mode, setMode] = useState<GameMode | null>(null);
  const [question, setQuestion] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const playSound = (type: 'success' | 'error') => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = type === 'success' ? 880 : 220;
    gain.gain.value = 0.1;
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const generateQuestion = (currentMode: GameMode) => {
    const allConsonants = CONSONANTS_GRID.data;
    const randomConsonant = allConsonants[Math.floor(Math.random() * allConsonants.length)];
    
    if (currentMode === 'type-to-phoneme') {
      setQuestion({
        description: `${randomConsonant.manner} ${randomConsonant.place.toLowerCase()} ${randomConsonant.voiced ? 'vozeada' : 'surda'}`,
        answer: randomConsonant.symbol
      });
      // Generate 3 wrong options + 1 correct
      const wrong = allConsonants
        .filter(c => c.symbol !== randomConsonant.symbol)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(c => c.symbol);
      setOptions([randomConsonant.symbol, ...wrong].sort(() => 0.5 - Math.random()));
    } else {
      setQuestion({
        symbol: randomConsonant.symbol,
        answer: `${randomConsonant.manner} ${randomConsonant.place.toLowerCase()} ${randomConsonant.voiced ? 'vozeada' : 'surda'}`
      });
      // Generate 3 wrong options + 1 correct
      const wrong = allConsonants
        .filter(c => c.symbol !== randomConsonant.symbol)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(c => `${c.manner} ${c.place.toLowerCase()} ${c.voiced ? 'vozeada' : 'surda'}`);
      setOptions([`${randomConsonant.manner} ${randomConsonant.place.toLowerCase()} ${randomConsonant.voiced ? 'vozeada' : 'surda'}`, ...wrong].sort(() => 0.5 - Math.random()));
    }
    setFeedback(null);
  };

  const handleAnswer = (answer: string) => {
    if (answer === (mode === 'type-to-phoneme' ? question.answer : question.answer)) {
      playSound('success');
      setFeedback({ text: 'Correto! 🎉', type: 'success' });
      setTimeout(() => generateQuestion(mode!), 1500);
    } else {
      playSound('error');
      setFeedback({ text: 'Tente novamente! ❌', type: 'error' });
    }
  };

  if (!mode) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
        <h2 className="text-4xl font-serif italic text-zinc-900 dark:text-zinc-100">Identificação de Fonemas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button onClick={() => { setMode('type-to-phoneme'); generateQuestion('type-to-phoneme'); }} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl hover:border-zinc-900 dark:hover:border-zinc-600 transition-all text-left">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Tipo → Fonema</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Identifique o símbolo AFI pela descrição articulatória.</p>
          </button>
          <button onClick={() => { setMode('phoneme-to-type'); generateQuestion('phoneme-to-type'); }} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl hover:border-zinc-900 dark:hover:border-zinc-600 transition-all text-left">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Fonema → Tipo</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Identifique a descrição articulatória pelo símbolo AFI.</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
      <button onClick={() => setMode(null)} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-sm font-mono uppercase tracking-widest">Voltar</button>
      <div className="p-12 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-3xl shadow-2xl">
        <p className="text-zinc-400 dark:text-zinc-600 font-mono text-xs uppercase tracking-widest mb-4">
          {mode === 'type-to-phoneme' ? 'Descrição' : 'Fonema'}
        </p>
        <p className="text-5xl font-serif">
          {mode === 'type-to-phoneme' ? question.description : `/${question.symbol}/`}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((opt, i) => (
          <button key={i} onClick={() => handleAnswer(opt)} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-zinc-900 dark:hover:border-zinc-600 transition-all font-serif text-lg text-zinc-900 dark:text-zinc-100">
            {mode === 'type-to-phoneme' ? `/${opt}/` : opt}
          </button>
        ))}
      </div>
      <AnimatePresence>
        {feedback && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn("text-lg font-semibold", feedback.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}
          >
            {feedback.text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};
