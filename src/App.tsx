import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { Transcriber } from './components/Transcriber';
import { Game } from './components/Game';
import { PhoneticTable } from './components/PhoneticTable';
import { cn } from './lib/utils';
import { Languages, Gamepad2, Info, Table, Globe } from 'lucide-react';
import { DIALECTS } from './constants';

type Tab = 'transcriber' | 'game' | 'about' | 'table';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('game');
  const [dialect, setDialect] = useState(DIALECTS[0].id);
  const [ignoreTonicity, setIgnoreTonicity] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={cn("min-h-screen bg-[#F8F8F7] text-zinc-900 selection:bg-zinc-900 selection:text-white", darkMode && "bg-zinc-950 text-zinc-100")}>
      <Toaster position="top-center" richColors />
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#F8F8F7]/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 dark:bg-zinc-100 rounded-xl flex items-center justify-center text-white dark:text-zinc-900">
              <Languages className="w-6 h-6" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-serif italic tracking-tight dark:text-zinc-100">alofone</h1>
              <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">Estudo de Dialetos</p>
            </div>
          </div>

          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => setActiveTab('game')}
              className={cn(
                "px-4 md:px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                activeTab === 'game' ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              )}
            >
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden md:inline">Jogar</span>
            </button>
            <button
              onClick={() => setActiveTab('transcriber')}
              className={cn(
                "px-4 md:px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                activeTab === 'transcriber' ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              )}
            >
              <Languages className="w-4 h-4" />
              <span className="hidden md:inline">Conversor</span>
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={cn(
                "px-4 md:px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                activeTab === 'table' ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              )}
            >
              <Table className="w-4 h-4" />
              <span className="hidden md:inline">Tabela</span>
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={cn(
                "px-4 md:px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                activeTab === 'about' ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              )}
            >
              <Info className="w-4 h-4" />
              <span className="hidden md:inline">Sobre</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                title={darkMode ? "Modo Claro" : "Modo Noturno"}
              >
                {darkMode ? "☀️" : "🌙"}
              </button>
              <button
                onClick={() => setIgnoreTonicity(!ignoreTonicity)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all border",
                  ignoreTonicity 
                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800" 
                    : "bg-zinc-50 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                )}
                title={ignoreTonicity ? "Sílaba/Tonicidade Ocultas" : "Sílaba/Tonicidade Visíveis"}
              >
                {ignoreTonicity ? "Modo Simples" : "Modo Completo"}
              </button>
            </div>
            <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              <Globe className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              <select
                value={dialect}
                onChange={(e) => setDialect(e.target.value)}
                className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer dark:text-zinc-300"
              >
                {DIALECTS.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {activeTab === 'transcriber' && (
          <Transcriber 
            dialect={dialect} 
            setDialect={setDialect} 
            ignoreTonicity={ignoreTonicity}
          />
        )}
        {activeTab === 'game' && (
          <Game 
            dialect={dialect} 
            ignoreTonicity={ignoreTonicity} 
            setIgnoreTonicity={setIgnoreTonicity}
          />
        )}
        {activeTab === 'table' && <PhoneticTable />}
        {activeTab === 'about' && (
          <div className="max-w-3xl mx-auto space-y-12 py-12">
            <div className="space-y-6">
              <h2 className="text-5xl font-serif italic dark:text-zinc-100">Sobre o Projeto</h2>
              <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Este programa foi desenvolvido para auxiliar estudantes e entusiastas da linguística no aprendizado da transcrição fonética da língua portuguesa utilizando o Alfabeto Fonético Internacional (AFI).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-mono">Funcionalidades</h3>
                <ul className="space-y-3 text-zinc-700 dark:text-zinc-300">
                  <li className="flex gap-3">
                    <span className="text-zinc-300 dark:text-zinc-600">•</span>
                    <span>Transcrição automática via IA (Gemini)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-zinc-300 dark:text-zinc-600">•</span>
                    <span>Suporte a variações regionais (R forte, S chiado, etc)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-zinc-300 dark:text-zinc-600">•</span>
                    <span>Modo de jogo gamificado com 4 níveis de dificuldade</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-zinc-300 dark:text-zinc-600">•</span>
                    <span>Teclado AFI integrado para facilitar a entrada</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-mono">O Alfabeto Fonético</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                  O AFI é um sistema de notação fonética baseado no alfabeto latino, criado pela Associação Fonética Internacional como uma forma padronizada de representar os sons da linguagem falada. No português, ele é essencial para distinguir variações como o "o" aberto [ɔ] e fechado [o], ou o "r" vibrante [r] e o gutural [ʁ].
                </p>
              </div>
            </div>

            <div className="p-8 bg-zinc-900 dark:bg-zinc-800 rounded-3xl text-white flex items-center justify-between">
              <div>
                <h4 className="text-lg font-serif italic mb-1">Pronto para começar?</h4>
                <p className="text-zinc-400 text-sm">Teste seus conhecimentos agora mesmo.</p>
              </div>
              <button
                onClick={() => setActiveTab('game')}
                className="px-8 py-3 bg-white dark:bg-zinc-100 text-zinc-900 rounded-xl font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-200 transition-colors"
              >
                Ir para o Jogo
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-400 text-sm font-mono">© 2026 Fonética PT-BR • Educacional</p>
          <div className="flex gap-8">
            <a href="#" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-sm transition-colors">Documentação</a>
            <a href="#" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-sm transition-colors">Termos</a>
            <a href="#" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-sm transition-colors">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
