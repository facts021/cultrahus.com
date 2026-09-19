import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDocFromServer } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Web app Firebase configuration for Cultrahus
const rawConfig = (firebaseConfigJson as any)?.default || (firebaseConfigJson as any) || {};

export const firebaseConfig = {
  apiKey: rawConfig.apiKey || "AIzaSyCHyEEWwVYjOcLvqeo_9VtxxlxIvLD2V2M",
  authDomain: rawConfig.authDomain || "cultrahus.firebaseapp.com",
  projectId: rawConfig.projectId || "cultrahus",
  storageBucket: rawConfig.storageBucket || "cultrahus.firebasestorage.app",
  messagingSenderId: rawConfig.messagingSenderId || "1035826339801",
  appId: rawConfig.appId || "1:1035826339801:web:1560894ea4e752838bc3c8",
  firestoreDatabaseId: rawConfig.firestoreDatabaseId || "ai-studio-cultrahussangam2-133890dc-039f-4062-b806-1bfa745e5c99"
};

// Initialize Firebase safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: Connect to designated Firestore Database
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Test connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Connected to Firestore project:', firebaseConfig.projectId);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Network or offline warning during initial check');
    }
    return false;
  }
}

// Safely test connection after initial load without blocking rendering
if (typeof window !== 'undefined') {
  setTimeout(() => {
    testConnection().catch(() => {});
  }, 1500);
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Persists ticket record to Firebase Firestore
 */
export async function saveTicketToFirestore(ticket: any): Promise<boolean> {
  const ticketId = ticket.id || `tkt_${Date.now()}`;
  const path = `tickets/${ticketId}`;
  try {
    const payload = {
      id: ticketId,
      ticketCode: String(ticket.ticketCode || ticketId),
      fullName: String(ticket.fullName || '').slice(0, 100),
      email: String(ticket.email || '').slice(0, 120),
      whatsappPhone: String(ticket.whatsappPhone || '').replace(/\D/g, '').slice(0, 10),
      tier: ticket.tier || 'classic',
      tierName: ticket.tierName || ticket.tier,
      quantity: Number(ticket.quantity) || 1,
      seats: Array.isArray(ticket.seats) ? ticket.seats : [],
      foodAddon: ticket.foodAddon || 'none',
      totalAmount: Number(ticket.totalAmount) || 0,
      currency: 'INR',
      status: ticket.status || 'Confirmed',
      festivalDate: ticket.festivalDate || '2026-10-18',
      venue: ticket.venue || 'TBA',
      createdAt: ticket.createdAt || new Date().toISOString()
    };
    await setDoc(doc(db, 'tickets', ticketId), payload);
    console.log('[Firebase] Ticket record saved to Firestore:', ticketId);
    return true;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.CREATE, path);
    } catch (e) {
      console.warn('[Firebase] Firestore ticket save fallback:', e);
    }
    return false;
  }
}

/**
 * Persists delegate accreditation record to Firebase Firestore
 */
export async function saveDelegateToFirestore(delegate: any): Promise<boolean> {
  const delegateId = delegate.id || `del_${Date.now()}`;
  const path = `delegates/${delegateId}`;
  try {
    const payload = {
      id: delegateId,
      accreditationCode: String(delegate.accreditationCode || delegateId),
      fullName: String(delegate.fullName || '').slice(0, 100),
      email: String(delegate.email || '').slice(0, 120),
      whatsappPhone: String(delegate.whatsappPhone || '').replace(/\D/g, '').slice(0, 10),
      institution: String(delegate.institution || 'Independent Artist').slice(0, 150),
      cityState: String(delegate.cityState || 'New Delhi').slice(0, 100),
      participationCategory: delegate.participationCategory || 'Cultural Delegate',
      parliamentTrack: delegate.parliamentTrack || 'Cultural Heritage & Creative Democracy',
      priorExperience: String(delegate.priorExperience || '').slice(0, 1000),
      registrationFee: Number(delegate.registrationFee) || 650,
      currency: 'INR',
      status: delegate.status || 'Confirmed',
      festivalDate: delegate.festivalDate || '2026-10-18',
      venue: delegate.venue || 'TBA',
      createdAt: delegate.createdAt || new Date().toISOString()
    };
    await setDoc(doc(db, 'delegates', delegateId), payload);
    console.log('[Firebase] Delegate accreditation saved to Firestore:', delegateId);
    return true;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.CREATE, path);
    } catch (e) {
      console.warn('[Firebase] Firestore delegate save fallback:', e);
    }
    return false;
  }
}
