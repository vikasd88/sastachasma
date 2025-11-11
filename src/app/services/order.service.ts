import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { OrderDetails, OrderStatusType, PaymentStatusType, ShippingAddress, OrderItem, OrderStatus } from '../models/order.model';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private loading = new BehaviorSubject<boolean>(false);
  private error = new BehaviorSubject<string | null>(null);
  private userId: number = environment.defaultUserId;

  public loading$ = this.loading.asObservable();
  public error$ = this.error.asObservable();

  constructor(private apiService: ApiService) {}

  private calculateEstimatedDelivery(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 7); // 7 days from now
    return date;
  }

  // Generate a unique order ID
  private generateOrderId(): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000);
    return `ORD-${timestamp}-${random}`;
  }

  // Place a new order
  placeOrder(items: OrderItem[], shippingAddress: ShippingAddress, paymentMethod: string = 'cod'): Observable<OrderDetails> {
    this.loading.next(true);
    this.error.next(null);

    const now = new Date().toISOString();
    const estimatedDelivery = this.calculateEstimatedDelivery().toISOString();
    
    // Calculate subtotal (sum of all items including lens prices)
    const subtotal = items.reduce((sum, item) => {
      const itemPrice = item.price + (item.lensPrice || 0);
      return sum + (itemPrice * item.quantity);
    }, 0);

    // Create the order request
    const orderRequest: OrderDetails = {
      orderId: this.generateOrderId(),
      customerName: shippingAddress.name,
      orderDate: new Date(now),
      estimatedDelivery: new Date(estimatedDelivery),
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        lensPrice: item.lensPrice || 0,
        quantity: item.quantity,
        imageUrl: item.imageUrl || 'assets/placeholder-product.jpg',
        lensId: item.lensId,
        lensName: item.lensName,
        frameSize: (item as any).frameSize || 'standard',
        totalPrice: (item.price + (item.lensPrice || 0)) * item.quantity
      })),
      shippingAddress: {
        ...shippingAddress,
        phone: shippingAddress.phone || 'Not provided',
        country: shippingAddress.country || 'India'
      },
      payment: {
        method: paymentMethod,
        status: (paymentMethod === 'cod' ? 'pending' : 'completed') as PaymentStatusType,
        amount: subtotal,
        transactionId: 'TXN' + Math.floor(10000000 + Math.random() * 90000000).toString(),
        paymentDate: new Date(now)
      },
      statusHistory: [
        {
          status: 'processing' as OrderStatusType,
          date: new Date(now),
          description: 'Order received and is being processed.'
        }
      ],
      total: subtotal,
      shippingMethod: { 
        name: 'Standard Shipping', 
        price: 0, 
        estimatedDays: 7 
      },
      discount: 0
    };

    console.log('Sending order request:', JSON.stringify(orderRequest, null, 2));

    return this.apiService.placeOrder(this.userId, orderRequest).pipe(
      map((response: any) => this.mapApiResponseToOrderDetails(response)),
      tap({
        next: () => {
          console.log('Order placed successfully');
          this.loading.next(false);
        },
        error: (error) => {
          console.error('Error placing order:', error);
          if (error.error) {
            console.error('Error details:', error.error);
          }
          this.error.next(error.error?.message || 'Failed to place order. Please try again.');
          this.loading.next(false);
        }
      }),
      catchError((error) => {
        console.error('Error in order placement:', error);
        this.loading.next(false);
        const errorMsg = error.error?.message || error.message || 'Failed to place order.';
        this.error.next(errorMsg);
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  // Get order details by ID
  getOrderDetails(orderId: string): Observable<OrderDetails> {
    this.loading.next(true);
    this.error.next(null);

    return this.apiService.getOrder(orderId, this.userId).pipe(
      map((response: any) => this.mapApiResponseToOrderDetails(response)),
      tap({
        next: () => this.loading.next(false),
        error: (error) => {
          console.error('Error fetching order details:', error);
          this.error.next('Failed to load order details.');
          this.loading.next(false);
        }
      }),
      catchError((error) => {
        this.loading.next(false);
        this.error.next('Failed to load order details.');
        return throwError(() => new Error(error.message || 'Failed to load order details.'));
      })
    );
  }

  // Get all orders for a user
  getUserOrders(): Observable<OrderDetails[]> {
    this.loading.next(true);
    this.error.next(null);

    return this.apiService.getOrders(this.userId).pipe(
      map((response: any[]) => response.map(order => this.mapApiResponseToOrderDetails(order))),
      tap({
        next: () => this.loading.next(false),
        error: (error) => {
          console.error('Error fetching orders:', error);
          this.error.next('Failed to load orders.');
          this.loading.next(false);
        }
      }),
      catchError((error) => {
        this.loading.next(false);
        this.error.next('Failed to load orders.');
        return throwError(() => new Error(error.message || 'Failed to load orders.'));
      })
    );
  }

  // Update order status
  updateOrderStatus(orderId: string, status: OrderStatusType): Observable<OrderDetails> {
    this.loading.next(true);
    this.error.next(null);

    return this.apiService.updateOrderStatus(orderId, status, this.userId).pipe(
      map((response: any) => this.mapApiResponseToOrderDetails(response)),
      tap({
        next: () => this.loading.next(false),
        error: (error) => {
          console.error('Error updating order status:', error);
          this.error.next('Failed to update order status.');
          this.loading.next(false);
        }
      }),
      catchError((error) => {
        this.loading.next(false);
        this.error.next('Failed to update order status.');
        return throwError(() => new Error(error.message || 'Failed to update order status.'));
      })
    );
  }

  // Map backend API response to OrderDetails interface
  private mapApiResponseToOrderDetails(response: any): OrderDetails {
    return {
      orderId: response.orderId || `ORD-${Date.now()}`,
      customerName: response.customerName || '',
      orderDate: response.orderDate ? new Date(response.orderDate) : new Date(),
      estimatedDelivery: response.estimatedDelivery ? new Date(response.estimatedDelivery) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      items: Array.isArray(response.items) ? response.items.map((item: any) => ({
        productId: item.productId,
        name: item.name || 'Unknown Product',
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1,
        imageUrl: item.imageUrl || 'assets/placeholder-product.jpg',
        lensId: item.lensId || null,
        lensName: item.lensName || '',
        lensPrice: parseFloat(item.lensPrice) || 0,
        frameSize: item.frameSize || 'standard'
      })) : [],
      shippingAddress: {
        name: response.shippingAddress?.name || '',
        street: response.shippingAddress?.street || '',
        city: response.shippingAddress?.city || '',
        state: response.shippingAddress?.state || '',
        pincode: response.shippingAddress?.pincode || '',
        phone: response.shippingAddress?.phone || ''
      },
      payment: {
        method: response.payment?.method || 'cod',
        status: (response.payment?.status || 'PENDING') as PaymentStatusType,
        amount: parseFloat(response.payment?.amount) || 0,
        transactionId: response.payment?.transactionId || ''
      },
      statusHistory: Array.isArray(response.statusHistory) ? response.statusHistory.map((h: any) => ({
        status: h.status || 'PROCESSING',
        date: h.date ? new Date(h.date) : new Date(),
        description: h.description || ''
      })) : [],
      total: parseFloat(response.total) || 0,
      shippingMethod: response.shippingMethod || { name: 'Standard Shipping', price: 0, estimatedDays: 7 },
      discount: parseFloat(response.discount) || 0
    };
  }

  // Get loading state
  getLoadingState(): Observable<boolean> {
    return this.loading$;
  }

  // Get error observable
  getError$(): Observable<string | null> {
    return this.error.asObservable();
  }
}
