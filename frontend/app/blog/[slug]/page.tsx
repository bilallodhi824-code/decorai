'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiGet } from '../../services/api';
import Link from 'next/link';
import { ArrowLeft, Clock, User, MessageSquare, Send, Compass, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BlogItem {
  id: string;
  slug: string;
  title: string;
  content: string;
  author: string;
  category: string;
  image: string;
  readTime: string;
  createdAt: string;
  commentsCount: number;
}

interface Comment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  date: string;
}

export default function BlogPostDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (slug) {
      fetchBlogDetail();
    }
  }, [slug]);

  const fetchBlogDetail = async () => {
    setLoading(true);
    try {
      const data = await apiGet<BlogItem>(`/blogs/${slug}`);
      setBlog(data);
      
      // Seed mock comments for the post
      setComments([
        {
          id: 'c1',
          authorName: 'Muhammad Bilal',
          authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&h=256&fit=crop',
          content: 'This color combination works spectacularly in north-facing bedrooms. The soft champagne reflecting off gold trim provides natural ambient lighting even during overcast winter mornings.',
          date: '3 days ago'
        },
        {
          id: 'c2',
          authorName: 'Muhammad Bilal',
          authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&fit=crop',
          content: 'Excellent write-up! I especially loved the breakdown of contrast ratios. Combining dark oak with greige wall wraps is a design system standard we use in all our high-end residential stagings.',
          date: '1 day ago'
        }
      ]);
    } catch (err) {
      console.error('Error fetching blog detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      authorName: user?.displayName || user?.email.split('@')[0] || 'Anonymous Designer',
      authorAvatar: user?.photoURL || '',
      content: commentText,
      date: 'Just now'
    };

    setComments(prev => [...prev, newComment]);
    setCommentText('');
  };

  if (loading) {
    return (
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-20 space-y-6">
        <div className="h-6 w-24 bg-secondary/5 shimmer rounded" />
        <div className="h-12 w-full bg-secondary/5 shimmer rounded" />
        <div className="h-[350px] w-full bg-secondary/5 shimmer rounded-2xl" />
        <div className="h-40 w-full bg-secondary/5 shimmer rounded-xl" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-primary" />
        <h3 className="text-xl font-bold">Article not found</h3>
        <p className="text-sm text-foreground/60">The blog post you are looking for has been moved or deleted.</p>
        <Link href="/blog" className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Blog Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full bg-background font-sans py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      
      {/* Back button */}
      <div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground/60 hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blog Feed
        </Link>
      </div>

      {/* Hero Header */}
      <div className="space-y-4">
        <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full">
          {blog.category}
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-playfair text-foreground leading-tight">
          {blog.title}
        </h1>
        <div className="flex items-center gap-5 text-xs text-foreground/50 border-b border-foreground/5 pb-6">
          <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-primary" /> By {blog.author}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {blog.readTime}</span>
        </div>
      </div>

      {/* Featured Image */}
      <div className="h-[400px] rounded-3xl overflow-hidden border border-foreground/5 shadow-md">
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Body content */}
      <article className="prose dark:prose-invert max-w-none text-sm sm:text-base text-foreground/80 leading-relaxed font-light space-y-6">
        <p className="font-semibold text-foreground text-lg">{blog.content.split('...')[0]}</p>
        <p>
          Creating luxury interiors requires balancing structural alignment with material integrity. 
          When designing open-concept spaces like living-kitchen extensions, ensure that floor planks run parallel to the longest wall. This architectural guide elongates sight lines. Under-cabinet lighting should use 3000K soft warm-white LEDs to illuminate backsplash stones cleanly.
        </p>
        <div className="p-6 rounded-2xl bg-secondary/5 dark:bg-white/5 border border-primary/20 flex items-start gap-4">
          <Compass className="w-6 h-6 text-primary shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-foreground italic">
            "Design is not just what it looks like and feels like. Design is how it works. Spatial AI empowers designers to visualize layout options in seconds, making iterative planning fluid."
          </p>
        </div>
        <p>
          Always coordinate main colors using the 60-30-10 palette rules. 
          Select ash gray or alabaster whites for dominant wall spaces (60%), warm natural oak or walnut millwork for secondaries (30%), and velvet navy or brushed brass elements for accoutrements (10%).
        </p>
      </article>

      {/* Interactive Comments Panel */}
      <div className="border-t border-foreground/5 pt-12 space-y-8">
        <div className="flex items-center gap-2 border-b border-foreground/5 pb-3">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold tracking-wide">Article Discussion ({comments.length})</h3>
        </div>

        {/* Form */}
        <form onSubmit={handlePostComment} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder={user ? "Write a public comment..." : "Sign in to leave a comment..."}
            disabled={!user}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-grow bg-secondary/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-foreground placeholder-foreground/50"
          />
          <button
            type="submit"
            disabled={!user || !commentText.trim()}
            className="px-5 py-3 rounded-xl bg-primary text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" /> Post Comment
          </button>
        </form>

        {/* Comments Feed */}
        <div className="space-y-6 pt-2">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 items-start text-sm">
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm uppercase shrink-0">
                {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="space-y-1.5 p-4 rounded-2xl bg-secondary/5 dark:bg-white/5 border border-foreground/5 flex-grow">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{comment.authorName}</span>
                  <span className="text-[10px] text-foreground/45">{comment.date}</span>
                </div>
                <p className="text-xs text-foreground/75 leading-relaxed font-light">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
