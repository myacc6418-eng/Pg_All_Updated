import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { usePGFinder } from '../../context/PGFinderContext';
import { isValidIndianMobile } from '../../utils/formatters';
import { INDIAN_CITIES } from '../../data/demoData';
import { ThemeSwitch } from '../../components/ui/Primitives';

export const AuthPage: React.FC = () => {
  const { loginUser, registerUser, switchDemoRole } = usePGFinder();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [role, setRole] = useState<'TENANT' | 'PG_OWNER'>('TENANT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const navigateForRole = (userRole: 'TENANT' | 'PG_OWNER' | 'SUPER_ADMIN') => {
    if (redirectPath) {
      navigate(redirectPath);
      return;
    }
    if (userRole === 'TENANT') navigate('/tenant/home');
    else if (userRole === 'PG_OWNER') navigate('/owner/dashboard');
    else navigate('/admin/dashboard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (mode === 'forgot') {
      if (!email.trim()) {
        setError('Please enter your registered email address.');
        return;
      }
      setInfo('If an account exists for that email, a password reset instruction has been sent (UI prototype).');
      return;
    }

    if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        setError('Please enter both email and password.');
        return;
      }
      const user = loginUser(email, role);
      navigateForRole(user.role);
      return;
    }

    if (!name.trim()) return setError('Full name is required.');
    if (!email.includes('@')) return setError('Enter a valid email address.');
    if (!isValidIndianMobile(mobile)) return setError('Enter a valid 10-digit Indian mobile number.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (!acceptedTerms) return setError('Please accept the Terms and Privacy Policy.');

    const created = registerUser({ name, email, mobile: `+91 ${mobile.replace(/\D/g, '').slice(-10)}`, role, city });
    navigateForRole(created.role);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] text-[#111827] dark:text-[#F9FAFB] flex flex-col">
      <header className="h-14 border-b border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] px-4 sm:px-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-bold font-display text-[#047857] dark:text-[#34D399]">PG Finder</span>
        </button>
        <ThemeSwitch compact />
      </header>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] dark:border-[#374151] bg-white dark:bg-[#111827] p-6">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F8FAFC] dark:bg-[#0B1220] border border-[#E2E8F0] dark:border-[#374151] mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setInfo('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'login'
                  ? 'bg-white dark:bg-[#1F2937] text-[#111827] dark:text-[#F9FAFB] shadow-xs'
                  : 'text-[#64748B] dark:text-[#9CA3AF]'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
                setInfo('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'register'
                  ? 'bg-white dark:bg-[#1F2937] text-[#111827] dark:text-[#F9FAFB] shadow-xs'
                  : 'text-[#64748B] dark:text-[#9CA3AF]'
              }`}
            >
              Register
            </button>
          </div>

          <h1 className="text-xl font-bold font-display">
            {mode === 'login' ? 'Sign in to PG Finder' : mode === 'register' ? 'Create your account' : 'Reset password'}
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#9CA3AF] mt-1">
            {mode === 'register'
              ? 'Public registration is available for Tenants and PG Owners.'
              : 'Access your Tenant stay, PG Owner console, or Admin workspace.'}
          </p>

          {mode !== 'forgot' && (
            <div className="mt-4">
              <div className="text-xs font-medium text-[#64748B] dark:text-[#9CA3AF] mb-1.5">
                {mode === 'register' ? 'Register as' : 'Account type'}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { value: 'TENANT', label: 'Tenant' },
                    { value: 'PG_OWNER', label: 'PG Owner' },
                  ] as const
                ).map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                      role === r.value
                        ? 'border-[#047857] dark:border-[#34D399] bg-[#047857]/10 dark:bg-[#34D399]/15 text-[#047857] dark:text-[#34D399]'
                        : 'border-[#E2E8F0] dark:border-[#374151] text-[#64748B] dark:text-[#9CA3AF]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Ananya Sharma"
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Indian Mobile (+91)</label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="98450 21490"
                      className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-sm font-mono-num"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">City</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-sm"
                    >
                      {INDIAN_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.in"
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-sm"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] font-medium text-[#047857] dark:text-[#34D399] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 pl-3 pr-10 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    aria-label="Toggle password visibility"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B]"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#374151] bg-[#F8FAFC] dark:bg-[#1F2937] text-sm"
                  />
                </div>
                <label className="flex items-start gap-2 text-xs text-[#64748B] dark:text-[#9CA3AF] pt-1">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 accent-[#047857]"
                  />
                  <span>I accept PG Finder Terms &amp; Conditions and Privacy Policy.</span>
                </label>
              </>
            )}

            {error && (
              <div className="p-2.5 rounded-xl bg-[#DC2626]/10 text-[#DC2626] dark:text-[#F87171] text-xs font-medium">
                {error}
              </div>
            )}
            {info && (
              <div className="p-2.5 rounded-xl bg-[#059669]/10 text-[#059669] dark:text-[#34D399] text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{info}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#047857] hover:bg-[#065F46] dark:bg-[#34D399] dark:hover:bg-[#10B981] text-white dark:text-[#0B1220] text-sm font-semibold transition-colors"
            >
              {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="mt-3 w-full text-center text-xs font-medium text-[#64748B] hover:text-[#111827] dark:hover:text-[#F9FAFB]"
            >
              Back to Sign In
            </button>
          )}

          {/* Prototype Demo Quick Switch */}
          <div className="mt-6 pt-4 border-t border-[#E2E8F0] dark:border-[#374151]">
            <div className="text-[11px] font-medium text-[#64748B] dark:text-[#9CA3AF] mb-2">
              Demo Mode Quick Access (UI Prototype)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  switchDemoRole('TENANT');
                  navigateForRole('TENANT');
                }}
                className="py-2 px-2 rounded-lg border border-[#E2E8F0] dark:border-[#374151] text-xs font-medium hover:border-[#047857] dark:hover:border-[#34D399]"
              >
                Tenant
              </button>
              <button
                type="button"
                onClick={() => {
                  switchDemoRole('PG_OWNER');
                  navigateForRole('PG_OWNER');
                }}
                className="py-2 px-2 rounded-lg border border-[#E2E8F0] dark:border-[#374151] text-xs font-medium hover:border-[#047857] dark:hover:border-[#34D399]"
              >
                PG Owner
              </button>
              <button
                type="button"
                onClick={() => {
                  switchDemoRole('SUPER_ADMIN');
                  navigateForRole('SUPER_ADMIN');
                }}
                className="py-2 px-2 rounded-lg border border-[#E2E8F0] dark:border-[#374151] text-xs font-medium hover:border-[#047857] dark:hover:border-[#34D399]"
              >
                Super Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
