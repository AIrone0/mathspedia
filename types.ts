export interface DependencyNode {
  id: string; // The theorem name or unique ID
  name: string;
  year: number; // Year proven (approximate)
  parentIds: string[]; // IDs of theorems this directly depends on
  author?: string; // Who proved/discovered this
  source?: string; // Book/paper where this appears (e.g., "Elements VII.30")
  comment?: string; // Description/tooltip text
}

export interface ProofStep {
  text: string;
  latex?: string;
}

export interface Prover {
  name: string;
  age: number;
  flag: string; // Country flag emoji
  nationality?: string;
  circumstance?: string;
}

export interface TheoremData {
  id: string;
  name: string;
  domain?: string; // Mathematical domain/field (e.g., "Number Theory", "Algebra", "Analysis")
  prover?: Prover;
  year: number;
  introduction: string;
  history: string;
  dependencies: DependencyNode[];
  proofs: {
    title: string;
    steps: ProofStep[];
  }[];
  implications: string[];
  requisites: string[]; // Simple list for the sidebar
  references: string[];
  externalLinks: { title: string; url: string }[];
}

export enum AppState {
  IDLE,
  SEARCHING,
  LOADING_THEOREM,
  DISPLAYING,
  ERROR
}
