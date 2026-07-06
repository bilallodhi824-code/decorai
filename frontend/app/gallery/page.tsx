'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPost, apiDelete } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Sliders, Search, Heart, Info, X, Download, Share2, Filter, ChevronDown } from 'lucide-react';

interface ProjectItem {
  id: string;
  name: string;
  userId: string;
  style: string;
  budget: string;
  roomType: string;
  originalImageUrl: string;
  generatedImageUrl: string;
  createdAt: string;
  promptSuggestions?: string;
}

const STYLES = ['All Styles', 'Modern', 'Scandinavian', 'Luxury', 'Japanese', 'Industrial', 'Minimalist', 'Bohemian', 'Contemporary'];
const ROOM_TYPES = ['All Rooms', 'Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office', 'Outdoor', 'Apartment', 'Full House'];
const BUDGET_TIERS = ['All Budgets', 'Under $2,000', '$2,000 - $5,000', '$5,000 - $10,000', '$10,000+'];

interface GalleryDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

function GalleryDropdown({ label, value, options, onChange }: GalleryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function clickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const dropdownVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.05,
        duration: 0.2
      }
    },
    exit: { 
      opacity: 0, 
      y: 8, 
      scale: 0.95,
      transition: { duration: 0.15 }
    }
  };

  const optionVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div ref={ref} className="relative z-20">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-secondary/5 dark:bg-white/5 border border-foreground/10 hover:border-primary/50 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary text-foreground flex items-center justify-between gap-2 min-w-[140px] cursor-pointer transition-all"
      >
        <span>{value}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-[110%] right-0 mt-1 rounded-xl glass-luxury shadow-2xl p-1.5 min-w-[160px] max-h-60 overflow-y-auto z-50 border border-primary/20"
          >
            {options.map((opt) => (
              <motion.button
                variants={optionVariants}
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                  value === opt 
                    ? 'bg-primary/10 text-primary font-semibold' 
                    : 'text-foreground hover:bg-primary/5 hover:text-primary'
                }`}
              >
                <span>{opt}</span>
                {value === opt && <span className="w-1 h-1 rounded-full bg-primary" />}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function GalleryPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Active Filters
  const [selectedStyle, setSelectedStyle] = useState('All Styles');
  const [selectedRoom, setSelectedRoom] = useState('All Rooms');
  const [selectedBudget, setSelectedBudget] = useState('All Budgets');
  
  // Selected Detail Modal
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    setLoading(true);
    try {
      const allProjects = await apiGet<ProjectItem[]>('/gallery');
      setProjects(allProjects);
      
      // If logged in, fetch user favorites
      if (user) {
        const saved = await apiGet<ProjectItem[]>('/saved-designs');
        setFavorites(saved.map(p => p.id));
      }
    } catch (err) {
      console.error('Gallery fetching failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async (e: React.MouseEvent, designId: string) => {
    e.stopPropagation();
    if (!user) {
      alert('Please log in to save designs to your favorites!');
      return;
    }

    const isFav = favorites.includes(designId);
    try {
      if (isFav) {
        await apiDelete(`/saved-designs/${designId}`);
        setFavorites(prev => prev.filter(id => id !== designId));
      } else {
        await apiPost(`/saved-designs/${designId}`, {});
        setFavorites(prev => [...prev, designId]);
      }
    } catch (err) {
      console.error('Toggle favorite failed:', err);
    }
  };

  // Filter Logic
  const filteredProjects = projects.filter(proj => {
    const matchesSearch = proj.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          proj.style.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          proj.roomType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStyle = selectedStyle === 'All Styles' || proj.style === selectedStyle;
    const matchesRoom = selectedRoom === 'All Rooms' || proj.roomType === selectedRoom;
    const matchesBudget = selectedBudget === 'All Budgets' || proj.budget === selectedBudget;
    
    return matchesSearch && matchesStyle && matchesRoom && matchesBudget;
  });

  const handleDownload = (proj: ProjectItem) => {
    const link = document.createElement('a');
    link.href = proj.generatedImageUrl;
    link.download = `${proj.name}-DecorAI.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.5 }}
      className="flex-1 w-full bg-background font-sans py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10"
    >
      
      {/* Page Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-playfair text-foreground">
          Inspiration Gallery
        </h1>
        <p className="max-w-xl mx-auto text-sm sm:text-base text-foreground/60 leading-relaxed font-light">
          Browse luxury design transformations created by the DecorAI engine and shared by our professional community.
        </p>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-6 rounded-2xl glass-luxury border flex flex-col md:flex-row items-center justify-between gap-4 relative z-30">
        
        {/* Search */}
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
          <input
            type="text"
            placeholder="Search style, room, or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-secondary/5 dark:bg-white/5 border border-foreground/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary text-foreground placeholder-foreground/50"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <GalleryDropdown label="Style" value={selectedStyle} options={STYLES} onChange={setSelectedStyle} />
          <GalleryDropdown label="Room" value={selectedRoom} options={ROOM_TYPES} onChange={setSelectedRoom} />
          <GalleryDropdown label="Budget" value={selectedBudget} options={BUDGET_TIERS} onChange={setSelectedBudget} />
        </div>
      </div>

      {/* Skeletons Loader */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 rounded-2xl border border-foreground/5 shimmer bg-secondary/5" />
          ))}
        </div>
      ) : (
        <>
          {filteredProjects.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <Info className="w-12 h-12 text-primary mx-auto opacity-75" />
              <h3 className="text-xl font-bold">No designs found</h3>
              <p className="text-sm text-foreground/60 max-w-xs mx-auto">Try clearing your filters or adjustments to explore more designs.</p>
            </div>
          ) : (
            
            /* Professional Masonry Columns */
            <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8 relative z-10">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((proj) => {
                  const isFav = favorites.includes(proj.id);
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      key={proj.id}
                      onClick={() => setActiveProject(proj)}
                      className="break-inside-avoid group relative rounded-2xl overflow-hidden border border-foreground/5 bg-background shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      
                      {/* Render Image overlay */}
                      <div className="relative overflow-hidden bg-black">
                        <img
                          src={proj.generatedImageUrl}
                          alt={proj.name}
                          className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-500"
                          loading="lazy"
                        />
                        
                        {/* Hover Info overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-between">
                          
                          {/* Upper Heart button */}
                          <div className="flex justify-end">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => handleFavoriteToggle(e, proj.id)}
                              className={`p-2.5 rounded-full backdrop-blur-md transition-transform active:scale-90 cursor-pointer ${
                                isFav 
                                  ? 'bg-primary text-white' 
                                  : 'bg-black/50 hover:bg-primary/20 text-neutral-200'
                              }`}
                            >
                              <Heart className={`w-4.5 h-4.5 ${isFav ? 'fill-current' : ''}`} />
                            </motion.button>
                          </div>

                          {/* Lower text stats */}
                          <div className="space-y-2">
                            <span className="inline-block text-[9px] font-bold uppercase tracking-widest bg-primary text-white px-2 py-0.5 rounded-full">
                              {proj.style}
                            </span>
                            <h3 className="text-white font-bold text-lg leading-tight tracking-wide">{proj.name}</h3>
                            <div className="flex items-center justify-between text-neutral-300 text-xs">
                              <span>{proj.roomType}</span>
                              <span>Budget: {proj.budget}</span>
                            </div>
                          </div>

                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </>
      )}

      {/* DETAIL MODAL DRAWER */}
      <AnimatePresence>
        {activeProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveProject(null)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ type: 'spring', stiffness: 100, damping: 16 }}
              className="fixed inset-x-4 top-10 bottom-10 md:inset-x-20 md:top-16 md:bottom-16 bg-background rounded-3xl border border-primary/25 shadow-2xl z-50 overflow-hidden flex flex-col md:flex-row"
            >
              
              {/* Left Close Button (Mobile float) */}
              <button
                onClick={() => setActiveProject(null)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md cursor-pointer md:hidden"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Side A - Double Visual view */}
              <div className="md:w-3/5 h-1/2 md:h-full bg-black relative flex flex-col md:grid md:grid-cols-2">
                
                {/* Before Image */}
                <div className="relative h-full border-r border-white/10 overflow-hidden">
                  <img
                    src={activeProject.originalImageUrl || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&fit=crop'}
                    alt="Original"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 text-white text-xs font-semibold rounded-full backdrop-blur-md">
                    Before Space
                  </div>
                </div>

                {/* After Image */}
                <div className="relative h-full overflow-hidden">
                  <img
                    src={activeProject.generatedImageUrl}
                    alt="AI Transformation"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full backdrop-blur-md shadow-md">
                    AI Design
                  </div>
                </div>

              </div>

              {/* Side B - Details description */}
              <div className="md:w-2/5 h-1/2 md:h-full p-8 overflow-y-auto flex flex-col justify-between space-y-6 border-l border-foreground/5">
                <div className="space-y-6">
                  
                  {/* Title & Tags */}
                  <div className="space-y-2 border-b border-foreground/5 pb-4 relative">
                    <button
                      onClick={() => setActiveProject(null)}
                      className="absolute top-0 right-0 hidden md:block p-1 text-foreground/50 hover:text-foreground hover:bg-secondary/5 rounded-full cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {activeProject.style} style
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-secondary/10 dark:bg-white/10 text-foreground px-2 py-0.5 rounded-full">
                        {activeProject.roomType}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-wide font-playfair pr-6">{activeProject.name}</h2>
                    <p className="text-xs text-foreground/55">Uploaded: {new Date(activeProject.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}</p>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-primary" /> Design Details
                    </h4>
                    <p className="text-sm text-foreground/75 leading-relaxed bg-secondary/5 p-4 rounded-xl">
                      {activeProject.promptSuggestions || 
                        `This space is styled under the ${activeProject.style} interior design guide using soft textures, balanced placement matching ${activeProject.budget} budget requirements. For layout continuity, align statement lighting directly above seating clusters.`
                      }
                    </p>
                  </div>

                </div>

                {/* Footer Drawer actions */}
                <div className="flex items-center gap-3 border-t border-foreground/5 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDownload(activeProject)}
                    className="flex-1 py-3 bg-secondary text-white hover:bg-primary font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
                  >
                    <Download className="w-4.5 h-4.5" /> Download HD
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => handleFavoriteToggle(e, activeProject.id)}
                    className={`p-3 rounded-xl border border-foreground/10 hover:border-primary flex items-center justify-center cursor-pointer transition-colors ${
                      favorites.includes(activeProject.id) ? 'bg-primary/10 text-primary border-primary/30' : 'text-foreground/75'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${favorites.includes(activeProject.id) ? 'fill-current' : ''}`} />
                  </motion.button>
                </div>

              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
