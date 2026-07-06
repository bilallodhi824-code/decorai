'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiGet, apiDelete, apiPatch, apiPost } from '../services/api';
import { useRouter } from 'next/navigation';
import { 
  User, LayoutDashboard, Folder, Heart, CreditCard, Bell, Settings, 
  Trash2, AlertCircle, RefreshCw, Check, Globe, Shield, MessageSquare, Star, Send, Plus
} from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  style: string;
  budget: string;
  roomType: string;
  originalImageUrl: string;
  generatedImageUrl: string;
  createdAt: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function UserDashboardPage() {
  const { user, token, logout, updateUserField } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'projects' | 'favorites' | 'subscriptions' | 'notifications' | 'settings' | 'review'>('overview');
  
  // Data States
  const [projects, setProjects] = useState<Project[]>([]);
  const [savedDesigns, setSavedDesigns] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form profile edits
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Form Review State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const handleSubmittingReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    setReviewError(null);
    setReviewSuccess(false);

    try {
      await apiPost('/feedback', {
        rating: reviewRating,
        comment: reviewComment
      });
      setReviewSuccess(true);
      setReviewComment('');
      setReviewRating(5);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err: any) {
      setReviewError(err.message || 'Failed to post feedback.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // If not logged in, redirect
  useEffect(() => {
    if (!token && !loading) {
      router.push('/login');
    }
  }, [token, loading]);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // Set initial form states
  useEffect(() => {
    if (user) {
      setEditName(user.displayName);
      setEditAvatar(user.photoURL || '');
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [projList, savedList, notifList] = await Promise.all([
        apiGet<Project[]>('/projects'),
        apiGet<Project[]>('/saved-designs'),
        apiGet<NotificationItem[]>('/notifications')
      ]);
      setProjects(projList);
      setSavedDesigns(savedList);
      setNotifications(notifList);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);
    try {
      await updateUserField({
        displayName: editName
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id: string, isFav: boolean) => {
    const confirm = window.confirm(isFav ? 'Remove this design from favorites?' : 'Delete this project permanently?');
    if (!confirm) return;

    try {
      if (isFav) {
        await apiDelete(`/saved-designs/${id}`);
        setSavedDesigns(prev => prev.filter(p => p.id !== id));
      } else {
        await apiDelete(`/projects/${id}`);
        setProjects(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkNotifRead = async (id: string) => {
    try {
      await apiPatch(`/notifications/${id}/read`, {});
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || loading) {
    return (
      <div className="flex-grow w-full max-w-7xl mx-auto px-4 py-20 flex items-center justify-center gap-2">
        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
        <span className="text-sm font-semibold text-foreground/75">Syncing account database...</span>
      </div>
    );
  }

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Sidebar navigation */}
      <div className="lg:col-span-3 space-y-6">
        <div className="p-6 rounded-2xl glass-luxury border flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center font-bold text-3xl uppercase border-2 border-primary shrink-0">
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{user.displayName}</h2>
            <span className="inline-block mt-1 text-[10px] bg-primary/10 border border-primary/25 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {user.subscription.plan} Plan
            </span>
          </div>
        </div>

        {/* Tab buttons */}
        <div className="rounded-2xl border border-foreground/5 bg-background overflow-hidden p-2 flex flex-col gap-1 text-sm text-foreground/80">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${activeTab === 'overview' ? 'bg-primary text-white font-bold' : 'hover:bg-primary/5 hover:text-primary'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> Overview
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${activeTab === 'profile' ? 'bg-primary text-white font-bold' : 'hover:bg-primary/5 hover:text-primary'}`}
          >
            <User className="w-4 h-4" /> Profile Info
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${activeTab === 'projects' ? 'bg-primary text-white font-bold' : 'hover:bg-primary/5 hover:text-primary'}`}
          >
            <Folder className="w-4 h-4" /> My Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${activeTab === 'favorites' ? 'bg-primary text-white font-bold' : 'hover:bg-primary/5 hover:text-primary'}`}
          >
            <Heart className="w-4 h-4" /> Saved Designs ({savedDesigns.length})
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${activeTab === 'subscriptions' ? 'bg-primary text-white font-bold' : 'hover:bg-primary/5 hover:text-primary'}`}
          >
            <CreditCard className="w-4 h-4" /> Subscription
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full px-4 py-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${activeTab === 'notifications' ? 'bg-primary text-white font-bold' : 'hover:bg-primary/5 hover:text-primary'}`}
          >
            <span className="flex items-center gap-3"><Bell className="w-4 h-4" /> Notifications</span>
            {unreadNotifsCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${activeTab === 'notifications' ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                {unreadNotifsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${activeTab === 'review' ? 'bg-primary text-white font-bold' : 'hover:bg-primary/5 hover:text-primary'}`}
          >
            <MessageSquare className="w-4 h-4" /> Share Feedback
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${activeTab === 'settings' ? 'bg-primary text-white font-bold' : 'hover:bg-primary/5 hover:text-primary'}`}
          >
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="lg:col-span-9 space-y-6">
        
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="p-8 rounded-2xl glass-luxury border flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-playfair tracking-wide">Welcome back, {user.displayName.split(' ')[0]}</h3>
                <p className="text-xs sm:text-sm text-foreground/60 leading-relaxed max-w-md">
                  Review generated mockups, adjust subscription details, and modify custom room guidelines.
                </p>
              </div>
              <Link href="/generator" className="px-6 py-3.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-md shadow-primary/10">
                New Transformation
              </Link>
            </div>

            {/* Quick stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-foreground/80">
              <div className="p-6 rounded-2xl border border-foreground/5 bg-background shadow-sm space-y-2">
                <span className="text-foreground/45 uppercase tracking-wider text-[10px] font-bold">Renders Saved</span>
                <p className="text-3xl font-extrabold text-primary font-playfair">{projects.length}</p>
              </div>
              <div className="p-6 rounded-2xl border border-foreground/5 bg-background shadow-sm space-y-2">
                <span className="text-foreground/45 uppercase tracking-wider text-[10px] font-bold">Wishlist Favorites</span>
                <p className="text-3xl font-extrabold text-primary font-playfair">{savedDesigns.length}</p>
              </div>
              <div className="p-6 rounded-2xl border border-foreground/5 bg-background shadow-sm space-y-2">
                <span className="text-foreground/45 uppercase tracking-wider text-[10px] font-bold">Active Alerts</span>
                <p className="text-3xl font-extrabold text-primary font-playfair">{unreadNotifsCount}</p>
              </div>
            </div>

            {/* Recent Project preview */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Recent Generations</h3>
              {projects.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-foreground/15 text-center text-foreground/55">
                  <Folder className="w-10 h-10 text-primary mx-auto opacity-75 mb-2" />
                  <p className="text-xs">You haven't generated any spaces yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {projects.slice(0, 2).map(proj => (
                    <div key={proj.id} className="rounded-xl border border-foreground/5 bg-background overflow-hidden shadow-sm flex flex-col">
                      <div className="h-44 overflow-hidden relative">
                        <img src={proj.generatedImageUrl} className="w-full h-full object-cover" />
                        <span className="absolute top-3 left-3 bg-black/60 text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-md">{proj.style}</span>
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm truncate max-w-[150px]">{proj.name}</h4>
                          <p className="text-[10px] text-foreground/50">{proj.roomType}</p>
                        </div>
                        <Link href="/gallery" className="text-xs font-semibold text-primary hover:underline">
                          View details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* 2. PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="p-6 rounded-2xl glass-luxury border space-y-6">
            <h3 className="text-xl font-bold border-b border-foreground/5 pb-2">Profile Details</h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4 text-sm max-w-md">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-foreground/80">Display Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-secondary/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-3.5 py-3 focus:outline-none focus:border-primary text-foreground"
                />
              </div>



              {profileSuccess && (
                <div className="p-3.5 rounded-xl bg-success/15 border border-success/35 text-xs text-success flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Profile details updated successfully!</span>
                </div>
              )}

              <button
                type="submit"
                className="px-6 py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-md shadow-primary/10 hover:bg-primary-dark transition-colors cursor-pointer"
              >
                Save Profile
              </button>
            </form>
          </div>
        )}

        {/* 3. PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold border-b border-foreground/5 pb-2">My Rendered Projects</h3>

            {projects.length === 0 ? (
              <div className="py-20 border border-dashed border-foreground/10 rounded-2xl text-center text-foreground/55">
                <Folder className="w-12 h-12 text-primary mx-auto opacity-75 mb-3" />
                <h4 className="font-bold">No projects yet</h4>
                <p className="text-xs max-w-xs mx-auto mt-1 mb-6">Upload a photo to start designing and saving renders.</p>
                <Link href="/generator" className="px-5 py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-md">Start Generator</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {projects.map((proj) => (
                  <div key={proj.id} className="rounded-xl border border-foreground/5 bg-background overflow-hidden shadow-sm flex flex-col justify-between">
                    <div className="h-48 overflow-hidden relative">
                      <img src={proj.generatedImageUrl} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-widest bg-primary text-white px-2 py-0.5 rounded-full mb-1 inline-block">
                            {proj.style}
                          </span>
                          <h4 className="text-white font-bold text-base leading-tight">{proj.name}</h4>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between border-t border-foreground/5">
                      <span className="text-[10px] text-foreground/50">{proj.roomType} &bull; {proj.budget}</span>
                      <button
                        onClick={() => handleDeleteProject(proj.id, false)}
                        className="p-2 hover:bg-danger/10 text-foreground/60 hover:text-danger rounded-lg transition-colors cursor-pointer"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. FAVORITES TAB */}
        {activeTab === 'favorites' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold border-b border-foreground/5 pb-2">Saved Wishlist Designs</h3>

            {savedDesigns.length === 0 ? (
              <div className="py-20 border border-dashed border-foreground/10 rounded-2xl text-center text-foreground/55">
                <Heart className="w-12 h-12 text-primary mx-auto opacity-75 mb-3" />
                <h4 className="font-bold">No saved designs</h4>
                <p className="text-xs max-w-xs mx-auto mt-1">Browse the community Gallery and click the heart icon to save designs here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {savedDesigns.map((proj) => (
                  <div key={proj.id} className="rounded-xl border border-foreground/5 bg-background overflow-hidden shadow-sm flex flex-col justify-between">
                    <div className="h-48 overflow-hidden relative">
                      <img src={proj.generatedImageUrl} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-widest bg-primary text-white px-2 py-0.5 rounded-full mb-1 inline-block">
                            {proj.style}
                          </span>
                          <h4 className="text-white font-bold text-base leading-tight">{proj.name}</h4>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between border-t border-foreground/5">
                      <span className="text-[10px] text-foreground/50">{proj.roomType} &bull; {proj.budget}</span>
                      <button
                        onClick={() => handleDeleteProject(proj.id, true)}
                        className="p-2 hover:bg-danger/10 text-foreground/60 hover:text-danger rounded-lg transition-colors cursor-pointer"
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. SUBSCRIPTION TAB */}
        {activeTab === 'subscriptions' && (
          <div className="p-6 rounded-2xl glass-luxury border space-y-6">
            <h3 className="text-xl font-bold border-b border-foreground/5 pb-2">Active Plan</h3>

            <div className="p-6 rounded-2xl bg-secondary/5 dark:bg-white/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-extrabold uppercase tracking-widest bg-primary/20 text-primary px-2.5 py-1 rounded-full">
                  DecorAI {user.subscription.plan.toUpperCase()}
                </span>
                <p className="text-lg font-bold pt-2">Active Billing Cycle</p>
                <p className="text-xs text-foreground/50">Renews / Period end: {new Date(user.subscription.currentPeriodEnd).toLocaleDateString([], { dateStyle: 'medium' })}</p>
              </div>
              <Link
                href="/pricing"
                className="px-5 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl shadow-md shadow-primary/20 text-center"
              >
                Change Subscription Plan
              </Link>
            </div>
          </div>
        )}

        {/* 6. NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold border-b border-foreground/5 pb-2">Account Alerts</h3>

            {notifications.length === 0 ? (
              <div className="py-12 text-center text-foreground/55">
                <Bell className="w-10 h-10 text-primary mx-auto opacity-75 mb-2" />
                <p className="text-xs">No account notifications received.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-colors ${
                      notif.read 
                        ? 'border-foreground/5 bg-background text-foreground/75' 
                        : 'border-primary/20 bg-primary/5 text-foreground'
                    }`}
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm flex items-center gap-1.5">
                        {!notif.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                        {notif.title}
                      </h4>
                      <p className="text-xs text-foreground/70 leading-relaxed font-light">{notif.message}</p>
                      <span className="block text-[9px] text-foreground/45 pt-1">
                        {new Date(notif.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>

                    {!notif.read && (
                      <button
                        onClick={() => handleMarkNotifRead(notif.id)}
                        className="px-2.5 py-1 text-[10px] font-bold bg-primary text-white rounded-lg hover:bg-primary-dark cursor-pointer"
                      >
                        Read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7. SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="p-6 rounded-2xl glass-luxury border space-y-6">
            <h3 className="text-xl font-bold border-b border-foreground/5 pb-2">Configuration Settings</h3>

            <div className="space-y-6 text-sm text-foreground/80 max-w-md">
              
              {/* Theme toggle */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <h4 className="font-bold">Dark Theme</h4>
                  <p className="text-xs text-foreground/55">Toggle between dark and light modes.</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="w-12 h-6 bg-primary/20 hover:bg-primary/30 rounded-full p-1 transition-colors relative"
                >
                  <div className={`w-4 h-4 bg-primary rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Language selection mockup */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <h4 className="font-bold flex items-center gap-1.5"><Globe className="w-4 h-4 text-primary" /> Application Language</h4>
                  <p className="text-xs text-foreground/55">Select layout language translations.</p>
                </div>
                <select className="bg-secondary/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-3 py-1.5 text-xs focus:outline-none text-foreground">
                  <option value="en">English (US)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>

              {/* Multi factor / Security mockup */}
              <div className="flex items-center justify-between py-1 border-t border-foreground/5 pt-6">
                <div>
                  <h4 className="font-bold flex items-center gap-1.5"><Shield className="w-4 h-4 text-primary" /> Enterprise Protection</h4>
                  <p className="text-xs text-foreground/55">Force secure SSL JWT parameters.</p>
                </div>
                <span className="text-[10px] bg-success/15 text-success font-extrabold px-2 py-0.5 rounded-full uppercase">Enabled</span>
              </div>

            </div>
          </div>
        )}

        {/* 8. SHARE FEEDBACK TAB */}
        {activeTab === 'review' && (
          <div className="p-6 rounded-2xl glass-luxury border space-y-6">
            <h3 className="text-xl font-bold border-b border-foreground/5 pb-2">Share Your DecorAI Experience</h3>
            
            <form onSubmit={handleSubmittingReview} className="space-y-4 text-sm max-w-md">
              
              {/* Star Picker */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-foreground/80 font-sans">Your Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="text-primary hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star className={`w-6 h-6 ${reviewRating >= star ? 'fill-current' : 'text-foreground/20'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-foreground/80 font-sans">Your Message</label>
                <textarea
                  placeholder="Share your transformation story, quality of suggestions, or speed..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  required
                  className="w-full bg-secondary/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-3.5 py-3 focus:outline-none focus:border-primary text-foreground resize-none"
                />
              </div>

              {reviewError && (
                <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-xs text-danger flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{reviewError}</span>
                </div>
              )}

              {reviewSuccess && (
                <div className="p-3.5 rounded-xl bg-success/15 border border-success/35 text-xs text-success flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Thank you! Your testimonial has been posted successfully.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submittingReview}
                className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/10 hover:shadow-lg transition-colors"
              >
                {submittingReview ? (
                  <>
                    <RefreshCw className="w-4.5 h-4.5 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Plus className="w-4.5 h-4.5" /> Post Testimonial
                  </>
                )}
              </button>

            </form>
          </div>
        )}

      </div>

    </div>
  );
}
