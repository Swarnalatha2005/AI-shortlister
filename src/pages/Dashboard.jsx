import React, { useState, useRef, useEffect } from 'react';
import { analyzeJob, uploadCandidates, rankCandidates, getResultsCsvUrl } from '../services/api';
import CandidateTable from '../components/CandidateTable';
import CandidateModal from '../components/CandidateModal'; // We'll just render its content inline
import { UploadCloud, FileText, Play, Download, Search, CheckCircle, BrainCircuit } from 'lucide-react';

const Dashboard = () => {
  const [jobText, setJobText] = useState('');
  const [jobId, setJobId] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [candidatesUploaded, setCandidatesUploaded] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  const resultsRef = useRef(null);

  useEffect(() => {
    if (results.length > 0 && resultsRef.current) {
      // Auto-scroll to results when they are ready
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Select the top candidate automatically to show details immediately
      if (!selectedCandidate) {
        setSelectedCandidate(results[0]);
      }
    }
  }, [results]);

  const handleAnalyzeJob = async () => {
    if (!jobText) return alert('Please enter a job description');
    setLoading(true);
    try {
      const payload = {
        title: 'Uploaded Job Role',
        description: jobText,
        requiredSkills: ['JavaScript', 'React', 'Node.js', 'Machine Learning'],
        preferredSkills: ['Python', 'Docker'],
        experienceLevel: 3
      };
      const res = await analyzeJob(payload);
      setJobId(res.jobId);
    } catch (err) {
      console.error(err);
      alert('Failed to analyze job');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadCandidates = async () => {
    if (!file) return alert('Please select a JSON file');
    setLoading(true);
    try {
      await uploadCandidates(file);
      setCandidatesUploaded(true);
    } catch (err) {
      console.error(err);
      alert('Failed to upload candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleRank = async () => {
    if (!jobId || !candidatesUploaded) return alert('Please upload job and candidates first');
    setLoading(true);
    try {
      const res = await rankCandidates(jobId);
      setResults(res.results);
    } catch (err) {
      console.error(err);
      alert('Failed to rank candidates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Job Description Panel */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all hover:border-slate-700">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400">
              <FileText size={28} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Job Description</h2>
          </div>
          <textarea
            className="w-full h-48 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none shadow-inner"
            placeholder="Paste Job Description here..."
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
          />
          <button 
            onClick={handleAnalyzeJob}
            disabled={loading || jobId}
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-lg py-4 rounded-2xl transition-all shadow-lg hover:shadow-blue-500/25 flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {jobId ? <><CheckCircle size={24} /> Analyzed successfully</> : <><Search size={24} /> Analyze JD</>}
          </button>
        </div>

        {/* Candidate Upload Panel */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all hover:border-slate-700">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400">
              <UploadCloud size={28} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Candidate Dataset</h2>
          </div>
          
          <div className="h-48 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center bg-slate-950/40 hover:bg-slate-950/80 transition-all cursor-pointer relative group">
            <input 
              type="file" 
              accept=".json"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <UploadCloud size={56} className="text-slate-500 group-hover:text-indigo-400 group-hover:-translate-y-2 transition-all duration-300 mb-4" />
            <p className="text-slate-300 font-medium text-lg">
              {file ? file.name : 'Click or drag JSON file to upload'}
            </p>
          </div>
          
          <button 
            onClick={handleUploadCandidates}
            disabled={loading || candidatesUploaded || !file}
            className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-lg py-4 rounded-2xl transition-all shadow-lg hover:shadow-indigo-500/25 flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {candidatesUploaded ? <><CheckCircle size={24} /> Database Ready</> : <><UploadCloud size={24} /> Upload Candidates</>}
          </button>
        </div>

      </div>

      {/* Action Bar */}
      <div className="flex justify-center items-center py-8">
        <button 
          onClick={handleRank}
          disabled={loading || !jobId || !candidatesUploaded}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xl py-5 px-16 rounded-full shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
        >
          {loading ? 'Crunching Data...' : <><Play size={28} fill="currentColor" /> Rank Candidates</>}
        </button>
      </div>

      {/* Results Section - Advanced Side-by-Side Layout */}
      {results.length > 0 && (
        <div ref={resultsRef} className="pt-4 scroll-mt-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500 tracking-tight">AI Ranking Results</h2>
            <a 
              href={getResultsCsvUrl()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:-translate-y-1"
            >
              <Download size={22} /> Export CSV Report
            </a>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Table taking 2/3 of space */}
            <div className="xl:col-span-2 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl">
              <CandidateTable 
                candidates={results} 
                onSelectCandidate={setSelectedCandidate} 
                selectedId={selectedCandidate?.candidateId}
              />
            </div>
            
            {/* Details taking 1/3 of space immediately visible */}
            <div className="xl:col-span-1">
              <div className="sticky top-8 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl shadow-2xl overflow-hidden h-[800px] flex flex-col">
                <div className="p-6 bg-slate-800/50 border-b border-slate-800">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <BrainCircuit className="text-purple-400" /> Explainable AI Insights
                  </h3>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                  {selectedCandidate ? (
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-2xl font-bold text-white mb-1">{selectedCandidate.candidateName}</h4>
                          <span className="text-blue-400 font-medium">Rank #{selectedCandidate.rank}</span>
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl font-bold text-emerald-400 shadow-lg shadow-emerald-500/10">
                          {selectedCandidate.finalScore}
                        </div>
                      </div>
                      
                      <div className="prose prose-invert prose-slate max-w-none prose-p:leading-relaxed prose-p:text-slate-300">
                        <p className="text-lg whitespace-pre-wrap">{selectedCandidate.reasons}</p>
                      </div>
                      
                      <div className="space-y-4 pt-6 border-t border-slate-800/50">
                        <div>
                          <h5 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Matched Skills</h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedCandidate.matchingSkills?.length > 0 ? (
                              selectedCandidate.matchingSkills.map(s => (
                                <span key={s} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500 text-sm italic">No exact matches</span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Missing Skills</h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedCandidate.missingSkills?.length > 0 ? (
                              selectedCandidate.missingSkills.map(s => (
                                <span key={s} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500 text-sm italic">None missing!</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                      <BrainCircuit size={48} className="opacity-50" />
                      <p>Select a candidate to view AI reasoning</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
