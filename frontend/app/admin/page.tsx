'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPost, apiPatch } from '../services/api';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Folder, TrendingUp, BookOpen,
  RefreshCw, Plus, CheckCircle, AlertCircle, ChevronRight,
  DollarSign, Image, LogOut, Settings, Menu, X
} from 'lucide-react';
import Link from 'next/link';

interface UserProfileSummary { uid: string; email: string; displayName: string; role: string; plan: string; createdAt: string; }
interface ProjectSummary { id: string; name: string; style: string; roomType: string; userId: string; budget: string; originalImageUrl: string; generatedImageUrl: string; createdAt: string; }
interface TransactionSummary { id: string; userEmail: string; amount: number; plan: string; billingCycle: string; date: string; status: string; }
interface AnalyticsData {
  summary: { totalUsers: number; totalProjects: number; totalAiRequests: number; totalRevenue: number; activeSubscriptions: number; };
  subscriptionBreakdown: { free: number; pro: number; business: number; };
  transactions: TransactionSummary[];
  users: UserProfileSummary[];
  projects: ProjectSummary[];
}
type ActiveTab = 'overview' | 'users' | 'designs' | 'subscriptions' | 'blog';

export default function AdminDashboardPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSlug, setBlogSlug] = useState('');
  const [blogCategory, setBlogCategory] = useState('Interior Design');
  const [blogReadTime, setBlogReadTime] = useState('5 min read');
  const [blogImage, setBlogImage] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogSuccess, setBlogSuccess] = useState(false);
  const [blogError, setBlogError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [submittingApprove, setSubmittingApprove] = useState<string | null>(null);

  useEffect(() => { if (!loading && (!user || user.role !== 'admin')) router.push('/dashboard'); }, [user, loading, router]);
  useEffect(() => { if (token && user?.role === 'admin') fetchAnalytics(); else setLoading(false); }, [token, user]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await apiGet<AnalyticsData>('/admin/analytics');
      setAnalytics(data);
      const subData = await apiGet<any[]>('/admin/subscriptions');
      setSubscriptions(subData);
    }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleApproveSubscription = async (subId: string) => {
    setSubmittingApprove(subId);
    try {
      await apiPatch(`/admin/subscriptions/${subId}/approve`, {});
      await fetchAnalytics();
    } catch (err) {
      console.error(err);
      alert('Failed to approve subscription');
    } finally {
      setSubmittingApprove(null);
    }
  };

  const handlePublishBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true); setBlogError(null); setBlogSuccess(false);
    try {
      await apiPost('/blogs', { title: blogTitle, slug: blogSlug, category: blogCategory, readTime: blogReadTime, image: blogImage || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600&fit=crop', content: blogContent });
      setBlogSuccess(true); setBlogTitle(''); setBlogSlug(''); setBlogImage(''); setBlogContent('');
    } catch (err: any) { setBlogError(err.message || 'Failed to publish.'); } finally { setPublishing(false); }
  };

  if (loading) return <div className="flex-grow flex items-center justify-center"><RefreshCw className="w-5 h-5 text-primary animate-spin" /></div>;
  if (!analytics) return <div className="flex-grow flex items-center justify-center text-foreground/50 text-sm">Unable to load admin data.</div>;

  const { summary, subscriptionBreakdown, transactions, users, projects } = analytics;
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'designs', label: 'Design Logs', icon: <Folder className="w-4 h-4" /> },
    { id: 'subscriptions', label: 'Subscriptions', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'blog', label: 'Blog', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <div className="flex-grow w-full flex flex-col md:flex-row font-sans bg-background" style={{ minHeight: 'calc(100vh - 80px)' }}>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 border-b border-foreground/10 bg-background sticky top-[80px] z-30">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">Admin Console</p>
          <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary font-semibold rounded">Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-foreground/5 text-foreground transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-[80px] bottom-0 left-0 z-40
          w-56 shrink-0 border-r border-foreground/10 bg-background
          flex flex-col py-6 px-4 transition-transform duration-300 ease-in-out
          h-[calc(100vh-80px)] overflow-y-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="mb-6 px-2">
          <p className="text-[10px] uppercase tracking-widest font-semibold text-foreground/40">Admin</p>
          <p className="text-sm font-semibold text-foreground mt-1 truncate">{user?.displayName}</p>
          <span className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-primary/10 text-primary font-semibold rounded">Administrator</span>
        </div>
        <nav className="space-y-0.5 flex-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors text-left ${activeTab === item.id ? 'bg-primary/10 text-primary' : 'text-foreground/55 hover:text-foreground hover:bg-foreground/5'}`}>
              {item.icon} {item.label} {activeTab === item.id && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
            </button>
          ))}
        </nav>
        <div className="border-t border-foreground/10 pt-3 mt-3 space-y-0.5">
          <Link href="/dashboard" className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-foreground/55 hover:text-foreground hover:bg-foreground/5 transition-colors">
            <Settings className="w-4 h-4" /> Settings
          </Link>
          <button onClick={() => logout()} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-danger/70 hover:text-danger hover:bg-danger/5 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Backdrop overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 top-[80px] bg-black/40 z-30 md:hidden"
        />
      )}

      {/* Main */}
      <main className="flex-1 px-4 sm:px-8 py-8 overflow-y-auto">

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div><h1 className="text-xl font-bold tracking-tight">Overview</h1><p className="text-sm text-foreground/50 mt-0.5">Platform performance and revenue.</p></div>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: 'Total Revenue', value: `$${summary.totalRevenue.toLocaleString()}`, icon: <DollarSign className="w-4 h-4" /> },
                { label: 'Active Members', value: summary.activeSubscriptions.toString(), icon: <Users className="w-4 h-4" /> },
                { label: 'Designs Generated', value: summary.totalAiRequests.toString(), icon: <Folder className="w-4 h-4" /> },
                { label: 'Total Accounts', value: summary.totalUsers.toString(), icon: <TrendingUp className="w-4 h-4" /> },
              ].map((card, i) => (
                <div key={i} className="p-5 rounded-xl border border-foreground/10 bg-background">
                  <div className="flex items-center justify-between mb-3"><span className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wide">{card.label}</span><span className="text-foreground/25">{card.icon}</span></div>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2 p-6 rounded-xl border border-foreground/10 bg-background space-y-5">
                <h2 className="text-sm font-semibold">Subscription Breakdown</h2>
                {[{ label: 'Free', count: subscriptionBreakdown.free, cls: 'bg-foreground/20' },{ label: 'Pro', count: subscriptionBreakdown.pro, cls: 'bg-primary' },{ label: 'Business', count: subscriptionBreakdown.business, cls: 'bg-accent' }].map((t) => {
                  const pct = summary.totalUsers > 0 ? Math.round((t.count / summary.totalUsers) * 100) : 0;
                  return <div key={t.label}><div className="flex justify-between text-xs text-foreground/50 mb-1.5"><span>{t.label} � {t.count}</span><span>{pct}%</span></div><div className="w-full h-1.5 rounded-full bg-foreground/5"><div className={`h-full rounded-full ${t.cls}`} style={{ width: `${pct}%` }} /></div></div>;
                })}
              </div>
              <div className="lg:col-span-3 p-6 rounded-xl border border-foreground/10 bg-background">
                <h2 className="text-sm font-semibold mb-4">Recent Transactions</h2>
                <table className="w-full text-xs"><thead><tr className="border-b border-foreground/8 text-foreground/40"><th className="text-left pb-2">Email</th><th className="text-left pb-2">Plan</th><th className="text-left pb-2">Billing</th><th className="text-right pb-2">Amount</th></tr></thead>
                  <tbody className="divide-y divide-foreground/5">{transactions.map((tx) => (<tr key={tx.id}><td className="py-2.5 text-foreground/60 truncate max-w-[130px]">{tx.userEmail}</td><td className="py-2.5 capitalize text-foreground/60">{tx.plan}</td><td className="py-2.5 capitalize text-foreground/60">{tx.billingCycle}</td><td className="py-2.5 font-semibold text-right">${tx.amount}</td></tr>))}</tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div><h1 className="text-xl font-bold tracking-tight">Users</h1><p className="text-sm text-foreground/50 mt-0.5">{summary.totalUsers} registered accounts.</p></div>
            <div className="rounded-xl border border-foreground/10 bg-background overflow-hidden">
              <table className="w-full text-xs"><thead className="border-b border-foreground/10"><tr className="text-foreground/40 font-semibold"><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Email</th><th className="text-left px-4 py-3">Role</th><th className="text-left px-4 py-3">Plan</th><th className="text-left px-4 py-3">Joined</th></tr></thead>
                <tbody className="divide-y divide-foreground/5">{users.map((u) => (<tr key={u.uid} className="hover:bg-foreground/2 transition-colors"><td className="px-4 py-3 font-medium">{u.displayName}</td><td className="px-4 py-3 text-foreground/55">{u.email}</td><td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-foreground/5 text-foreground/40'}`}>{u.role}</span></td><td className="px-4 py-3 capitalize text-foreground/55">{u.plan}</td><td className="px-4 py-3 text-foreground/35">{new Date(u.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}</td></tr>))}</tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'designs' && (
          <div className="space-y-6">
            <div><h1 className="text-xl font-bold tracking-tight">Design Logs</h1><p className="text-sm text-foreground/50 mt-0.5">{projects.length} projects generated by users.</p></div>
            <div className="rounded-xl border border-foreground/10 bg-background overflow-hidden">
              <table className="w-full text-xs"><thead className="border-b border-foreground/10"><tr className="text-foreground/40 font-semibold"><th className="text-left px-4 py-3">Project</th><th className="text-left px-4 py-3">Style</th><th className="text-left px-4 py-3">Room</th><th className="text-left px-4 py-3">Budget</th><th className="text-left px-4 py-3">Previews</th><th className="text-left px-4 py-3">Date</th></tr></thead>
                <tbody className="divide-y divide-foreground/5">{projects.map((p) => { const up = users.find((u) => u.uid === p.userId); return (<tr key={p.id} className="hover:bg-foreground/2 transition-colors"><td className="px-4 py-3"><p className="font-medium">{p.name}</p><p className="text-foreground/35 mt-0.5">{up ? `${up.displayName} • ${up.email}` : p.userId}</p></td><td className="px-4 py-3 text-foreground/55">{p.style}</td><td className="px-4 py-3 text-foreground/55">{p.roomType}</td><td className="px-4 py-3 text-foreground/55">{p.budget}</td><td className="px-4 py-3"><div className="flex gap-1.5">{p.originalImageUrl && <a href={p.originalImageUrl} target="_blank" rel="noreferrer" title="Before"><img src={p.originalImageUrl} alt="Before" className="w-10 h-10 rounded object-cover border border-foreground/10 hover:border-primary transition-colors" /></a>}{p.generatedImageUrl && <a href={p.generatedImageUrl} target="_blank" rel="noreferrer" title="After"><img src={p.generatedImageUrl} alt="After" className="w-10 h-10 rounded object-cover border border-primary/20 hover:border-primary transition-colors" /></a>}</div></td><td className="px-4 py-3 text-foreground/35">{new Date(p.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}</td></tr>); })}</tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'blog' && (
          <div className="space-y-6">
            <div><h1 className="text-xl font-bold tracking-tight">Publish Article</h1><p className="text-sm text-foreground/50 mt-0.5">Add content to the blog feed.</p></div>
            <div className="max-w-2xl rounded-xl border border-foreground/10 bg-background p-6">
              <form onSubmit={handlePublishBlog} className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5"><label className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wide">Title</label><input type="text" required placeholder="Article title" value={blogTitle} onChange={(e) => { setBlogTitle(e.target.value); setBlogSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')); }} className="bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary text-foreground" /></div>
                  <div className="flex flex-col gap-1.5"><label className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wide">URL Slug</label><input type="text" required placeholder="article-url-slug" value={blogSlug} onChange={(e) => setBlogSlug(e.target.value)} className="bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary text-foreground" /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5"><label className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wide">Category</label><select value={blogCategory} onChange={(e) => setBlogCategory(e.target.value)} className="bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary text-foreground"><option>Interior Design</option><option>Home Decoration</option><option>Furniture Guides</option><option>Color Theory</option><option>Smart Home Ideas</option></select></div>
                  <div className="flex flex-col gap-1.5"><label className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wide">Read Time</label><input type="text" placeholder="5 min read" value={blogReadTime} onChange={(e) => setBlogReadTime(e.target.value)} className="bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary text-foreground" /></div>
                  <div className="flex flex-col gap-1.5"><label className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wide">Cover Image URL</label><input type="text" placeholder="https://..." value={blogImage} onChange={(e) => setBlogImage(e.target.value)} className="bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary text-foreground" /></div>
                </div>
                <div className="flex flex-col gap-1.5"><label className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wide">Content</label><textarea required placeholder="Write article content..." rows={8} value={blogContent} onChange={(e) => setBlogContent(e.target.value)} className="bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary text-foreground resize-none" /></div>
                {blogError && <div className="flex items-center gap-2 text-xs text-danger bg-danger/5 border border-danger/10 px-3 py-2 rounded-lg"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{blogError}</div>}
                {blogSuccess && <div className="flex items-center gap-2 text-xs text-success bg-success/5 border border-success/10 px-3 py-2 rounded-lg"><CheckCircle className="w-3.5 h-3.5 shrink-0" />Article published successfully.</div>}
                <button type="submit" disabled={publishing} className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold text-sm flex items-center gap-2 transition-colors disabled:opacity-50">
                  {publishing ? <><RefreshCw className="w-4 h-4 animate-spin" />Publishing...</> : <><Plus className="w-4 h-4" />Publish Article</>}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Subscriptions</h1>
              <p className="text-sm text-foreground/50 mt-0.5">Manage user plan activations and billing approvals.</p>
            </div>
            <div className="rounded-xl border border-foreground/10 bg-background overflow-hidden">
              <table className="w-full text-xs animate-fade-in">
                <thead className="border-b border-foreground/10 bg-secondary/5 dark:bg-white/5">
                  <tr className="text-foreground/40 font-semibold text-left">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Billing</th>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/5">
                  {subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-foreground/40">
                        No subscription requests found.
                      </td>
                    </tr>
                  ) : (
                    subscriptions.map((sub) => {
                      const userProfile = users.find((u) => u.uid === sub.userId);
                      return (
                        <tr key={sub.id} className="hover:bg-foreground/2 transition-colors">
                          <td className="px-4 py-3 font-medium">
                            <p>{userProfile?.displayName || 'User'}</p>
                            <p className="text-[10px] text-foreground/45">{userProfile?.email || sub.userId}</p>
                          </td>
                          <td className="px-4 py-3 capitalize">{sub.plan}</td>
                          <td className="px-4 py-3 font-semibold">${sub.price}</td>
                          <td className="px-4 py-3 capitalize">{sub.billingCycle}</td>
                          <td className="px-4 py-3 text-foreground/55">
                            <p>Start: {new Date(sub.startAt).toLocaleDateString([], { dateStyle: 'short' })}</p>
                            <p>End: {new Date(sub.endAt).toLocaleDateString([], { dateStyle: 'short' })}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                sub.status === 'active'
                                  ? 'bg-success/15 text-success'
                                  : 'bg-warning/15 text-warning animate-pulse'
                              }`}
                            >
                              {sub.status === 'active' ? 'Active' : 'Pending Approval'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {sub.status !== 'active' && (
                              <button
                                onClick={() => handleApproveSubscription(sub.id)}
                                disabled={submittingApprove === sub.id}
                                className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-[10px] uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
                              >
                                {submittingApprove === sub.id ? 'Approving...' : 'Approve'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
