import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { 
  OrderDetails, 
  OrderStatusType, 
  PaymentStatusType, 
  ShippingAddress, 
  OrderItem, 
  OrderRequest 
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
  private userId: number = environment.defaultUserId;

  private readonly validStatuses: OrderStatusType[] = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'returned'
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
  getUserOrders(): Observable<OrderDetails[]> {
    this.loading.next(true);
    this.error.next(null);

    return this.apiService.getOrders(this.userId).pipe(
      map((response: any[]) => 
        Array.isArray(response) 
          ? response.map(order => this.mapApiResponseToOrderDetails(order)) 
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
  getOrderDetails(orderId: string): Observable<OrderDetails> {
    if (!orderId?.trim()) {
      const error = new Error('A valid order ID is required to fetch order details');
      this.error.next(error.message);
      return throwError(() => error);
    }

    this.loading.next(true);
    this.error.next(null);

    return this.apiService.getOrderDetails(orderId).pipe(
      map(response => {
        if (!response) throw new Error('No order found with the provided ID');
        return this.mapApiResponseToOrderDetails(response);
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
    items: OrderItem[],
    shippingAddress: ShippingAddress,
    paymentMethod: string = 'cod'
  ): Observable<OrderDetails> {
    let orderRequest: OrderRequest;

    try {
      orderRequest = this.prepareOrderRequest(items, shippingAddress, paymentMethod);
    } catch (error) {
      console.error('Error preparing order request:', error);
      return throwError(() => error);
    }

    this.loading.next(true);
    this.error.next(null);

    return this.apiService.placeOrder(this.userId, orderRequest).pipe(
      map((response: any) => {
        if (!response?.orderId) {
          throw new Error('Invalid response from server: Missing order ID');
        }
        return this.mapApiResponseToOrderDetails(response);
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

  // ----------------------------
  // Helper: Prepare Order Request
  // ----------------------------
  private prepareOrderRequest(
    items: OrderItem[],
    shippingAddress: ShippingAddress,
    paymentMethod: string
  ): OrderRequest {
    if (!items?.length) {
      throw new Error('Cannot place an order with no items');
    }

    const totalAmount = items.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;
      const lensPrice = Number(item.lensPrice) || 0;
      return total + (price * quantity) + lensPrice;
    }, 0);

    return {
      customerName: (shippingAddress.name || 'Guest').trim(),
      orderDate: new Date().toISOString(),
      estimatedDelivery: this.calculateEstimatedDelivery().toISOString(),
      items: items.map(item => ({
        productId: item.productId || 0,
        name: item.name || 'Product',
        price: item.price || 0, // This is unitPrice from backend
        quantity: item.quantity || 1,
        imageUrl: item.imageUrl || '',
        lensId: item.lensId || null,
        lensName: item.lensName || '',
        lensPrice: item.lensPrice || 0,
        frameSize: String(item.frameSize || 'standard')
      })),
      shippingAddress: {
        name: shippingAddress.name || 'Recipient',
        street: shippingAddress.street || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        pincode: shippingAddress.pincode || '',
        country: shippingAddress.country || 'India',
        phone: ''
      },
      payment: {
        method: String(paymentMethod || 'cod').toLowerCase(),
        status: String(paymentMethod === 'cod' ? 'pending' : 'completed').toLowerCase() as PaymentStatusType,
        transactionId: `TXN${Math.floor(10000000 + Math.random() * 90000000)}`,
        amount: totalAmount
      },
      userId: this.userId
    };
  }

  // ----------------------------
  // Helper: Calculate Delivery
  // ----------------------------
  private calculateEstimatedDelivery(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  }

  private parseAddressString(address: any): ShippingAddress {
    // If address is already an object, return it directly
    if (address && typeof address === 'object') {
      return {
        name: address.name || '',
        street: address.street || address.addressLine1 || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || address.zipCode || '',
        country: address.country || '',
        phone: address.phone || ''
      };
    }
  
    // If it's a string, try to parse it as JSON
    if (typeof address === 'string') {
      try {
        const parsed = JSON.parse(address);
        // If JSON parsing is successful, treat it as an object
        return {
          name: parsed.name || '',
          street: parsed.street || parsed.addressLine1 || '',
          city: parsed.city || '',
          state: parsed.state || '',
          pincode: parsed.pincode || parsed.zipCode || '',
          country: parsed.country || '',
          phone: parsed.phone || ''
        };
      } catch (e) {
        // If JSON parsing fails, fall back to comma-separated string parsing
        console.warn('Failed to parse address as JSON, trying comma-separated:', address);
        const parts = address.split(', ').map(p => p.trim());
        return {
          name: parts[0] || '',
          street: parts[1] || '',
          city: parts[2] || '',
          state: parts[3] || '',
          pincode: parts[4] || '',
          country: parts[5] || '',
          phone: parts[6] || ''
        };
      }
    }
  
    // Return empty address if parsing fails or address is null/undefined
    return {
      name: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: '',
      phone: ''
    };
  }
  // ----------------------------
  // Map API Response
  // ----------------------------
  private mapApiResponseToOrderDetails(response: any): OrderDetails {
    if (!response) {
      throw new Error('Invalid response: Response is null or undefined');
    }

    // Parse shipping address
    const shippingAddress = this.parseAddressString(response.shippingAddress || '');

    // Parse items with null checks
    const items: OrderItem[] = [];
    if (Array.isArray(response.items)) {
      response.items.forEach((item: any) => {
        if (item) {
          items.push({
            productId: item.productId || 0,
            name: item.productName || item.name || 'Unknown Product',
            price: Number(item.unitPrice) || Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
            imageUrl: item.imageUrl || '',
            lensId: item.lensId,
            lensName: item.lensName,
            lensPrice: item.lensPrice ? Number(item.lensPrice) : 0,
            frameSize: item.frameSize
          });
        }
      });
    }

    // Calculate subtotal
    const subtotal = items.reduce(
      (sum, item) => sum + (item.price * item.quantity) + (item.lensPrice || 0),
      0
    );

    // Parse status with validation
    const status: OrderStatusType = this.validStatuses.includes(
      String(response.status || 'pending').toLowerCase() as OrderStatusType
    ) ? (response.status.toLowerCase() as OrderStatusType) : 'pending';

    // Parse dates
    const orderDate = response.orderDate 
    ? new Date(response.orderDate) 
    : new Date();
  const estimatedDelivery = new Date(orderDate);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
  
  // Define payment object with safe defaults
  const payment = response.payment || {};
  const paymentMethod = payment?.method || 'cod';
  const paymentStatus = (['pending', 'completed', 'failed', 'refunded'] as const).includes(
    String(payment?.status || 'pending').toLowerCase() as PaymentStatusType
  ) ? (payment?.status?.toLowerCase() as PaymentStatusType) : 'pending';
  
  const orderDetails: OrderDetails = {
    orderId: String(response.orderId || response.orderNumber || '').trim(),
    customerName: String(response.customerName || 'Guest').trim(),
    orderDate,
    estimatedDelivery,
    items,
    shippingAddress,
    payment: {
      method: paymentMethod,
      status: paymentStatus,
      transactionId: String(payment?.transactionId || '').trim(),
      amount: Number(payment?.amount) || 0,
      paymentDate: payment?.paymentDate ? new Date(payment.paymentDate) : undefined
    },
      status,
      statusHistory: Array.isArray(response.statusHistory) 
        ? response.statusHistory.map((sh: any) => ({
            status: this.validStatuses.includes(
              String(sh.status || status).toLowerCase() as OrderStatusType
            ) ? (sh.status.toLowerCase() as OrderStatusType) : status,
            date: sh.timestamp ? new Date(sh.timestamp) : new Date(),
            description: String(sh.message || 'Status updated').trim()
          }))
        : [{
            status,
            date: orderDate,
            description: 'Order created'
          }],
      total: response.totalAmount || subtotal || 0 // Use totalAmount from backend or calculated subtotal
    };

    return orderDetails;
  }
}
