import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CartItem, CartService } from '../../../services/cart';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent implements OnInit {
  cartItems: (CartItem & { sanitizedImageUrl: SafeUrl })[] = [];
  subtotal: number = 0;
  taxRate: number = 0.05; // 5% tax
  otherCharges: number = 10; // e.g., shipping fee
  taxAmount: number = 0;
  totalAmount: number = 0;

  customer = {
    name: '',
    email: ''
  };

  deliveryAddress = {
    street: '',
    city: '',
    state: '',
    zip: ''
  };

  constructor(
    @Inject(CartService) private cartService: CartService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    public router: Router,
    @Inject(OrderService) private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadCartItems();
  }

  loadCartItems(): void {
    this.cartService.getCartItems().then((items: CartItem[]) => {
      this.cartItems = items.map(item => ({
        ...item,
        sanitizedImageUrl: this.sanitizer.bypassSecurityTrustUrl(item.imageUrl)
      }));
      this.calculateTotals();
      this.cdr.detectChanges();
    });
  }

  calculateTotals(): void {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    this.taxAmount = this.subtotal * this.taxRate;
    this.totalAmount = this.subtotal + this.taxAmount + this.otherCharges;
  }

  submitOrder(): void {
    if (this.cartItems.length === 0) {
      console.warn('Cart is empty. Cannot submit an empty order.');
      return;
    }

    this.orderService.placeOrder(
      this.cartItems.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
      this.totalAmount,
      this.customer.name,
      this.deliveryAddress
    ).then(() => {
      // Clear the cart after successful order submission
      this.cartService.clearCart().then(() => {
        this.router.navigate(['/order-summary']); // Navigate to an order summary page
      });
    });
  }
}
