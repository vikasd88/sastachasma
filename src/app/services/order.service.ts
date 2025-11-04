import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { OrderDetails, OrderStatus } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  // Mock order data - in a real app, this would be an API call
  private mockOrders: { [key: string]: OrderDetails } = {
    'ORDER12345': {
      orderId: 'ORDER12345',
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

  trackOrder(orderId: string, email: string): Observable<OrderDetails> {
    // Simulate API delay
    return of({}).pipe(
      delay(800),
      map(() => {
        // In a real app, this would be an HTTP request to your backend
        const order = this.mockOrders[orderId];
        
        if (!order) {
          throw new Error('Order not found. Please check your order ID and email.');
        }

        // In a real app, you would validate the email against the order
        if (email && !email.endsWith('@example.com')) {
          throw new Error('No order found with the provided details.');
        }

        return order;
      })
    );
  }

  // This would be called when the order is actually delivered
  markAsDelivered(orderId: string): Observable<OrderStatus> {
    const order = this.mockOrders[orderId];
    if (!order) {
      return throwError('Order not found');
    }

    const newStatus: OrderStatus = {
      status: 'delivered',
      date: new Date(),
      description: 'Your order has been delivered.'
    };

    order.statusHistory.push(newStatus);
    return of(newStatus).pipe(delay(500));
  }
}
