import { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, Check, ArrowRight, Sparkles } from 'lucide-react';

export default function Register(){
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e)=>{
    e.preventDefault();
    setMsg('');
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try{
      await api.post('/api/auth/register', {username, email, password});
      setMsg('🎉 Account created successfully! Redirecting to login...');
      setTimeout(()=>nav('/login'), 2000);
    } catch(err){
      setError('Registration failed. Username or email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pastel-gradient-2 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-pastel-mint-300 to-pastel-blue-300 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-pastel-lg hover:scale-110 transition-transform duration-300">
            <UserPlus className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-pastel-mint-600 to-pastel-blue-600 bg-clip-text text-transparent">Join MediCare</h2>
          <p className="mt-3 text-gray-600 font-medium">Create your account to start shopping</p>
        </div>

        {/* Register Form */}
        <div className="card-pastel p-8">
          {error && (
            <div className="mb-6 bg-pastel-pink-50 border-2 border-pastel-pink-200 rounded-2xl p-4 flex items-center animate-bounce-in">
              <div className="w-8 h-8 rounded-full bg-pastel-pink-200 flex items-center justify-center mr-3">
                <span className="text-pastel-pink-600 text-sm">!</span>
              </div>
              <p className="text-pastel-pink-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {msg && (
            <div className="mb-6 bg-pastel-mint-50 border-2 border-pastel-mint-200 rounded-2xl p-4 flex items-center animate-bounce-in">
              <div className="w-8 h-8 rounded-full bg-pastel-mint-200 flex items-center justify-center mr-3">
                <Check className="w-5 h-5 text-pastel-mint-600" />
              </div>
              <p className="text-pastel-mint-700 text-sm font-medium">{msg}</p>
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username *
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="input-pastel w-full pl-12"
                  placeholder="Choose a unique username"
                  value={username}
                  onChange={e=>setUsername(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-pastel-blue-400" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input-pastel w-full pl-12"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={e=>setEmail(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-pastel-mint-400" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input-pastel w-full pl-12"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={e=>setPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-pastel-lavender-400" />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-pastel-lavender-400"></span>
                Must be at least 6 characters long
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="input-pastel w-full pl-12"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={e=>setConfirmPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-pastel-pink-400" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-pastel-primary w-full group bg-gradient-to-r from-pastel-mint-400 to-pastel-blue-400 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-pastel-mint-600 hover:text-pastel-blue-600 transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>

          {/* Benefits */}
          <div className="mt-6 p-5 bg-gradient-to-br from-pastel-mint-50 to-pastel-blue-50 rounded-2xl border border-pastel-mint-200">
            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
              <Sparkles className="w-4 h-4 text-pastel-mint-500 mr-2" />
              Why Join MediCare?
            </h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-pastel-blue-200 flex items-center justify-center">
                  <Check className="w-3 h-3 text-pastel-blue-600" />
                </div>
                Easy online ordering
              </li>
              <li className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-pastel-mint-200 flex items-center justify-center">
                  <Check className="w-3 h-3 text-pastel-mint-600" />
                </div>
                Fast & free delivery
              </li>
              <li className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-pastel-lavender-200 flex items-center justify-center">
                  <Check className="w-3 h-3 text-pastel-lavender-600" />
                </div>
                Quality medicines
              </li>
              <li className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-pastel-pink-200 flex items-center justify-center">
                  <Check className="w-3 h-3 text-pastel-pink-600" />
                </div>
                Mobile-friendly experience
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
