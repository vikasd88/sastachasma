import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CartItem } from '../../models/product.model';
import { OrderService } from '../../services/order.service';
import { catchError, firstValueFrom, of } from 'rxjs';
import { OrderDetails as ModelOrderDetails, OrderItem, ShippingAddress as ModelShippingAddress, PaymentDetails, PaymentStatusType } from '../../models/order.model';

// Local interfaces for the component
interface LocalOrderItem extends OrderItem {
  totalPrice: number;
}

interface LocalOrderDetails {
  orderId: string;
  items: LocalOrderItem[];
  total: number;
  shippingAddress: ModelShippingAddress;
  payment: PaymentDetails; // Changed to PaymentDetails
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
  loading: boolean = true;
  error: string | null = null;
  orderId: string | null = null;
  localOrderDetails: LocalOrderDetails | null = null;

  get activeOrderDetails(): ModelOrderDetails | LocalOrderDetails | null {
    return this.orderDetails || this.localOrderDetails;
  }

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    // First check for order data in navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { order: any };
    
    // Extract order ID from URL
    const urlSegments = this.router.url.split('/');
    this.orderId = urlSegments[urlSegments.length - 1];
    
    if (state?.order) {
      // If we have order data in the state, use it directly
      this.localOrderDetails = this.mapToLocalOrderDetails(state.order);
      this.loading = false;
      // Also save to local storage for future reference
      if (this.localOrderDetails) {
        localStorage.setItem('lastOrder', JSON.stringify(this.localOrderDetails));
      }
      
      // Try to load from local storage first
      this.tryLoadFromLocalStorage();
      
      // Then try to load from URL if we have an order ID
      if (this.orderId) { // Check if orderId exists before loading
        this.loadOrderDetails();
      } else {
        this.loading = false;
        this.error = 'No order ID provided';
      }
    }
    
    // Fallback: Check for order data in local storage after a short delay
    setTimeout(() => {
      if ((!this.orderDetails && !this.localOrderDetails) || this.loading) {
        const lastOrder = localStorage.getItem('lastOrder');
        if (lastOrder) {
          try {
            this.localOrderDetails = JSON.parse(lastOrder);
            this.loading = false;
          } catch (e) {
            console.error('Error parsing order from localStorage:', e);
          }
        }
      }
    }, 500);
  }

  private tryLoadFromLocalStorage(): void {
    const lastOrder = localStorage.getItem('lastOrder');
    if (lastOrder) {
      try {
        const parsedOrder = JSON.parse(lastOrder);
        // Only use local storage if we don't have an order ID or if it matches
        if (!this.orderId || parsedOrder.orderId === this.orderId) {
          // Ensure payment is correctly typed as PaymentDetails when loading from local storage
          let paymentMethod: string;
          let paymentStatus: PaymentStatusType;
          let paymentAmount: number = parsedOrder.total || 0;
          let paymentTransactionId: string | undefined = undefined;
          let paymentDate: Date | undefined = undefined;

          if (typeof parsedOrder.payment === 'string') {
            paymentMethod = parsedOrder.payment;
            paymentStatus = (parsedOrder.payment.toLowerCase() === 'cod' ? 'pending' : 'completed');
          } else if (parsedOrder.payment) {
            paymentMethod = parsedOrder.payment.method || 'cod';
            paymentStatus = parsedOrder.payment.status || 'pending';
            paymentAmount = Number(parsedOrder.payment.amount) || paymentAmount;
            paymentTransactionId = parsedOrder.payment.transactionId || paymentTransactionId;
            paymentDate = parsedOrder.payment.paymentDate ? new Date(parsedOrder.payment.paymentDate) : paymentDate;
          } else {
            paymentMethod = 'cod';
            paymentStatus = 'pending' as PaymentStatusType;
          }

          const finalPaymentDetails: PaymentDetails = {
            method: paymentMethod,
            status: paymentStatus,
            amount: paymentAmount,
            transactionId: paymentTransactionId,
            paymentDate: paymentDate,
          };

          const correctedLocalOrderDetails: LocalOrderDetails = {
            orderId: parsedOrder.orderId,
            items: parsedOrder.items,
            total: parsedOrder.total,
            shippingAddress: parsedOrder.shippingAddress,
            payment: finalPaymentDetails, // Assign the explicitly constructed PaymentDetails
            orderDate: parsedOrder.orderDate,
          };

          this.localOrderDetails = correctedLocalOrderDetails;
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
    
    if (!this.orderId) {
      this.error = 'No order ID provided';
      this.loading = false;
      return;
    }
    
    // First try to load from local storage for immediate display
    this.tryLoadFromLocalStorage();
    
    // Then try to fetch from server in the background
    try {
      const order = await firstValueFrom(
        this.orderService.getOrderDetails(this.orderId).pipe(
          catchError(error => {
            if (error.status === 404) {
            } else {
            }
            return of(null);
          })
        )
      );
      
      if (order) {
        this.orderDetails = order;
        this.localOrderDetails = this.mapToLocalOrderDetails(order);
        
        // Update local storage with the latest order details
        if (this.localOrderDetails) {
          localStorage.setItem('lastOrder', JSON.stringify(this.localOrderDetails));
        }
      }
      
    } catch (error) {
      // We'll continue with local data if available
    } finally {
      // If we still don't have any order details, show an error
      if (!this.localOrderDetails && !this.orderDetails) {
        const lastOrder = localStorage.getItem('lastOrder');
        if (lastOrder) {
          try {
            const parsedOrderFromLocalStorage = JSON.parse(lastOrder);

            let paymentMethodFinal: string;
            let paymentStatusFinal: PaymentStatusType;
            let paymentAmountFinal: number = parsedOrderFromLocalStorage.total || 0;
            let paymentTransactionIdFinal: string | undefined = undefined;
            let paymentDateFinal: Date | undefined = undefined;

            if (typeof parsedOrderFromLocalStorage.payment === 'string') {
              paymentMethodFinal = parsedOrderFromLocalStorage.payment;
              paymentStatusFinal = (parsedOrderFromLocalStorage.payment.toLowerCase() === 'cod' ? 'pending' : 'completed') as PaymentStatusType;
            } else if (parsedOrderFromLocalStorage.payment) {
              paymentMethodFinal = parsedOrderFromLocalStorage.payment.method || 'cod';
              paymentStatusFinal = parsedOrderFromLocalStorage.payment.status || 'pending';
              paymentAmountFinal = Number(parsedOrderFromLocalStorage.payment.amount) || paymentAmountFinal;
              paymentTransactionIdFinal = parsedOrderFromLocalStorage.payment.transactionId || paymentTransactionIdFinal;
              paymentDateFinal = parsedOrderFromLocalStorage.payment.paymentDate ? new Date(parsedOrderFromLocalStorage.payment.paymentDate) : paymentDateFinal;
            } else {
              paymentMethodFinal = 'cod';
              paymentStatusFinal = 'pending' as PaymentStatusType;
            }

            const finalPaymentDetails: PaymentDetails = {
              method: paymentMethodFinal,
              status: paymentStatusFinal,
              amount: paymentAmountFinal,
              transactionId: paymentTransactionIdFinal,
              paymentDate: paymentDateFinal,
            };

            const finalParsedOrder = parsedOrderFromLocalStorage as LocalOrderDetails;

            const correctedLocalOrderDetails: LocalOrderDetails = {
              orderId: finalParsedOrder.orderId,
              items: finalParsedOrder.items,
              total: finalParsedOrder.total,
              shippingAddress: finalParsedOrder.shippingAddress,
              payment: finalPaymentDetails,
              orderDate: finalParsedOrder.orderDate,
            };

            // If we have an order ID, verify it matches the stored order
            if (!this.orderId || (correctedLocalOrderDetails.orderId === this.orderId)) {
              this.localOrderDetails = correctedLocalOrderDetails;
            } else {
              this.error = 'Order not found. Please check your order confirmation email.';
            }
          } catch (e) {
            console.error('Error parsing order from localStorage in finally block:', e);
            this.error = 'Error loading order details. Please contact support.';
          }
        } else {
          this.error = 'No order details found. Please check your order confirmation email.';
        }
      }
      this.loading = false;
    }
  }
  private mapToLocalOrderDetails(order: any): LocalOrderDetails {
    
    if (!order) {
      return {
        orderId: 'error-no-order-id',
        items: [],
        total: 0,
        shippingAddress: {
          name: '',
          street: '',
          city: '',
          state: '',
          pincode: '',
          phone: ''
        },
        payment: {
          method: 'cod',
          status: 'pending' as PaymentStatusType,
          amount: 0,
        },
        orderDate: new Date().toISOString()
      };
    }
    
    // Ensure items exist and are properly formatted
    const items = (order.items || []).map((item: any) => {
      // Ensure all required fields have default values
      const mappedItem: LocalOrderItem = {
        productId: item.productId || 0,
        name: item.name, // Use name directly, as mapped by service
        price: item.price, // Use price directly, as mapped by service
        imageUrl: item.imageUrl || 'assets/placeholder-product.jpg',
        lensId: item.lensId || null,
        lensName: item.lensName || (item.lensPrice > 0 ? 'Custom Lens' : undefined),
        lensPrice: Number(item.lensPrice) || 0,
        frameSize: item.frameSize || null,
        quantity: Number(item.quantity) || 1,
        totalPrice: 0 // Initialize totalPrice, will be calculated next
      };
      
      // Calculate total price for the item
      mappedItem.totalPrice = (mappedItem.price + (mappedItem.lensPrice ?? 0)) * mappedItem.quantity;
      
      return mappedItem;
    });
    
    // Calculate total if not provided
    const total = Number(order.totalAmount) || (order.total || 0) || items.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
    
    // Format shipping address
    const shippingAddress = this.parseAddressString(order.shippingAddress || {});
    
    let finalPaymentMethod: string;
    let finalPaymentStatus: PaymentStatusType;
    let finalPaymentAmount: number = Number(order.totalAmount) || 0;
    let finalPaymentTransactionId: string | undefined = undefined;
    let finalPaymentDate: Date | undefined = undefined;

    if (typeof order.payment === 'string') {
      finalPaymentMethod = order.payment;
      finalPaymentStatus = (order.payment.toLowerCase() === 'cod' ? 'pending' : 'completed') as PaymentStatusType;
    } else if (order.payment) {
      finalPaymentMethod = order.payment.method || 'cod';
      finalPaymentStatus = order.payment.status || 'pending';
      finalPaymentAmount = Number(order.payment.amount) || finalPaymentAmount;
      finalPaymentTransactionId = order.payment.transactionId || finalPaymentTransactionId;
      finalPaymentDate = order.payment.paymentDate ? new Date(order.payment.paymentDate) : finalPaymentDate;
    } else {
      finalPaymentMethod = order.paymentMethod || 'cod';
      finalPaymentStatus = order.paymentStatus || (finalPaymentMethod.toLowerCase() === 'cod' ? 'pending' : 'completed') as PaymentStatusType;
    }

    const paymentDetails: PaymentDetails = {
      method: finalPaymentMethod,
      status: finalPaymentStatus,
      amount: finalPaymentAmount,
      transactionId: finalPaymentTransactionId,
      paymentDate: finalPaymentDate,
    };
    
    // Format order date
    let orderDate = order.orderDate ? new Date(order.orderDate).toISOString() : new Date().toISOString();
    
    const mappedOrder: LocalOrderDetails = {
      orderId: order.orderId || order.orderNumber || `temp-${Date.now()}`,
      items,
      total,
      shippingAddress,
      payment: paymentDetails,
      orderDate
    };
    
    return mappedOrder;
  }

  // Helper method to get the product image URL
  getProductImage(item: any): string {
    // Check for image in various possible locations
    if (item?.imageUrl) return item.imageUrl;
    if (item?.image) return item.image;
    if (item?.product?.imageUrl) return item.product.imageUrl;
    if (item?.product?.image) return item.product.image;
    
    // Return a simple placeholder SVG as a fallback
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNEOEQ4RDgiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgo8cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiI+PC9yZWN0Pgo8Y2lyY2xlIGN4PSI4LjUiIGN5PSI4LjUiIHI9IjEuNSI+PC9jaXJjbGU+Cjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDE2IDEwIDUgMjEiPjwvcG9seWxpbmU+Cjwvc3ZnPg==';
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

  // Calculate item subtotal (frame + lens) * quantity
  calculateItemSubtotal(item: any): number {
    const framePrice = item.price || 0;
    const lensPrice = item.lensPrice || 0;
    const quantity = item.quantity || 1;
    return (framePrice + lensPrice) * quantity;
  }

  // Calculate order subtotal (sum of all items)
  calculateOrderSubtotal(): number {
    const items = this.orderDetails?.items || this.localOrderDetails?.items || [];
    return items.reduce((total: number, item: any) => {
      return total + this.calculateItemSubtotal(item);
    }, 0);
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
    const paymentMethod = this.activeOrderDetails?.payment?.method || 'cod';
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

  private parseAddressString(address: string | any): ModelShippingAddress & {
    zipCode?: string;
    country?: string;
    addressLine1?: string;
    addressLine2?: string;
  } {
    if (typeof address === 'string') {
      try {
        const parsedAddress = JSON.parse(address);
        return {
          name: parsedAddress.name || '',
          street: parsedAddress.street || parsedAddress.addressLine1 || '',
          city: parsedAddress.city || '',
          state: parsedAddress.state || '',
          pincode: parsedAddress.pincode || parsedAddress.zipCode || '',
          phone: parsedAddress.phone || '',
          country: parsedAddress.country || '',
          addressLine1: parsedAddress.street || parsedAddress.addressLine1 || '',
          addressLine2: parsedAddress.addressLine2 || ''
        };
      } catch (e) {
        console.error('Error parsing address string:', e);
        return {
          name: 'N/A',
          street: 'N/A',
          city: 'N/A',
          state: 'N/A',
          pincode: 'N/A',
          phone: 'N/A',
          country: 'India',
          addressLine1: 'N/A',
          addressLine2: ''
        };
      }
    }
    return {
      name: address?.name || '',
      street: address?.street || address?.addressLine1 || '',
      city: address?.city || '',
      state: address?.state || '',
      pincode: address?.pincode || address?.zipCode || '',
      phone: address?.phone || '',
      country: address?.country || '',
      addressLine1: address?.street || address?.addressLine1 || '',
      addressLine2: address?.addressLine2 || ''
    };
  }
}