export type OrderStatusType = 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatusType = 'pending' | 'completed' | 'failed' | 'refunded';

export interface OrderStatus {
  status: OrderStatusType;
  date: Date;
  location?: string;
  description: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
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
  items: OrderItem[];
  statusHistory: OrderStatus[];
  shippingAddress: ShippingAddress;
  payment: PaymentDetails;
  shippingMethod?: ShippingMethod;
  discount?: number;
}
