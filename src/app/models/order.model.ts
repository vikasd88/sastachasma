import { CartItem, Product } from '../models/product.model';

export type OrderStatusType = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
export type PaymentStatusType = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface OrderStatus {
  status: OrderStatusType;
  statusDate: Date; // Changed from 'date' to 'statusDate'
  description: string;
}

// Reverted OrderItem to its original structure (or similar to CartItem without full product)
// For TrackOrderComponent, OrderItem needs direct properties
export interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number; // Changed from 'price' to 'unitPrice'
  totalPrice: number; // Added
  imageUrl?: string;
  lensId?: number; // Changed type to number
  lensType?: string;
  lensMaterial?: string;
  lensPrescriptionRange?: string;
  lensCoating?: string;
  lensPrice?: number;
}

export interface Address {
  
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface Order {
  id: number; // Changed from string to number
  orderNumber: string; // Added
  userId: string; // Added
  fullName: string,
  orderDate: Date;
  estimatedDelivery: Date;
  status: OrderStatusType;
  paymentStatus: PaymentStatusType; // Added, replacing payment object
  items: OrderItem[];
  statusHistory: OrderStatus[];
  billingAddress: Address; // Changed from shippingAddress to billingAddress
  subtotal: number; // Added
  shippingFee: number; // Added
  tax: number; // Added
  totalAmount: number; // Changed from 'total' to 'totalAmount'
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

export interface PlaceOrderRequest {
  paymentMethod: string; // Added
  billingAddress: Address; // Using the new Address interface
  items: Array<{
    productId: number;
    quantity: number;
    lensId?: number;
    lensType?: string;
    lensMaterial?: string;
    lensPrescriptionRange?: string;
    lensCoating?: string;
  }>;
}
