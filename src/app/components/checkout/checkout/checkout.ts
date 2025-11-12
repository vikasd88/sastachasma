import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../services/cart.service';
import { OrderService } from '../../../services/order.service';
import { CartItem } from '../../../models/product.model';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Address, PlaceOrderRequest, Order } from '../../../models/order.model'; // Updated imports

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartTotal: number = 0;
  fullName: any = '';
  shippingAddress: Address = {
    // Changed to Address interface
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: '',
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
        const itemPrice = (item.unitPrice || 0) + (item.lensPrice || 0); // Changed priceAtAddition to unitPrice
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
      const placeOrderRequest: PlaceOrderRequest = {
        paymentMethod: this.paymentMethod,
        billingAddress: this.shippingAddress,
        items: this.cartItems.map(item => ({
          productId: item.productId,
          name: item.name, // Added
          quantity: item.quantity,
          unitPrice: item.unitPrice, // Added
          totalPrice: item.totalPrice, // Added
          imageUrl: item.imageUrl, // Added
          lensId: item.lensId,
          lensType: item.lensType,
          lensMaterial: item.lensMaterial,
          lensPrescriptionRange: item.lensPrescriptionRange,
          lensCoating: item.lensCoating,
          lensPrice: item.lensPrice, // Added
        })),
      };

      this.orderService.placeOrder(placeOrderRequest).subscribe({
        next: (order: Order) => { // Changed to Order type
          console.log('Order placed successfully:', order);

          // Store the full order object in local storage
          localStorage.setItem('lastOrder', JSON.stringify(order));

          // Clear the cart after successful order placement
          this.cartService.clearCart().subscribe({
            next: () => {
              console.log('Cart cleared successfully');
              // Navigate to order summary with order ID and state
              this.router.navigate(['/order-summary', order.orderNumber], {
                state: { order: order }, // Pass the full order object
                replaceUrl: true
              }).then(success => {
                if (!success) {
                  console.error('Navigation failed');
                  // Fallback to just the order ID if navigation with state fails
                  this.router.navigate(['/order-summary', order.orderNumber]);
                }
              });
            },
            error: (clearError) => {
              console.error('Error clearing cart:', clearError);
              // Still navigate to order summary even if cart clearing fails
              this.router.navigate(['/order-summary', order.orderNumber], {
                state: { order: order }
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
