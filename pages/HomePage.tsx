import React, { useState, useMemo } from 'react';
import { Terminal } from 'lucide-react';
import { getAllTheorems, searchTheorems } from '../services/theoremService';

interface HomePageProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const allTheorems = useMemo(() => getAllTheorems(), []);
  
  // Fuzzy search results as user types
  const searchResults = useMemo(() => {
    if (query.length < 2) return [];
    return searchTheorems(query).slice(0, 5);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleSelectSuggestion = (name: string) => {
    setQuery(name);
    onSearch(name);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-black p-4 relative">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-10 left-10 w-64 h-64 border-l border-t border-term-dim opacity-50"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 border-r border-b border-term-dim opacity-50"></div>
      
      <div className="max-w-2xl w-full border border-term-fg p-1 bg-black z-10 shadow-[0_0_15px_rgba(0,255,65,0.1)]">
        <div className="border border-term-dim p-8 flex flex-col items-center">
          
          <div className="mb-8 text-center space-y-2">
            <Terminal size={48} className="text-term-fg mx-auto mb-4 animate-pulse" />
            <h1 className="text-4xl font-retro text-term-fg tracking-widest">OMNIMATH_TERMINAL</h1>
            <div className="text-xs text-term-dim tracking-[0.5em]">V.1.0.4 :: LOCAL_DB</div>
          </div>

          <form onSubmit={handleSubmit} className="w-full relative group">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-term-fg">
              {isLoading ? <span className="animate-spin">|</span> : '>'}
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ENTER THEOREM..."
              className="w-full bg-[#050505] border border-term-dim p-4 pl-10 text-xl font-mono text-term-fg focus:outline-none focus:border-term-fg focus:ring-1 focus:ring-term-fg placeholder-term-dim/50 uppercase"
              autoFocus
              disabled={isLoading}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <button type="submit" disabled={isLoading} className="text-term-dim hover:text-term-fg disabled:opacity-50">
                   [EXEC]
                </button>
            </div>
          </form>

          {/* Fuzzy Search Suggestions */}
          {searchResults.length > 0 && !isLoading && (
            <div className="mt-2 w-full border border-term-dim bg-[#050505]">
              <div className="text-[10px] text-term-dim px-2 py-1 border-b border-term-dim">
                MATCHING_RECORDS: {searchResults.length}
              </div>
              {searchResults.map((result, idx) => (
                <div
                  key={result.theorem.id}
                  className="px-3 py-2 hover:bg-term-dim/20 cursor-pointer flex items-center justify-between text-sm"
                  onClick={() => handleSelectSuggestion(result.theorem.name)}
                >
                  <span className="text-term-fg">{result.theorem.name}</span>
                  <span className="text-term-dim text-xs">
                    [{result.score < 2 ? 'EXACT' : result.score < 4 ? 'CLOSE' : 'PARTIAL'}]
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Available Theorems */}
          <div className="mt-8 w-full">
            <div className="text-xs text-term-dim mb-2">AVAILABLE_RECORDS: {allTheorems.length}</div>
            <div className="grid grid-cols-2 gap-4 text-xs text-term-dim font-mono">
              {allTheorems.map((theorem) => (
                <div 
                  key={theorem.id}
                  className="border border-term-dim p-2 hover:bg-term-dim/10 cursor-pointer"
                  onClick={() => onSearch(theorem.name)}
                >
                  {'>'} {theorem.name.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
          
          {isLoading && (
             <div className="mt-4 w-full">
               <div className="text-xs text-term-warn mb-1">LOADING THEOREM DATA...</div>
               <div className="h-1 w-full bg-term-dim">
                 <div className="h-full bg-term-warn animate-[width_2s_ease-in-out_infinite]" style={{width: '50%'}}></div>
               </div>
             </div>
          )}

        </div>
      </div>
      
      {/* <div className="absolute bottom-4 text-[10px] text-term-dim text-center w-full">
         SYS_OP: ONLINE // MEM: LOCAL // MODE: VISUAL // (C) OMNI_CORP
      </div> */}
    </div>
  );
};

export default HomePage;
