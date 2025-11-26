export interface DependencyNode {
  id: string; // The theorem name or unique ID
  name: string;
  year: number; // Year proven (approximate)
  parentIds: string[]; // IDs of theorems this directly depends on
}

export interface ProofStep {
  text: string;
  latex?: string;
}

export interface TheoremData {
  id: string;
  name: string;
  domain?: string; // Mathematical domain/field (e.g., "Number Theory", "Algebra", "Analysis")
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
