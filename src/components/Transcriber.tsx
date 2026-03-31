import React, { useState } from 'react';
import { transcribeToIPA, getPhoneticExplanation } from '../services/phonetics';
import { Loader2, Search, Globe, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { IPAKeyboard } from './IPAKeyboard';
import { DIALECTS } from '../constants';

interface TranscriberProps {
  dialect: string;
  setDialect: (dialect: string) => void;
  ignoreTonicity: boolean;
}

interface PhoneticExplanation {
  transcription: string;
  explanation: string;
  tonicSyllable: string;
  phoneticProcesses: string[];
}

export const Transcriber: React.FC<TranscriberProps> = ({ dialect, setDialect, ignoreTonicity }) => {
  const [word, setWord] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [explanation, setExplanation] = useState<PhoneticExplanation | null>(null);
  const [loading, setLoading] = useState(false);

  const stripMarks = (ipa: string) => {
    // Remove stress marks (ˈ, ˌ), syllable dots (., ·, -), parentheses, slashes and brackets
    let res = ipa.replace(/[()\/\[\]]/g, '');
    if (ignoreTonicity) {
      res = res.replace(/[ˈˌ.·-]/g, '');
    }
    return res;
  };

  const handleTranscribe = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!word.trim()) return;

    setLoading(true);
    setExplanation(null);
    try {
      const [ipa, expl] = await Promise.all([
        transcribeToIPA(word, dialect),
        getPhoneticExplanation(word, dialect)
      ]);
      setResults(ipa);
      setExplanation(expl);
    } catch (error: any) {
      if (error.isQuotaError) {
        toast.error("Cota de transcrição excedida. Tente novamente mais tarde.");
      } else {
        toast.error("Erro ao realizar a transcrição.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800">
        <h2 className="text-3xl font-serif italic mb-6 text-zinc-900 dark:text-zinc-100">Conversor Fonético</h2>
        
        <form onSubmit={handleTranscribe} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Digite uma palavra em português..."
                className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-lg text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div className="relative">
              <select
                value={dialect}
                onChange={(e) => setDialect(e.target.value)}
                className="w-full appearance-none px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all text-sm font-medium pr-10 text-zinc-900 dark:text-zinc-100"
              >
                {DIALECTS.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-600 pointer-events-none" />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-all flex items-center gap-3 font-medium shadow-lg hover:shadow-xl active:scale-95"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              <span>Transcrever</span>
            </button>
          </div>
        </form>

        {results.length > 0 && (
          <div className="mt-12 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-mono">Transcrição Fonética</h3>
              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500 dark:text-zinc-400 font-mono">
                {DIALECTS.find(d => d.id === dialect)?.name}
              </span>
            </div>
            <div className="flex items-center justify-center p-12 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 dark:from-zinc-200 to-transparent opacity-50" />
              <div className="relative space-y-2 text-center">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-700 font-mono">AFI / IPA</span>
                <p className="text-6xl font-serif tracking-tight">{stripMarks(results[0])}</p>
              </div>
            </div>

            {explanation && (
              <div className="mt-8 p-6 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-4">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold">
                  <BookOpen className="w-5 h-5" />
                  <h3>Explicação Fonética</h3>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{explanation.explanation}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-400 dark:text-zinc-600 font-mono text-[10px] uppercase">Sílaba Tônica</span>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{explanation.tonicSyllable}</p>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-400 dark:text-zinc-600 font-mono text-[10px] uppercase">Processos Fonéticos</span>
                    <ul className="list-disc list-inside text-zinc-900 dark:text-zinc-100">
                      {explanation.phoneticProcesses.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-mono text-center">Teclado AFI Auxiliar</h3>
        <IPAKeyboard onSymbolClick={(s) => setWord(prev => prev + s)} className="max-w-2xl mx-auto" />
      </div>
    </div>
  );
};
