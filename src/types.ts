export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff'
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: any;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  buyingPrice: number;
  sellingPrice: number;
  supplierName: string;
  sku: string;
  createdAt: any;
  updatedAt: any;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  buyingPrice: number;
  profit: number;
  staffId: string;
  staffName: string;
  createdAt: any;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalItemsSold: number;
  totalRevenue: number;
  totalProfit: number;
}
