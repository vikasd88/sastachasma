import { CartItem, Product } from '../models/product.model';

export type OrderStatusType = 'processing' | 'shipped' | 'delivered' | 'cancelled';
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
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  lensId?: number;
  lensName?: string;
  lensPrice?: number;
}

export interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface PaymentDetails {
  method: string;
  status: PaymentStatusType;
  amount: number;
  transactionId?: string;
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
  items: OrderItem[]; // Changed to OrderItem[]
  statusHistory: OrderStatus[];
  shippingAddress: ShippingAddress;
  payment: PaymentDetails;
  total: number;
  shippingMethod?: ShippingMethod;
  discount?: number;
}
