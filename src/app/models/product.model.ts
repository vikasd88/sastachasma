export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  rating: number;
  imageUrl: string;
  description: string;
  shape: string;
  frameMaterial: string;
  lensType: string;
  color: string;
  gender: string;
  category: string; // Re-added category
  inStock: number; // Changed from boolean to number to match backend DTO
  isActive: boolean;
}

export interface Lens {
  id: number;
  type: string;
  material: string;
  price: number;
  prescriptionRange: string;
  coating: string;
  inStock: number;
  isActive: boolean;
}

// Frontend cart item without full product or lens details (these will be fetched separately if needed)
export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  imageUrl: string;
  lensId?: number;
  lensType?: string;
  lensMaterial?: string;
  lensPrescriptionRange?: string;
  lensCoating?: string;
  lensPrice?: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Backend cart response
export interface BackendCartResponse {
  id: number;
  userId: string; // Changed from number to string
  items: CartItem[]; // Using the updated CartItem interface
  totalPrice: number;
  isActive: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalPrice: number;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  orderDate: Date;
  status: string;
}
