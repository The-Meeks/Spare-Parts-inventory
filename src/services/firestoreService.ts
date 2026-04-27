import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  serverTimestamp,
  increment,
  runTransaction
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Product, Sale, UserRole } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
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
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
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
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Products
export const getProducts = async (): Promise<Product[]> => {
  const path = 'products';
  try {
    const q = query(collection(db, path), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
  const path = 'products';
  try {
    return await addDoc(collection(db, path), {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  const path = `products/${id}`;
  try {
    return await updateDoc(doc(db, 'products', id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteProduct = async (id: string) => {
  const path = `products/${id}`;
  try {
    return await deleteDoc(doc(db, 'products', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

// Sales
export const recordSale = async (
  sale: Omit<Sale, 'id' | 'createdAt' | 'profit'>, 
  buyingPrice: number
) => {
  const salesPath = 'sales';
  const profit = sale.totalPrice - (buyingPrice * sale.quantity);
  
  try {
    await runTransaction(db, async (transaction) => {
      const productRef = doc(db, 'products', sale.productId);
      const productDoc = await transaction.get(productRef);
      
      if (!productDoc.exists()) {
        throw new Error("Product does not exist!");
      }
      
      const newQuantity = productDoc.data().quantity - sale.quantity;
      if (newQuantity < 0) {
        throw new Error("Insufficient stock!");
      }

      // Record Sale
      const saleRef = doc(collection(db, salesPath));
      transaction.set(saleRef, {
        ...sale,
        profit,
        createdAt: serverTimestamp(),
      });

      // Update Stock
      transaction.update(productRef, {
        quantity: newQuantity,
        updatedAt: serverTimestamp(),
      });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, salesPath);
  }
};

export const getSales = async (limitCount = 50): Promise<Sale[]> => {
  const path = 'sales';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

// Settings
export const getBusinessSettings = async () => {
  const path = 'settings/business';
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'business'));
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return {
      businessName: 'Pasbest Ventures',
      currency: 'Ksh',
      taxRate: 0,
      lowStockThreshold: 10
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const updateBusinessSettings = async (settings: any) => {
  const path = 'settings/business';
  try {
    return await setDoc(doc(db, 'settings', 'business'), settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const getSalesByRange = async (startDate: Date, endDate: Date): Promise<Sale[]> => {
  const path = 'sales';
  try {
    const q = query(
      collection(db, path), 
      where('createdAt', '>=', startDate),
      where('createdAt', '<=', endDate),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};
