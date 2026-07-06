'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { ArrowLeft, Mail, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await forgotPassword(email);
      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send recovery email. Please check the address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-background font-sans py-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-3xl glass-luxury border shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground/60 hover:text-primary mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h2 className="text-2xl font-bold tracking-wide font-playfair">Recover Password</h2>
          <p className="text-xs text-foreground/50">Enter your email and we'll send reset instructions.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          
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

          {error && (
            <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-xs text-danger flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-xs text-success flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Recovery link sent! Check your inbox for instructions.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/10 hover:shadow-lg"
          >
            {loading ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : 'Send Reset Link'}
          </button>

        </form>

        {/* Bottom link */}
        <div className="text-center text-xs text-foreground/50 border-t border-foreground/5 pt-4">
          Remember password? 
          <Link href="/login" className="text-primary font-bold ml-1 hover:underline">
            Log In
          </Link>
        </div>

      </div>
    </div>
  );
}
