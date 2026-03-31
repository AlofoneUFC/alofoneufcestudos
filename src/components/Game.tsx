import React, { useState, useEffect, useRef } from 'react';
import { WORD_DATABASE, WordData, DIALECTS } from '../constants';
import { IPAKeyboard } from './IPAKeyboard';
import { PhonemeGame } from './PhonemeGame';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { Trophy, Timer, History, Play, RotateCcw, CheckCircle2, XCircle, Info, Loader2, Flame, BrainCircuit } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { transcribeToIPA, fetchRandomWord, analyzeMistake } from '../services/phonetics';

type GameMode = 'train' | 'challenge' | 'phoneme';

interface GameProps {
  dialect: string;
  ignoreTonicity: boolean;
  setIgnoreTonicity: (val: boolean) => void;
}

export const Game: React.FC<GameProps> = ({ dialect, ignoreTonicity, setIgnoreTonicity }) => {
  const [mode, setMode] = useState<GameMode | null>(null);
  const [includeExplanation, setIncludeExplanation] = useState(true);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [currentWord, setCurrentWord] = useState<WordData | null>(null);
  const [nextWordPayload, setNextWordPayload] = useState<WordData | null>(null);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [dialectIPA, setDialectIPA] = useState<string | null>(null);
  const [fetchingIPA, setFetchingIPA] = useState(false);
  const [isPreFetching, setIsPreFetching] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [history, setHistory] = useState<{ word: string; correct: boolean; input: string; expected: string[] }[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [detailedError, setDetailedError] = useState<{summary: string, errorAnalysis: string, phonemeTips: string[]} | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const preFetchNextWord = async (diff: number, excluded: string[], currentDialect: string) => {
    if (isPreFetching) return;
    setIsPreFetching(true);
    try {
      const word = await fetchRandomWord(diff, excluded, currentDialect);
      setNextWordPayload(word);
    } catch (e) {
      console.error("Failed to pre-fetch next word", e);
    } finally {
      setIsPreFetching(false);
    }
  };

  const playSound = (type: 'success' | 'error') => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = type === 'success' ? 880 : 220;
    gain.gain.value = 0.1;
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };

  const startNewRound = async () => {
    setUserInput('');
    setShowAnswer(false);
    setShowHints(false);
    setFeedback({ type: null, message: '' });
    setDialectIPA(null);

    if (nextWordPayload) {
      setCurrentWord(nextWordPayload);
      setDialectIPA(nextWordPayload.transcriptions[0]);
      const newUsed = [...usedWords, nextWordPayload.word];
      setUsedWords(newUsed);
      setNextWordPayload(null);
      
      // Trigger next prefetch in background
      preFetchNextWord(difficulty, newUsed, dialect);
    } else {
      setFetchingIPA(true);
      try {
        const randomWord = await fetchRandomWord(difficulty, usedWords, dialect);
        setCurrentWord(randomWord);
        setDialectIPA(randomWord.transcriptions[0]);
        const newUsed = [...usedWords, randomWord.word];
        setUsedWords(newUsed);
        
        // Trigger next prefetch in background
        preFetchNextWord(difficulty, newUsed, dialect);
      } catch (error) {
        console.error("Failed to fetch random word", error);
        toast.error("Erro ao buscar nova palavra. Tente novamente.");
      } finally {
        setFetchingIPA(false);
      }
    }
  };

  const handleDifficultyChange = (level: 1 | 2 | 3 | 4 | 5) => {
    setDifficulty(level);
    setNextWordPayload(null);
  };

  const startGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setScore(0);
    setTimeLeft(60);
    setHistory([]);
    setGameActive(true);
    setUsedWords([]);
    setNextWordPayload(null);
    
    // We need to fetch the first word directly since prefetch is null
    setFetchingIPA(true);
    fetchRandomWord(difficulty, [], dialect).then(randomWord => {
      setCurrentWord(randomWord);
      setDialectIPA(randomWord.transcriptions[0]);
      setUsedWords([randomWord.word]);
      setFetchingIPA(false);
      preFetchNextWord(difficulty, [randomWord.word], dialect);
    }).catch(error => {
      console.error("Failed to fetch random word", error);
      toast.error("Erro ao buscar nova palavra. Tente novamente.");
      setFetchingIPA(false);
    });

    if (selectedMode === 'challenge') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const endGame = () => {
    setGameActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const normalize = (s: string) => {
    let res = s.trim().replace(/[()\/\[\]]/g, '');
    if (ignoreTonicity) {
      // Remove stress marks (ˈ, ˌ) and syllable dots/marks (., ·, -)
      res = res.replace(/[ˈˌ.·-]/g, '');
    }
    return res;
  };

  const checkAnswer = () => {
    if (!currentWord) return;

    const allExpected = [...currentWord.transcriptions];
    if (dialectIPA && !allExpected.includes(dialectIPA)) {
      allExpected.push(dialectIPA);
    }

    const normalizedInput = normalize(userInput);

    const isCorrect = allExpected.some(t => 
      normalize(t) === normalizedInput || t === userInput
    );

    setHistory(prev => [{
      word: currentWord.word,
      correct: isCorrect,
      input: userInput,
      expected: allExpected
    }, ...prev].slice(0, 10));

    setShowAnswer(true);

    if (isCorrect) {
      playSound('success');
      setStreak(prev => prev + 1);
      setScore(prev => prev + (difficulty * 10));
      
      let successMessage = 'Excelente! Transcrição correta.';
      if (includeExplanation) {
        setFeedback({ type: 'success', message: 'Analisando fonética...' });
        setIsAnalyzing(true);
        const expected = dialectIPA || currentWord.transcriptions[0];
        const dialectDesc = DIALECTS.find(d => d.id === dialect)?.name || 'Português Padrão';
        analyzeMistake(currentWord.word, expected, expected, dialectDesc, ignoreTonicity).then(analysis => {
          setDetailedError(analysis);
          setFeedback({ type: 'success', message: 'Excelente! Veja a análise fonética.' });
        }).finally(() => setIsAnalyzing(false));
      } else {
        setFeedback({ type: 'success', message: successMessage });
        setTimeout(() => {
          if (gameActive) startNewRound();
        }, 1500);
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      playSound('error');
      setStreak(0);
      
      const expected = dialectIPA || currentWord.transcriptions[0];
      const dialectDesc = DIALECTS.find(d => d.id === dialect)?.name || 'Português Padrão';
      
      if (includeExplanation) {
        setFeedback({ type: 'error', message: `Analisando seu erro...` });
        setIsAnalyzing(true);
        analyzeMistake(currentWord.word, expected, userInput, dialectDesc, ignoreTonicity).then(analysis => {
          setDetailedError(analysis);
          setFeedback({ type: 'error', message: `Quase lá! A transcrição esperada era: ${allExpected.map(t => normalize(t)).join(' ou ')}` });
        }).finally(() => {
          setIsAnalyzing(false);
        });
      } else {
        setFeedback({ type: 'error', message: `Incorreto. O esperado era: ${allExpected.map(t => normalize(t)).join(' ou ')}` });
        // Even without explanation, we show the correct answer for a moment then move on or let user see it
        setTimeout(() => {
          if (gameActive) startNewRound();
        }, 3000);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!mode) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-12 py-12">
        <div className="space-y-4">
          <h2 className="text-5xl font-serif italic text-zinc-900 dark:text-zinc-100">alofone</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">estudo da fonologia e fonética</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => startGame('train')}
            className="group p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl hover:border-zinc-900 dark:hover:border-zinc-600 transition-all text-left space-y-4"
          >
            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900 transition-colors">
              <Play className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Modo Treino</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">Pratique sem pressão. Veja as transcrições e aprenda no seu ritmo.</p>
            </div>
          </button>

          <button
            onClick={() => startGame('challenge')}
            className="group p-8 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-3xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all text-left space-y-4"
          >
            <div className="w-12 h-12 bg-zinc-800 dark:bg-zinc-200 rounded-2xl flex items-center justify-center group-hover:bg-white dark:group-hover:bg-zinc-900 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Modo Desafio</h3>
              <p className="text-zinc-400 dark:text-zinc-600 text-sm">Teste seus conhecimentos contra o relógio e suba no ranking.</p>
            </div>
          </button>

          <button
            onClick={() => setMode('phoneme')}
            className="group p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl hover:border-zinc-900 dark:hover:border-zinc-600 transition-all text-left space-y-4"
          >
            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900 transition-colors">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Identificação de Fonemas</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">Aprenda a classificar os sons do AFI por modo e ponto de articulação.</p>
            </div>
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-mono">Configurações</h3>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => setIgnoreTonicity(!ignoreTonicity)}
              className={cn(
                "px-6 py-2 rounded-full border transition-all font-mono text-sm flex items-center gap-2",
                ignoreTonicity
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800"
                  : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
              )}
            >
              {ignoreTonicity ? 'Modo Simples (Sem marcações)' : 'Modo Completo (Com tonicidade/sílabas)'}
            </button>
            <button
              onClick={() => setIncludeExplanation(!includeExplanation)}
              className={cn(
                "px-6 py-2 rounded-full border transition-all font-mono text-sm flex items-center gap-2",
                includeExplanation
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800"
                  : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
              )}
            >
              {includeExplanation ? 'Com Explicação Fonológica' : 'Sem Explicação'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-mono">Dificuldade</h3>
          <div className="flex justify-center gap-2 flex-wrap">
            {[1, 2, 3, 4, 5].map((d) => (
              <button
                key={d}
                onClick={() => handleDifficultyChange(d as any)}
                className={cn(
                  "px-6 py-2 rounded-full border transition-all font-mono text-sm",
                  difficulty === d 
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100" 
                    : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                )}
              >
                Nível {d}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'phoneme') {
    return <PhonemeGame />;
  }

  if (!gameActive && timeLeft === 0) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-8 py-12">
        <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-8">
          <Trophy className="w-12 h-12 text-zinc-900 dark:text-zinc-100" />
        </div>
        <h2 className="text-4xl font-serif italic text-zinc-900 dark:text-zinc-100">Fim de Jogo!</h2>
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center px-4">
            <span className="text-zinc-500 dark:text-zinc-400">Pontuação Final</span>
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{score}</span>
          </div>
          <div className="flex justify-between items-center px-4">
            <span className="text-zinc-500 dark:text-zinc-400">Palavras Respondidas</span>
            <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{history.length}</span>
          </div>
        </div>
        <button
          onClick={() => setMode(null)}
          className="px-8 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-2 mx-auto"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Jogar Novamente</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-12">
            <span className="text-sm font-bold text-zinc-400 dark:text-zinc-500 tracking-widest uppercase">
              {currentWord?.isPhrase ? 'Transcreva a Frase' : 'Transcreva a Palavra'}
            </span>
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-bold">
              <Trophy className="w-5 h-5" />
              <span>{score}</span>
            </div>
          </div>

          <div className="text-center mb-12">
            <h2 className={cn(
              "font-bold text-zinc-900 dark:text-zinc-100 tracking-tight",
              currentWord?.word && currentWord.word.length > 15 ? "text-4xl" : "text-6xl"
            )}>
              {currentWord?.word}
            </h2>
            {fetchingIPA && <Loader2 className="w-5 h-5 animate-spin text-zinc-300 dark:text-zinc-600 mx-auto mt-4" />}
          </div>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="digite aqui"
                className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center text-2xl font-mono focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all text-zinc-900 dark:text-zinc-100"
                autoFocus
                disabled={showAnswer}
              />
              {mode === 'train' && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {showAnswer && (
                    <span className="text-sm font-mono text-zinc-400 dark:text-zinc-600 animate-in fade-in slide-in-from-right-2">
                      {normalize(currentWord?.transcriptions[0] || '')}
                    </span>
                  )}
                  <button
                    onClick={() => setShowAnswer(!showAnswer)}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      showAnswer ? "text-zinc-900 dark:text-zinc-100 bg-zinc-200 dark:bg-zinc-800" : "text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    )}
                    title="Mostrar Resposta (Modo Treino)"
                  >
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center mb-8">
            <IPAKeyboard onSymbolClick={(s) => setUserInput(prev => prev + s)} />
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={checkAnswer}
              disabled={!userInput || showAnswer || isAnalyzing}
              className="px-12 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-all font-semibold flex items-center gap-2"
            >
              {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {isAnalyzing ? 'Analisando...' : 'Verificar'}
            </button>
            {currentWord?.hints && currentWord.hints.length > 0 && (
              <button
                onClick={() => setShowHints(!showHints)}
                className={cn(
                  "px-8 py-4 rounded-2xl border transition-all font-semibold flex items-center gap-2",
                  showHints ? "bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800" : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                )}
              >
                <Info className="w-5 h-5" />
                Dicas
              </button>
            )}
          </div>

          <AnimatePresence>
            {showHints && currentWord?.hints && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-6"
              >
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 rounded-2xl p-6 space-y-3">
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 uppercase tracking-wider">Dicas Fonéticas</h4>
                  <ul className="space-y-2">
                    {currentWord.hints.map((hint, i) => (
                      <li key={i} className="text-amber-800 dark:text-amber-300 text-sm flex items-start gap-2">
                        <span className="text-amber-400 dark:text-amber-600 mt-0.5">•</span>
                        {hint}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {detailedError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-2xl p-6 space-y-6 mt-6 text-left"
              >
                <div className="flex items-center gap-2 text-red-900 dark:text-red-200">
                  <XCircle className="w-6 h-6" />
                  <h4 className="font-bold text-lg">Análise do Erro</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/60 dark:bg-zinc-950/50 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                    <span className="block text-xs uppercase tracking-wider text-red-500 dark:text-red-400 font-bold mb-1">Sua resposta</span>
                    <span className="font-mono text-red-900 dark:text-red-100 text-lg">{normalize(userInput)}</span>
                  </div>
                  <div className="bg-white/60 dark:bg-zinc-950/50 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                    <span className="block text-xs uppercase tracking-wider text-green-600 dark:text-green-400 font-bold mb-1">Correto</span>
                    <span className="font-mono text-green-900 dark:text-green-100 text-lg">
                      {normalize(dialectIPA || currentWord?.transcriptions[0] || '')}
                    </span>
                  </div>
                </div>

                <div className="bg-white/60 dark:bg-zinc-950/50 p-5 rounded-xl border border-red-100 dark:border-red-900/30 space-y-2">
                  <h5 className="font-bold text-red-900 dark:text-red-200">Por que você errou?</h5>
                  <p className="text-red-800 dark:text-red-300 text-sm leading-relaxed">{detailedError.errorAnalysis}</p>
                </div>

                <div className="bg-white/60 dark:bg-zinc-950/50 p-5 rounded-xl border border-red-100 dark:border-red-900/30 space-y-2">
                  <h5 className="font-bold text-red-900 dark:text-red-200">Resumo da Pronúncia</h5>
                  <p className="text-red-800 dark:text-red-300 text-sm leading-relaxed">{detailedError.summary}</p>
                </div>

                {detailedError.phonemeTips.length > 0 && (
                  <div className="bg-white/60 dark:bg-zinc-950/50 p-5 rounded-xl border border-red-100 dark:border-red-900/30 space-y-2">
                    <h5 className="font-bold text-red-900 dark:text-red-200">Dicas Específicas</h5>
                    <ul className="space-y-2">
                      {detailedError.phonemeTips.map((tip, i) => (
                        <li key={i} className="text-red-800 dark:text-red-300 text-sm flex items-start gap-2">
                          <span className="text-red-400 dark:text-red-600 mt-0.5">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <button 
                  onClick={() => {
                    setDetailedError(null);
                    startNewRound();
                  }} 
                  className="w-full py-4 bg-red-900 dark:bg-red-700 hover:bg-red-800 dark:hover:bg-red-600 text-white rounded-xl font-bold transition-colors"
                >
                  Continuar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Estatísticas</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <span className="text-zinc-500 dark:text-zinc-400">Pontuação</span>
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{score}</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <span className="text-zinc-500 dark:text-zinc-400">Sequência</span>
              <span className="text-xl font-bold text-orange-500 dark:text-orange-400 flex items-center gap-1">
                {streak} <Flame className="w-5 h-5"/>
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <span className="text-zinc-500 dark:text-zinc-400">Dificuldade</span>
              <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {difficulty === 1 ? 'Easy' : difficulty === 2 ? 'Medium' : difficulty === 3 ? 'Hard' : difficulty === 4 ? 'Expert' : 'Master'}
              </span>
            </div>
            {mode === 'challenge' && (
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Tempo</span>
                <span className={cn("text-xl font-bold", timeLeft < 10 ? "text-red-500 dark:text-red-400 animate-pulse" : "text-zinc-900 dark:text-zinc-100")}>
                  {timeLeft}s
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Histórico</h3>
          {history.length === 0 ? (
            <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">Nenhuma palavra jogada ainda.</p>
          ) : (
            <div className="space-y-3">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{h.word}</p>
                    <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600">
                      {normalize(h.expected[0])}
                    </p>
                  </div>
                  {h.correct ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 dark:text-red-600" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setMode(null)}
          className="w-full py-4 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Sair do Jogo</span>
        </button>
      </div>
    </div>
  );
};
