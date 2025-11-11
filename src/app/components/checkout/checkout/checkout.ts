import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../services/cart.service';
import { OrderService } from '../../../services/order.service';
import { CartItem } from '../../../models/product.model';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { OrderDetails } from '../../../models/order.model';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartTotal: number = 0;
  shippingAddress = {
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  };
  paymentMethod: string = 'cod'; // Default to Cash on Delivery

  constructor(
    private cartService: CartService, 
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      // Recalculate the total whenever cart items change
      this.cartTotal = this.cartItems.reduce((total, item) => {
        const itemPrice = (item.priceAtAddition || 0) + (item.lensPrice || 0);
        return total + (itemPrice * (item.quantity || 1));
      }, 0);
      
      if (this.cartItems.length === 0) {
        this.router.navigate(['/cart']);
      }
    });
  }

  isPlacingOrder = false;
  orderError: string | null = null;

  async placeOrder(): Promise<void> {
    if (this.cartItems.length === 0) {
      alert('Your cart is empty. Please add items before checking out.');
      this.router.navigate(['/products']);
      return;
    }

    this.isPlacingOrder = true;
    this.orderError = null;

    try {
      // Prepare order items with required properties
      const orderItems = this.cartItems.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.priceAtAddition,
        lensPrice: item.lensPrice || 0,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl || 'assets/placeholder-product.jpg',
        lensName: item.lensPrice && item.lensPrice > 0 ? 'Custom Lens' : 'Standard',
        frameSize: item.frameSize
      }));

      const shippingAddressPayload = {
        name: this.shippingAddress.fullName,
        street: this.shippingAddress.addressLine1, // Assuming addressLine1 is the street
        city: this.shippingAddress.city,
        state: this.shippingAddress.state,
        pincode: this.shippingAddress.zipCode,
        phone: '' // Phone is not collected in this form, provide an empty string or default
      };

      // Place the order using the OrderService
      this.orderService.placeOrder(orderItems, shippingAddressPayload, this.paymentMethod).subscribe({
        next: (order) => {
          console.log('Order placed successfully:', order);
          
          // Create a local order details object to pass to the order summary
          const localOrder: any = {
            orderId: order.orderId,
            items: order.items.map(item => ({
              ...item,
              frameSize: item.frameSize || 'standard',
              product: {
                name: item.name,
                price: item.price,
                imageUrl: item.imageUrl
              },
              lensPrice: item.lensPrice || 0,
              priceAtAddition: item.price // Add this for backward compatibility
            })),
            total: order.total,
            shippingAddress: {
              ...order.shippingAddress,
              zipCode: order.shippingAddress.pincode // Map pincode to zipCode if needed
            },
            payment: order.payment?.method || 'cod',
            orderDate: order.orderDate
          };
          
          // Save to local storage first
          localStorage.setItem('lastOrder', JSON.stringify(localOrder));
          
          // Clear the cart after successful order placement
          this.cartService.clearCart().subscribe({
            next: () => {
              console.log('Cart cleared successfully');
              // Navigate to order summary with order ID and state
              this.router.navigate(['/order-summary', order.orderId], { 
                state: { order: localOrder },
                replaceUrl: true // Replace the current URL in history
              }).then(success => {
                if (!success) {
                  console.error('Navigation failed');
                  // Fallback to just the order ID if navigation with state fails
                  this.router.navigate(['/order-summary', order.orderId]);
                }
              });
            },
            error: (clearError) => {
              console.error('Error clearing cart:', clearError);
              // Still navigate to order summary even if cart clearing fails
              this.router.navigate(['/order-summary', order.orderId], { 
                state: { order: localOrder } 
              });
            }
          });
        },
        error: (error) => {
          console.error('Error placing order:', error);
          this.orderError = error.error?.message || 'Failed to place order. Please try again.';
          this.isPlacingOrder = false;
        }
      });
      
    } catch (error) {
      console.error('Error placing order:', error);
      this.orderError = 'Failed to place order. Please try again.';
    } finally {
      this.isPlacingOrder = false;
    }
  }

}
