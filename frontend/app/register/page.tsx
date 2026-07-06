'use client';

import React, { useState, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, RefreshCw, AlertCircle } from 'lucide-react';

function RegisterForm() {
  const { register, loginWithGoogle, loginWithApple, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/generator';

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      router.push(redirectTo);
    }
  }, [user, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) return;

    setLoading(true);
    setError(null);
    try {
      await register(email, password, displayName);
      router.push(redirectTo);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      router.push(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Google registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithApple();
      router.push(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Apple registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-background font-sans py-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-3xl glass-luxury border shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-wider bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            DECOR<span className="text-foreground">AI</span>
          </Link>
          <h2 className="text-2xl font-bold tracking-wide font-playfair pt-1">Create Account</h2>
          <p className="text-xs text-foreground/50">Register for free and start generating rooms.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-foreground/80 flex items-center gap-1.5">
              <User className="w-4 h-4 text-primary" /> Full Name
            </label>
            <input
              type="text"
              placeholder="Alexander Sterling"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-secondary/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-3.5 py-3 focus:outline-none focus:border-primary text-foreground"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-foreground/80 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-primary" /> Email Address
            </label>
            <input
              type="email"
              placeholder="client@decorai.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-secondary/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-3.5 py-3 focus:outline-none focus:border-primary text-foreground"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-foreground/80 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-primary" /> Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-secondary/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-3.5 py-3 focus:outline-none focus:border-primary text-foreground"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-xs text-danger flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/10 hover:shadow-lg"
          >
            {loading ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : 'Register'}
          </button>

        </form>

        {/* Social auth */}
        <div className="space-y-4 pt-2">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-foreground/10"></div>
            <span className="flex-shrink mx-4 text-foreground/45 text-xs font-semibold uppercase tracking-wider">Or continue with</span>
            <div className="flex-grow border-t border-foreground/10"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="py-3 border border-foreground/10 hover:border-primary rounded-xl text-xs font-semibold flex items-center justify-center gap-2 bg-secondary/5 dark:bg-white/5 text-foreground cursor-pointer"
            >
              Google
            </button>
            <button
              onClick={handleAppleLogin}
              disabled={loading}
              className="py-3 border border-foreground/10 hover:border-primary rounded-xl text-xs font-semibold flex items-center justify-center gap-2 bg-secondary/5 dark:bg-white/5 text-foreground cursor-pointer"
            >
              Apple
            </button>
          </div>
        </div>

        {/* Bottom link */}
        <div className="text-center text-xs text-foreground/50 border-t border-foreground/5 pt-4">
          Already have an account? 
          <Link href="/login" className="text-primary font-bold ml-1 hover:underline">
            Log In
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
