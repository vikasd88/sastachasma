import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order, OrderStatus } from '../../models/order.model'; // Updated imports

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-confirmation.html',
  styleUrls: ['./order-confirmation.css']
})
export class OrderConfirmationComponent implements OnInit {
  order: Order | null = null; // Changed to Order type
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const orderNumber = params['orderNumber']; // Changed orderId to orderNumber
      if (orderNumber) {
        this.loadOrderDetails(orderNumber); // Changed orderId to orderNumber
      } else {
        this.error = 'No order number provided'; // Updated error message
        this.isLoading = false;
      }
    });
  }

  private loadOrderDetails(orderNumber: string): void { // Changed orderId to orderNumber
    this.orderService.getOrderDetails(orderNumber).subscribe({ // Changed orderId to orderNumber
      next: (order: Order) => {
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
    return this.order.items.reduce((sum, item) => sum + ((item.unitPrice || 0) * (item.quantity || 1)) + (item.lensPrice || 0), 0); // Updated calculation
  }

  getOrderTotal(): number {
    if (!this.order) return 0;
    return this.order.totalAmount || 0; // Use totalAmount directly
  }

  printOrder(): void {
    window.print();
  }

  getOrderStatusClass(status?: string): string {
    if (!status) return 'status-pending';
    switch (status.toUpperCase()) { // Changed toUpperCase
      case 'PROCESSING':
        return 'status-processing';
      case 'SHIPPED':
        return 'status-shipped';
      case 'DELIVERED':
        return 'status-delivered';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  }

  formatDate(date: Date | string | undefined): string { // Added undefined to type
    if (!date) return '';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return ''; // Added check for invalid date
      return d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  }
}
