import { CartItem, Product } from '../models/product.model';

export type OrderStatusType = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatusType = 'pending' | 'completed' | 'failed' | 'refunded';

export interface OrderStatus {
  status: OrderStatusType;
  date: Date;
  location?: string;
  description: string;
}

// Reverted OrderItem to its original structure (or similar to CartItem without full product)
// For TrackOrderComponent, OrderItem needs direct properties
export interface OrderItem {
  productId: number;
  name: string; // Reverted to name
  quantity: number;
  price: number; // Use price as unit price
  imageUrl?: string;
  lensId?: string | null;
  lensName?: string;
  lensPrice?: number;
  frameSize?: string | number | null;
}

export interface ShippingAddress {
  name: string;
  street: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  zipCode?: string;
  phone?: string;
  country?: string;
}

export interface PaymentDetails {
  method: string;
  status: PaymentStatusType;
  amount: number;
  transactionId?: string;
  paymentDate?: Date;
}

export interface ShippingMethod {
  name: string;
  price: number;
  estimatedDays: number;
}

export interface OrderDetails {
  orderId: string;
  customerName: string;
  orderDate: Date;
  estimatedDelivery?: Date;
  status: OrderStatusType;
  items: OrderItem[]; // Changed to OrderItem[]
  statusHistory: OrderStatus[];
  shippingAddress: ShippingAddress;
  payment: PaymentDetails;
  total: number;
  shippingMethod?: ShippingMethod;
  discount?: number;
}

export interface OrderRequest {
  customerName: string;
  orderDate: string;
  estimatedDelivery: string;
  items: Array<{
    productId: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    lensId: string | null;
    lensName: string;
    lensPrice: number;
    frameSize: string;
  }>;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    country: string;
  };
  payment: PaymentDetails;
  userId: number;
}
