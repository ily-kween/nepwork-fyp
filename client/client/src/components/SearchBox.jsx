import React, { useState } from 'react';
import { FiSearch, FiArrowRight, FiSliders, FiX, FiCheck } from "react-icons/fi";
import { useNavigate } from 'react-router';

const SearchBox = ({ type, className = "" }) => {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const isClient = type === 'client';
  
  const placeholder = isClient 
    ? 'Search experts (e.g. "Senior React Developer")...' 
    : 'Search high-impact projects (e.g. "E-commerce Build")...';

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Main Search Input */}
      <form 
        onSubmit={handleSearch}
        className="relative flex items-center bg-white border border-slate-200 rounded-[32px] p-2 pr-4 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 group-focus-within:ring-4 group-focus-within:ring-primary/5 group-focus-within:border-primary/40 ring-1 ring-slate-100"
      >
        <div className="pl-6 pr-4 text-slate-400 group-focus-within:text-primary transition-colors">
          <FiSearch className="text-xl" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent py-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />

        <div className="flex items-center gap-3">
            <button
                type="button"
                onClick={() => setShowFilters(true)}
                className="hidden sm:flex items-center gap-2 h-12 px-6 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-900 transition-all text-[10px] font-black uppercase tracking-widest border border-slate-100"
            >
                <FiSliders /> Filters
            </button>
            
            <button 
                type="submit"
                className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
            >
                <FiArrowRight className="text-xl" />
            </button>
        </div>
      </form>

      {/* Filter Modal Overlay */}
      {showFilters && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden transform animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 border-b border-slate-50">
               <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Refine Discovery</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Target specific project parameters</p>
               </div>
               <button 
                 onClick={() => setShowFilters(false)}
                 className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"
               >
                 <FiX className="text-xl" />
               </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-10">
               {/* Budget Segment */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Budget Estimation</h3>
                     <span className="text-[10px] font-black text-primary uppercase">NPR</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Min Range</label>
                        <input type="number" placeholder="5,000" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:bg-white focus:border-primary/40 outline-none transition-all" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Max Range</label>
                        <input type="number" placeholder="50,000" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:bg-white focus:border-primary/40 outline-none transition-all" />
                     </div>
                  </div>
               </div>

               {/* Category Selection */}
               <div className="space-y-6">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Specialization Focus</h3>
                  <div className="flex flex-wrap gap-2">
                     {['Development', 'Visual Arts', 'Marketing', 'FinTech', 'Writing'].map(cat => (
                        <button key={cat} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-primary hover:text-primary transition-all">
                           {cat}
                        </button>
                     ))}
                  </div>
               </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
               <button 
                  onClick={() => setShowFilters(false)}
                  className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900"
               >
                  Reset Defaults
               </button>
               <button 
                  onClick={() => setShowFilters(false)}
                  className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-widest"
               >
                  <FiCheck className="text-lg" /> Apply Parameters
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBox;
