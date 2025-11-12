import { Product, Lens, CartItem } from './product.model';


export interface Cart {
  id?: number; // Changed to number to match backend
  userId: string;
  items: CartItem[];
  totalPrice?: number; // Changed from totalAmount to totalPrice
  isActive: boolean; // Added to match backend
}

export interface AddToCartRequest {
  productId: number;
  name: string; // Added
  price: number; // Added
  imageUrl: string; // Added
  quantity: number;
  lensId?: number;
  lensType?: string; // Added
  lensMaterial?: string; // Added
  lensPrescriptionRange?: string; // Added
  lensCoating?: string; // Added
  lensPrice?: number; // Changed to number
}

export interface UpdateCartItemRequest {
  quantity: number;
}
