import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CartItem } from '../../models/product.model';
import { OrderService } from '../../services/order.service';
import { firstValueFrom } from 'rxjs';
import { OrderDetails as ModelOrderDetails, OrderItem, ShippingAddress as ModelShippingAddress } from '../../models/order.model';

// Local interfaces for the component
interface LocalOrderItem extends OrderItem {
  frameSize?: string;
  product?: {
    name: string;
    price: number;
    imageUrl?: string;
  };
}

interface LocalOrderDetails {
  orderId: string;
  items: LocalOrderItem[];
  total: number;
  shippingAddress: ModelShippingAddress & {
    zipCode?: string;
    country?: string;
    addressLine1?: string;
    addressLine2?: string;
  };
  payment: string;
  orderDate: string;
}

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-summary.html',
  styleUrls: ['./order-summary.css']
})
export class OrderSummaryComponent implements OnInit {
  orderDetails: ModelOrderDetails | null = null;
  localOrderDetails: LocalOrderDetails | null = null;
  loading: boolean = true;
  error: string | null = null;
  orderId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.orderId = params.get('id');
      this.loadOrderDetails();
    });
  }

  async loadOrderDetails(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;
      
      // First try to get order details from local storage (for immediate feedback)
      const lastOrder = localStorage.getItem('lastOrder');
      if (lastOrder) {
        try {
          const parsedOrder = JSON.parse(lastOrder) as LocalOrderDetails;
          // If we have an order ID and it matches the current order, use it
          if (!this.orderId || (parsedOrder.orderId === this.orderId)) {
            this.localOrderDetails = parsedOrder;
            this.loading = false;
          }
        } catch (e) {
          console.error('Error parsing order from localStorage:', e);
        }
      }
      
      // If we have an order ID, try to fetch the latest order details from the server
      if (this.orderId) {
        try {
          const order = await firstValueFrom(this.orderService.getOrderDetails(this.orderId));
          if (order) {
            this.orderDetails = order;
            // Update local storage with the latest order details
            localStorage.setItem('lastOrder', JSON.stringify(this.mapToLocalOrderDetails(order)));
          }
        } catch (error) {
          console.error('Error fetching order details:', error);
          // Don't show error if we already have order details from local storage
          if (!this.localOrderDetails) {
            this.error = 'Failed to load order details. Please try again later.';
          }
        }
      } else if (!this.localOrderDetails) {
        this.error = 'No order details found.';
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      this.error = 'An unexpected error occurred while loading order details.';
    } finally {
      this.loading = false;
    }
  }
    // End of previous block (try/catch/finally). No stray or unmatched closing braces.
  
  private mapToLocalOrderDetails(order: ModelOrderDetails): LocalOrderDetails {
    return {
      orderId: order.orderId,
      items: order.items.map(item => ({
        ...item,
        frameSize: (item as any).frameSize,
        product: {
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl
        }
      })),
      total: order.total || 0,
      shippingAddress: {
        ...order.shippingAddress,
        zipCode: order.shippingAddress.pincode,
        country: 'India', // Default to India as per the checkout form
        addressLine1: order.shippingAddress.street,
        addressLine2: ''
      },
      payment: order.payment?.method || 'cod',
      orderDate: order.orderDate ? (typeof order.orderDate === 'string' ? order.orderDate : order.orderDate.toISOString()) : new Date().toISOString()
    };
  }
  
  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  formatPrice(price: number | undefined): string {
    const amount = price || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getEstimatedDeliveryDate(): string {
    const orderDate = this.orderDetails?.orderDate || this.localOrderDetails?.orderDate;
    if (!orderDate) return '3-5 business days';
    
    const date = new Date(orderDate);
    date.setDate(date.getDate() + 3); // 3 days for delivery
    
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Helper method to get the product image URL
  getProductImage(product: any): string {
    if (!product) return 'assets/placeholder-product.jpg';
    
    // Handle different product object structures
    if (typeof product === 'object') {
      return product.imageUrl || product.image || 'assets/placeholder-product.jpg';
    }
    
    return 'assets/placeholder-product.jpg';
  }
  
  // Helper method to get frame size if available
  getFrameSize(item: OrderItem | any): string | null {
    // Check if frameSize exists on the item or its product
    return item?.frameSize || item?.product?.frameSize || null;
  }

  // Get the payment method display text
  getPaymentMethod(): string {
    const paymentMethod = this.orderDetails?.payment?.method || this.localOrderDetails?.payment || 'cod';
    return paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment';
  }

  // Navigate to the track order page
  trackOrder(): void {
    const orderId = this.orderDetails?.orderId || this.localOrderDetails?.orderId;
    if (orderId) {
      this.router.navigate(['/track-order', orderId]);
    }
  }
}