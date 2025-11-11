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
    console.log('OrderSummaryComponent initialized');
    
    // First check for order data in navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { order: any };
    
    console.log('Navigation state:', state);
    
    if (state?.order) {
      console.log('Using order from navigation state:', state.order);
      // If we have order data in the state, use it directly
      this.localOrderDetails = this.mapToLocalOrderDetails(state.order);
      console.log('Mapped order details:', this.localOrderDetails);
      this.loading = false;
      // Also save to local storage for future reference
      localStorage.setItem('lastOrder', JSON.stringify(this.localOrderDetails));
    } else {
      console.log('No order in navigation state, checking URL params');
      // Check local storage first for immediate feedback
      const lastOrder = localStorage.getItem('lastOrder');
      if (lastOrder) {
        try {
          this.localOrderDetails = JSON.parse(lastOrder);
          console.log('Loaded order from localStorage:', this.localOrderDetails);
          this.loading = false;
        } catch (e) {
          console.error('Error parsing order from localStorage:', e);
        }
      }
      
      // Then check URL parameters
      this.route.paramMap.subscribe(params => {
        this.orderId = params.get('id');
        console.log('Order ID from URL:', this.orderId);
        if (this.orderId) {
          this.loadOrderDetails();
        } else {
          console.warn('No order ID in URL and no order in state');
          this.error = 'No order details found. Please check your order confirmation email.';
          this.loading = false;
        }
      });
    }
    
    // Fallback: Check for order data in local storage after a short delay
    setTimeout(() => {
      if ((!this.orderDetails && !this.localOrderDetails) || this.loading) {
        console.log('Falling back to local storage check');
        const lastOrder = localStorage.getItem('lastOrder');
        if (lastOrder) {
          try {
            this.localOrderDetails = JSON.parse(lastOrder);
            this.loading = false;
            console.log('Loaded order from local storage:', this.localOrderDetails);
          } catch (e) {
            console.error('Error parsing order from localStorage:', e);
          }
        }
      }
    }, 500);
  }

  async loadOrderDetails(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;
      
      console.log('Loading order details for ID:', this.orderId);
      
      // If we have an order ID, try to fetch the latest order details from the server first
      if (this.orderId) {
        try {
          console.log('Fetching order details from server...');
          const order = await firstValueFrom(this.orderService.getOrderDetails(this.orderId));
          console.log('Order details from server:', order);
          
          if (order) {
            this.orderDetails = order;
            this.localOrderDetails = this.mapToLocalOrderDetails(order);
            console.log('Mapped order details:', this.localOrderDetails);
            
            // Update local storage with the latest order details
            localStorage.setItem('lastOrder', JSON.stringify(this.localOrderDetails));
            this.loading = false;
            return;
          }
        } catch (error) {
          console.error('Error fetching order from server:', error);
          // If server fetch fails, fall back to local storage
        }
      }
      
      // Fallback to local storage if server fetch fails or no order ID
      console.log('Falling back to local storage');
      const lastOrder = localStorage.getItem('lastOrder');
      if (lastOrder) {
        try {
          const parsedOrder = JSON.parse(lastOrder) as LocalOrderDetails;
          // If we have an order ID, verify it matches the stored order
          if (!this.orderId || (parsedOrder.orderId === this.orderId)) {
            this.localOrderDetails = parsedOrder;
            console.log('Loaded order from localStorage:', this.localOrderDetails);
          } else {
            console.warn('Order ID in URL does not match stored order');
            this.error = 'Order not found. Please check your order confirmation email.';
          }
        } catch (e) {
          console.error('Error parsing order from localStorage:', e);
          this.error = 'Error loading order details. Please contact support.';
        }
      } else {
        this.error = 'No order details found. Please check your order confirmation email.';
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      this.error = 'An unexpected error occurred while loading order details.';
    } finally {
      this.loading = false;
    }
  }
    // End of previous block (try/catch/finally). No stray or unmatched closing braces.
  
  private mapToLocalOrderDetails(order: any): LocalOrderDetails {
    console.log('Mapping order to local details:', order);
    
    // Ensure items exist and are properly formatted
    const items = (order.items || []).map((item: any) => {
      // Ensure all required fields have default values
      const mappedItem: any = {
        ...item,
        productId: item.productId || 0,
        name: item.name || 'Unknown Product',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        imageUrl: item.imageUrl || 'assets/placeholder-product.jpg',
        lensPrice: Number(item.lensPrice) || 0,
        lensName: item.lensName || (item.lensPrice > 0 ? 'Custom Lens' : undefined),
        frameSize: item.frameSize || null
      };
      
      // Calculate total price for the item
      mappedItem.totalPrice = (mappedItem.price + (mappedItem.lensPrice || 0)) * mappedItem.quantity;
      
      return mappedItem;
    });
    
    // Calculate total if not provided
    const total = order.total || items.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0);
    
    // Format shipping address
    const shippingAddress = {
      name: order.shippingAddress?.name || 'N/A',
      street: order.shippingAddress?.street || order.shippingAddress?.addressLine1 || 'N/A',
      city: order.shippingAddress?.city || 'N/A',
      state: order.shippingAddress?.state || 'N/A',
      pincode: order.shippingAddress?.pincode || order.shippingAddress?.zipCode || 'N/A',
      phone: order.shippingAddress?.phone || 'N/A',
      country: order.shippingAddress?.country || 'India',
      addressLine1: order.shippingAddress?.street || order.shippingAddress?.addressLine1 || 'N/A',
      addressLine2: order.shippingAddress?.addressLine2 || ''
    };
    
    // Format payment method
    const paymentMethod = order.payment?.method || 'cod';
    
    // Format order date
    let orderDate = new Date().toISOString();
    if (order.orderDate) {
      orderDate = typeof order.orderDate === 'string' 
        ? order.orderDate 
        : order.orderDate.toISOString ? order.orderDate.toISOString() : new Date(order.orderDate).toISOString();
    }
    
    const mappedOrder: LocalOrderDetails = {
      orderId: order.orderId || `temp-${Date.now()}`,
      items,
      total,
      shippingAddress,
      payment: paymentMethod,
      orderDate
    };
    
    console.log('Mapped order details:', mappedOrder);
    return mappedOrder;
  }

  // Helper method to get the product image URL
  getProductImage(item: any): string {
    if (!item) return 'assets/placeholder-product.jpg';
    if (item.imageUrl) return item.imageUrl;
    if (item.image) return item.image;
    return 'assets/placeholder-product.jpg';
  }

  // Format price to currency
  formatPrice(price: number | undefined): string {
    const amount = price || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Get estimated delivery date
  getEstimatedDeliveryDate(): string {
    const orderDate = this.orderDetails?.orderDate || this.localOrderDetails?.orderDate;
    if (!orderDate) return 'Estimated delivery: 5-7 business days';
    
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    
    return `Estimated delivery: ${deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`;
  }

  // Get payment method display text
  getPaymentMethod(): string {
    const paymentMethod = this.orderDetails?.payment?.method || this.localOrderDetails?.payment || 'cod';
    switch (paymentMethod.toLowerCase()) {
      case 'cod': return 'Cash on Delivery';
      case 'card': return 'Credit/Debit Card';
      case 'upi': return 'UPI Payment';
      case 'netbanking': return 'Net Banking';
      default: return 'Payment Method';
    }
  }

  // Navigate to track order page
  trackOrder(): void {
    const orderId = this.orderDetails?.orderId || this.localOrderDetails?.orderId;
    if (orderId) {
      this.router.navigate(['/track-order', orderId]);
    }
  }
  
  // Continue shopping
  continueShopping(): void {
    this.router.navigate(['/products']);
  }
  
  
  // Helper method to get frame size if available
  getFrameSize(item: OrderItem | any): string | null {
    // Check if frameSize exists on the item or its product
    return item?.frameSize || item?.product?.frameSize || null;
  }
}