import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { User, Mail, Lock, UserPlus, AlertCircle, Eye, EyeOff, Loader2, ArrowLeft, ShieldCheck, ChevronDown } from 'lucide-react';
import { registerUser, clearError } from '../../redux/slices/authSlice';

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user, loading, error } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
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
    dispatch(registerUser({ name, email, password, role }));
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-slate-50">
      {/* Ambient background blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 xs:p-8 sm:p-10 max-w-md w-full space-y-6 relative backdrop-blur-md">
        
        {/* Return to Home link */}
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
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Join thousands of smart shoppers comparing prices and saving money daily.
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
              Full Name
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 text-slate-900 text-sm font-medium rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all"
              />
            </div>
          </div>

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
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
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

          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
              Account Role
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full appearance-none bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 text-slate-900 text-sm font-medium rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all cursor-pointer"
              >
                <option value="user">User Account (Price Tracking & Alerts)</option>
                <option value="admin">Administrator Account (Store & Scraper Management)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:bg-right bg-[length:150%_auto] text-white font-extrabold text-sm rounded-xl shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create PriceHunt Account</span>
              </>
            )}
          </button>
        </form>

        {/* Bottom Switch Link */}
        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          Already have an account?{' '}
          <Link to="/login" className="font-extrabold text-emerald-600 hover:text-emerald-700 hover:underline">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
