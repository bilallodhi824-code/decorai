'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Send, Instagram, Twitter, Facebook, CheckCircle } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setSubscribed(true);
      setLoading(false);
      setEmail('');
    }, 1200);
  };

  return (
    <footer className="bg-secondary text-neutral-300 border-t border-white/5 font-sans">
      
      {/* Upper Grid Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                DECOR<span className="text-white">AI</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-neutral-400">
              Redefining spaces using state-of-the-art Artificial Intelligence. From style generation to complete layout recommendations, DecorAI brings luxury interior designs to your fingertips.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2.5 rounded-full bg-white/5 hover:bg-primary/20 text-neutral-400 hover:text-primary transition-all duration-300" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 rounded-full bg-white/5 hover:bg-primary/20 text-neutral-400 hover:text-primary transition-all duration-300" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 rounded-full bg-white/5 hover:bg-primary/20 text-neutral-400 hover:text-primary transition-all duration-300" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Explore */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg tracking-wider relative pb-2 before:absolute before:bottom-0 before:left-0 before:w-8 before:h-0.5 before:bg-primary">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/generator" className="hover:text-primary hover:translate-x-1 inline-block transition-all">
                  AI Design Generator
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-primary hover:translate-x-1 inline-block transition-all">
                  Premium Services
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-primary hover:translate-x-1 inline-block transition-all">
                  Inspiration Gallery
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-primary hover:translate-x-1 inline-block transition-all">
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Company links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg tracking-wider relative pb-2 before:absolute before:bottom-0 before:left-0 before:w-8 before:h-0.5 before:bg-primary">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-primary hover:translate-x-1 inline-block transition-all">
                  About Our Studio
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary hover:translate-x-1 inline-block transition-all">
                  Decor Insights Blog
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="hover:text-primary hover:translate-x-1 inline-block transition-all">
                  Client Reviews
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary hover:translate-x-1 inline-block transition-all">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg tracking-wider relative pb-2 before:absolute before:bottom-0 before:left-0 before:w-8 before:h-0.5 before:bg-primary">
              Newsletter
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Subscribe to receive luxury styling tips, trend analyses, and exclusive product releases.
            </p>
            
            {subscribed ? (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Thank you! You have subscribed successfully.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative flex items-center mt-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-white placeholder-neutral-500 pr-12 transition-all"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-1 p-2 rounded-md hover:bg-primary bg-white/5 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* Under Area */}
      <div className="border-t border-white/5 bg-black/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            &copy; {new Date().getFullYear()} DecorAI Inc. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Terms of Service</a>
            <a href="#" className="hover:text-primary">Security Settings</a>
          </div>
        </div>
      </div>

    </footer>
  );
}
