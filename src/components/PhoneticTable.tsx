import React from 'react';
import { CONSONANTS_GRID, VOWELS_DATA } from '../constants';
import { Info } from 'lucide-react';
import { cn } from '../lib/utils';

export const PhoneticTable: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-16 py-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-serif italic text-zinc-900 dark:text-zinc-100">O Alfabeto Fonético Internacional</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Passe o mouse sobre os símbolos para ver suas características articulatórias e exemplos.</p>
      </div>

      {/* Consonants Table */}
      <div className="space-y-6">
        <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-bold">Consoantes (Pulmônicas)</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800">
                <th className="border border-zinc-200 dark:border-zinc-700 p-3 text-xs font-mono text-zinc-500 dark:text-zinc-400">Modo / Ponto</th>
                {CONSONANTS_GRID.places.map(place => (
                  <th key={place} className="border border-zinc-200 dark:border-zinc-700 p-3 text-[10px] uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                    {place}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CONSONANTS_GRID.manners.map(manner => (
                <tr key={manner}>
                  <td className="border border-zinc-200 dark:border-zinc-700 p-3 text-[10px] uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800">
                    {manner}
                  </td>
                  {CONSONANTS_GRID.places.map(place => {
                    const phonemes = CONSONANTS_GRID.data.filter(d => d.place === place && d.manner === manner);
                    return (
                      <td key={`${manner}-${place}`} className="border border-zinc-200 dark:border-zinc-700 p-1 min-w-[80px]">
                        <div className="flex justify-center gap-2">
                          {phonemes.map(p => (
                            <div
                              key={p.symbol}
                              className={cn(
                                "relative w-10 h-10 flex items-center justify-center rounded-lg transition-all group/item bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100"
                              )}
                            >
                              <span className={cn("text-xl font-serif", p.voiced ? "font-bold" : "font-normal")}>
                                {p.symbol}
                              </span>
                              <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] px-3 py-2 rounded-lg opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity shadow-xl z-50 min-w-[120px] text-center">
                                <p className="font-bold mb-1">{p.name}</p>
                                <p className="text-zinc-400 dark:text-zinc-600 italic">Ex: {p.example}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 italic">
          * Símbolos em negrito são vozeados. Símbolos à direita em pares são vozeados.
        </p>
      </div>

      {/* Vowels Grid */}
      <div className="space-y-6">
        <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-bold">Vogais</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative h-[400px]">
            {/* Simple Trapezoid Visualization */}
            <div className="absolute inset-12 border-l-2 border-b-2 border-zinc-100 dark:border-zinc-700 italic text-[10px] text-zinc-300 dark:text-zinc-600">
              <span className="absolute -left-8 top-0">Fechada</span>
              <span className="absolute -left-8 bottom-0">Aberta</span>
              <span className="absolute left-0 -bottom-6">Anterior</span>
              <span className="absolute right-0 -bottom-6">Posterior</span>
            </div>
            
            {VOWELS_DATA.map(v => {
              // Simple positioning logic for the trapezoid
              const top = v.height === "Fechada" ? "10%" : v.height === "Semifechada" ? "35%" : v.height === "Semiaberta" ? "60%" : "85%";
              const left = v.backness === "Anterior" ? "10%" : v.backness === "Central" ? "50%" : "90%";
              
              return (
                <div
                  key={v.symbol}
                  style={{ top, left }}
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 flex flex-col items-center justify-center rounded-full transition-all group bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100"
                  )}
                >
                  <span className="text-2xl font-serif">{v.symbol}</span>
                  <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50 min-w-[120px] text-center">
                    <p className="font-bold mb-1">{v.name}</p>
                    <p className="text-zinc-400 dark:text-zinc-600 italic">Ex: {v.example}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <div className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-700">
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                <Info className="w-4 h-4" />
                Legenda
              </h4>
              <ul className="space-y-3 text-[11px] text-zinc-600 dark:text-zinc-400">
                <li><strong>Oclusiva:</strong> Bloqueio total do ar.</li>
                <li><strong>Fricativa:</strong> Estreitamento com fricção.</li>
                <li><strong>Nasal:</strong> Ar sai pela cavidade nasal.</li>
                <li><strong>Vozeada:</strong> Com vibração das pregas vocais.</li>
                <li><strong>Não vozeada:</strong> Sem vibração.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
