import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CartItem, Product } from '../../models/product.model';

interface OrderDetails {
  orderId: string;
  items: CartItem[];
  total: number;
  shipping: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  payment: string;
  orderDate: Date;
}

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-summary.html',
  styleUrl: './order-summary.css'
})
export class OrderSummaryComponent implements OnInit {
  orderDetails: OrderDetails | null = null;
  loading: boolean = true;
  error: string | null = null;

  // Make router public to be accessible in the template
  constructor(
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    // In a real app, you would fetch the order details using an order ID from the route
    // For now, we'll use the cart items from localStorage as a fallback
    const orderData = localStorage.getItem('lastOrder');
    
    if (orderData) {
      try {
        this.orderDetails = JSON.parse(orderData);
        this.loading = false;
      } catch (e) {
        this.error = 'Failed to load order details.';
        this.loading = false;
      }
    } else {
      this.error = 'No order details found.';
      this.loading = false;
    }
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  getEstimatedDeliveryDate(): string {
    if (!this.orderDetails?.orderDate) return '';
    const date = new Date(this.orderDetails.orderDate);
    date.setDate(date.getDate() + 3); // 3 days for delivery
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  // Helper method to get the first image URL or a fallback
  getProductImage(product: Product): string {
    return product.image || 'assets/images/placeholder.jpg';
  }

  // Helper method to get frame size if available
  getFrameSize(item: CartItem): string | null {
    // Check if frameSize exists on the item or its product
    return (item as any).frameSize || (item.product as any)?.frameSize || null;
  }
}
