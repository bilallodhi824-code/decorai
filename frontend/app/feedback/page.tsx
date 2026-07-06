'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPost } from '../services/api';
import { Star, MessageSquare, Plus, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReviewItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function FeedbackPage() {
  const { user } = useAuth();
  
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await apiGet<ReviewItem[]>('/feedback');
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    if (!user) {
      setError('Please sign in to submit a review.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const newReview = await apiPost<ReviewItem>('/feedback', {
        rating,
        comment
      });
      
      setReviews(prev => [newReview, ...prev]);
      setSuccess(true);
      setComment('');
      setRating(5);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-background font-sans py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
      
      {/* Left Column: Form & aggregate stats */}
      <div className="lg:col-span-4 space-y-8">
        
        {/* Form Container */}
        <div className="p-6 rounded-2xl glass-luxury border flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-foreground/5 pb-3">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold tracking-wide">Write a Review</h2>
          </div>

          {!user ? (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs text-foreground/80 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>You must be logged in to submit a review.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              
              {/* Star Picker */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-foreground/85">Your Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-primary hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star className={`w-6 h-6 ${rating >= star ? 'fill-current' : 'text-foreground/20'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-foreground/85">Your Feedback</label>
                <textarea
                  placeholder="Share your transformation story, quality of suggestions, or speed..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  required
                  className="w-full bg-secondary/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-3.5 py-3 focus:outline-none focus:border-primary text-foreground resize-none"
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
                  <span>Thank you! Review posted successfully.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/10 hover:shadow-lg"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4.5 h-4.5 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Plus className="w-4.5 h-4.5" /> Submit Review
                  </>
                )}
              </button>

            </form>
          )}

        </div>

      </div>

      {/* Right Column: Reviews feeds */}
      <div className="lg:col-span-8 space-y-6">
        <div className="border-b border-foreground/5 pb-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold font-playfair tracking-wide">Client Testimonials</h1>
          <p className="text-sm text-foreground/60 mt-1">Read reviews from verified DecorAI designers.</p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 rounded-2xl border border-foreground/5 shimmer bg-secondary/5" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-2xl border border-foreground/5 bg-background shadow-sm space-y-4"
              >
                
                {/* User avatar & Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {rev.userAvatar ? (
                      <img
                        src={rev.userAvatar}
                        alt={rev.userName}
                        className="w-10 h-10 rounded-full object-cover border border-primary/20 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-base uppercase border border-primary/20 shrink-0">
                        {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm">{rev.userName}</h4>
                      <p className="text-[10px] text-foreground/50">{new Date(rev.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 text-primary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-foreground/10'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Comment text */}
                <p className="text-sm text-foreground/80 leading-relaxed font-light pl-13">
                  "{rev.comment}"
                </p>

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
