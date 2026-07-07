import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'user';
  createdAt: string;
  subscription: {
    plan: 'free' | 'pro' | 'business';
    status: 'active' | 'inactive';
    currentPeriodEnd: string;
  };
}

export interface Project {
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

export interface AIDesign {
  id: string;
  projectId: string;
  userId: string;
  style: string;
  budget: string;
  roomType: string;
  responseText: string;
  originalImageUrl: string;
  generatedImageUrl: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'pro' | 'business';
  status: 'active' | 'inactive';
  price: number;
  billingCycle: 'monthly' | 'yearly';
  startAt: string;
  endAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  plan: 'pro' | 'business';
  billingCycle: 'monthly' | 'yearly';
  date: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Blog {
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

export interface SavedDesign {
  id: string;
  userId: string;
  designId: string;
  savedAt: string;
}

// Interface defining all database operations
export interface IDatabase {
  isMock: boolean;
  
  // Users
  getUser(uid: string): Promise<UserProfile | null>;
  getAllUsers(): Promise<UserProfile[]>;
  createUser(profile: Partial<UserProfile> & { uid: string; email: string }): Promise<UserProfile>;
  updateUser(uid: string, data: Partial<UserProfile>): Promise<UserProfile>;
  
  // Projects
  getProjects(userId?: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  createProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project>;
  deleteProject(id: string): Promise<boolean>;

  // AI Designs
  getAiDesigns(userId?: string): Promise<AIDesign[]>;
  createAiDesign(design: Omit<AIDesign, 'id' | 'createdAt'>): Promise<AIDesign>;

  // Feedback
  getFeedbacks(): Promise<Feedback[]>;
  createFeedback(feedback: Omit<Feedback, 'id' | 'createdAt'>): Promise<Feedback>;

  // Subscriptions & Transactions
  getSubscriptions(userId?: string): Promise<Subscription[]>;
  createSubscription(sub: Omit<Subscription, 'id'>): Promise<Subscription>;
  getTransactions(userId?: string): Promise<Transaction[]>;
  createTransaction(tx: Omit<Transaction, 'id' | 'date'>): Promise<Transaction>;

  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notif: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification>;
  markNotificationRead(id: string): Promise<boolean>;

  // Blogs
  getBlogs(): Promise<Blog[]>;
  getBlogBySlug(slug: string): Promise<Blog | null>;
  createBlog(blog: Omit<Blog, 'id' | 'createdAt' | 'commentsCount'>): Promise<Blog>;
  updateBlog(id: string, blog: Partial<Blog>): Promise<Blog>;
  deleteBlog(id: string): Promise<boolean>;

  // Saved Designs
  getSavedDesigns(userId: string): Promise<Project[]>;
  saveDesign(userId: string, designId: string): Promise<boolean>;
  unsaveDesign(userId: string, designId: string): Promise<boolean>;
}

// In-Memory Mock Database implementation
class MockDatabase implements IDatabase {
  public isMock = true;

  private users: Map<string, UserProfile> = new Map();
  private projects: Map<string, Project> = new Map();
  private aiDesigns: Map<string, AIDesign> = new Map();
  private feedbacks: Feedback[] = [];
  private subscriptions: Subscription[] = [];
  private transactions: Transaction[] = [];
  private notifications: Notification[] = [];
  private blogs: Blog[] = [];
  private savedDesigns: SavedDesign[] = [];

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed default admin and users
    this.users.set('admin-uid', {
      uid: 'admin-uid',
      email: 'admin@decorai.com',
      displayName: 'DecorAI Administrator',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop',
      role: 'admin',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      subscription: { plan: 'business', status: 'active', currentPeriodEnd: '2027-01-01T00:00:00.000Z' }
    });

    this.users.set('user-uid', {
      uid: 'user-uid',
      email: 'client@decorai.com',
      displayName: 'Alexander Sterling',
      photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&fit=crop',
      role: 'user',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      subscription: { plan: 'pro', status: 'active', currentPeriodEnd: '2026-07-22T16:21:36.000Z' }
    });

    // Seed default projects for Gallery & Masonry display
    const sampleProjects: Omit<Project, 'id' | 'createdAt'>[] = [
      {
        name: 'Luxurious Golden Living Room',
        userId: 'user-uid',
        style: 'Luxury',
        budget: '$10,000+',
        roomType: 'Living Room',
        originalImageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&fit=crop',
        generatedImageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600&fit=crop',
        promptSuggestions: 'Incorporate velvet mustard armchairs, luxury golden trim chandeliers, and dynamic warm marble accents.'
      },
      {
        name: 'Scandinavian Serenity Bedroom',
        userId: 'admin-uid',
        style: 'Scandinavian',
        budget: '$2,000 - $5,000',
        roomType: 'Bedroom',
        originalImageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&fit=crop',
        generatedImageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=600&fit=crop',
        promptSuggestions: 'Use oak wood headboards, linen sheets in neutral tones, minimalist reading lamps, and potted olive plants.'
      },
      {
        name: 'Industrial Minimalist Kitchen',
        userId: 'user-uid',
        style: 'Industrial',
        budget: '$5,000 - $10,000',
        roomType: 'Kitchen',
        originalImageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&fit=crop',
        generatedImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&fit=crop',
        promptSuggestions: 'Add matte black concrete countertops, exposed metal racks, brick walls, and warm Edison light bulbs.'
      },
      {
        name: 'Zen Japanese Bathroom',
        userId: 'admin-uid',
        style: 'Japanese',
        budget: '$5,000 - $10,000',
        roomType: 'Bathroom',
        originalImageUrl: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=600&fit=crop',
        generatedImageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=600&fit=crop',
        promptSuggestions: 'Integrate natural cedar wood bathtubs, dark river stone details, minimalist shoji screens, and bonsai plants.'
      },
      {
        name: 'Chic Bohemian Workspace',
        userId: 'user-uid',
        style: 'Bohemian',
        budget: 'Under $2,000',
        roomType: 'Office',
        originalImageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&fit=crop',
        generatedImageUrl: 'https://images.unsplash.com/photo-1581428982868-e410dd047a90?q=80&w=600&fit=crop',
        promptSuggestions: 'Include rattan office chairs, hanging macramé planters, layered textured rugs, and warm fairy lights.'
      },
      {
        name: 'Modern Minimalist Living Room',
        userId: 'user-uid',
        style: 'Minimalist',
        budget: 'Under $2,000',
        roomType: 'Living Room',
        originalImageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600&fit=crop',
        generatedImageUrl: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=600&fit=crop',
        promptSuggestions: 'Low-profile light gray linen sofas, circular matte black metal coffee tables, minimalist light oak shelving units, and clean warm track lighting.'
      },
      {
        name: 'Luxury Contemporary Office',
        userId: 'admin-uid',
        style: 'Contemporary',
        budget: '$10,000+',
        roomType: 'Office',
        originalImageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&fit=crop',
        generatedImageUrl: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=600&fit=crop',
        promptSuggestions: 'Rich walnut executive desks, premium leather swivel chairs, gold accents on wall shelving, custom linear warm pendant lighting, and velvet privacy drapes.'
      },
      {
        name: 'Scandinavian Cozy Outdoor Patio',
        userId: 'user-uid',
        style: 'Scandinavian',
        budget: 'Under $2,000',
        roomType: 'Outdoor',
        originalImageUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=600&fit=crop',
        generatedImageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=600&fit=crop',
        promptSuggestions: 'Weathered teak wood benches, comfortable off-white outdoor cushions, warm string lights, stone planters with green ferns, and light knit throw blankets.'
      },
      {
        name: 'Industrial Modern Apartment Bedroom',
        userId: 'admin-uid',
        style: 'Industrial',
        budget: '$2,000 - $5,000',
        roomType: 'Apartment',
        originalImageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&fit=crop',
        generatedImageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=600&fit=crop',
        promptSuggestions: 'Platform bed with black iron frames, concrete style accent wall, exposed bronze water pipe decorations, soft gray linen sheets, and warm brass bedside lamps.'
      },
      {
        name: 'Modern Luxury Full House Design',
        userId: 'user-uid',
        style: 'Luxury',
        budget: '$10,000+',
        roomType: 'Full House',
        originalImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&fit=crop',
        generatedImageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=600&fit=crop',
        promptSuggestions: 'Integrated marble wall paneling, built-in ambient warm LED strip lighting, custom designer velvet sofas, golden metal side tables, and premium oak hardwood floors.'
      },
      {
        name: 'Bohemian Cozy Kitchen',
        userId: 'admin-uid',
        style: 'Bohemian',
        budget: '$2,000 - $5,000',
        roomType: 'Kitchen',
        originalImageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&fit=crop',
        generatedImageUrl: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=600&fit=crop',
        promptSuggestions: 'Earthy terracotta tiled backsplash, open oak shelves with colorful ceramic bowls, hanging macramé herb baskets, and copper kitchen faucet fittings.'
      },
      {
        name: 'Japanese Minimalist Living Room',
        userId: 'user-uid',
        style: 'Japanese',
        budget: '$2,000 - $5,000',
        roomType: 'Living Room',
        originalImageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&fit=crop',
        generatedImageUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=600&fit=crop',
        promptSuggestions: 'Low tatami floor tables, circular off-white floor cushions, solid natural cedar cabinets, shoji sliding window screens, and clean white ceramic vases with dry reeds.'
      },
      {
        name: 'Modern Industrial Outdoor Terrace',
        userId: 'admin-uid',
        style: 'Industrial',
        budget: '$5,000 - $10,000',
        roomType: 'Outdoor',
        originalImageUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=600&fit=crop',
        generatedImageUrl: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?q=80&w=600&fit=crop',
        promptSuggestions: 'Exposed concrete block dining tables, dark steel structural chairs, overhead copper Edison pendant lighting string, and rustic wood panel fence walls.'
      },
      {
        name: 'Contemporary Nordic Bathroom',
        userId: 'user-uid',
        style: 'Contemporary',
        budget: '$2,000 - $5,000',
        roomType: 'Bathroom',
        originalImageUrl: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=600&fit=crop',
        generatedImageUrl: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?q=80&w=600&fit=crop',
        promptSuggestions: 'Matte white freestanding bathtub, warm ash wood vanity table, round mirror with backlit LED halo light, and sage green ceramic tiles.'
      },
      {
        name: 'Luxury Executive Office',
        userId: 'admin-uid',
        style: 'Luxury',
        budget: '$5,000 - $10,000',
        roomType: 'Office',
        originalImageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&fit=crop',
        generatedImageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600&fit=crop',
        promptSuggestions: 'Fluted wall paneling, charcoal gray leather reading chairs, brushed brass floor lamps, dark marble desk tops, and thick premium weave oriental rugs.'
      },
      {
        name: 'Minimalist Modern Apartment Kitchen',
        userId: 'user-uid',
        style: 'Minimalist',
        budget: '$5,000 - $10,000',
        roomType: 'Apartment',
        originalImageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&fit=crop',
        generatedImageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8e8e?q=80&w=600&fit=crop',
        promptSuggestions: 'Flat-panel seamless oak cabinets, pure white quartz countertops, integrated handles, hidden refrigerator panel, and white glass pendant lights.'
      },
      {
        name: 'Zen Scandinavian Bedroom',
        userId: 'admin-uid',
        style: 'Scandinavian',
        budget: '$5,000 - $10,000',
        roomType: 'Bedroom',
        originalImageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&fit=crop',
        generatedImageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=600&fit=crop',
        promptSuggestions: 'Floating white oak bed frames, neutral beige textured linen curtains, round paper globe ceiling light, and light ash wood nightstands.'
      }
    ];

    sampleProjects.forEach((proj, idx) => {
      const id = `project-00${idx + 1}`;
      this.projects.set(id, {
        ...proj,
        id,
        createdAt: new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString()
      });
      // Add matching AI Designs
      this.aiDesigns.set(`design-00${idx + 1}`, {
        id: `design-00${idx + 1}`,
        projectId: id,
        userId: proj.userId,
        style: proj.style,
        budget: proj.budget,
        roomType: proj.roomType,
        responseText: `AI analysis of your ${proj.roomType}: Under the ${proj.style} theme, we recommend adding ${proj.promptSuggestions}. The lighting should be soft and indirect, emphasizing the rich textures.`,
        originalImageUrl: proj.originalImageUrl,
        generatedImageUrl: proj.generatedImageUrl,
        createdAt: new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString()
      });
    });

    // Seed Feedbacks
    this.feedbacks = [
      {
        id: 'fb-1',
        userId: 'user-uid',
        userName: 'Alexander Sterling',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&fit=crop',
        rating: 5,
        comment: 'DecorAI turned my messy, uninspired bedroom into a Nordic sanctuary in seconds. The before/after slider is amazing, and the layout recommendations were incredibly accurate!',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'fb-2',
        userId: 'fb-user-2',
        userName: 'Eleanor Vance',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&h=256&fit=crop',
        rating: 5,
        comment: 'As an interior design enthusiast, I love playing around with styles. DecorAI is lightning fast and offers beautiful color palettes that actually match local retail supplies.',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'fb-3',
        userId: 'fb-user-3',
        userName: 'Marcus Chen',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&fit=crop',
        rating: 4,
        comment: 'Highly responsive chatbot! It gave me brilliant suggestions for my dark industrial-themed kitchen. Best AI visualizer out there.',
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'fb-4',
        userId: 'fb-user-4',
        userName: 'Sarah Jenkins',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&fit=crop',
        rating: 5,
        comment: 'I used the Modern style to stage a living room for a listing. The client was absolutely blown away, and the house sold in under a week. The photorealistic rendering is highly accurate.',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'fb-5',
        userId: 'fb-user-5',
        userName: 'David Thorne',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&fit=crop',
        rating: 5,
        comment: 'Absolutely perfect budget breakdown. I set my cap at $5,000, and it gave me an itemized list of furniture that fits standard retail categories. Saved me hours of research.',
        createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'fb-6',
        userId: 'fb-user-6',
        userName: 'Nisha Patel',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop',
        rating: 5,
        comment: 'DecorAI helped us visualize a Bohemian setup for our new sunroom. The textures, hanging plants, and color balance recommendations made it feel so alive. Highly recommended!',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'fb-7',
        userId: 'fb-user-7',
        userName: 'Liam O\'Connor',
        userAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&h=256&fit=crop',
        rating: 4,
        comment: 'The rendering speed is impressive—less than 4 seconds. The high-res download is crystal clear. I only wish there was an undo button in the style dropdown, but otherwise a flawless tool.',
        createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'fb-8',
        userId: 'fb-user-8',
        userName: 'Elena Rostova',
        userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&h=256&fit=crop',
        rating: 5,
        comment: 'As a professional architect, I was skeptical about spatial AI. However, this platform preserves doors, windows, and structural lines with extreme precision. Outstanding staging tool.',
        createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'fb-9',
        userId: 'fb-user-9',
        userName: 'James Miller',
        userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&h=256&fit=crop',
        rating: 5,
        comment: 'The Luxury style recommendations are elite. It suggested velvets, gold trim, and premium lighting that completely redefined my master suite. Feels like a five-star hotel now.',
        createdAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'fb-10',
        userId: 'fb-user-10',
        userName: 'Chloe Zhao',
        userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&h=256&fit=crop',
        rating: 5,
        comment: 'I tried the Japanese Zen theme for my study. The combination of bamboo frames and earthy tones created a perfect working environment. Very clean and minimalist.',
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'fb-11',
        userId: 'fb-user-11',
        userName: 'Omar Farooq',
        userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=256&h=256&fit=crop',
        rating: 5,
        comment: 'Excellent client layout export feature on the Business plan! My clients love the before/after comparisons we print for them. It has streamlined our entire design pitching workflow.',
        createdAt: new Date(Date.now() - 39 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'fb-12',
        userId: 'fb-user-12',
        userName: 'Sophia Martinez',
        userAvatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=256&h=256&fit=crop',
        rating: 4,
        comment: 'Great color palette generation based on professional color theories. It helped us solve a major paint contrast issue in our hallway. Very easy to use.',
        createdAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'fb-13',
        userId: 'fb-user-13',
        userName: 'Benjamin Wright',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&fit=crop',
        rating: 5,
        comment: 'A game-changer for real estate staging. Uploading property photos and instantly getting industrial and contemporary designs saves us thousands in physical furniture rentals.',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Seed Transactions (For revenue tracking)
    this.transactions = [
      { id: 'tx-1', userId: 'user-uid', userEmail: 'client@decorai.com', amount: 29.00, status: 'completed', plan: 'pro', billingCycle: 'monthly', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'tx-2', userId: 'tx-user-2', userEmail: 'sarah.k@gmail.com', amount: 290.00, status: 'completed', plan: 'pro', billingCycle: 'yearly', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'tx-3', userId: 'tx-user-3', userEmail: 'design.studio@outlook.com', amount: 89.00, status: 'completed', plan: 'business', billingCycle: 'monthly', date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'tx-4', userId: 'tx-user-4', userEmail: 'vance.e@arch.co', amount: 89.00, status: 'completed', plan: 'business', billingCycle: 'monthly', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
    ];

    // Seed Blogs
    this.blogs = [
      {
        id: 'blog-1',
        slug: 'color-theory-luxury-interiors',
        title: 'Understanding Color Theory in Luxury Interior Design',
        content: 'When designing a luxury interior, color theory plays a vital role. In this article, we cover how muted primary tones like gold, champagne, and velvet navy evoke premium feeling when combined with organic wood accents...',
        author: 'Muhammad Bilal',
        category: 'Color Theory',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600&fit=crop',
        readTime: '5 min read',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 12
      },
      {
        id: 'blog-2',
        slug: 'scandinavian-minimalism-trends',
        title: 'Scandinavian Minimalism: Top 5 Trends for 2026',
        content: 'Scandinavian design stands on simplicity, functionalism, and beauty. Explore how clean lines, textures over prints, and sustainable craft furniture define the premium nordic layouts in 2026...',
        author: 'Ayaan Tanveer',
        category: 'Interior Design',
        image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=600&fit=crop',
        readTime: '4 min read',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 8
      },
      {
        id: 'blog-3',
        slug: 'smart-lighting-integration-guide',
        title: 'The Essential Guide to Smart Lighting Integration',
        content: 'Smart homes are no longer a future trend. Integrating ambient dimmers, architectural spotlights, and customizable RGB strips with interior design adds dynamic control and unmatched spatial depth...',
        author: 'Muhammad Bilal',
        category: 'Smart Home Ideas',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&fit=crop',
        readTime: '6 min read',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 3
      },
      {
        id: 'blog-4',
        slug: 'space-planning-furniture-guides',
        title: 'The Art of Space Planning: Choosing the Right Furniture',
        content: 'Selecting the correct scale of furniture is the single most critical decision in interior layouts. Learn how to map walking lanes, utilize multi-functional modular pieces, and coordinate contrasting textures to maximize flow in compact apartments.',
        author: 'Ayaan Tanveer',
        category: 'Furniture Guides',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600&fit=crop',
        readTime: '8 min read',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 5
      },
      {
        id: 'blog-5',
        slug: 'biophilic-design-home-decoration',
        title: 'Biophilic Design: Integrating Nature into Modern Homes',
        content: 'Incorporating plants and organic elements into residential spaces does more than clean the air. Discover modern techniques to coordinate natural cedar details, moss accent walls, and river stone setups in your bathroom and kitchen design.',
        author: 'Muhammad Bilal',
        category: 'Home Decoration',
        image: 'https://images.unsplash.com/photo-1581428982868-e410dd047a90?q=80&w=600&fit=crop',
        readTime: '7 min read',
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 9
      },
      {
        id: 'blog-6',
        slug: 'contrast-accent-walls-color-theory',
        title: 'Chasing Contrast: The Master Class on Accent Walls',
        content: 'Accent walls are the visual focal point of any living area. Explore our breakdown of high-contrast painting options, greige color theory balances, and textured wall paneling to establish spatial depth in high-ceiling entryways.',
        author: 'Muhammad Bilal',
        category: 'Color Theory',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600&fit=crop',
        readTime: '6 min read',
        createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 4
      },
      {
        id: 'blog-7',
        slug: 'hidden-tech-smart-home',
        title: 'Hidden Tech: Seamless Smart Integration in Living Spaces',
        content: 'Technology should support design, not distract from it. Learn how custom-built sliding panel systems, motorized ceiling drops, and invisible wall speaker wraps keep your contemporary layouts sleek and clean.',
        author: 'Muhammad Bilal',
        category: 'Smart Home Ideas',
        image: 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=600&fit=crop',
        readTime: '9 min read',
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 6
      },
      {
        id: 'blog-8',
        slug: 'industrial-revival-interior-design',
        title: 'The Industrial Revival: Embracing Concrete and Iron',
        content: 'Exposed bricks, dark concrete slab tables, and structural iron frames are redefining metropolitan apartments. Find out how to balance these raw, cold textures with rich cognac leather, warm rugs, and Edison light bulbs.',
        author: 'Ayaan Tanveer',
        category: 'Interior Design',
        image: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=600&fit=crop',
        readTime: '10 min read',
        createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 11
      },
      {
        id: 'blog-9',
        slug: 'lighting-furniture-guides',
        title: 'Lighting coordinates: Statement Chandeliers vs Spotlights',
        content: 'Lighting coordinates can define or break a room. Learn why low-hanging linear chandeliers are perfect for executive dining tables, and how recessed warm spotlight halos establish spatial boundaries in open-concept floorplans.',
        author: 'Ayaan Tanveer',
        category: 'Furniture Guides',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&fit=crop',
        readTime: '5 min read',
        createdAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 2
      },
      {
        id: 'blog-10',
        slug: 'minimalist-textiles-decoration',
        title: 'Minimalist Textiles: Linen, Jute, and Bouclé in 2026',
        content: 'Texture is the new color. Bouclé lounge chairs, raw linen drapery, and woven jute area rugs add visual depth without relying on busy patterns. Our guide shows how to blend these materials inside contemporary layouts.',
        author: 'Muhammad Bilal',
        category: 'Home Decoration',
        image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=600&fit=crop',
        readTime: '6 min read',
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 7
      },
      // Color Theory Seeds (Need 6 more for a total of 8)
      {
        id: 'blog-11',
        slug: 'monochromatic-palette-tips',
        title: 'The Elegance of Monochromatic Color Schemes',
        content: 'Muted neutrals, warm greige, and soft charcoal can establish a highly cohesive, calm, and premium atmosphere in master bedrooms when mapped to low-contrast boundaries...',
        author: 'Muhammad Bilal',
        category: 'Color Theory',
        image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=600&fit=crop',
        readTime: '6 min read',
        createdAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 5
      },
      {
        id: 'blog-12',
        slug: 'warm-vs-cool-undertones',
        title: 'Determining Undertones: Warm vs Cool Interior Balances',
        content: 'Understanding how natural daylight shifts gray paint from cool blue to pale yellow is the secret to selecting appropriate base shades and avoiding sterile staging environments...',
        author: 'Ayaan Tanveer',
        category: 'Color Theory',
        image: 'https://images.unsplash.com/photo-1618219944342-824e40a13285?q=80&w=600&fit=crop',
        readTime: '5 min read',
        createdAt: new Date(Date.now() - 41 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 3
      },
      {
        id: 'blog-13',
        slug: 'earthy-terracotta-accents',
        title: 'Terracotta and Sage: The Earthy Palette of 2026',
        content: 'Earthy tones are dominating modern rustic projects. Incorporating clay pigments, dusty sage green, and brushed brass details provides a organic warmth to bathroom and kitchen areas.',
        author: 'Muhammad Bilal',
        category: 'Color Theory',
        image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=600&fit=crop',
        readTime: '7 min read',
        createdAt: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 9
      },
      {
        id: 'blog-14',
        slug: 'dark-moody-ceilings-guide',
        title: 'Moody Design: Why You Should Paint Your Ceilings Dark',
        content: 'Low ceilings can feel cozy and high ceilings dramatic when treated with deep charcoal, forest green, or navy tones. We discuss visual height illusions and paint finish matching rules.',
        author: 'Ayaan Tanveer',
        category: 'Color Theory',
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&fit=crop',
        readTime: '8 min read',
        createdAt: new Date(Date.now() - 47 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 11
      },
      {
        id: 'blog-15',
        slug: 'psychology-of-greige-interiors',
        title: 'The Psychology of Greige: Achieving Peaceful Living Spaces',
        content: 'Greige sits perfectly between cold gray and warm beige. We examine how this quiet color choice controls occupant stress, reduces sensory clutter, and behaves under warm led coordinates.',
        author: 'Muhammad Bilal',
        category: 'Color Theory',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600&fit=crop',
        readTime: '5 min read',
        createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 6
      },
      {
        id: 'blog-16',
        slug: 'contrasting-trims-doors-ideas',
        title: 'Bold Trims: High-Contrast Painting for Doors and Moldings',
        content: 'Ditch standard white moldings. Learn why dark espresso or olive green doors highlight classical architectural details and create custom focal frames in long hallways.',
        author: 'Ayaan Tanveer',
        category: 'Color Theory',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&fit=crop',
        readTime: '6 min read',
        createdAt: new Date(Date.now() - 53 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 4
      },
      // Interior Design Seeds (Need 6 more for a total of 8)
      {
        id: 'blog-17',
        slug: 'japandi-fusion-philosophies',
        title: 'Japandi Style: The Harmonic Blend of East and West',
        content: 'Combining Scandinavian functionality with Japanese Zen simplicity creates spaces that feel both refined and warm. Explore bamboo coordinates, paper pendant shades, and cedar accents.',
        author: 'Ayaan Tanveer',
        category: 'Interior Design',
        image: 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?q=80&w=600&fit=crop',
        readTime: '7 min read',
        createdAt: new Date(Date.now() - 39 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 8
      },
      {
        id: 'blog-18',
        slug: 'contemporary-loft-spacing-ideas',
        title: 'Maximalist Lofts: Coordinating Tall Walls and Open Areas',
        content: 'High-ceiling loft apartments require careful scaling. Discover custom wainscoting paneling, oversized canvases, and suspended linear light configurations to group distinct seating zones.',
        author: 'Muhammad Bilal',
        category: 'Interior Design',
        image: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?q=80&w=600&fit=crop',
        readTime: '9 min read',
        createdAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 14
      },
      {
        id: 'blog-19',
        slug: 'coastal-revival-organic-textures',
        title: 'Modern Coastal Revival: Beyond the Blue-and-White Clichés',
        content: 'Coastal design in 2026 is grounded in organic linen textures, bleached white oak floors, and dry ocean driftwood elements. Say goodbye to anchors and stripes and welcome calm simplicity.',
        author: 'Ayaan Tanveer',
        category: 'Interior Design',
        image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=600&fit=crop',
        readTime: '6 min read',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 5
      },
      {
        id: 'blog-20',
        slug: 'art-deco-luxury-accents',
        title: 'Art Deco Return: Integrating Bold Curves and Gold Metals',
        content: 'The structural geometry of the 1920s returns. Integrate rounded velvet armchairs, gold inlay detailing, and brass hardware into modern staging setups to create focal highlights.',
        author: 'Muhammad Bilal',
        category: 'Interior Design',
        image: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=600&fit=crop',
        readTime: '8 min read',
        createdAt: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 10
      },
      {
        id: 'blog-21',
        slug: 'rustic-farmhouse-revised-styling',
        title: 'Modern Farmhouse Revised: A Cleaner Approach to Country Living',
        content: 'Moving away from distressed signs toward clean lime-wash plaster walls, antique statement furniture, and raw black iron hardware. Achieve a timeless country balance without the visual clutter.',
        author: 'Ayaan Tanveer',
        category: 'Interior Design',
        image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=600&fit=crop',
        readTime: '6 min read',
        createdAt: new Date(Date.now() - 51 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 7
      },
      {
        id: 'blog-22',
        slug: 'mid-century-modern-furnishings-mix',
        title: 'Mid-Century Modern: Integrating Vintage Outlines in Modern Rooms',
        content: 'Teak credenzas, tapered legs, and organic shapes. How to blend retro mid-century furniture pieces with clean, bright color bases and modern architectural grids.',
        author: 'Muhammad Bilal',
        category: 'Interior Design',
        image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=600&fit=crop',
        readTime: '7 min read',
        createdAt: new Date(Date.now() - 54 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 9
      },
      // Smart Home Ideas Seeds (Need 6 more for a total of 8)
      {
        id: 'blog-23',
        slug: 'automated-shading-system-benefits',
        title: 'Automated Shading: Balancing Natural Daylight and Solar Control',
        content: 'Smart motorized curtains adjust automatically throughout the day, protecting custom staging fabrics from sun-fade and optimizing room temperature profiles dynamically.',
        author: 'Muhammad Bilal',
        category: 'Smart Home Ideas',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&fit=crop',
        readTime: '6 min read',
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 4
      },
      {
        id: 'blog-24',
        slug: 'hidden-wall-screens-integrated-media',
        title: 'Invisible Screens: Seamless Integrated Projector Displays',
        content: 'Say goodbye to large black television monitors occupying statement walls. Discover drop-down screen slots and short-throw laser projectors integrated into minimalist credenzas.',
        author: 'Ayaan Tanveer',
        category: 'Smart Home Ideas',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&fit=crop',
        readTime: '7 min read',
        createdAt: new Date(Date.now() - 43 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 8
      },
      {
        id: 'blog-25',
        slug: 'integrated-smart-kitchens-appliances',
        title: 'The Automated Kitchen: Tech Integrations for Chef Spaces',
        content: 'Voice-controlled pantry lights, smart touchless faucets, and hidden counter power panels keep kitchen prep zones highly functional and sleekly staged.',
        author: 'Muhammad Bilal',
        category: 'Smart Home Ideas',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&fit=crop',
        readTime: '8 min read',
        createdAt: new Date(Date.now() - 46 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 12
      },
      {
        id: 'blog-26',
        slug: 'climate-zones-smart-thermostats-architects',
        title: 'Invisible Climate Controls: Multi-Zone Architectural Venting',
        content: 'Integrating hidden linear slot diffusers and localized climate sensors preserves clean wall profiles while ensuring temperature consistency across open residential staging layouts.',
        author: 'Ayaan Tanveer',
        category: 'Smart Home Ideas',
        image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=600&fit=crop',
        readTime: '6 min read',
        createdAt: new Date(Date.now() - 49 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 3
      },
      {
        id: 'blog-27',
        slug: 'smart-bathroom-spa-systems-sensors',
        title: 'Smart Bathroom Spas: Motion Sensors and Temperature Control',
        content: 'Digital thermostatic valves, touchless defogging mirrors, and programmable floor heating grids create a luxury resort atmosphere in compact master bathroom layouts.',
        author: 'Muhammad Bilal',
        category: 'Smart Home Ideas',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&fit=crop',
        readTime: '7 min read',
        createdAt: new Date(Date.now() - 52 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 6
      },
      {
        id: 'blog-28',
        slug: 'sound-treatment-acoustic-panels-aesthetic',
        title: 'Acoustic Styling: Custom Sound Panels that Double as Canvas Art',
        content: 'Home theaters and listening rooms require sound treatment. Learn how to construct custom-printed acoustic fabric panels that look like luxury art pieces.',
        author: 'Ayaan Tanveer',
        category: 'Smart Home Ideas',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&fit=crop',
        readTime: '9 min read',
        createdAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 5
      },
      // Furniture Guides Seeds (Need 6 more for a total of 8)
      {
        id: 'blog-29',
        slug: 'modular-sofas-sectional-spacing',
        title: 'Sectional Layouts: Placing Modular Sofas in Living Spaces',
        content: 'A complete scale guide on choosing between L-shaped couches, symmetrical U-sectionals, and standalone armchairs to maintain walking clearance and visual balance.',
        author: 'Ayaan Tanveer',
        category: 'Furniture Guides',
        image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=600&fit=crop',
        readTime: '6 min read',
        createdAt: new Date(Date.now() - 37 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 8
      },
      {
        id: 'blog-30',
        slug: 'accent-chairs-contrasting-styles',
        title: 'Choosing the Perfect Accent Chair: Contrast and Balance',
        content: 'How to place a structural leather lounger alongside a neutral fabric sofa to add texture and form without cluttering main entryway walking lanes.',
        author: 'Muhammad Bilal',
        category: 'Furniture Guides',
        image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=600&fit=crop',
        readTime: '5 min read',
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 6
      },
      {
        id: 'blog-31',
        slug: 'custom-dining-table-size-rules',
        title: 'Dining Tables sizing: Mapping Clear Walkways and Seat Spacing',
        content: 'Ensure at least 3 feet of clearance behind every chair. Here is how to select between round white oak tables for apartments and long linear tables for open plans.',
        author: 'Ayaan Tanveer',
        category: 'Furniture Guides',
        image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?q=80&w=600&fit=crop',
        readTime: '7 min read',
        createdAt: new Date(Date.now() - 43 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 11
      },
      {
        id: 'blog-32',
        slug: 'bedroom-bedframe-size-selections',
        title: 'Bedframe Scale: Optimizing Bedroom Storage and Walkways',
        content: 'From low king platforms to floating bedframes, learn which structural bed outlines match compact layouts and allow proper drawer and wardrobe clearance.',
        author: 'Muhammad Bilal',
        category: 'Furniture Guides',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=600&fit=crop',
        readTime: '6 min read',
        createdAt: new Date(Date.now() - 46 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 5
      },
      {
        id: 'blog-33',
        slug: 'ergonomic-office-chair-aesthetics',
        title: 'Office Furniture: Blending Ergonomic Chairs with Aesthetic Desks',
        content: 'Ditch boring office layouts. Selecting leather executive chairs, integrated cable channels, and sleek minimalist desks for high-end home staging configurations.',
        author: 'Ayaan Tanveer',
        category: 'Furniture Guides',
        image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&fit=crop',
        readTime: '8 min read',
        createdAt: new Date(Date.now() - 49 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 7
      },
      {
        id: 'blog-34',
        slug: 'outdoor-patio-furniture-durability-tips',
        title: 'Patio Coordinates: Selecting Weatherproof Staging Furniture',
        content: 'Teak wood, powder-coated aluminum, and outdoor performance ropes. Discover the best outdoor coordinates that stand weather changes while maintaining luxury design.',
        author: 'Muhammad Bilal',
        category: 'Furniture Guides',
        image: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?q=80&w=600&fit=crop',
        readTime: '7 min read',
        createdAt: new Date(Date.now() - 52 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 4
      },
      // Home Decoration Seeds (Need 6 more for a total of 8)
      {
        id: 'blog-35',
        slug: 'curated-bookshelf-styling-methods',
        title: 'The Art of Bookshelf Styling: Organizing Clutter into Displays',
        content: 'Balance books vertically and horizontally. Mix in organic ceramic vases, small green plants, and marble bookends to create an curated editorial styling display.',
        author: 'Muhammad Bilal',
        category: 'Home Decoration',
        image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=600&fit=crop',
        readTime: '6 min read',
        createdAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 10
      },
      {
        id: 'blog-36',
        slug: 'large-format-canvas-art-placement',
        title: 'Statement Canvases: Sizing and Centering Large Art Prints',
        content: 'Hanging art too high is a common decorators mistake. Learn the 57-inch centerline rule and how to frame oversized abstract canvases above living room sectionals.',
        author: 'Ayaan Tanveer',
        category: 'Home Decoration',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&fit=crop',
        readTime: '5 min read',
        createdAt: new Date(Date.now() - 41 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 9
      },
      {
        id: 'blog-37',
        slug: 'vintage-antique-rugs-modern-living',
        title: 'Layering History: Incorporating Persian and Antique Rugs',
        content: 'Distressed vintage rugs anchor contemporary spaces. How to pick color bases that reference accent paints and coordinate contrasting furniture woods cleanly.',
        author: 'Muhammad Bilal',
        category: 'Home Decoration',
        image: 'https://images.unsplash.com/photo-1581428982868-e410dd047a90?q=80&w=600&fit=crop',
        readTime: '7 min read',
        createdAt: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 13
      },
      {
        id: 'blog-38',
        slug: 'interior-plant-selections-light-conditions',
        title: 'Green Accents: Selecting Indoor Plants for Light Profiles',
        content: 'From low-light snake plants in bathrooms to fiddle leaf figs in sun-drenched windows. Discover styling rules using terracotta and matte ceramic planters.',
        author: 'Ayaan Tanveer',
        category: 'Home Decoration',
        image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=600&fit=crop',
        readTime: '6 min read',
        createdAt: new Date(Date.now() - 47 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 8
      },
      {
        id: 'blog-39',
        slug: 'mirror-placement-maximize-natural-light',
        title: 'Mirror Coordinates: Doubling Space and Reflecting Natural Light',
        content: 'Placing custom frame wall mirrors directly opposite main windows increases room brightness and opens up narrow, windowless hallway staging coordinates.',
        author: 'Muhammad Bilal',
        category: 'Home Decoration',
        image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=600&fit=crop',
        readTime: '5 min read',
        createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 5
      },
      {
        id: 'blog-40',
        slug: 'scented-candles-diffusers-sensory-styling',
        title: 'Olfactory Decor: Elevating Interiors with Sensory Fragrance styling',
        content: 'Amber candle jars, natural reed diffusers, and brass incense dishes add the final layering touch of luxury. How scents shift occupant perception of space comfort.',
        author: 'Ayaan Tanveer',
        category: 'Home Decoration',
        image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=600&fit=crop',
        readTime: '6 min read',
        createdAt: new Date(Date.now() - 53 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 6
      }
    ];

    // Seed saved designs link
    this.savedDesigns.push({
      id: 'saved-1',
      userId: 'user-uid',
      designId: 'project-002',
      savedAt: new Date().toISOString()
    });
  }

  public getRawData() {
    return {
      users: Array.from(this.users.values()),
      projects: Array.from(this.projects.values()),
      aiDesigns: Array.from(this.aiDesigns.values()),
      feedbacks: this.feedbacks,
      subscriptions: this.subscriptions,
      transactions: this.transactions,
      notifications: this.notifications,
      blogs: this.blogs,
      savedDesigns: this.savedDesigns
    };
  }

  // --- Users API ---
  async getUser(uid: string): Promise<UserProfile | null> {
    return this.users.get(uid) || null;
  }
  async getAllUsers(): Promise<UserProfile[]> {
    return Array.from(this.users.values());
  }
  async createUser(profile: Partial<UserProfile> & { uid: string; email: string }): Promise<UserProfile> {
    const defaultProfile: UserProfile = {
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName || profile.email.split('@')[0],
      photoURL: profile.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&h=256&fit=crop',
      role: profile.role || 'user',
      createdAt: new Date().toISOString(),
      subscription: profile.subscription || { plan: 'free', status: 'active', currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }
    };
    this.users.set(defaultProfile.uid, defaultProfile);
    return defaultProfile;
  }
  async updateUser(uid: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const existing = this.users.get(uid);
    if (!existing) throw new Error('User not found');
    const updated = { ...existing, ...data };
    this.users.set(uid, updated);
    return updated;
  }

  // --- Projects API ---
  async getProjects(userId?: string): Promise<Project[]> {
    const list = Array.from(this.projects.values());
    return userId ? list.filter(p => p.userId === userId) : list;
  }
  async getProject(id: string): Promise<Project | null> {
    return this.projects.get(id) || null;
  }
  async createProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    const newProj: Project = {
      ...project,
      id: `project-${uuidv4().substring(0, 8)}`,
      createdAt: new Date().toISOString()
    };
    this.projects.set(newProj.id, newProj);
    return newProj;
  }
  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  // --- AI Designs API ---
  async getAiDesigns(userId?: string): Promise<AIDesign[]> {
    const list = Array.from(this.aiDesigns.values());
    return userId ? list.filter(d => d.userId === userId) : list;
  }
  async createAiDesign(design: Omit<AIDesign, 'id' | 'createdAt'>): Promise<AIDesign> {
    const newDesign: AIDesign = {
      ...design,
      id: `design-${uuidv4().substring(0, 8)}`,
      createdAt: new Date().toISOString()
    };
    this.aiDesigns.set(newDesign.id, newDesign);
    return newDesign;
  }

  // --- Feedback API ---
  async getFeedbacks(): Promise<Feedback[]> {
    return this.feedbacks.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  }
  async createFeedback(feedback: Omit<Feedback, 'id' | 'createdAt'>): Promise<Feedback> {
    const newFeedback: Feedback = {
      ...feedback,
      id: `fb-${uuidv4().substring(0, 8)}`,
      createdAt: new Date().toISOString()
    };
    this.feedbacks.push(newFeedback);
    return newFeedback;
  }

  // --- Subscriptions & Transactions ---
  async getSubscriptions(userId?: string): Promise<Subscription[]> {
    return userId ? this.subscriptions.filter(s => s.userId === userId) : this.subscriptions;
  }
  async createSubscription(sub: Omit<Subscription, 'id'>): Promise<Subscription> {
    const newSub: Subscription = { ...sub, id: `sub-${uuidv4().substring(0, 8)}` };
    this.subscriptions.push(newSub);
    // Update user sub record
    const user = this.users.get(sub.userId);
    if (user) {
      user.subscription = { plan: sub.plan, status: sub.status, currentPeriodEnd: sub.endAt };
      this.users.set(user.uid, user);
    }
    return newSub;
  }
  async getTransactions(userId?: string): Promise<Transaction[]> {
    return userId ? this.transactions.filter(t => t.userId === userId) : this.transactions;
  }
  async createTransaction(tx: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> {
    const newTx: Transaction = { ...tx, id: `tx-${uuidv4().substring(0, 8)}`, date: new Date().toISOString() };
    this.transactions.push(newTx);
    return newTx;
  }

  // --- Notifications ---
  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notifications.filter(n => n.userId === userId).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  }
  async createNotification(notif: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification> {
    const newNotif: Notification = {
      ...notif,
      id: `notif-${uuidv4().substring(0, 8)}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.push(newNotif);
    return newNotif;
  }
  async markNotificationRead(id: string): Promise<boolean> {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      return true;
    }
    return false;
  }

  // --- Blogs API ---
  async getBlogs(): Promise<Blog[]> {
    return this.blogs.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  }
  async getBlogBySlug(slug: string): Promise<Blog | null> {
    return this.blogs.find(b => b.slug === slug) || null;
  }
  async createBlog(blog: Omit<Blog, 'id' | 'createdAt' | 'commentsCount'>): Promise<Blog> {
    const newBlog: Blog = {
      ...blog,
      id: `blog-${uuidv4().substring(0, 8)}`,
      commentsCount: 0,
      createdAt: new Date().toISOString()
    };
    this.blogs.push(newBlog);
    return newBlog;
  }
  async updateBlog(id: string, blog: Partial<Blog>): Promise<Blog> {
    const index = this.blogs.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Blog not found');
    const updated = { ...this.blogs[index], ...blog };
    this.blogs[index] = updated;
    return updated;
  }
  async deleteBlog(id: string): Promise<boolean> {
    const len = this.blogs.length;
    this.blogs = this.blogs.filter(b => b.id !== id);
    return this.blogs.length < len;
  }

  // --- Saved Designs ---
  async getSavedDesigns(userId: string): Promise<Project[]> {
    const designIds = this.savedDesigns.filter(s => s.userId === userId).map(s => s.designId);
    return Array.from(this.projects.values()).filter(p => designIds.includes(p.id));
  }
  async saveDesign(userId: string, designId: string): Promise<boolean> {
    if (this.savedDesigns.some(s => s.userId === userId && s.designId === designId)) {
      return true;
    }
    this.savedDesigns.push({
      id: `saved-${uuidv4().substring(0, 8)}`,
      userId,
      designId,
      savedAt: new Date().toISOString()
    });
    return true;
  }
  async unsaveDesign(userId: string, designId: string): Promise<boolean> {
    const len = this.savedDesigns.length;
    this.savedDesigns = this.savedDesigns.filter(s => !(s.userId === userId && s.designId === designId));
    return this.savedDesigns.length < len;
  }
}

// Global service export
let databaseService: IDatabase;

const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountEnv || serviceAccountEnv.trim() === '') {
  throw new Error(
    'CRITICAL CONFIGURATION ERROR: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is missing or empty. ' +
    'The server requires a real Firebase connection to operate. Mock Database is disabled.'
  );
}

let FirebaseDatabaseClass: any;

try {
  const serviceAccount = JSON.parse(serviceAccountEnv);
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    });
  }
  
  const firestore = admin.firestore();
  firestore.settings({ ignoreUndefinedProperties: true });

  // Firebase Admin Firestore DB Implementation
  class FirebaseDatabase implements IDatabase {
    public isMock = false;

    // Wrap Firestore helper
    private async getDocData<T>(coll: string, docId: string): Promise<T | null> {
      const snap = await firestore.collection(coll).doc(docId).get();
      return snap.exists ? (snap.data() as T) : null;
    }

    async getUser(uid: string): Promise<UserProfile | null> {
      return this.getDocData<UserProfile>('users', uid);
    }
    async getAllUsers(): Promise<UserProfile[]> {
      const snap = await firestore.collection('users').get();
      return snap.docs.map(doc => doc.data() as UserProfile);
    }
    async createUser(profile: Partial<UserProfile> & { uid: string; email: string }): Promise<UserProfile> {
      const docRef = firestore.collection('users').doc(profile.uid);
      const data: UserProfile = {
        uid: profile.uid,
        email: profile.email,
        displayName: profile.displayName || profile.email.split('@')[0],
        photoURL: profile.photoURL || '',
        role: profile.role || 'user',
        createdAt: new Date().toISOString(),
        subscription: profile.subscription || { plan: 'free', status: 'active', currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }
      };
      await docRef.set(data, { merge: true });
      return data;
    }
    async updateUser(uid: string, data: Partial<UserProfile>): Promise<UserProfile> {
      const docRef = firestore.collection('users').doc(uid);
      await docRef.update(data);
      const updated = await docRef.get();
      return updated.data() as UserProfile;
    }

    async getProjects(userId?: string): Promise<Project[]> {
      let query: admin.firestore.Query = firestore.collection('projects');
      if (userId) {
        query = query.where('userId', '==', userId);
      }
      const snap = await query.get();
      return snap.docs.map(doc => doc.data() as Project);
    }
    async getProject(id: string): Promise<Project | null> {
      return this.getDocData<Project>('projects', id);
    }
    async createProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
      const id = uuidv4();
      const docRef = firestore.collection('projects').doc(id);
      const data = { ...project, id, createdAt: new Date().toISOString() };
      await docRef.set(data);
      return data;
    }
    async deleteProject(id: string): Promise<boolean> {
      await firestore.collection('projects').doc(id).delete();
      return true;
    }

    async getAiDesigns(userId?: string): Promise<AIDesign[]> {
      let query: admin.firestore.Query = firestore.collection('ai_designs');
      if (userId) {
        query = query.where('userId', '==', userId);
      }
      const snap = await query.get();
      return snap.docs.map(doc => doc.data() as AIDesign);
    }
    async createAiDesign(design: Omit<AIDesign, 'id' | 'createdAt'>): Promise<AIDesign> {
      const id = uuidv4();
      const docRef = firestore.collection('ai_designs').doc(id);
      const data = { ...design, id, createdAt: new Date().toISOString() };
      await docRef.set(data);
      return data;
    }

    async getFeedbacks(): Promise<Feedback[]> {
      const snap = await firestore.collection('feedbacks').orderBy('createdAt', 'desc').get();
      return snap.docs.map(doc => doc.data() as Feedback);
    }
    async createFeedback(feedback: Omit<Feedback, 'id' | 'createdAt'>): Promise<Feedback> {
      const id = uuidv4();
      const docRef = firestore.collection('feedbacks').doc(id);
      const data = { ...feedback, id, createdAt: new Date().toISOString() };
      await docRef.set(data);
      return data;
    }

    async getSubscriptions(userId?: string): Promise<Subscription[]> {
      let query: admin.firestore.Query = firestore.collection('subscriptions');
      if (userId) {
        query = query.where('userId', '==', userId);
      }
      const snap = await query.get();
      return snap.docs.map(doc => doc.data() as Subscription);
    }
    async createSubscription(sub: Omit<Subscription, 'id'>): Promise<Subscription> {
      const id = uuidv4();
      const docRef = firestore.collection('subscriptions').doc(id);
      const data = { ...sub, id };
      await docRef.set(data);
      // Sync user role
      await firestore.collection('users').doc(sub.userId).update({
        'subscription.plan': sub.plan,
        'subscription.status': sub.status,
        'subscription.currentPeriodEnd': sub.endAt
      });
      return data;
    }
    async getTransactions(userId?: string): Promise<Transaction[]> {
      let query: admin.firestore.Query = firestore.collection('transactions');
      if (userId) {
        query = query.where('userId', '==', userId);
      }
      const snap = await query.get();
      return snap.docs.map(doc => doc.data() as Transaction);
    }
    async createTransaction(tx: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> {
      const id = uuidv4();
      const docRef = firestore.collection('transactions').doc(id);
      const data = { ...tx, id, date: new Date().toISOString() };
      await docRef.set(data);
      return data;
    }

    async getNotifications(userId: string): Promise<Notification[]> {
      const snap = await firestore.collection('notifications')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      return snap.docs.map(doc => doc.data() as Notification);
    }
    async createNotification(notif: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification> {
      const id = uuidv4();
      const docRef = firestore.collection('notifications').doc(id);
      const data = { ...notif, id, read: false, createdAt: new Date().toISOString() };
      await docRef.set(data);
      return data;
    }
    async markNotificationRead(id: string): Promise<boolean> {
      await firestore.collection('notifications').doc(id).update({ read: true });
      return true;
    }

    async getBlogs(): Promise<Blog[]> {
      const snap = await firestore.collection('blogs').orderBy('createdAt', 'desc').get();
      return snap.docs.map(doc => doc.data() as Blog);
    }
    async getBlogBySlug(slug: string): Promise<Blog | null> {
      const snap = await firestore.collection('blogs').where('slug', '==', slug).limit(1).get();
      if (snap.empty) return null;
      return snap.docs[0].data() as Blog;
    }
    async createBlog(blog: Omit<Blog, 'id' | 'createdAt' | 'commentsCount'>): Promise<Blog> {
      const id = uuidv4();
      const docRef = firestore.collection('blogs').doc(id);
      const data = { ...blog, id, commentsCount: 0, createdAt: new Date().toISOString() };
      await docRef.set(data);
      return data;
    }
    async updateBlog(id: string, blog: Partial<Blog>): Promise<Blog> {
      const docRef = firestore.collection('blogs').doc(id);
      await docRef.update(blog);
      const snap = await docRef.get();
      return snap.data() as Blog;
    }
    async deleteBlog(id: string): Promise<boolean> {
      await firestore.collection('blogs').doc(id).delete();
      return true;
    }

    async getSavedDesigns(userId: string): Promise<Project[]> {
      const snap = await firestore.collection('saved_designs').where('userId', '==', userId).get();
      const projectIds = snap.docs.map(doc => (doc.data() as SavedDesign).designId);
      if (projectIds.length === 0) return [];
      
      // Batch get projects in Firestore (capped at 10, standard limit)
      const projectsSnap = await firestore.collection('projects')
        .where('id', 'in', projectIds.slice(0, 10))
        .get();
      return projectsSnap.docs.map(doc => doc.data() as Project);
    }
    async saveDesign(userId: string, designId: string): Promise<boolean> {
      const snap = await firestore.collection('saved_designs')
        .where('userId', '==', userId)
        .where('designId', '==', designId)
        .limit(1)
        .get();
      if (!snap.empty) return true;
      
      const id = uuidv4();
      await firestore.collection('saved_designs').doc(id).set({
        id,
        userId,
        designId,
        savedAt: new Date().toISOString()
      });
      return true;
    }
    async unsaveDesign(userId: string, designId: string): Promise<boolean> {
      const snap = await firestore.collection('saved_designs')
        .where('userId', '==', userId)
        .where('designId', '==', designId)
        .get();
      for (const doc of snap.docs) {
        await doc.ref.delete();
      }
      return true;
    }
  }

  databaseService = new FirebaseDatabase();
  FirebaseDatabaseClass = FirebaseDatabase;
  console.log('DecorAI initialized with real Firebase (Live Mode).');
} catch (error) {
  console.error('Firebase Admin init failed. Could not start server.', error);
  throw error;
}

export { databaseService, MockDatabase, FirebaseDatabaseClass };

