export interface WordData {
  word: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  transcriptions: string[];
  hints?: string[];
  isPhrase?: boolean;
}

export const WORD_DATABASE: WordData[] = [
  // Level 1: Simple
  { word: "casa", difficulty: 1, transcriptions: ["ˈka.zɐ"] },
  { word: "bola", difficulty: 1, transcriptions: ["ˈbɔ.lɐ"] },
  { word: "pato", difficulty: 1, transcriptions: ["ˈpa.tu"] },
  { word: "dedo", difficulty: 1, transcriptions: ["ˈde.du"] },
  { word: "fogo", difficulty: 1, transcriptions: ["ˈfo.gu"] },
  { word: "gato", difficulty: 1, transcriptions: ["ˈga.tu"] },
  { word: "mala", difficulty: 1, transcriptions: ["ˈma.lɐ"] },
  { word: "navio", difficulty: 1, transcriptions: ["na.ˈvi.u"] },
  { word: "pipoca", difficulty: 1, transcriptions: ["pi.ˈpɔ.kɐ"] },
  { word: "suco", difficulty: 1, transcriptions: ["ˈsu.ku"] },

  // Level 2: Nasals and Diphthongs
  { word: "mão", difficulty: 2, transcriptions: ["ˈmɐ̃w̃"] },
  { word: "pão", difficulty: 2, transcriptions: ["ˈpɐ̃w̃"] },
  { word: "mãe", difficulty: 2, transcriptions: ["ˈmɐ̃j̃"] },
  { word: "pai", difficulty: 2, transcriptions: ["ˈpaj"] },
  { word: "céu", difficulty: 2, transcriptions: ["ˈsɛw"] },
  { word: "limão", difficulty: 2, transcriptions: ["li.ˈmɐ̃w̃"] },
  { word: "coração", difficulty: 2, transcriptions: ["ko.ɾa.ˈsɐ̃w̃"] },
  { word: "muito", difficulty: 2, transcriptions: ["ˈmũj̃.tu"] },
  { word: "noite", difficulty: 2, transcriptions: ["ˈnoj.tʃi"] },
  { word: "peixe", difficulty: 2, transcriptions: ["ˈpej.ʃi"] },

  // Level 3: Complex R, S and Clusters
  { word: "carro", difficulty: 3, transcriptions: ["ˈka.ʁu", "ˈka.hu"] },
  { word: "prato", difficulty: 3, transcriptions: ["ˈpɾa.tu"] },
  { word: "festa", difficulty: 3, transcriptions: ["ˈfɛs.tɐ", "ˈfɛʃ.tɐ"] },
  { word: "brasil", difficulty: 3, transcriptions: ["bɾa.ˈziw"] },
  { word: "cachorro", difficulty: 3, transcriptions: ["ka.ˈʃo.ʁu", "ka.ˈʃo.hu"] },
  { word: "escola", difficulty: 3, transcriptions: ["es.ˈkɔ.lɐ", "iʃ.ˈkɔ.lɐ"] },
  { word: "porta", difficulty: 3, transcriptions: ["ˈpɔɾ.tɐ", "ˈpɔh.tɐ", "ˈpɔɻ.tɐ"] },
  { word: "trabalho", difficulty: 3, transcriptions: ["tɾa.ˈba.ʎu"] },
  { word: "chuva", difficulty: 3, transcriptions: ["ˈʃu.vɐ"] },
  { word: "galinha", difficulty: 3, transcriptions: ["ga.ˈlĩ.ɲɐ"] },

  // Level 4: Advanced
  { word: "exceção", difficulty: 4, transcriptions: ["e.se.ˈsɐ̃w̃", "i.si.ˈsɐ̃w̃"] },
  { word: "psicologia", difficulty: 4, transcriptions: ["psi.ko.lo.ˈʒi.ɐ"] },
  { word: "paralelepípedo", difficulty: 4, transcriptions: ["pa.ɾa.le.le.ˈpi.pe.du"] },
  { word: "ritmo", difficulty: 4, transcriptions: ["ˈhitʃ.mu", "ˈʁitʃ.mu"] },
  { word: "advogado", difficulty: 4, transcriptions: ["ad.vo.ˈga.du", "a.dʒi.vo.ˈga.du"] },
  { word: "transcrição", difficulty: 4, transcriptions: ["tɾɐ̃s.kɾi.ˈsɐ̃w̃"] },
  { word: "fonética", difficulty: 4, transcriptions: ["fo.ˈnɛ.tʃi.kɐ"] },
  { word: "alfabeto", difficulty: 4, transcriptions: ["aw.fa.ˈbɛ.tu"] },
  { word: "internacional", difficulty: 4, transcriptions: ["ĩ.teɾ.na.sjo.ˈnaw"] },
  { word: "português", difficulty: 4, transcriptions: ["poɾ.tu.ˈges", "puɾ.tu.ˈgeʃ"] },
];

export interface PhonemeData {
  symbol: string;
  name: string;
  description: string;
}

export const CONSONANTS_GRID = {
  places: ["Bilabial", "Labiodental", "Alveolar", "Pós-alveolar", "Palatal", "Velar", "Uvular", "Glotal"],
  manners: ["Oclusiva", "Nasal", "Vibrante", "Tepe", "Fricativa", "Aproximante", "Lateral"],
  data: [
    // Oclusivas
    { symbol: "p", place: "Bilabial", manner: "Oclusiva", voiced: false, name: "Oclusiva bilabial não vozeada", example: "pato" },
    { symbol: "b", place: "Bilabial", manner: "Oclusiva", voiced: true, name: "Oclusiva bilabial vozeada", example: "bola" },
    { symbol: "t", place: "Alveolar", manner: "Oclusiva", voiced: false, name: "Oclusiva alveolar não vozeada", example: "teto" },
    { symbol: "d", place: "Alveolar", manner: "Oclusiva", voiced: true, name: "Oclusiva alveolar vozeada", example: "dedo" },
    { symbol: "k", place: "Velar", manner: "Oclusiva", voiced: false, name: "Oclusiva velar não vozeada", example: "casa" },
    { symbol: "g", place: "Velar", manner: "Oclusiva", voiced: true, name: "Oclusiva velar vozeada", example: "gato" },
    { symbol: "ʔ", place: "Glotal", manner: "Oclusiva", voiced: false, name: "Oclusiva glotal", example: "ã-ã" },
    
    // Nasais
    { symbol: "m", place: "Bilabial", manner: "Nasal", voiced: true, name: "Nasal bilabial vozeada", example: "mala" },
    { symbol: "ɱ", place: "Labiodental", manner: "Nasal", voiced: true, name: "Nasal labiodental vozeada", example: "ênfase" },
    { symbol: "n", place: "Alveolar", manner: "Nasal", voiced: true, name: "Nasal alveolar vozeada", example: "navio" },
    { symbol: "ɲ", place: "Palatal", manner: "Nasal", voiced: true, name: "Nasal palatal vozeada", example: "galinha" },
    { symbol: "ŋ", place: "Velar", manner: "Nasal", voiced: true, name: "Nasal velar vozeada", example: "manga" },

    // Vibrantes / Tepes
    { symbol: "r", place: "Alveolar", manner: "Vibrante", voiced: true, name: "Vibrante alveolar vozeada", example: "carro (alguns dialetos)" },
    { symbol: "ɾ", place: "Alveolar", manner: "Tepe", voiced: true, name: "Tepe alveolar vozeada", example: "prato" },
    { symbol: "R", place: "Uvular", manner: "Vibrante", voiced: true, name: "Vibrante uvular vozeada", example: "carro (Rio de Janeiro)" },

    // Fricativas
    { symbol: "f", place: "Labiodental", manner: "Fricativa", voiced: false, name: "Fricativa labiodental não vozeada", example: "fogo" },
    { symbol: "v", place: "Labiodental", manner: "Fricativa", voiced: true, name: "Fricativa labiodental vozeada", example: "vida" },
    { symbol: "s", place: "Alveolar", manner: "Fricativa", voiced: false, name: "Fricativa alveolar não vozeada", example: "suco" },
    { symbol: "z", place: "Alveolar", manner: "Fricativa", voiced: true, name: "Fricativa alveolar vozeada", example: "zebra" },
    { symbol: "ʃ", place: "Pós-alveolar", manner: "Fricativa", voiced: false, name: "Fricativa pós-alveolar não vozeada", example: "chuva" },
    { symbol: "ʒ", place: "Pós-alveolar", manner: "Fricativa", voiced: true, name: "Fricativa pós-alveolar vozeada", example: "janela" },
    { symbol: "x", place: "Velar", manner: "Fricativa", voiced: false, name: "Fricativa velar não vozeada", example: "carro (interior)" },
    { symbol: "ʁ", place: "Uvular", manner: "Fricativa", voiced: true, name: "Fricativa uvular vozeada", example: "carro (padrão)" },
    { symbol: "h", place: "Glotal", manner: "Fricativa", voiced: false, name: "Fricativa glotal não vozeada", example: "carro (suave)" },

    // Aproximantes / Laterais
    { symbol: "j", place: "Palatal", manner: "Aproximante", voiced: true, name: "Aproximante palatal vozeada", example: "pai" },
    { symbol: "w", place: "Velar", manner: "Aproximante", voiced: true, name: "Aproximante labiovelar vozeada", example: "mau" },
    { symbol: "l", place: "Alveolar", manner: "Lateral", voiced: true, name: "Aproximante lateral alveolar vozeada", example: "lado" },
    { symbol: "ʎ", place: "Palatal", manner: "Lateral", voiced: true, name: "Aproximante lateral palatal vozeada", example: "filho" },
    { symbol: "L", place: "Velar", manner: "Lateral", voiced: true, name: "Aproximante lateral velar vozeada", example: "Brasil (dialetos)" },
  ]
};

export const VOWELS_DATA = [
  { symbol: "i", height: "Fechada", backness: "Anterior", rounded: false, name: "Vogal anterior fechada não arredondada", example: "vi" },
  { symbol: "u", height: "Fechada", backness: "Posterior", rounded: true, name: "Vogal posterior fechada arredondada", example: "tu" },
  { symbol: "e", height: "Semifechada", backness: "Anterior", rounded: false, name: "Vogal anterior semifechada não arredondada", example: "vê" },
  { symbol: "o", height: "Semifechada", backness: "Posterior", rounded: true, name: "Vogal posterior semifechada arredondada", example: "vou" },
  { symbol: "ɛ", height: "Semiaberta", backness: "Anterior", rounded: false, name: "Vogal anterior semiaberta não arredondada", example: "pé" },
  { symbol: "ɔ", height: "Semiaberta", backness: "Posterior", rounded: true, name: "Vogal posterior semiaberta arredondada", example: "pó" },
  { symbol: "a", height: "Aberta", backness: "Anterior", rounded: false, name: "Vogal anterior aberta não arredondada", example: "pá" },
  { symbol: "ɐ", height: "Aberta", backness: "Central", rounded: false, name: "Vogal central aberta não arredondada", example: "cama" },
];

export const IPA_SYMBOLS = {
  vowels: ["a", "ɐ", "e", "ɛ", "i", "o", "ɔ", "u", "y"],
  nasals: ["ɐ̃", "ẽ", "ĩ", "õ", "ũ"],
  semivowels: ["j", "w", "j̃", "w̃"],
  consonants: ["p", "b", "t", "d", "k", "g", "f", "v", "s", "z", "ʃ", "ʒ", "m", "n", "ɲ", "l", "ʎ", "ɾ", "r", "ʁ", "h", "ɦ", "x", "tʃ", "dʒ", "ɻ"],
  diacritics: ["ˈ", "ˌ", ".", "~"]
};

export const DIALECTS = [
  { id: 'pb-standard', name: 'Brasileiro (Padrão)', description: 'Padrão culto do Sudeste (SP/MG).' },
  { id: 'pb-carioca', name: 'Carioca (RJ)', description: 'Caracterizado pelo "s" chiado [ʃ/ʒ] e "r" forte [ʁ/h].' },
  { id: 'pb-nordestino', name: 'Nordestino', description: 'Variações regionais do Nordeste, com foco em oclusivas e vogais abertas.' },
  { id: 'pb-sulista', name: 'Sulista', description: 'Caracterizado pelo "r" vibrante [r] e vogais mais fechadas.' },
  { id: 'pe-standard', name: 'Europeu (Portugal)', description: 'Padrão de Portugal, com redução de vogais átonas.' },
];
