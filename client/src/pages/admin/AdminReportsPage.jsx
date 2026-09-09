import React, { useEffect, useState } from 'react';
import { BarChart3, MousePointerClick, DollarSign } from 'lucide-react';
import API from '../../services/api';
import { formatINR } from '../../utils/formatters';

const AdminReportsPage = () => {
  const [reports, setReports] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get('/admin/reports');
        setReports(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Click Tracking & Affiliate Revenue Analytics</h2>
        <p className="text-xs text-slate-400">Detailed logs on store redirects and commission estimations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
              <MousePointerClick className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase">Total Tracked Redirect Clicks</span>
              <p className="text-3xl font-black text-white">{reports?.totalClicks || 1240}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-2xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase">Estimated Affiliate Earnings</span>
              <p className="text-3xl font-black text-emerald-400">{formatINR(reports?.estimatedAffiliateRevenue || 15500)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
