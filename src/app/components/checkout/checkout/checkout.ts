import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../services/cart.service';
import { CartItem } from '../../../models/product.model';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.cartTotal = this.cartService.getCartTotal();
      if (this.cartItems.length === 0) {
        this.router.navigate(['/cart']);
      }
    });
  }

  placeOrder(): void {
    if (this.cartItems.length === 0) {
      alert('Your cart is empty. Please add items before checking out.');
      this.router.navigate(['/products']);
      return;
    }

    // Dummy checkout logic
    console.log('Placing order with details:', {
      items: this.cartItems,
      total: this.cartTotal,
      shipping: this.shippingAddress,
      payment: this.paymentMethod,
    });

    alert('Order Placed Successfully! Thank you for shopping with us.');
    this.cartService.clearCart();
    this.router.navigate(['/']);
  }

}
