'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../app/context/AuthContext';
import { useTheme } from '../app/context/ThemeContext';
import { Sun, Moon, Menu, X, User, LogOut, LayoutDashboard, Award } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    ...(user ? [{ name: 'AI Generator', href: '/generator' }] : []),
    { name: 'Services', href: '/services' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
    { name: 'Reviews', href: '/feedback' },
    { name: 'Contact', href: '/contact' },
  ];

  const activeLinkStyle = "text-primary font-medium border-b-2 border-primary";
  const inactiveLinkStyle = "text-foreground/80 hover:text-primary transition-colors duration-200";

  return (
    <nav className="sticky top-0 z-50 w-full glass-luxury border-b transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                DECOR<span className="text-foreground">AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`py-2 text-sm tracking-wide ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Action Buttons: Theme toggle & Auth */}
          <div className="hidden lg:flex items-center space-x-4">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-foreground/80 hover:text-primary transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Auth Buttons / Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full border border-primary/20 hover:border-primary transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm uppercase shrink-0">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm font-medium mr-1 text-foreground hidden xl:inline-block">
                    {user.displayName.split(' ')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-3 w-56 rounded-xl border border-primary/10 bg-background shadow-xl p-2 z-20"
                        style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                      >
                        <div className="px-3 py-2 border-b border-foreground/5 mb-1">
                          <p className="text-xs text-foreground/60">Signed in as</p>
                          <p className="text-sm font-semibold truncate text-foreground">{user.email}</p>
                          <span className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-primary/10 text-primary font-bold rounded-full capitalize">
                            {user.subscription.plan} Plan
                          </span>
                        </div>

                        <Link
                          href="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          User Dashboard
                        </Link>

                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          >
                            <Award className="w-4 h-4 text-primary" />
                            Admin Console
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/5 rounded-lg transition-colors mt-1 pt-2 border-t border-foreground/5"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-foreground/80 hover:text-primary transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-primary hover:bg-primary-dark text-white shadow-md shadow-primary/20 hover:shadow-lg transition-all duration-300 transform hover:-y-0.5"
                >
                  Start Designing
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburguer Menu Button */}
          <div className="lg:hidden flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-foreground/80 hover:text-primary transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-foreground hover:text-primary hover:bg-primary/5 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-b border-foreground/5 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2.5 rounded-lg text-base tracking-wide ${
                      isActive 
                        ? "bg-primary/10 text-primary font-semibold" 
                        : "text-foreground/80 hover:bg-primary/5 hover:text-primary"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              
              <div className="pt-4 border-t border-foreground/5 space-y-2">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-3 rounded-lg text-foreground/85 hover:bg-primary/5 hover:text-primary"
                    >
                      <LayoutDashboard className="w-5 h-5 text-primary" />
                      User Dashboard
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-3 rounded-lg text-foreground/85 hover:bg-primary/5 hover:text-primary"
                      >
                        <Award className="w-5 h-5 text-primary" />
                        Admin Console
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 px-3 py-3 rounded-lg text-danger hover:bg-danger/5"
                    >
                      <LogOut className="w-5 h-5" />
                      Log Out
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-2 px-3">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 text-center text-sm font-semibold rounded-lg border border-foreground/10 text-foreground hover:bg-primary/5"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 text-center text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-dark"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
