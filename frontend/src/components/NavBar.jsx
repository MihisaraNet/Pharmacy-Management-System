import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Pill, ShoppingCart, Settings, Sun, Moon, LogIn, UserPlus, LogOut } from 'lucide-react';

export default function NavBar(){
  const {user, logout} = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const nav = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartAnimating, setIsCartAnimating] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('👋 Successfully logged out!', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    nav('/login');
    setIsMobileMenuOpen(false);
  };

  const isActiveLink = (path) => location.pathname === path;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-pastel-lg border-b border-pastel-blue-100'
          : 'bg-white/70 backdrop-blur-lg shadow-pastel'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <Link
                to="/"
                className="flex items-center space-x-3 group"
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br from-pastel-blue-300 to-pastel-lavender-300 shadow-pastel group-hover:shadow-pastel-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Pill className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-pastel-blue-600 to-pastel-lavender-600 bg-clip-text text-transparent">
                  MediCare
                </span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 rounded-2xl bg-pastel-blue-50 text-pastel-blue-600 hover:bg-pastel-blue-100 transition-all duration-200"
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'
                  }`}></span>
                  <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}></span>
                  <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                    isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'
                  }`}></span>
                </div>
              </button>
            </div>

            {/* Main Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <Link
                to="/browse"
                className={`relative px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 group ${
                  isActiveLink('/browse')
                    ? 'bg-gradient-to-r from-pastel-blue-100 to-pastel-lavender-100 text-pastel-blue-700 shadow-pastel'
                    : 'text-gray-700 hover:bg-pastel-blue-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  Browse Medicines
                </span>
              </Link>
              <Link
                to="/cart"
                onClick={() => {
                  setIsCartAnimating(true);
                  setTimeout(() => setIsCartAnimating(false), 600);
                }}
                className={`relative px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 group ${
                  isActiveLink('/cart')
                    ? 'bg-gradient-to-r from-pastel-pink-100 to-pastel-peach-100 text-pastel-pink-700 shadow-pastel'
                    : 'text-gray-700 hover:bg-pastel-pink-50'
                }`}
              >
                <span className={`flex items-center gap-2 transition-transform duration-300 ${isCartAnimating ? 'scale-125' : ''}`}>
                  <ShoppingCart className="w-4 h-4" />
                  Cart
                </span>
              </Link>
              {user?.role==='ADMIN' && (
                <Link
                  to="/admin"
                  className={`relative px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 group ${
                    isActiveLink('/admin')
                      ? 'bg-gradient-to-r from-pastel-lavender-100 to-pastel-pink-100 text-pastel-lavender-700 shadow-pastel'
                      : 'text-gray-700 hover:bg-pastel-lavender-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Admin Panel
                  </span>
                </Link>
              )}
            </div>

            {/* Dark Mode Toggle & User Actions */}
            <div className="flex items-center space-x-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-2xl bg-pastel-blue-50 text-pastel-blue-600 hover:bg-pastel-blue-100 transition-all duration-300 hover:scale-110"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="px-5 py-2.5 rounded-2xl text-sm font-medium text-pastel-blue-600 hover:bg-pastel-blue-50 transition-all duration-300 flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 rounded-2xl text-sm font-medium bg-gradient-to-r from-pastel-blue-400 to-pastel-lavender-400 text-white hover:shadow-pastel-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </Link>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-pastel-blue-50 to-pastel-lavender-50">
                    <div className={`w-2 h-2 rounded-full ${
                      user.role === 'ADMIN' ? 'bg-pastel-lavender-400' : 'bg-pastel-blue-400'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2.5 rounded-2xl text-sm font-medium bg-gradient-to-r from-pastel-pink-400 to-pastel-peach-400 text-white hover:shadow-pastel-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-pastel-blue-100 shadow-pastel-lg transition-all duration-300 ${
            isMobileMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'
          }`}>
            <div className="px-4 py-6 space-y-3">
              <Link
                to="/browse"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium transition-all duration-200 ${
                  isActiveLink('/browse')
                    ? 'bg-gradient-to-r from-pastel-blue-100 to-pastel-lavender-100 text-pastel-blue-700'
                    : 'text-gray-700 hover:bg-pastel-blue-50'
                }`}
              >
                <Pill className="w-5 h-5" />
                Browse Medicines
              </Link>
              <Link
                to="/cart"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium transition-all duration-200 ${
                  isActiveLink('/cart')
                    ? 'bg-gradient-to-r from-pastel-pink-100 to-pastel-peach-100 text-pastel-pink-700'
                    : 'text-gray-700 hover:bg-pastel-pink-50'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                Cart
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium transition-all duration-200 ${
                    isActiveLink('/admin')
                      ? 'bg-gradient-to-r from-pastel-lavender-100 to-pastel-pink-100 text-pastel-lavender-700'
                      : 'text-gray-700 hover:bg-pastel-lavender-50'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  Admin Panel
                </Link>
              )}
              <hr className="border-pastel-blue-100" />
              {!user ? (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-center bg-white border border-pastel-blue-200 text-pastel-blue-600 rounded-2xl font-medium hover:bg-pastel-blue-50 transition-all duration-200"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-center bg-gradient-to-r from-pastel-blue-400 to-pastel-lavender-400 text-white rounded-2xl font-medium hover:shadow-pastel-lg transition-all duration-200"
                  >
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="px-4 py-2 text-center rounded-2xl bg-gradient-to-r from-pastel-blue-50 to-pastel-lavender-50">
                    <span className="text-gray-600">Welcome, </span>
                    <span className="font-medium text-pastel-blue-700">{user.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-center bg-gradient-to-r from-pastel-pink-400 to-pastel-peach-400 text-white rounded-2xl font-medium hover:shadow-pastel-lg transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}
