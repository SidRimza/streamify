'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';
import { FiMenu, FiX, FiSun, FiMoon, FiUser, FiLogOut, FiTv } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-dark-200 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <FiTv className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold gradient-text">Streamify</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">
              Home
            </Link>
            
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <Link href="/admin" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">
                      Dashboard
                    </Link>
                    <Link href="/watch" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">
                      Watch
                    </Link>
                  </>
                )}
                <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-300 dark:border-gray-600">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{user.name}</span>
                  <button onClick={logout} className="text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors" aria-label="Logout">
                    <FiLogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">
                  Login
                </Link>
                <Link href="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
            
            <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors" aria-label="Toggle dark mode">
              {darkMode ? <FiSun className="h-5 w-5 text-yellow-500" /> : <FiMoon className="h-5 w-5 text-gray-600" />}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button onClick={toggleDarkMode} className="p-2" aria-label="Toggle dark mode">
              {darkMode ? <FiSun className="h-5 w-5 text-yellow-500" /> : <FiMoon className="h-5 w-5" />}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2" aria-label="Toggle menu">
              {mobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-dark-200 border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 space-y-3">
            <Link href="/" className="block text-gray-700 dark:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <Link href="/admin" className="block text-gray-700 dark:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/dashboard" className="block text-gray-700 dark:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                      Dashboard
                    </Link>
                    <Link href="/watch" className="block text-gray-700 dark:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                      Watch
                    </Link>
                  </>
                )}
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="flex items-center space-x-2 text-red-500">
                  <FiLogOut /> <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-gray-700 dark:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className="block btn-primary text-center" onClick={() => setMobileMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
