import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, User, Lock, Sparkles, ArrowRight } from 'lucide-react';

export default function Login(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const {login} = useAuth();
  const nav = useNavigate();

  const submit = async (e)=>{
    e.preventDefault();
    setLoading(true);
    setError('');

    try{
      const {data} = await api.post('/api/auth/login', {username, password});
      login(data.token, data.role);
      nav(data.role==='ADMIN'? '/admin' : '/browse');
    } catch(err){
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pastel-gradient flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-pastel-blue-300 to-pastel-lavender-300 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-pastel-lg hover:scale-110 transition-transform duration-300">
            <LogIn className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-pastel-blue-600 to-pastel-lavender-600 bg-clip-text text-transparent">Welcome Back</h2>
          <p className="mt-3 text-gray-600 font-medium">Sign in to your MediCare account</p>
        </div>

        {/* Login Form */}
        <div className="card-pastel p-8">
          {error && (
            <div className="mb-6 bg-pastel-pink-50 border-2 border-pastel-pink-200 rounded-2xl p-4 flex items-center animate-bounce-in">
              <div className="w-8 h-8 rounded-full bg-pastel-pink-200 flex items-center justify-center mr-3">
                <span className="text-pastel-pink-600 text-sm">!</span>
              </div>
              <p className="text-pastel-pink-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="input-pastel w-full pl-12"
                  placeholder="Enter your username"
                  value={username}
                  onChange={e=>setUsername(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-pastel-blue-400" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input-pastel w-full pl-12"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e=>setPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-pastel-lavender-400" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-pastel-primary w-full group ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-pastel-blue-600 hover:text-pastel-lavender-600 transition-colors duration-200"
              >
                Create one now
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-5 bg-gradient-to-br from-pastel-blue-50 to-pastel-lavender-50 rounded-2xl border border-pastel-blue-200">
            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
              <Sparkles className="w-4 h-4 text-pastel-blue-500 mr-2" />
              Demo Credentials
            </h4>
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex items-center justify-between p-2 bg-white/60 rounded-xl">
                <span className="font-medium">Admin:</span>
                <code className="text-pastel-blue-600 bg-pastel-blue-100 px-2 py-1 rounded">admin / password</code>
              </div>
              <div className="flex items-center justify-between p-2 bg-white/60 rounded-xl">
                <span className="font-medium">Customer:</span>
                <code className="text-pastel-lavender-600 bg-pastel-lavender-100 px-2 py-1 rounded">alice / password</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
