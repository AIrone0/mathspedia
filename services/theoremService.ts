import { TheoremData } from "../types";

// Import all theorem files statically for Vite bundling
// Add new theorems here as you create them
const theoremModules = import.meta.glob('../theorems/*.json', { eager: true });

interface TheoremIndex {
  id: string;
  name: string;
  fileName: string;
}

// Build the theorem index from loaded modules
const theoremIndex: TheoremIndex[] = Object.entries(theoremModules).map(([path, module]) => {
  const data = module as { default?: TheoremData } | TheoremData;
  const theorem = 'default' in data ? data.default : data as TheoremData;
  const fileName = path.split('/').pop()?.replace('.json', '') || '';
  return {
    id: theorem.id,
    name: theorem.name,
    fileName,
  };
});

// Get all available theorems for the homepage
export const getAllTheorems = (): TheoremIndex[] => {
  return theoremIndex;
};

// Get total theorem count
export const getTheoremCount = (): number => {
  return theoremIndex.length;
};

// Levenshtein distance for fuzzy matching
const levenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
};

// Calculate fuzzy match score (lower is better)
const fuzzyScore = (query: string, target: string): number => {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase();
  
  // Exact match
  if (t === q) return 0;
  
  // Target contains query as substring
  if (t.includes(q)) return 1;
  
  // Query contains target as substring
  if (q.includes(t)) return 2;
  
  // Check if all words in query appear in target (with fuzzy word matching)
  const queryWords = q.split(/\s+/);
  const targetWords = t.split(/\s+/);
  
  // Fuzzy word matching - allow small typos in individual words
  const fuzzyWordMatch = (qw: string, tw: string): boolean => {
    if (tw.includes(qw) || qw.includes(tw)) return true;
    // Allow 1-2 character difference for words
    const dist = levenshteinDistance(qw, tw);
    return dist <= Math.max(1, Math.floor(qw.length / 3));
  };
  
  const allWordsMatch = queryWords.every(qw => 
    targetWords.some(tw => fuzzyWordMatch(qw, tw))
  );
  if (allWordsMatch) return 3;
  
  // At least some words match (partial match)
  const matchingWords = queryWords.filter(qw =>
    targetWords.some(tw => fuzzyWordMatch(qw, tw))
  );
  if (matchingWords.length > 0) {
    return 4 + (1 - matchingWords.length / queryWords.length) * 3;
  }
  
  // Calculate normalized Levenshtein distance for full string
  const distance = levenshteinDistance(q, t);
  const maxLen = Math.max(q.length, t.length);
  const normalizedDistance = distance / maxLen;
  
  // Return high score for poor matches
  return 7 + normalizedDistance * 3;
};

export interface SearchResult {
  theorem: TheoremIndex;
  score: number;
}

// Search theorems with fuzzy matching
export const searchTheorems = (query: string): SearchResult[] => {
  if (!query.trim()) return [];
  
  const results = theoremIndex
    .map(theorem => ({
      theorem,
      score: Math.min(
        fuzzyScore(query, theorem.name),
        fuzzyScore(query, theorem.id.replace(/-/g, ' '))
      ),
    }))
    .filter(r => r.score < 8) // Filter out very poor matches
    .sort((a, b) => a.score - b.score);
  
  return results;
};

// Find best matching theorem
export const findBestMatch = (query: string): TheoremIndex | null => {
  const results = searchTheorems(query);
  return results.length > 0 ? results[0].theorem : null;
};

// Load theorem data by ID or fuzzy search
export const fetchTheoremData = async (query: string): Promise<TheoremData> => {
  // First try exact ID match
  const exactMatch = theoremIndex.find(t => 
    t.id === query || 
    t.id === query.toLowerCase().replace(/\s+/g, '-')
  );
  
  if (exactMatch) {
    return loadTheoremById(exactMatch.id);
  }
  
  // Fuzzy search
  const bestMatch = findBestMatch(query);
  
  if (!bestMatch) {
    throw new Error(`No theorem found matching "${query}". Available theorems: ${theoremIndex.map(t => t.name).join(', ')}`);
  }
  
  return loadTheoremById(bestMatch.id);
};

// Load theorem by exact ID
const loadTheoremById = async (id: string): Promise<TheoremData> => {
  const entry = Object.entries(theoremModules).find(([path]) => {
    const fileName = path.split('/').pop()?.replace('.json', '');
    return fileName === id;
  });
  
  if (!entry) {
    throw new Error(`Theorem file not found for ID: ${id}`);
  }
  
  const [, module] = entry;
  const data = module as { default?: TheoremData } | TheoremData;
  return 'default' in data ? data.default : data as TheoremData;
};

