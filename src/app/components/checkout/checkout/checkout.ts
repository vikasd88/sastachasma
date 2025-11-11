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
      const order = await lastValueFrom(
        this.orderService.placeOrder(orderItems, shippingAddressPayload, this.paymentMethod)
      );

      // Clear the cart after successful order placement
      this.cartService.clearCart().subscribe();
      
      // Navigate to order summary with order ID
      this.router.navigate(['/order-summary', order.orderId], { 
        state: { order: order } 
      });
      
    } catch (error) {
      console.error('Error placing order:', error);
      this.orderError = 'Failed to place order. Please try again.';
    } finally {
      this.isPlacingOrder = false;
    }
  }

}
