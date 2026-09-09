import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, Loader2, ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';
import { loginUser, clearError } from '../../redux/slices/authSlice';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user, loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(clearError());
    if (isAuthenticated && user) {
      if (user.role === 'admin' || user.role === 'superadmin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-slate-50">
      {/* Background ambient gradient blurs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 xs:p-8 sm:p-10 max-w-md w-full space-y-6 relative backdrop-blur-md">
        
        {/* Top return link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <img 
            src="/pricehunt-logo.png" 
            alt="PriceHunt" 
            className="h-12 w-auto object-contain mx-auto" 
          />
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Welcome Back to <span className="text-emerald-600">PriceHunt</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Sign in to track live prices, wishlist deals & receive instant price alerts.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Credentials Helper */}
        <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-2 text-xs">
          <div>
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Admin Demo Account
            </span>
            <span className="text-slate-500 font-mono text-[11px] block mt-0.5">admin@pricehunt.com</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setEmail('admin@pricehunt.com');
              setPassword('Admin@12345');
            }}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-xs hover:shadow active:scale-95 cursor-pointer shrink-0"
          >
            Auto-Fill
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 text-slate-900 text-sm font-medium rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                Password
              </label>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 text-slate-900 text-sm font-medium rounded-xl pl-10 pr-11 py-2.5 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:bg-right bg-[length:150%_auto] text-white font-extrabold text-sm rounded-xl shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to PriceHunt</span>
              </>
            )}
          </button>
        </form>

        {/* Bottom Switch Link */}
        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          Don't have an account?{' '}
          <Link to="/register" className="font-extrabold text-emerald-600 hover:text-emerald-700 hover:underline">
            Register Here Free
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
