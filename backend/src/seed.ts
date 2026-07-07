import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import path from 'path';
import { MockDatabase } from './services/firebase.service';

// Load environment variables
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountEnv || serviceAccountEnv.trim() === '') {
  console.error('ERROR: FIREBASE_SERVICE_ACCOUNT_KEY env var is missing or empty.');
  process.exit(1);
}

async function seed() {
  console.log('Starting Firestore database seeder...');
  
  const serviceAccount = JSON.parse(serviceAccountEnv!);
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    });
  }

  const firestore = admin.firestore();
  firestore.settings({ ignoreUndefinedProperties: true });

  // Instantiate the MockDatabase to retrieve the seed data
  const mockDb = new MockDatabase();
  const seedData = mockDb.getRawData();

  const collections = [
    { name: 'users', data: seedData.users, key: 'uid' },
    { name: 'projects', data: seedData.projects, key: 'id' },
    { name: 'ai_designs', data: seedData.aiDesigns, key: 'id' },
    { name: 'feedbacks', data: seedData.feedbacks, key: 'id' },
    { name: 'subscriptions', data: seedData.subscriptions, key: 'id' },
    { name: 'transactions', data: seedData.transactions, key: 'id' },
    { name: 'notifications', data: seedData.notifications, key: 'id' },
    { name: 'blogs', data: seedData.blogs, key: 'id' },
  ];

  for (const col of collections) {
    console.log(`Seeding collection "${col.name}" with ${col.data.length} documents...`);
    const batch = firestore.batch();
    
    for (const doc of col.data) {
      const docId = (doc as any)[col.key];
      const docRef = firestore.collection(col.name).doc(docId);
      batch.set(docRef, doc, { merge: true });
    }
    
    await batch.commit();
    console.log(`Collection "${col.name}" seeded successfully.`);
  }

  // Seed saved_designs relation
  console.log(`Seeding collection "saved_designs" with ${seedData.savedDesigns.length} documents...`);
  const savedBatch = firestore.batch();
  for (const item of seedData.savedDesigns) {
    const docRef = firestore.collection('saved_designs').doc(item.id);
    savedBatch.set(docRef, item, { merge: true });
  }
  await savedBatch.commit();
  console.log('Collection "saved_designs" seeded successfully.');

  console.log('Database seeding complete! All initial records have been written to Firestore.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
