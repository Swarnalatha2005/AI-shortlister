import React from 'react';
import { ChevronRight, Award, Briefcase, BrainCircuit } from 'lucide-react';

const CandidateTable = ({ candidates, onSelectCandidate, selectedId }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400 text-sm font-medium uppercase tracking-wider">
            <th className="p-4 pl-0">Rank</th>
            <th className="p-4">Candidate</th>
            <th className="p-4 text-center">Score</th>
            <th className="p-4 text-center">Semantic</th>
            <th className="p-4 text-center">Skills</th>
            <th className="p-4 text-center">Experience</th>
            <th className="p-4 text-right pr-0">View</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {candidates.map((res) => (
            <tr 
              key={res.candidateId} 
              className={`group transition-all cursor-pointer ${selectedId === res.candidateId ? 'bg-indigo-500/10 border-l-2 border-indigo-500' : 'hover:bg-slate-800/30 border-l-2 border-transparent'}`}
              onClick={() => onSelectCandidate(res)}
            >
              <td className="p-4">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                  #{res.rank}
                </div>
              </td>
              <td className="p-4">
                <p className={`font-semibold ${selectedId === res.candidateId ? 'text-indigo-400' : 'text-white'}`}>{res.candidateName}</p>
                <p className="text-sm text-slate-400 line-clamp-1 max-w-[200px]">{res.candidate.summary}</p>
              </td>
              <td className="p-4 text-center">
                <div className={`text-xl font-bold ${getScoreColor(res.finalScore)}`}>
                  {res.finalScore}
                </div>
              </td>
              <td className="p-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <BrainCircuit size={16} className="text-purple-400" />
                  <span className="text-sm text-slate-300">{res.components.semanticMatch}</span>
                </div>
              </td>
              <td className="p-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Award size={16} className="text-blue-400" />
                  <span className="text-sm text-slate-300">{res.components.skillsScore}</span>
                </div>
              </td>
              <td className="p-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Briefcase size={16} className="text-amber-400" />
                  <span className="text-sm text-slate-300">{res.components.experienceScore}</span>
                </div>
              </td>
              <td className="p-4 text-right pr-0">
                <button 
                  className={`p-2 rounded-lg transition-colors inline-flex items-center gap-1 ${selectedId === res.candidateId ? 'text-white bg-indigo-500/20' : 'text-slate-500 group-hover:text-white group-hover:bg-slate-700'}`}
                >
                  <ChevronRight size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CandidateTable;
