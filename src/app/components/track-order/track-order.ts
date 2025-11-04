import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { finalize } from 'rxjs/operators';

interface OrderStatus {
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: Date;
  location?: string;
  description: string;
}

interface OrderDetails {
  orderId: string;
  customerName: string;
  orderDate: Date;
  estimatedDelivery?: Date;
  items: {
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }[];
  statusHistory: OrderStatus[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  payment: {
    method: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    amount: number;
    transactionId?: string;
  };
}

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './track-order.html',
  styleUrls: ['./track-order.css']
})
export class TrackOrderComponent implements OnInit {
  trackForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  order: OrderDetails | null = null;
  currentStatus: OrderStatus | null = null;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private router: Router
  ) {
    this.trackForm = this.fb.group({
      orderId: ['', [Validators.required, Validators.minLength(8)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Check for order ID in route params or local storage
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    if (orderId) {
      this.trackForm.patchValue({ orderId });
      // Auto-submit if we have both order ID and email in URL
      const email = urlParams.get('email');
      if (email) {
        this.trackForm.patchValue({ email });
        this.onTrackOrder();
      }
    }
  }

  onTrackOrder(): void {
    if (this.trackForm.invalid) {
      this.trackForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const { orderId, email } = this.trackForm.value;

    // In a real app, you would call your order service here
    // For demo purposes, we'll use a mock implementation
    this.orderService.trackOrder(orderId, email)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (order) => {
          this.order = order;
          this.currentStatus = order.statusHistory[order.statusHistory.length - 1];
          
          // Update URL with order details for sharing
          const url = new URL(window.location.href);
          url.searchParams.set('orderId', orderId);
          url.searchParams.set('email', email);
          window.history.pushState({}, '', url);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to track order. Please check your details and try again.';
          this.order = null;
        }
      });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'delivered':
        return 'status-delivered';
      case 'shipped':
        return 'status-shipped';
      case 'processing':
        return 'status-processing';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'delivered':
        return 'check-circle';
      case 'shipped':
        return 'truck';
      case 'processing':
        return 'refresh';
      case 'cancelled':
        return 'x-circle';
      default:
        return 'clock';
    }
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isStatusActive(status: string): boolean {
    if (!this.currentStatus) return false;
    const statusOrder = ['processing', 'shipped', 'delivered'];
    const currentStatusIndex = statusOrder.indexOf(this.currentStatus.status);
    const checkStatusIndex = statusOrder.indexOf(status);
    return currentStatusIndex >= checkStatusIndex;
  }

  isStatusCompleted(status: string): boolean {
    if (!this.currentStatus) return false;
    const statusOrder = ['processing', 'shipped', 'delivered'];
    const currentStatusIndex = statusOrder.indexOf(this.currentStatus.status);
    const checkStatusIndex = statusOrder.indexOf(status);
    return currentStatusIndex > checkStatusIndex;
  }

  getOrderSubtotal(): number {
    if (!this.order) return 0;
    return this.order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getOrderTotal(): number {
    // In a real app, you might have shipping, taxes, etc.
    return this.getOrderSubtotal();
  }
}
