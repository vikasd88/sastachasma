import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CartItem } from '../../models/product.model';
import { OrderService } from '../../services/order.service';
import { catchError, firstValueFrom, of } from 'rxjs';
import { Order, OrderItem, Address, PaymentStatusType, OrderStatus } from '../../models/order.model'; // Updated imports

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-summary.html',
  styleUrls: ['./order-summary.css']
})
export class OrderSummaryComponent implements OnInit {
  orderDetails: Order | null = null; // Changed to Order type
  loading: boolean = true;
  error: string | null = null;
  orderNumber: string | null = null; // Changed from orderId to orderNumber

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    // Extract order number from URL
    this.route.params.subscribe(params => {
      this.orderNumber = params['orderNumber']; // Changed from 'id' to 'orderNumber'
      this.loadOrderDetails();
    });

    // Also check for order data in navigation state (from checkout page)
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { order: Order }; // Expecting Order type

    if (state?.order) {
      this.orderDetails = state.order;
      this.loading = false;
      localStorage.setItem('lastOrder', JSON.stringify(this.orderDetails));
    } else if (this.orderNumber) {
      // If no state, try loading from local storage first for immediate display
      this.tryLoadFromLocalStorage();
    }

    // Fallback: Check for order data in local storage if not loaded yet
    setTimeout(() => {
      if (!this.orderDetails && !this.loading) {
        this.tryLoadFromLocalStorage();
      }
    }, 100);
  }

  private tryLoadFromLocalStorage(): void {
    const lastOrder = localStorage.getItem('lastOrder');
    if (lastOrder) {
      try {
        const parsedOrder: Order = JSON.parse(lastOrder);
        // Only use local storage if we don't have an order ID or if it matches
        if (!this.orderNumber || parsedOrder.orderNumber === this.orderNumber) {
          this.orderDetails = parsedOrder;
          this.loading = false;
        }
      } catch (e) {
        console.error('Error parsing order from localStorage:', e);
      }
    }
  }

  async loadOrderDetails(): Promise<void> {
    this.loading = true;
    this.error = null;

    if (!this.orderNumber) {
      this.error = 'No order number provided';
      this.loading = false;
      return;
    }

    try {
      const order = await firstValueFrom(
        this.orderService.getOrderDetails(this.orderNumber).pipe(
          catchError(error => {
            if (error.status === 404) {
              this.error = `Order not found with number: ${this.orderNumber}`;
            } else {
              this.error = 'Failed to load order details. Please try again later.';
            }
            return of(null);
          })
        )
      );

      if (order) {
        this.orderDetails = order;
        localStorage.setItem('lastOrder', JSON.stringify(this.orderDetails));
      } else if (!this.orderDetails) { // If no order from API and no local storage fallback
        this.error = this.error || 'Order details could not be loaded.';
      }
    } catch (error) {
      console.error('Error fetching order details from API:', error);
      this.error = 'Failed to load order details. Please try again later.';
    } finally {
      this.loading = false;
    }
  }

  // Calculate item subtotal (frame + lens) * quantity
  calculateItemSubtotal(item: OrderItem): number {
    const unitPrice = item.unitPrice || 0;
    const lensPrice = item.lensPrice || 0;
    const quantity = item.quantity || 1;
    return (unitPrice + lensPrice) * quantity;
  }

  // Get estimated delivery date
  getEstimatedDeliveryDate(): string {
    const estimatedDelivery = this.orderDetails?.estimatedDelivery;
    if (!estimatedDelivery) return 'Estimated delivery: 5-7 business days';

    return `Estimated delivery: ${new Date(estimatedDelivery).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`;
  }

  // Get payment method display text
  getPaymentMethod(): string {
    const paymentStatus = this.orderDetails?.paymentStatus;
    switch (paymentStatus?.toLowerCase()) {
      case 'cod': return 'Cash on Delivery'; // Assuming COD implies a specific payment method
      case 'pending': return 'Payment Pending';
      case 'completed': return 'Payment Completed';
      case 'failed': return 'Payment Failed';
      case 'refunded': return 'Refunded';
      default: return 'Payment Details N/A';
    }
  }

  // Navigate to track order page
  trackOrder(): void {
    const orderNumber = this.orderDetails?.orderNumber;
    if (orderNumber) {
      this.router.navigate(['/track-order', orderNumber]);
    }
  }

  // Continue shopping
  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  // Helper method to get the product image URL
  getProductImage(item: OrderItem): string {
    if (item?.imageUrl) return item.imageUrl;
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNEOEQ4RDgiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgo8cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiI+PC9yZWN0Pgo8Y2lyY2xlIGN4PSI4LjUiIGN5PSI4LjUiIHI9IjEuNSI+PC9jaXJjbGU+Cjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDE2IDEwIDUgMjEiPjwvcGZnPg==';
  }
}