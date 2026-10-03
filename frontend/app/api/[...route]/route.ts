import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '../../services/firebase.service';
import { aiService } from '../../services/ai.service';
import * as admin from 'firebase-admin';

// Helper to authenticate user via token
async function getAuthenticatedUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new Error('Access token required');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userProfile = await databaseService.getUser(decodedToken.uid);

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

    return {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role
    };
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    throw new Error('Invalid or expired access token');
  }
}

// Helper to enforce admin access
function requireAdmin(user: { role: 'admin' | 'user' }) {
  if (user.role !== 'admin') {
    throw new Error('Admin privileges required');
  }
}

// Catch-all GET handler
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ route: string[] }> }
) {
  const params = await props.params;
  const route = params.route;
  const path = route.join('/');

  try {
    // 1. GET auth/me
    if (path === 'auth/me') {
      const user = await getAuthenticatedUser(req);
      const profile = await databaseService.getUser(user.uid);
      if (!profile) {
        return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
      }
      return NextResponse.json(profile);
    }

    // 2. GET projects
    if (path === 'projects') {
      const user = await getAuthenticatedUser(req);
      const list = await databaseService.getProjects(user.uid);
      return NextResponse.json(list);
    }

    // 3. GET gallery
    if (path === 'gallery') {
      const allProjects = await databaseService.getProjects();
      return NextResponse.json(allProjects);
    }

    // 4. GET saved-designs
    if (path === 'saved-designs') {
      const user = await getAuthenticatedUser(req);
      const list = await databaseService.getSavedDesigns(user.uid);
      return NextResponse.json(list);
    }

    // 5. GET feedback
    if (path === 'feedback') {
      const reviews = await databaseService.getFeedbacks();
      return NextResponse.json(reviews);
    }

    // 6. GET notifications
    if (path === 'notifications') {
      const user = await getAuthenticatedUser(req);
      const notifs = await databaseService.getNotifications(user.uid);
      return NextResponse.json(notifs);
    }

    // 7. GET blogs
    if (path === 'blogs') {
      const list = await databaseService.getBlogs();
      return NextResponse.json(list);
    }

    // 8. GET blogs/:slug
    if (route[0] === 'blogs' && route.length === 2) {
      const blog = await databaseService.getBlogBySlug(route[1]);
      if (!blog) {
        return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
      }
      return NextResponse.json(blog);
    }

    // 9. GET admin/analytics
    if (path === 'admin/analytics') {
      const user = await getAuthenticatedUser(req);
      requireAdmin(user);

      const users = await databaseService.getAllUsers();
      const projects = await databaseService.getProjects();
      const transactions = await databaseService.getTransactions();
      const reviews = await databaseService.getFeedbacks();
      const aiDesigns = await databaseService.getAiDesigns();

      const totalUsers = users.length;
      const totalProjects = projects.length;
      const totalAiRequests = aiDesigns.length;
      const totalRevenue = transactions.reduce((acc, t) => acc + (t.status === 'completed' ? t.amount : 0), 0);

      const subscriptionBreakdown = {
        free: users.filter(u => u.subscription.plan === 'free').length,
        pro: users.filter(u => u.subscription.plan === 'pro').length,
        business: users.filter(u => u.subscription.plan === 'business').length,
      };

      return NextResponse.json({
        summary: {
          totalUsers,
          totalProjects,
          totalAiRequests,
          totalRevenue,
          activeSubscriptions: subscriptionBreakdown.pro + subscriptionBreakdown.business
        },
        subscriptionBreakdown,
        transactions: transactions.slice(0, 10),
        users: users.map(u => ({ uid: u.uid, email: u.email, displayName: u.displayName, role: u.role, plan: u.subscription.plan, createdAt: u.createdAt })),
        projects: projects.slice(0, 10)
      });
    }

    // 10. GET admin/subscriptions
    if (path === 'admin/subscriptions') {
      const user = await getAuthenticatedUser(req);
      requireAdmin(user);
      const list = await databaseService.getSubscriptions();
      return NextResponse.json(list);
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
  } catch (error: any) {
    const status = error.message.includes('required') || error.message.includes('expired') ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

// Catch-all POST handler
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ route: string[] }> }
) {
  const params = await props.params;
  const route = params.route;
  const path = route.join('/');

  try {
    const body = await req.json().catch(() => ({}));

    // 1. POST auth/sync
    if (path === 'auth/sync') {
      const { uid, email, displayName, photoURL } = body;
      if (!uid || !email) {
        return NextResponse.json({ error: 'UID and Email are required for syncing' }, { status: 400 });
      }
      let user = await databaseService.getUser(uid);
      if (!user) {
        user = await databaseService.createUser({ uid, email, displayName, photoURL });
      } else {
        user = await databaseService.updateUser(uid, { displayName, photoURL });
      }
      return NextResponse.json(user);
    }

    // 2. POST projects
    if (path === 'projects') {
      const user = await getAuthenticatedUser(req);
      const { name, style, budget, roomType, originalImageUrl, generatedImageUrl } = body;
      if (!name || !style || !roomType) {
        return NextResponse.json({ error: 'Project name, style, and roomType are required' }, { status: 400 });
      }
      const newProj = await databaseService.createProject({
        name,
        userId: user.uid,
        style,
        budget: budget || 'Under $2,000',
        roomType,
        originalImageUrl: originalImageUrl || '',
        generatedImageUrl: generatedImageUrl || ''
      });
      return NextResponse.json(newProj, { status: 201 });
    }

    // 3. POST designs/generate
    if (path === 'designs/generate') {
      const user = await getAuthenticatedUser(req);
      const { roomType, style, budget, theme, originalImageUrl, projectName } = body;

      if (!roomType || !style || !budget) {
        return NextResponse.json({ error: 'Missing roomType, style, or budget requirements' }, { status: 400 });
      }

      const aiResponse = await aiService.generateDesign({
        roomType,
        style,
        budget,
        theme,
        originalImageUrl
      });

      const finalProjName = projectName || `${style} ${roomType} Design`;
      const newProj = await databaseService.createProject({
        name: finalProjName,
        userId: user.uid,
        style,
        budget,
        roomType,
        originalImageUrl: originalImageUrl || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&fit=crop',
        generatedImageUrl: aiResponse.generatedImageUrl,
        promptSuggestions: aiResponse.promptSuggestions
      });

      await databaseService.createAiDesign({
        projectId: newProj.id,
        userId: user.uid,
        style,
        budget,
        roomType,
        responseText: aiResponse.responseText,
        originalImageUrl: newProj.originalImageUrl,
        generatedImageUrl: aiResponse.generatedImageUrl
      });

      await databaseService.createNotification({
        userId: user.uid,
        title: 'Design Generated Successfully!',
        message: `Your ${style} ${roomType} is ready. View it now on your Dashboard.`
      });

      return NextResponse.json({
        project: newProj,
        analysis: aiResponse.responseText
      }, { status: 201 });
    }

    // 4. POST saved-designs/:designId
    if (route[0] === 'saved-designs' && route.length === 2) {
      const user = await getAuthenticatedUser(req);
      await databaseService.saveDesign(user.uid, route[1]);
      return NextResponse.json({ success: true, message: 'Design saved to favorites' });
    }

    // 5. POST feedback
    if (path === 'feedback') {
      const user = await getAuthenticatedUser(req);
      const { rating, comment } = body;
      if (!rating || !comment) {
        return NextResponse.json({ error: 'Rating and comment are required' }, { status: 400 });
      }
      const userProfile = await databaseService.getUser(user.uid);
      const newFeedback = await databaseService.createFeedback({
        userId: user.uid,
        userName: userProfile?.displayName || user.email.split('@')[0] || 'User',
        userAvatar: userProfile?.photoURL || '',
        rating: Number(rating),
        comment
      });
      return NextResponse.json(newFeedback, { status: 201 });
    }

    // 6. POST checkout
    if (path === 'checkout') {
      const user = await getAuthenticatedUser(req);
      const { plan, billingCycle, cardholderName, cardNumber, expiryDate, cvv } = body;
      if (!plan || !billingCycle) {
        return NextResponse.json({ error: 'Plan and billingCycle are required' }, { status: 400 });
      }

      if (plan !== 'free' && (!cardholderName || !cardNumber || !expiryDate || !cvv)) {
        return NextResponse.json({ error: 'Payment details are required for paid subscriptions.' }, { status: 400 });
      }

      const price = plan === 'pro'
        ? (billingCycle === 'monthly' ? 29.00 : 290.00)
        : (billingCycle === 'monthly' ? 89.00 : 890.00);

      const transaction = await databaseService.createTransaction({
        userId: user.uid,
        userEmail: user.email,
        amount: price,
        status: 'pending',
        plan,
        billingCycle
      });

      const startAt = new Date().toISOString();
      const endAt = new Date(Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString();

      await databaseService.createSubscription({
        userId: user.uid,
        plan,
        status: 'inactive',
        price,
        billingCycle,
        startAt,
        endAt
      });

      await databaseService.createNotification({
        userId: user.uid,
        title: 'Subscription Requested!',
        message: `Your request to upgrade to DecorAI ${plan.toUpperCase()} is received and pending admin approval.`
      });

      return NextResponse.json({ success: true, transaction }, { status: 201 });
    }

    // 7. POST chat
    if (path === 'chat') {
      const { message, history } = body;
      if (!message) {
        return NextResponse.json({ error: 'Message is required' }, { status: 400 });
      }
      const responseText = await aiService.getChatbotResponse(message, history || []);
      return NextResponse.json({ response: responseText });
    }

    // 8. POST blogs
    if (path === 'blogs') {
      const user = await getAuthenticatedUser(req);
      requireAdmin(user);
      const { title, slug, content, author, category, image, readTime } = body;
      if (!title || !slug || !content) {
        return NextResponse.json({ error: 'Title, slug, and content are required' }, { status: 400 });
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
      return NextResponse.json(newBlog, { status: 201 });
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
  } catch (error: any) {
    const status = error.message.includes('required') || error.message.includes('expired') ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

// Catch-all PATCH handler
export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ route: string[] }> }
) {
  const params = await props.params;
  const route = params.route;
  const path = route.join('/');

  try {
    const body = await req.json().catch(() => ({}));

    // 1. PATCH auth/profile
    if (path === 'auth/profile') {
      const user = await getAuthenticatedUser(req);
      const updated = await databaseService.updateUser(user.uid, body);
      return NextResponse.json(updated);
    }

    // 2. PATCH notifications/:id/read
    if (route[0] === 'notifications' && route.length === 3 && route[2] === 'read') {
      await getAuthenticatedUser(req);
      await databaseService.markNotificationRead(route[1]);
      return NextResponse.json({ success: true });
    }

    // 3. PATCH blogs/:id
    if (route[0] === 'blogs' && route.length === 2) {
      const user = await getAuthenticatedUser(req);
      requireAdmin(user);
      const updated = await databaseService.updateBlog(route[1], body);
      return NextResponse.json(updated);
    }

    // 4. PATCH admin/subscriptions/:id/approve
    if (route[0] === 'admin' && route[1] === 'subscriptions' && route.length === 4 && route[3] === 'approve') {
      const user = await getAuthenticatedUser(req);
      requireAdmin(user);
      const sub = await databaseService.updateSubscriptionStatus(route[2], 'active');
      if (!sub) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
      }

      await databaseService.createNotification({
        userId: sub.userId,
        title: 'Subscription Approved!',
        message: `Your upgrade request to DecorAI ${sub.plan.toUpperCase()} has been approved. Enjoy your full benefits.`
      });

      return NextResponse.json({ success: true, subscription: sub });
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
  } catch (error: any) {
    const status = error.message.includes('required') || error.message.includes('expired') ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

// Catch-all DELETE handler
export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ route: string[] }> }
) {
  const params = await props.params;
  const route = params.route;

  try {
    // 1. DELETE projects/:id
    if (route[0] === 'projects' && route.length === 2) {
      const user = await getAuthenticatedUser(req);
      const proj = await databaseService.getProject(route[1]);
      if (!proj) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      if (proj.userId !== user.uid && user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized to delete this project' }, { status: 403 });
      }
      await databaseService.deleteProject(route[1]);
      return NextResponse.json({ success: true, message: 'Project deleted' });
    }

    // 2. DELETE saved-designs/:designId
    if (route[0] === 'saved-designs' && route.length === 2) {
      const user = await getAuthenticatedUser(req);
      await databaseService.unsaveDesign(user.uid, route[1]);
      return NextResponse.json({ success: true, message: 'Design unsaved' });
    }

    // 3. DELETE blogs/:id
    if (route[0] === 'blogs' && route.length === 2) {
      const user = await getAuthenticatedUser(req);
      requireAdmin(user);
      await databaseService.deleteBlog(route[1]);
      return NextResponse.json({ success: true, message: 'Blog deleted' });
    }

    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
  } catch (error: any) {
    const status = error.message.includes('required') || error.message.includes('expired') ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
