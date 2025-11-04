export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  shape: string;
  material: string;
  color: string;
  frameSize: string;
  inStock: boolean;
}

export interface Lens {
  id: number;
  type: string;
  price: number;
  description: string;
}

export interface CartItem {
  product: Product;
  lens: Lens;
  quantity: number;
  frameColor?: string;
  lensType?: string;
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
