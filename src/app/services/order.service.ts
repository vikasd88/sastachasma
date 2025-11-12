import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import {
  Order,
  OrderStatusType,
  PaymentStatusType,
  Address, // Changed from ShippingAddress
  OrderItem,
  PlaceOrderRequest, // Changed from OrderRequest
  OrderStatus
} from '../models/order.model';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

interface PaymentDetails {
  method: string;
  status: string;
  transactionId: string;
  amount: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private loading = new BehaviorSubject<boolean>(false);
  private error = new BehaviorSubject<string | null>(null);
  private userId: string = environment.defaultUserId; // Changed userId type to string

  private readonly validStatuses: OrderStatusType[] = [
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'RETURNED'
  ];

  public loading$ = this.loading.asObservable();
  public error$ = this.error.asObservable();

  constructor(private apiService: ApiService) {}

  // ----------------------------
  // Loading & Error Observables
  // ----------------------------
  getLoadingState(): Observable<boolean> {
    return this.loading$;
  }

  getError$(): Observable<string | null> {
    return this.error$;
  }

  // ----------------------------
  // Get All Orders
  // ----------------------------
  getUserOrders(): Observable<Order[]> { // Changed to Order[]
    this.loading.next(true);
    this.error.next(null);

    return this.apiService.getOrders(this.userId).pipe(
      map((response: any[]) =>
        Array.isArray(response)
          ? response.map(order => this.mapApiResponseToOrder(order)) // Changed mapApiResponseToOrderDetails to mapApiResponseToOrder
          : []
      ),
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

  // ----------------------------
  // Get Order Details by ID
  // ----------------------------
  getOrderDetails(orderId: string): Observable<Order> { // Changed to Order
    if (!orderId?.trim()) {
      const error = new Error('A valid order ID is required to fetch order details');
      this.error.next(error.message);
      return throwError(() => error);
    }

    this.loading.next(true);
    this.error.next(null);

    return this.apiService.getOrderDetails(orderId, this.userId).pipe( // Pass userId to getOrderDetails
      map(response => {
        if (!response) throw new Error('No order found with the provided ID');
        return this.mapApiResponseToOrder(response); // Changed mapApiResponseToOrderDetails to mapApiResponseToOrder
      }),
      tap({
        next: () => this.loading.next(false),
        error: (error) => {
          console.error('Error fetching order details:', error);
          this.loading.next(false);
          const message = error.status === 404
            ? `Order not found with ID: ${orderId}`
            : 'Failed to fetch order details';
          this.error.next(message);
        }
      }),
      catchError(error => {
        this.loading.next(false);
        return throwError(() => error);
      })
    );
  }

  // ----------------------------
  // Place New Order
  // ----------------------------
  placeOrder(
    placeOrderRequest: PlaceOrderRequest
  ): Observable<Order> {
    this.loading.next(true);
    this.error.next(null);

    return this.apiService.placeOrder(this.userId, placeOrderRequest).pipe(
      map((response: any) => {
        if (!response?.orderId && !response?.id) { // Check for both orderId and id
          throw new Error('Invalid response from server: Missing order ID');
        }
        return this.mapApiResponseToOrder(response); // Changed mapApiResponseToOrderDetails to mapApiResponseToOrder
      }),
      tap({
        next: () => this.loading.next(false),
        error: (error) => {
          console.error('Error placing order:', error);
          this.loading.next(false);
          const errorMessage =
            error.status === 0
              ? 'Unable to connect to the server.'
              : 'Failed to place order. Please try again.';
          this.error.next(errorMessage);
        }
      }),
      catchError(error => {
        this.loading.next(false);
        return throwError(() => error);
      })
    );
  }

  // ----------------------------
  // Update Order Status
  // ----------------------------
  updateOrderStatus(orderId: string, status: OrderStatusType): Observable<Order> { // Changed to Order
    this.loading.next(true);
    this.error.next(null);

    return this.apiService.updateOrderStatus(orderId, status, this.userId).pipe(
      map((response: any) => this.mapApiResponseToOrder(response)), // Changed mapApiResponseToOrderDetails to mapApiResponseToOrder
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

  // ----------------------------
  // Helper: Calculate Delivery
  // ----------------------------
  private calculateEstimatedDelivery(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  }

  private mapApiResponseToOrder(response: any): Order {
    if (!response) {
      throw new Error('Invalid response: Response is null or undefined');
    }

    // Map billing address
    const billingAddress: Address = {
      street: response.billingAddress?.street || '',
      city: response.billingAddress?.city || '',
      state: response.billingAddress?.state || '',
      postalCode: response.billingAddress?.postalCode || '',
      country: response.billingAddress?.country || '',
      phone: response.billingAddress?.phone || '',
    };

    // Map items with null checks
    const items: OrderItem[] = [];
    if (Array.isArray(response.items)) {
      response.items.forEach((item: any) => {
        if (item) {
          items.push({
            productId: item.productId || 0,
            name: item.name || 'Unknown Product',
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.unitPrice) || 0,
            totalPrice: Number(item.totalPrice) || 0,
            imageUrl: item.imageUrl || '',
            lensId: item.lensId,
            lensType: item.lensType,
            lensMaterial: item.lensMaterial,
            lensPrescriptionRange: item.lensPrescriptionRange,
            lensCoating: item.lensCoating,
            lensPrice: item.lensPrice ? Number(item.lensPrice) : 0,
          });
        }
      });
    }

    // Parse status history
    const statusHistory: OrderStatus[] = Array.isArray(response.statusHistory)
      ? response.statusHistory.map((sh: any) => ({
          status: sh.status as OrderStatusType,
          statusDate: sh.statusDate ? new Date(sh.statusDate) : new Date(),
          description: sh.description || 'Status updated',
        }))
      : [];

    const order: Order = {
      id: Number(response.id),
      fullName: response.fullName,
      orderNumber: response.orderNumber || '',
      userId: response.userId || '',
      orderDate: response.orderDate ? new Date(response.orderDate) : new Date(),
      estimatedDelivery: response.estimatedDelivery ? new Date(response.estimatedDelivery) : new Date(),
      status: response.status as OrderStatusType,
      paymentStatus: response.paymentStatus as PaymentStatusType,
      items: items,
      statusHistory: statusHistory,
      billingAddress: billingAddress,
      subtotal: Number(response.subtotal) || 0,
      shippingFee: Number(response.shippingFee) || 0,
      tax: Number(response.tax) || 0,
      totalAmount: Number(response.totalAmount) || 0,
    };

    return order;
  }
}
