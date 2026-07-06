'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiPost } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Download, Save, Share2, RefreshCw, AlertCircle, Info, ArrowRight, ChevronRight, Sliders } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ROOM_TYPES = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office', 'Outdoor', 'Apartment', 'Full House'];
const STYLES = ['Modern', 'Scandinavian', 'Luxury', 'Japanese', 'Industrial', 'Minimalist', 'Bohemian', 'Contemporary'];
const BUDGET_TIERS = ['Under $2,000', '$2,000 - $5,000', '$5,000 - $10,000', '$10,000+'];


interface CustomDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

function CustomDropdown({ label, value, options, onChange }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="flex flex-col gap-1.5 relative z-20">
      <label className="font-semibold text-foreground/85">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-secondary/5 dark:bg-white/5 border border-foreground/10 hover:border-primary/50 rounded-xl px-3.5 py-3 focus:outline-none focus:border-primary text-foreground text-left flex items-center justify-between transition-all duration-200 cursor-pointer"
      >
        <span>{value}</span>
        <ChevronRight className={`w-4 h-4 text-foreground/60 transition-transform duration-200 ${isOpen ? 'rotate-90 text-primary' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-[100%] left-0 right-0 mt-2 rounded-xl glass-luxury border border-foreground/10 dark:border-white/10 shadow-2xl p-1.5 z-30 max-h-60 overflow-y-auto"
          >
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all duration-150 flex items-center justify-between cursor-pointer
                  ${value === option 
                    ? 'bg-primary/10 text-primary font-semibold' 
                    : 'text-foreground hover:bg-primary/8 hover:text-primary'
                  }`}
              >
                <span>{option}</span>
                {value === option && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function GeneratorPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  // Form State
  const [selectedRoom, setSelectedRoom] = useState(ROOM_TYPES[0]);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [selectedBudget, setSelectedBudget] = useState(BUDGET_TIERS[0]);
  const [themeText, setThemeText] = useState('');
  const [projectName, setProjectName] = useState('');
  
  // Upload State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Result State
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{
    originalImageUrl: string;
    generatedImageUrl: string;
    analysis: string;
    projectId: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Slider State
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/generator');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }
    setError(null);
    setUploading(true);
    
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleGenerate = async () => {
    if (!user) {
      setError('Please sign in or create an account to start designing.');
      return;
    }
    if (!imagePreview) {
      setError('Please upload an image of your room first.');
      return;
    }

    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response: any = await apiPost('/designs/generate', {
        roomType: selectedRoom,
        style: selectedStyle,
        budget: selectedBudget,
        theme: themeText,
        originalImageUrl: imagePreview,
        projectName: projectName.trim() || `${selectedStyle} ${selectedRoom}`
      });

      setResult({
        originalImageUrl: response.project.originalImageUrl,
        generatedImageUrl: response.project.generatedImageUrl,
        analysis: response.analysis,
        projectId: response.project.id
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during generation. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Before/After Slider drag handler
  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMove = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleDownload = () => {
    if (!result) return;
    // Download image helper
    const link = document.createElement('a');
    link.href = result.generatedImageUrl;
    link.download = `${projectName || selectedStyle}-${selectedRoom}-DecorAI.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    if (!result) return;
    if (navigator.share) {
      navigator.share({
        title: 'My DecorAI Interior Transformation',
        text: `Check out my redesigned ${selectedStyle} ${selectedRoom}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(result.generatedImageUrl);
      alert('Design image URL copied to clipboard!');
    }
  };

  const resetForm = () => {
    setResult(null);
    setImagePreview(null);
    setThemeText('');
    setProjectName('');
    setError(null);
  };

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans grid grid-cols-1 lg:grid-cols-12 gap-10">
      
      {/* Left panel - Form settings */}
      <div className="lg:col-span-4 space-y-6">
        <div className="p-6 rounded-2xl glass-luxury border flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-foreground/5 pb-3">
            <Sliders className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold tracking-wide">Design Configuration</h2>
          </div>

          {!user && (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs text-foreground/80 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <strong>Authentication Required:</strong> You need to be logged in to generate layouts. 
                <Link href="/login" className="text-primary font-bold ml-1 hover:underline">Log In Here</Link>
              </div>
            </div>
          )}

          {/* Form inputs */}
          <div className="space-y-4 text-sm">
            <CustomDropdown
              label="Room Type"
              value={selectedRoom}
              options={ROOM_TYPES}
              onChange={setSelectedRoom}
            />

            <CustomDropdown
              label="Design Style"
              value={selectedStyle}
              options={STYLES}
              onChange={setSelectedStyle}
            />

            <CustomDropdown
              label="Budget Cap"
              value={selectedBudget}
              options={BUDGET_TIERS}
              onChange={setSelectedBudget}
            />

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-foreground/85">Project Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. My Cozy Living Room Master"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-secondary/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-3.5 py-3 focus:outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-foreground/85">Custom Theme Notes (Optional)</label>
              <textarea
                placeholder="e.g. Highlight navy blue velvet details, warm gold chandeliers, wood panel walls..."
                value={themeText}
                onChange={(e) => setThemeText(e.target.value)}
                rows={3}
                className="w-full bg-secondary/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-3.5 py-3 focus:outline-none focus:border-primary text-foreground resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-xs text-danger flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating || uploading || !user}
            className="w-full py-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Generating Design...
              </>
            ) : (
              <>
                <ArrowRight className="w-5 h-5" />
                Generate Design
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right panel - Drag/Drop zone or Output visuals */}
      <div className="lg:col-span-8 space-y-6">
        <AnimatePresence mode="wait">
          
          {/* SKELETON LOADER */}
          {generating && (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-[450px] rounded-2xl border border-foreground/5 bg-background shadow-md flex flex-col items-center justify-center gap-4 relative overflow-hidden"
            >
              <div className="absolute inset-0 shimmer" />
              <div className="z-10 text-center space-y-4">
                <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto" />
                <h3 className="text-xl font-bold font-playfair tracking-wide">Designing Room Architecture</h3>
                <p className="text-sm text-foreground/60 max-w-xs mx-auto">Evaluating geometry, mapping color balance, and styling coordinates...</p>
              </div>
            </motion.div>
          )}

          {/* GENERATOR RESULT VIEW WITH SLIDER */}
          {!generating && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              
              {/* Before/After Comparison Container */}
              <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border border-primary/20 shadow-xl bg-black">
                <div
                  ref={sliderRef}
                  onMouseMove={handleMouseMove}
                  onTouchMove={handleTouchMove}
                  className="w-full h-full relative cursor-ew-resize select-none"
                >
                  
                  {/* Before (Original) - Left underlying layer */}
                  <img
                    src={result.originalImageUrl}
                    alt="Original room"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/60 text-white text-xs font-semibold rounded-full backdrop-blur-md">
                    Before Space
                  </div>

                  {/* After (Generated) - Right overlay layer */}
                  <div
                    className="absolute top-0 right-0 bottom-0 overflow-hidden"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <img
                      src={result.generatedImageUrl}
                      alt="Generated design"
                      className="absolute top-0 right-0 w-full h-full object-cover max-w-none pointer-events-none"
                      style={{ width: sliderRef.current?.getBoundingClientRect().width }}
                    />
                  </div>
                  <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-primary/95 text-white text-xs font-semibold rounded-full backdrop-blur-md shadow-md">
                    AI Design
                  </div>

                  {/* Drag Line and Center Ring handle */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-primary z-20 pointer-events-none"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary border-4 border-white flex items-center justify-center shadow-lg text-white pointer-events-none">
                      <Sliders className="w-3.5 h-3.5" />
                    </div>
                  </div>

                </div>
              </div>

              {/* Action Buttons underneath */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl glass-luxury border">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">{projectName || `${selectedStyle} ${selectedRoom}`}</h3>
                  <p className="text-xs text-foreground/50">Designed in {selectedStyle} scheme &middot; {selectedBudget}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownload}
                    className="p-3 rounded-xl bg-secondary/5 dark:bg-white/5 border border-foreground/10 hover:border-primary text-foreground transition-all flex items-center gap-1.5 text-sm font-semibold cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-xl bg-secondary/5 dark:bg-white/5 border border-foreground/10 hover:border-primary text-foreground transition-all flex items-center gap-1.5 text-sm font-semibold cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                  <button
                    onClick={resetForm}
                    className="p-3 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all flex items-center gap-1.5 text-sm font-semibold shadow-md shadow-primary/10 cursor-pointer"
                  >
                    New Space <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* AI Design Proposal Text */}
              <div className="p-6 rounded-2xl glass-luxury border space-y-4">
                <h3 className="font-bold text-lg border-b border-foreground/5 pb-2 flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" /> AI Layout & Color Proposal
                </h3>
                <div className="text-sm text-foreground/75 leading-relaxed space-y-3 prose dark:prose-invert max-w-none">
                  {result.analysis.split('\n').map((line, idx) => {
                    if (line.startsWith('###')) {
                      return <h4 key={idx} className="font-bold text-base pt-2 text-foreground">{line.replace('###', '')}</h4>;
                    }
                    if (line.startsWith('####')) {
                      return <h5 key={idx} className="font-bold text-sm text-primary pt-1">{line.replace('####', '')}</h5>;
                    }
                    if (line.startsWith('-')) {
                      return <li key={idx} className="ml-4 list-disc">{line.replace('-', '').trim()}</li>;
                    }
                    return <p key={idx}>{line}</p>;
                  })}
                </div>
              </div>

            </motion.div>
          )}

          {/* INITIAL STATE - UPLOAD SCREEN */}
          {!generating && !result && (
            <motion.div
              key="uploader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full min-h-[450px] rounded-2xl border border-dashed border-foreground/20 hover:border-primary/50 bg-secondary/5 dark:bg-white/5 flex flex-col items-center justify-center p-8 text-center transition-all cursor-pointer relative"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerUploadClick}
            >
              
              {imagePreview ? (
                <div className="space-y-4 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                  <img
                    src={imagePreview}
                    alt="Upload preview"
                    className="w-full h-64 object-cover rounded-xl border border-primary/20 shadow-md"
                  />
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={triggerUploadClick}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-secondary/10 dark:bg-white/10 hover:bg-primary/20 text-foreground transition-all cursor-pointer"
                    >
                      Change Photo
                    </button>
                    <button
                      onClick={() => setImagePreview(null)}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-danger/10 hover:bg-danger/20 text-danger transition-all cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-md">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-wide text-foreground">Upload Room Image</h3>
                    <p className="text-sm text-foreground/50 mt-1 max-w-sm">Drag & drop your room photo here, or click to browse files.</p>
                  </div>
                  <span className="inline-block text-[10px] text-foreground/45 border border-foreground/10 px-2 py-0.5 rounded-full">PNG, JPG, or WEBP &bull; Max 10MB</span>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
