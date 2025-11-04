import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { OrderDetails, OrderStatus } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  // Generate a random order ID with format ORD-XXXXXXX
  private generateOrderId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'ORD-';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Mock order data - in a real app, this would be an API call
  private mockOrders: { [key: string]: OrderDetails } = {
    'ORD-F3DABG4K': {
      orderId: 'ORD-F3DABG4K',
      customerName: 'Rahul Sharma',
      orderDate: new Date('2025-10-28T10:30:00'),
      estimatedDelivery: new Date('2025-11-05T18:00:00'),
      items: [
        {
          name: 'Classic Black Frames',
          quantity: 1,
          price: 1499,
          imageUrl: 'assets/images/classic-black.jpg'
        },
        {
          name: 'Blue Light Blocking Lenses',
          quantity: 1,
          price: 999,
          imageUrl: 'assets/images/blue-light.jpg'
        }
      ],
      statusHistory: [
        {
          status: 'processing',
          date: new Date('2025-10-28T11:00:00'),
          description: 'We\'ve received your order and it\'s being processed.'
        },
        {
          status: 'processing',
          date: new Date('2025-10-29T14:30:00'),
          description: 'Your lenses are being crafted with precision.'
        },
        {
          status: 'shipped',
          date: new Date('2025-10-31T09:15:00'),
          location: 'Mumbai, IN',
          description: 'Your order has been shipped via Delhivery.'
        }
      ],
      shippingAddress: {
        name: 'Rahul Sharma',
        street: 'A-502, Sunshine Apartments',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        phone: '9876543210'
      },
      payment: {
        method: 'Credit Card',
        status: 'completed',
        amount: 2717,
        transactionId: 'TXN987654321'
      }
    }
  };

  constructor() {}

  private calculateEstimatedDelivery(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 7); // 7 days from now
    return date;
  }

  getOrderDetails(orderId: string): Observable<OrderDetails> {
    const order = this.mockOrders[orderId];
    if (order) {
      return of(order).pipe(delay(500)); // Simulate network delay
    } else {
      return throwError(() => new Error('Order not found'));
    }
  }

  trackOrder(orderId: string, email: string): Observable<OrderDetails> {
    // Convert to uppercase to handle case-insensitive matching
    const normalizedOrderId = orderId.toUpperCase();
    
    // Simulate API delay
    return of({}).pipe(
      delay(800),
      map(() => {
        // In a real app, this would be an HTTP request to your backend
        const order = this.mockOrders[normalizedOrderId];
        
        if (!order) {
          throw new Error('No order found with the provided details.');
        }

        // In a real app, you would validate the email against the order
        // For demo purposes, we'll just check if the email is provided
        if (email && email.trim() === '') {
          throw new Error('Please enter your email address.');
        }
        
        return order;
      })
    );
  }

  // Mock method to create a new order
  createOrder(orderData: any): Observable<{ orderId: string }> {
    return new Observable(subscriber => {
      try {
        // Generate a new order ID with the specified format
        const orderId = this.generateOrderId();
        
        // Create a new order with the generated ID
        this.mockOrders[orderId] = {
          orderId,
          customerName: orderData.customerName || '',
          orderDate: new Date(),
          estimatedDelivery: this.calculateEstimatedDelivery(),
          items: orderData.items || [],
          statusHistory: [{
            status: 'processing' as const,
            date: new Date(),
            description: 'Order received and is being processed.'
          }],
          shippingAddress: orderData.shippingAddress || {
            name: '',
            street: '',
            city: '',
            state: '',
            pincode: '',
            phone: ''
          },
          payment: {
            method: orderData.paymentMethod || '',
            status: 'completed' as const,
            amount: orderData.totalAmount || 0,
            transactionId: 'TXN' + Math.floor(10000000 + Math.random() * 90000000)
          },
          shippingMethod: orderData.shippingMethod || {
            name: 'Standard',
            price: 0,
            estimatedDays: 5
          },
          discount: orderData.discount || 0
        };

        // Simulate network delay
        setTimeout(() => {
          subscriber.next({ orderId });
          subscriber.complete();
        }, 500);
      } catch (error) {
        subscriber.error(error);
      }
    });
  }
}