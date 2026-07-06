'use client';

import React, { useState, useEffect } from 'react';
import { apiGet } from '../services/api';
import Link from 'next/link';
import { Search, BookOpen, Clock, User, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const CATEGORIES = ['All Categories', 'Interior Design', 'Home Decoration', 'Furniture Guides', 'Color Theory', 'Smart Home Ideas'];

export default function BlogFeedPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await apiGet<BlogItem[]>('/blogs');
      setBlogs(data);
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          blog.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.5 }}
      className="flex-1 w-full bg-background font-sans py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12"
    >
      
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-playfair text-foreground">
          Decor Insights Blog
        </h1>
        <p className="max-w-xl mx-auto text-sm sm:text-base text-foreground/60 leading-relaxed font-light">
          Professional tips, color theory explanations, and architectural stager insights.
        </p>
      </div>

      {/* Toolbar */}
      <div className="p-6 rounded-2xl glass-luxury border flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
          <input
            type="text"
            placeholder="Search article title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-secondary/5 dark:bg-white/5 border border-foreground/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary text-foreground placeholder-foreground/50"
          />
        </div>

        {/* Categories buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {CATEGORIES.map(cat => (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-md shadow-primary/10'
                  : 'bg-secondary/5 dark:bg-white/5 text-foreground/80 hover:bg-primary/5'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

      </div>

      {/* Blog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-96 rounded-2xl border border-foreground/5 shimmer bg-secondary/5" />
          ))}
        </div>
      ) : (
        <>
          {filteredBlogs.length === 0 ? (
            <div className="py-20 text-center text-foreground/55">
              <BookOpen className="w-12 h-12 text-primary mx-auto opacity-75 mb-3" />
              <h3 className="text-xl font-bold">No articles found</h3>
              <p className="text-sm max-w-xs mx-auto mt-1">Try selecting another category or typing another keyword.</p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredBlogs.map((blog) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    key={blog.id}
                    className="group rounded-2xl overflow-hidden border border-foreground/5 bg-background shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      
                      {/* Cover image */}
                      <div className="h-52 overflow-hidden relative bg-black">
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                          loading="lazy"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 text-white font-bold text-[9px] uppercase tracking-wider rounded-full backdrop-blur-md">
                          {blog.category}
                        </span>
                      </div>

                      {/* Details content */}
                      <div className="p-6 space-y-3">
                        <div className="flex items-center gap-4 text-[10px] text-foreground/50">
                          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-primary" /> {blog.author}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {blog.readTime}</span>
                        </div>
                        <h3 className="text-lg font-bold tracking-wide leading-tight group-hover:text-primary transition-colors">
                          {blog.title}
                        </h3>
                        <p className="text-xs text-foreground/60 leading-relaxed line-clamp-3 font-light font-sans">
                          {blog.content}
                        </p>
                      </div>

                    </div>

                    <div className="p-6 pt-0">
                      <Link
                        href={`/blog/${blog.slug}`}
                        className="text-xs font-bold text-primary hover:text-primary-dark inline-flex items-center gap-1.5 transition-colors cursor-pointer group/link"
                      >
                        Read Full Article 
                        <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </>
      )}

    </motion.div>
  );
}
