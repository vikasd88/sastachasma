import { Product, Lens, CartItem } from './product.model';


export interface Cart {
  id?: string;
  userId: string;
  items: CartItem[];
  totalAmount?: number;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
  lensId?: number;
  lensPrice?: number | string; // Allow both number and string for flexibility
}

export interface UpdateCartItemRequest {
  quantity: number;
}
