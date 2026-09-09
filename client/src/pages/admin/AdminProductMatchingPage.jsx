import React, { useEffect, useState } from 'react';
import { GitCompare, CheckCircle2, XCircle, Edit, Sparkles, ShieldCheck } from 'lucide-react';
import API from '../../services/api';
import { formatINR } from '../../utils/formatters';

const AdminProductMatchingPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [threshold, setThreshold] = useState(80);
  const [loading, setLoading] = useState(true);

  const loadMatches = async () => {
    try {
      const res = await API.get('/admin/product-matching');
      setCandidates(res.data.data || []);
      setThreshold(res.data.threshold || 80);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const handleApprove = async (id) => {
    try {
      await API.post(`/admin/product-matching/${id}/approve`);
      loadMatches();
    } catch (err) {
      alert('Approval failed');
    }
  };

  const handleReject = async (id) => {
    try {
      await API.post(`/admin/product-matching/${id}/reject`);
      loadMatches();
    } catch (err) {
      alert('Rejection failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-emerald-400" /> Automated Product Matching Engine
          </h2>
          <p className="text-xs text-slate-400">
            Review candidate store listings identified as identical products based on Brand, Model, Storage, RAM, and Color similarity.
          </p>
        </div>
        <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-xs font-bold text-slate-300">
          Auto-Group Threshold: <span className="text-emerald-400 font-extrabold">{threshold}% Match Score</span>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-400 text-xs font-medium">Loading candidate matches...</div>
      ) : candidates.length === 0 ? (
        <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Product Matching Queue Clear</h3>
          <p className="text-xs text-slate-400">All store product listings have been reviewed and grouped.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {candidates.map((match) => {
            const mId = match.id || match._id;
            return (
              <div key={mId} className="bg-slate-950 rounded-3xl border border-slate-800 p-6 space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold px-3 py-1 rounded-full">
                      Match Confidence Score: {match.matchScore || match.confidence || 85}%
                    </span>
                    <span className="text-xs text-slate-400">Candidate Match Request ID: {mId}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(mId)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve Match
                    </button>
                    <button
                      onClick={() => handleReject(mId)}
                      className="bg-slate-800 hover:bg-rose-900/50 hover:text-rose-300 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>

              {/* CANDIDATE SIDE BY SIDE COMPARISON */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                
                {/* Product A */}
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 font-bold uppercase">
                    <span>Listing Candidate A</span>
                    <span className="text-emerald-400 font-extrabold">{match.productA?.store}</span>
                  </div>
                  <h4 className="font-extrabold text-white text-sm">{match.productA?.name}</h4>
                  <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800">
                    <span>Listed Price:</span>
                    <span className="font-bold text-white">{formatINR(match.productA?.price)}</span>
                  </div>
                </div>

                {/* Product B */}
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 font-bold uppercase">
                    <span>Listing Candidate B</span>
                    <span className="text-cyan-400 font-extrabold">{match.productB?.store}</span>
                  </div>
                  <h4 className="font-extrabold text-white text-sm">{match.productB?.name}</h4>
                  <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800">
                    <span>Listed Price:</span>
                    <span className="font-bold text-white">{formatINR(match.productB?.price)}</span>
                  </div>
                </div>

              </div>

            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};

export default AdminProductMatchingPage;
