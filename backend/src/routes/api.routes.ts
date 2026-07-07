import { Router, Request, Response, NextFunction } from 'express';
import { databaseService } from '../services/firebase.service';
import { aiService } from '../services/ai.service';
import * as admin from 'firebase-admin';

const router = Router();

// Extend Request interface to hold authenticated user info
export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role: 'admin' | 'user';
  };
}

// Middleware: Authenticate user via Firebase Token
export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userProfile = await databaseService.getUser(decodedToken.uid);
    
    // If user does not exist in Firestore yet, create them dynamically
    let role: 'admin' | 'user' = 'user';
    if (userProfile) {
      role = userProfile.role;
    } else {
      await databaseService.createUser({
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        displayName: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
        photoURL: decodedToken.picture || ''
      });
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role
    };
    next();
    return;
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    res.status(403).json({ error: 'Invalid or expired access token' });
    return;
  }
}

// Middleware: Admin role guard
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin privileges required' });
    return;
  }
  next();
}

// --- 1. USER PROFILE ENDPOINTS ---
router.get('/auth/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const profile = await databaseService.getUser(req.user!.uid);
    if (!profile) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/auth/sync', async (req: Request, res: Response) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;
    if (!uid || !email) {
      res.status(400).json({ error: 'UID and Email are required for syncing' });
      return;
    }
    let user = await databaseService.getUser(uid);
    if (!user) {
      user = await databaseService.createUser({ uid, email, displayName, photoURL });
    } else {
      user = await databaseService.updateUser(uid, { displayName, photoURL });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/auth/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await databaseService.updateUser(req.user!.uid, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- 2. PROJECTS ENDPOINTS ---
router.get('/projects', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const list = await databaseService.getProjects(req.user!.uid);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/projects', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, style, budget, roomType, originalImageUrl, generatedImageUrl } = req.body;
    if (!name || !style || !roomType) {
      res.status(400).json({ error: 'Project name, style, and roomType are required' });
      return;
    }
    const newProj = await databaseService.createProject({
      name,
      userId: req.user!.uid,
      style,
      budget: budget || 'Under $2,000',
      roomType,
      originalImageUrl: originalImageUrl || '',
      generatedImageUrl: generatedImageUrl || ''
    });
    res.status(201).json(newProj);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/projects/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const proj = await databaseService.getProject(req.params.id);
    if (!proj) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    if (proj.userId !== req.user!.uid && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Unauthorized to delete this project' });
      return;
    }
    await databaseService.deleteProject(req.params.id);
    res.json({ success: true, message: 'Project deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- 3. AI DESIGN GENERATOR ---
router.post('/designs/generate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { roomType, style, budget, theme, originalImageUrl, projectName } = req.body;

    if (!roomType || !style || !budget) {
      res.status(400).json({ error: 'Missing roomType, style, or budget requirements' });
      return;
    }

    // Call AI Service
    const aiResponse = await aiService.generateDesign({
      roomType,
      style,
      budget,
      theme,
      originalImageUrl
    });

    // Create a saved Project for the user
    const finalProjName = projectName || `${style} ${roomType} Design`;
    const newProj = await databaseService.createProject({
      name: finalProjName,
      userId: req.user!.uid,
      style,
      budget,
      roomType,
      originalImageUrl: originalImageUrl || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&fit=crop',
      generatedImageUrl: aiResponse.generatedImageUrl,
      promptSuggestions: aiResponse.promptSuggestions
    });

    // Create AI Design record
    const aiDesign = await databaseService.createAiDesign({
      projectId: newProj.id,
      userId: req.user!.uid,
      style,
      budget,
      roomType,
      responseText: aiResponse.responseText,
      originalImageUrl: newProj.originalImageUrl,
      generatedImageUrl: aiResponse.generatedImageUrl
    });

    // Push notification to user
    await databaseService.createNotification({
      userId: req.user!.uid,
      title: 'Design Generated Successfully!',
      message: `Your ${style} ${roomType} is ready. View it now on your Dashboard.`
    });

    res.status(201).json({
      project: newProj,
      aiDesign,
      analysis: aiResponse.responseText
    });
  } catch (error: any) {
    console.error('Design generation endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- 4. PUBLIC GALLERY ENDPOINTS ---
router.get('/gallery', async (req: Request, res: Response) => {
  try {
    // Get all projects to serve as gallery samples
    const allProjects = await databaseService.getProjects();
    res.json(allProjects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- 5. WISHLIST & SAVED DESIGNS ---
router.get('/saved-designs', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const list = await databaseService.getSavedDesigns(req.user!.uid);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/saved-designs/:designId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await databaseService.saveDesign(req.user!.uid, req.params.designId);
    res.json({ success: true, message: 'Design saved to favorites' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/saved-designs/:designId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await databaseService.unsaveDesign(req.user!.uid, req.params.designId);
    res.json({ success: true, message: 'Design unsaved' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- 6. FEEDBACK & REVIEWS ---
router.get('/feedback', async (req: Request, res: Response) => {
  try {
    const reviews = await databaseService.getFeedbacks();
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/feedback', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment) {
      res.status(400).json({ error: 'Rating and comment are required' });
      return;
    }
    const user = await databaseService.getUser(req.user!.uid);
    const newFeedback = await databaseService.createFeedback({
      userId: req.user!.uid,
      userName: user?.displayName || user?.email.split('@')[0] || 'User',
      userAvatar: user?.photoURL || '',
      rating: Number(rating),
      comment
    });
    res.status(201).json(newFeedback);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- 7. NOTIFICATIONS ---
router.get('/notifications', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const notifs = await databaseService.getNotifications(req.user!.uid);
    res.json(notifs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/notifications/:id/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await databaseService.markNotificationRead(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- 8. SUBSCRIPTIONS & CHECKOUT SIMULATOR ---
router.post('/checkout', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { plan, billingCycle } = req.body;
    if (!plan || !billingCycle) {
      res.status(400).json({ error: 'Plan and billingCycle are required' });
      return;
    }
    const price = plan === 'pro' 
      ? (billingCycle === 'monthly' ? 29.00 : 290.00) 
      : (billingCycle === 'monthly' ? 89.00 : 890.00);

    // Create checkout transaction
    const transaction = await databaseService.createTransaction({
      userId: req.user!.uid,
      userEmail: req.user!.email,
      amount: price,
      status: 'completed',
      plan,
      billingCycle
    });

    // Create corresponding subscription
    const startAt = new Date().toISOString();
    const endAt = new Date(Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString();
    
    await databaseService.createSubscription({
      userId: req.user!.uid,
      plan,
      status: 'active',
      price,
      billingCycle,
      startAt,
      endAt
    });

    // Push notification
    await databaseService.createNotification({
      userId: req.user!.uid,
      title: 'Subscription Activated!',
      message: `Thank you for upgrading to DecorAI ${plan.toUpperCase()}. Enjoy your full benefits.`
    });

    res.status(201).json({ success: true, transaction });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- 9. CHAT ASSISTANT BOT ---
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }
    const responseText = await aiService.getChatbotResponse(message, history || []);
    res.json({ response: responseText });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- 10. BLOGS ENDPOINTS ---
router.get('/blogs', async (req: Request, res: Response) => {
  try {
    const list = await databaseService.getBlogs();
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/blogs/:slug', async (req: Request, res: Response) => {
  try {
    const blog = await databaseService.getBlogBySlug(req.params.slug);
    if (!blog) {
      res.status(404).json({ error: 'Blog not found' });
      return;
    }
    res.json(blog);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/blogs', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, slug, content, author, category, image, readTime } = req.body;
    if (!title || !slug || !content) {
      res.status(400).json({ error: 'Title, slug, and content are required' });
      return;
    }
    const newBlog = await databaseService.createBlog({
      title,
      slug,
      content,
      author: author || 'Admin',
      category: category || 'General',
      image: image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600&fit=crop',
      readTime: readTime || '3 min read'
    });
    res.status(201).json(newBlog);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/blogs/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await databaseService.updateBlog(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/blogs/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await databaseService.deleteBlog(req.params.id);
    res.json({ success: true, message: 'Blog deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- 11. ADMIN ANALYTICS ---
router.get('/admin/analytics', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const users = await databaseService.getAllUsers();
    const projects = await databaseService.getProjects();
    const transactions = await databaseService.getTransactions();
    const reviews = await databaseService.getFeedbacks();
    const aiDesigns = await databaseService.getAiDesigns();

    // Compute aggregation stats
    const totalUsers = users.length;
    const totalProjects = projects.length;
    const totalAiRequests = aiDesigns.length;
    const totalRevenue = transactions.reduce((acc, t) => acc + (t.status === 'completed' ? t.amount : 0), 0);

    const subscriptionBreakdown = {
      free: users.filter(u => u.subscription.plan === 'free').length,
      pro: users.filter(u => u.subscription.plan === 'pro').length,
      business: users.filter(u => u.subscription.plan === 'business').length,
    };

    res.json({
      summary: {
        totalUsers,
        totalProjects,
        totalAiRequests,
        totalRevenue,
        activeSubscriptions: subscriptionBreakdown.pro + subscriptionBreakdown.business
      },
      subscriptionBreakdown,
      transactions: transactions.slice(0, 10), // Limit last 10
      users: users.map(u => ({ uid: u.uid, email: u.email, displayName: u.displayName, role: u.role, plan: u.subscription.plan, createdAt: u.createdAt })),
      projects: projects.slice(0, 10)
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
