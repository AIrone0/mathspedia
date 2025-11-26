import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import TheoremPage from './pages/TheoremPage';
import { fetchTheoremData, getTheoremCount } from './services/theoremService';
import { TheoremData, AppState } from './types';
import { BookOpen, GitBranch, FileText } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [data, setData] = useState<TheoremData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Simple Hash Router Logic
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // remove #
      if (hash) {
        const decoded = decodeURIComponent(hash);
        loadTheorem(decoded);
      } else {
        setState(AppState.IDLE);
        setData(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Initial check
    if (window.location.hash) {
       handleHashChange();
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const loadTheorem = async (name: string) => {
    setState(AppState.LOADING_THEOREM);
    setError(null);
    try {
      // Simulate "reading from file system" or "generating"
      const result = await fetchTheoremData(name);
      setData(result);
      setState(AppState.DISPLAYING);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error occurred during data retrieval.");
      setState(AppState.ERROR);
    }
  };

  const handleSearch = (query: string) => {
    window.location.hash = encodeURIComponent(query);
  };

  return (
    <div className="flex flex-col h-full bg-term-bg text-term-fg font-mono selection:bg-term-fg selection:text-term-bg">
      {/* Global Status Bar */}
      <div className="h-8 border-b border-term-dim flex justify-between items-center px-4 text-xs bg-[#020202] z-50">
        <div className="flex space-x-4">
           <span className="font-bold cursor-pointer hover:text-white" onClick={() => { window.location.hash = ''; }}>[HOME]</span>
           {data?.domain && <span className="text-term-warn">[{data.domain.toUpperCase().replace(/_/g, ' ')}]</span>}
           {/* {data && <span className="text-term-accent">{data.id.toUpperCase().replace(/-/g, '_')}</span>} */}
           {!data && state === AppState.LOADING_THEOREM && <span className="text-term-warn animate-pulse">LOADING...</span>}
        </div>
        <div className="flex space-x-4 text-term-dim">
           <div className="flex items-center space-x-1" title="Total theorems in database">
             <span>THM</span>
             <FileText size={10} />
             <span className="text-term-accent">{getTheoremCount()}</span>
           </div>
           {data && (
             <>
               <div className="flex items-center space-x-1" title="Prerequisite dependencies">
                 <span>DEP</span>
                 <GitBranch size={10} />
                 <span className="text-term-accent">{data.dependencies.length - 1}</span>
               </div>
               <div className="flex items-center space-x-1" title="Available proofs">
                 <span>PRF</span>
                 <BookOpen size={10} />
                 <span className="text-term-accent">{data.proofs.length}</span>
               </div>
             </>
           )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow overflow-hidden relative">
        {state === AppState.IDLE && (
          <HomePage onSearch={handleSearch} isLoading={false} />
        )}

        {state === AppState.LOADING_THEOREM && (
          <HomePage onSearch={handleSearch} isLoading={true} />
        )}

        {state === AppState.ERROR && (
           <div className="flex flex-col items-center justify-center h-full">
             <div className="border border-term-alert p-8 max-w-md text-center bg-black">
               <h2 className="text-2xl text-term-alert font-bold mb-4">CRITICAL ERROR</h2>
               <p className="text-term-alert mb-4">{error}</p>
               <button 
                 onClick={() => window.location.hash = ''}
                 className="bg-term-alert text-black px-4 py-2 font-bold hover:bg-red-500"
               >
                 RESET TERMINAL
               </button>
             </div>
           </div>
        )}

        {state === AppState.DISPLAYING && data && (
          <TheoremPage data={data} onNavigate={(name) => window.location.hash = encodeURIComponent(name)} />
        )}
      </div>
    </div>
  );
};

export default App;
