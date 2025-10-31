import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CartService } from '../../../services/cart';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { ConfiguredProduct } from '../../../shared/models/configured-product';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule], // Add FormsModule here
  templateUrl: './cart.html',
  styleUrl: './cart.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartComponent implements OnInit {
  cartItems: (ConfiguredProduct & { sanitizedImageUrl: SafeUrl })[] = [];
  subtotal: number = 0;
  taxRate: number = 0.05; // 5% tax
  otherCharges: number = 10; // e.g., shipping fee
  taxAmount: number = 0;
  totalAmount: number = 0;

  constructor(
    @Inject(CartService) private cartService: CartService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCartItems();
  }

  loadCartItems(): void {
    this.cartService.getCartItems().then((items: ConfiguredProduct[]) => {
      this.cartItems = items.map(item => ({
        ...item,
        sanitizedImageUrl: this.sanitizer.bypassSecurityTrustUrl(item.frame.imageUrl) // Use frame.imageUrl
      }));
      this.calculateTotals();
      this.cdr.detectChanges();
    });
  }

  calculateTotals(): void {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + item.totalPrice, 0); // Use totalPrice
    this.taxAmount = this.subtotal * this.taxRate;
    this.totalAmount = this.subtotal + this.taxAmount + this.otherCharges;
  }

  updateQuantity(itemId: string, event: Event): void {
    const newQuantity = Number((event.target as HTMLInputElement).value);
    if (newQuantity > 0) {
      this.cartService.updateItemQuantity(itemId, newQuantity).then(() => {
        this.loadCartItems(); // Reload cart after quantity update
        this.cdr.detectChanges();
      });
    } else if (newQuantity === 0) {
      this.removeFromCart(itemId); // Remove item if quantity is set to 0
    }
    this.cdr.detectChanges(); // Ensure UI is updated after any quantity change, including removal
  }

  removeFromCart(itemId: string): void {
    this.cartService.removeFromCart(itemId).then(() => {
      this.loadCartItems(); // Reload cart after removal
    });
  }

  clearCart(): void {
    this.cartService.clearCart().then(() => {
      this.loadCartItems(); // Reload cart after clearing
    });
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
