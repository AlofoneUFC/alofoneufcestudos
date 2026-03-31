import { GoogleGenAI, Modality } from "@google/genai";
import { WORD_DATABASE, WordData } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper for exponential backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, retries = 3, backoff = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isQuotaError = error?.status === 'RESOURCE_EXHAUSTED' || error?.code === 429 || error?.message?.includes('quota');
    if (isQuotaError && retries > 0) {
      console.warn(`Quota exceeded, retrying in ${backoff}ms...`);
      await delay(backoff);
      return withRetry(fn, retries - 1, backoff * 2);
    }
    if (isQuotaError) {
      const quotaError = new Error("Quota exceeded");
      (quotaError as any).isQuotaError = true;
      throw quotaError;
    }
    throw error;
  }
}

// Persistent cache using LocalStorage to reduce API calls across sessions
const getCache = (key: string) => {
  try {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
};

const saveCache = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save to localStorage cache", e);
  }
};

const transcriptionCache: Record<string, string[]> = getCache('ipa_transcription_cache');

export async function transcribeToIPA(word: string, dialectId: string = 'pb-standard'): Promise<string[]> {
  const normalizedWord = word.trim().toLowerCase();
  const cacheKey = `${dialectId}:${normalizedWord}`;
  
  if (transcriptionCache[cacheKey]) {
    return transcriptionCache[cacheKey];
  }

  const dialectPrompts: Record<string, string> = {
    'pb-standard': 'Português Brasileiro (Padrão/Sudeste)',
    'pb-carioca': 'Português Brasileiro (Dialeto Carioca/RJ - considere o "s" chiado e "r" uvular)',
    'pb-nordestino': 'Português Brasileiro (Dialeto Nordestino)',
    'pb-sulista': 'Português Brasileiro (Dialeto Sulista - considere o "r" vibrante alveolar)',
    'pe-standard': 'Português Europeu (Padrão de Portugal - considere a redução de vogais átonas)',
  };

  const dialectDescription = dialectPrompts[dialectId] || dialectPrompts['pb-standard'];

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Transcreva a palavra portuguesa "${word}" para o Alfabeto Fonético Internacional (AFI/IPA) seguindo o padrão: ${dialectDescription}. 
      Forneça apenas a transcrição mais comum e aceitável para este dialeto específico. Evite o uso de parênteses para sons opcionais; escolha a forma mais frequente.
      Retorne apenas um array JSON de strings com UMA ÚNICA transcrição, sem explicações.
      Exemplo: ["ˈka.zɐ"]`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          const result = parsed.slice(0, 1);
          transcriptionCache[cacheKey] = result;
          saveCache('ipa_transcription_cache', transcriptionCache);
          return result;
        }
      } catch (e) {
        console.error("Failed to parse IPA response", e);
      }
    }
    return [];
  });
}

export async function analyzeMistake(word: string, expectedIPA: string, userInput: string, dialectDescription: string, ignoreTonicity: boolean = false): Promise<{ summary: string, errorAnalysis: string, phonemeTips: string[] }> {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `O usuário tentou transcrever a palavra/frase "${word}" para o AFI (${dialectDescription}).
      A transcrição correta esperada era: ${expectedIPA.replace(/[()\/\[\]]/g, '')}
      O usuário digitou: ${userInput.replace(/[()\/\[\]]/g, '')}
      
      ${ignoreTonicity ? 'IMPORTANTE: O usuário está no "Modo Simples", portanto ignore erros relacionados a marcações de tonicidade (ˈ, ˌ), separação silábica (., ·, -) e parênteses ( ). Foque apenas nos fonemas.' : 'Considere marcações de tonicidade e separação silábica na sua análise, mas ignore parênteses ( ) que indicam sons opcionais.'}
      
      Forneça uma análise detalhada do erro em JSON com os seguintes campos:
      "s": Um resumo de como se pronuncia toda a palavra foneticamente (explicando os sons de forma simples). NÃO use barras / ou colchetes [ ] nas transcrições.
      "e": Uma explicação detalhada e amigável de por que o usuário errou, comparando o que ele digitou com o esperado. Aponte exatamente qual fonema ele trocou, omitiu ou adicionou.
      "t": Um array de strings com dicas estritamente fonéticas (ex: "O fonema /s/ é uma fricativa alveolar, tente posicionar a língua atrás dos dentes superiores", "O fonema /ʁ/ é uma fricativa uvular, tente produzir o som na garganta"). Evite dicas genéricas.
      
      Retorne APENAS o JSON válido.`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return {
        summary: parsed.s || '',
        errorAnalysis: parsed.e || '',
        phonemeTips: parsed.t || []
      };
    }
    throw new Error("Empty response");
  }).catch(error => {
    console.error("Error analyzing mistake", error);
    return {
      summary: `A transcrição correta é ${expectedIPA.replace(/[()\/\[\]]/g, '')}.`,
      errorAnalysis: "Ocorreu um erro ao analisar sua resposta detalhadamente. Verifique a transcrição correta acima.",
      phonemeTips: []
    };
  });
}

export async function getPhoneticExplanation(word: string, dialectId: string = 'pb-standard'): Promise<{ transcription: string, explanation: string, tonicSyllable: string, phoneticProcesses: string[] }> {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Analise a palavra "${word}" (dialeto: ${dialectId}) sob a ótica da fonética e fonologia.
      Forneça um JSON com:
      "t": Transcrição AFI (apenas a string, SEM barras / ou colchetes [ ]).
      "e": Explicação dos sons presentes (quais fonemas aparecem).
      "s": Sílaba tônica (ex: "segunda sílaba").
      "p": Array de strings comentando processos fonéticos relevantes (ex: "nasalização da vogal", "palatalização do 't' antes de 'i'", "redução vocálica").
      
      Retorne APENAS o JSON válido.`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return {
        transcription: parsed.t || '',
        explanation: parsed.e || '',
        tonicSyllable: parsed.s || '',
        phoneticProcesses: parsed.p || []
      };
    }
    throw new Error("Empty response");
  }).catch(error => {
    console.error("Error getting phonetic explanation", error);
    return {
      transcription: '?',
      explanation: 'Não foi possível gerar a explicação.',
      tonicSyllable: '?',
      phoneticProcesses: []
    };
  });
}

export async function fetchRandomWord(difficulty: number, excludedWords: string[] = [], dialectId: string = 'pb-standard'): Promise<WordData> {
  // Try to get a word from the local database first
  const filtered = WORD_DATABASE.filter(w => 
    (w.difficulty === difficulty || (difficulty === 5 && w.difficulty === 4)) &&
    !excludedWords.includes(w.word)
  );

  // If we have words, pick one randomly
  if (filtered.length > 0) {
    const word = filtered[Math.floor(Math.random() * filtered.length)];
    return {
      ...word,
      hints: word.hints || ["Dica fonética indisponível."]
    };
  }

  // Fallback to AI if no words found locally
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Gere um item aleatório em português (dificuldade: ${difficulty}).
      NÃO use: ${excludedWords.join(', ')}.
      Transcreva para AFI.
      Forneça 3 dicas fonéticas úteis. NÃO revele a resposta.
      Retorne JSON:
      {"w": "palavra/frase", "t": ["transcrição"], "h": ["dica_fonetica1", "dica_fonetica2", "dica_fonetica3"], "p": booleano (true se frase)}`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return {
        word: parsed.w,
        difficulty: difficulty as any,
        transcriptions: parsed.t,
        hints: parsed.h,
        isPhrase: parsed.p
      };
    }
    throw new Error("Empty response from AI");
  }).catch(error => {
    console.error("Error fetching random word from AI", error);
    // Final fallback
    return {
      word: "erro",
      difficulty: 1,
      transcriptions: ["ˈe.ʁu"],
      hints: ["Erro ao carregar palavra."]
    };
  });
}
