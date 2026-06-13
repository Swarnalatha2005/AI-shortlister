import React from 'react';
import { X, CheckCircle2, XCircle } from 'lucide-react';

const CandidateModal = ({ result, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900">
          <div>
            <h2 className="text-2xl font-bold text-white">{result.candidateName}</h2>
            <p className="text-slate-400">Rank #{result.rank} • Overall Score: <span className="font-bold text-emerald-400">{result.finalScore}</span></p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          
          {/* Explainable AI Reasons */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Why Recommended</h3>
            <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
              <ul className="space-y-2">
                {result.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300">
                    {r.startsWith('✓') ? (
                      <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                    ) : r.startsWith('✗') ? (
                      <XCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                    ) : (
                      <span className="text-yellow-500 font-bold w-[18px] text-center shrink-0">!</span>
                    )}
                    <span>{r.replace(/^[✓✗!]\s*/, '')}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Matching Skills</h3>
              <div className="flex flex-wrap gap-2">
                {result.matchingSkills.length > 0 ? result.matchingSkills.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-sm">
                    {s}
                  </span>
                )) : <p className="text-slate-500 text-sm">No matching required skills found.</p>}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Missing Skills</h3>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.length > 0 ? result.missingSkills.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-sm">
                    {s}
                  </span>
                )) : <p className="text-slate-500 text-sm">Candidate has all required skills.</p>}
              </div>
            </div>
          </div>

          {/* Summary / About */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Experience Summary</h3>
            <p className="text-slate-300 bg-slate-950/50 p-4 rounded-xl border border-slate-800 leading-relaxed">
              {result.candidate.summary || 'No summary provided.'}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CandidateModal;
