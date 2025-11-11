export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  image: string;  // Changed from imageUrl to match template
  imageUrl: string; // Keep for backward compatibility
  description: string;
  shape: string;
  frameMaterial: string;
  material: string; // Added for product detail page
  lensType: string;
  color: string;
  frameSize: string;
  inStock: boolean;
}

export interface Lens {
  id: number;
  type: string;
  price: number;
  description: string;
  name: string;
}

// Frontend cart item with full product details
export interface CartItem {
  id: number | string;
  product: Product;
  lens?: Lens;
  quantity: number;
  priceAtAddition: number;
  lensPrice?: number; // Add lensPrice to the interface
  totalPrice: number;
  productName: string;
  productRating?: number | null;
  frameSize?: number | null;
}

// Backend cart item DTO
export interface BackendCartItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  priceAtAddition: number;
  totalPrice: number;
  productRating: number | null;
}

// Backend cart response
export interface BackendCartResponse {
  id: number;
  userId: number;
  items: BackendCartItem[];
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
