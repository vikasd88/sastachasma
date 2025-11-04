import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { OrderDetails } from '../../models/order.model';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-confirmation.html',
  styleUrls: ['./order-confirmation.css']
})
export class OrderConfirmationComponent implements OnInit {
  order: OrderDetails | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const orderId = params['orderId'];
      if (orderId) {
        this.loadOrderDetails(orderId);
      } else {
        this.error = 'No order ID provided';
        this.isLoading = false;
      }
    });
  }

  private loadOrderDetails(orderId: string): void {
    this.orderService.getOrderDetails(orderId).subscribe({
      next: (order: OrderDetails) => {
        this.order = order;
        this.isLoading = false;
      },
      error: (err: Error) => {
        console.error('Error loading order:', err);
        this.error = 'Failed to load order details. Please try again later.';
      }
    });
  }

  getOrderSubtotal(): number {
    if (!this.order?.items) return 0;
    return this.order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getOrderTotal(): number {
    if (!this.order) return 0;
    const subtotal = this.getOrderSubtotal();
    const shipping = this.order.shippingMethod?.price ?? 0;
    const discount = this.order.discount ?? 0;
    return subtotal + shipping - discount;
  }

  printOrder(): void {
    window.print();
  }

  getOrderStatusClass(status?: string): string {
    if (!status) return 'status-pending';
    switch (status.toLowerCase()) {
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
