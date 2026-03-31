import React from 'react';
import { IPA_SYMBOLS } from '../constants';
import { cn } from '../lib/utils';

interface IPAKeyboardProps {
  onSymbolClick: (symbol: string) => void;
  className?: string;
}

export const IPAKeyboard: React.FC<IPAKeyboardProps> = ({ onSymbolClick, className }) => {
  const allSymbols = [
    ...IPA_SYMBOLS.vowels,
    ...IPA_SYMBOLS.nasals,
    ...IPA_SYMBOLS.semivowels,
    ...IPA_SYMBOLS.consonants,
    ...IPA_SYMBOLS.diacritics
  ];

  return (
    <div className={cn("bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm", className)}>
      <div className="flex flex-wrap gap-2 justify-center">
        {allSymbols.map((symbol) => (
          <button
            key={symbol}
            onClick={() => onSymbolClick(symbol)}
            className="w-10 h-10 flex items-center justify-center bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl border border-zinc-200 dark:border-zinc-700 transition-colors font-serif text-lg shadow-sm"
          >
            {symbol}
          </button>
        ))}
      </div>
    </div>
  );
};
