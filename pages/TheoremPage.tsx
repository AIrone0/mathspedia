import React from 'react';
import { TheoremData } from '../types';
import DependencyGraph from '../components/DependencyGraph';
import LatexRenderer from '../components/LatexRenderer';
import FormattedText from '../components/FormattedText';
import { ChevronRight, ExternalLink, Hash, BookOpen, Clock, Activity } from 'lucide-react';

interface TheoremPageProps {
  data: TheoremData;
  onNavigate: (name: string) => void;
}

const SectionHeader: React.FC<{ title: string; icon?: React.ReactNode }> = ({ title, icon }) => (
  <div className="flex items-center space-x-2 bg-term-dim/20 border-b border-term-dim p-1 mb-2">
    {icon && <span className="text-term-warn">{icon}</span>}
    <h3 className="font-bold text-term-fg uppercase tracking-widest text-sm">{title}</h3>
  </div>
);

const TheoremPage: React.FC<TheoremPageProps> = ({ data, onNavigate }) => {
  return (
    <div className="grid grid-cols-12 gap-4 h-full p-4 overflow-y-auto">
      
      {/* Header / Meta Strip */}
      <div className="col-span-12 border border-term-dim p-4 flex justify-between items-end bg-black">
        <div>
           <div className="text-xs text-term-dim mb-1">ID: {data.id}</div>
           <h1 className="text-4xl font-bold text-term-fg uppercase glow-text">{data.name}</h1>
        </div>
        <div className="text-right font-mono text-term-accent">
           <div className="text-2xl">{data.year < 0 ? `${Math.abs(data.year)} BC` : data.year}</div>
           <div className="text-xs text-term-dim">DATE_PROVEN</div>
        </div>
      </div>

      {/* Intro Box */}
      <div className="col-span-12 border border-term-dim p-4 bg-black relative">
        <SectionHeader title="INTRODUCTION" icon={<Hash size={14}/>} />
        <FormattedText text={data.introduction} className="text-justify" />
      </div>

       {/* Requisites Side Panel md:col-span-8
       <div className="col-span-12 md:col-span-4 border border-term-dim p-4 bg-black flex flex-col">
         <SectionHeader title="REQUISITES / CONTEXT" icon={<Activity size={14}/>} />
         <ul className="space-y-1 text-sm font-mono flex-grow overflow-y-auto">
           {data.requisites.map((req, idx) => (
             <li key={idx} className="flex items-center group cursor-pointer hover:bg-term-dim/30 p-1"
                 onClick={() => onNavigate(req)}>
               <ChevronRight size={12} className="text-term-dim group-hover:text-term-fg mr-2" />
               <span className="text-term-accent group-hover:text-term-fg">{req}</span>
             </li>
           ))}
         </ul>
      </div>*/}

      {/* Timeline Graph */}
      <div className="col-span-12 border border-term-dim p-0 bg-black">
        <DependencyGraph nodes={data.dependencies} onNodeClick={onNavigate} />
      </div>

      {/* Proofs Section */}
      <div className="col-span-12 md:col-span-8 border border-term-dim p-4 bg-black">
        <SectionHeader title="MATHEMATICAL PROOF(S)" icon={<BookOpen size={14}/>} />
        <div className="space-y-6">
          {data.proofs.map((proof, pIdx) => (
            <div key={pIdx} className="border-l-2 border-term-dim pl-4">
              <h4 className="text-term-warn font-bold mb-2">{'>>'} {proof.title}</h4>
              <div className="space-y-4">
                {proof.steps.map((step, sIdx) => (
                  <div key={sIdx} className="mb-2">
                    <p className="text-gray-400 text-sm mb-1">{sIdx + 1}. {step.text}</p>
                    {step.latex && (
                      <div className="bg-term-dim/10 p-2 border border-term-dim/30">
                        <LatexRenderer expression={step.latex} block />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History & Implications */}
      <div className="col-span-12 md:col-span-4 space-y-4">
        <div className="border border-term-dim p-4 bg-black h-fit">
          <SectionHeader title="HISTORY" icon={<Clock size={14}/>} />
          <FormattedText text={data.history} className="text-sm leading-tight" />
        </div>

        <div className="border border-term-dim p-4 bg-black h-fit">
          <SectionHeader title="IMPLICATIONS" />
          <ul className="list-square list-inside text-sm text-term-accent space-y-1">
            {data.implications.map((imp, idx) => (
              <li key={idx}><span className="text-gray-400">{imp}</span></li>
            ))}
          </ul>
        </div>
        
        <div className="border border-term-dim p-4 bg-black h-fit">
          <SectionHeader title="EXTERNAL_LINKS" icon={<ExternalLink size={14}/>} />
           <ul className="text-xs space-y-2">
             {data.externalLinks.map((link, idx) => (
               <li key={idx}>
                 <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-white text-term-dim underline decoration-dotted">
                   [{idx}] {link.title}
                 </a>
               </li>
             ))}
           </ul>
        </div>
      </div>
      
    </div>
  );
};

export default TheoremPage;
