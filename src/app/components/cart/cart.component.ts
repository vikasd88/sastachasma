import { Component, OnInit, OnDestroy } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/product.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, of, tap, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  loading: boolean = true;
  error: string | null = null;
  totalAmount: number = 0;
  private cartSubscription: Subscription | null = null;
  
  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.error = null;
    
    // Unsubscribe from previous subscription if it exists
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }

    this.cartService.loadCart();
    
    this.cartSubscription = this.cartService.cart$.pipe(
      tap((items: CartItem[]) => {
        this.cartItems = items || [];
        this.totalAmount = this.calculateTotal();
        this.loading = false;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Failed to load cart items:', error);
        this.error = error.error?.message || 'Failed to load cart. Please try again later.';
        this.cartItems = [];
        this.totalAmount = 0;
        this.loading = false;
        return of([]);
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe();
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (!item?.id || !item.product || newQuantity < 1) return;
    
    const quantity = Number(newQuantity);
    if (isNaN(quantity)) return;

    this.loading = true;
    this.cartService.updateQuantity(Number(item.id), quantity).subscribe({
      next: () => {
        this.loadCart();
      },
      error: (error: any) => {
        console.error('Failed to update quantity:', error);
        this.error = 'Failed to update quantity. Please try again.';
        this.loading = false;
      }
    });
  }

  removeItem(item: CartItem): void {
    if (!item?.id || !item.product) return;

    if (confirm(`Are you sure you want to remove ${item.product.name} from your cart?`)) {
      this.loading = true;
      this.cartService.removeFromCart(Number(item.id)).subscribe({
        next: () => {
          this.loadCart();
        },
        error: (error: any) => {
          console.error('Failed to remove item:', error);
          this.error = 'Failed to remove item. Please try again.';
          this.loading = false;
        }
      });
    }
  }

  clearCart(): void {
    if (this.cartItems.length === 0) return;

    if (confirm('Are you sure you want to clear your cart? This cannot be undone.')) {
      this.loading = true;
      this.cartService.clearCart().subscribe({
        next: () => {
          this.loadCart();
        },
        error: (error: any) => {
          console.error('Failed to clear cart:', error);
          this.error = 'Failed to clear cart. Please try again.';
          this.loading = false;
        }
      });
    }
  }

  /**
   * Calculate the total price for a single cart item
   * @param item The cart item
   * @returns The total price for the item (price + lens price) * quantity
   */
  getItemTotal(item: CartItem): number {
    if (!item) return 0;
    const itemPrice = (item.priceAtAddition || 0) + (item.lensPrice || 0);
    return itemPrice * (item.quantity || 1);
  }

  /**
   * Calculate the total price for all items in the cart
   */
  calculateTotal(): number {
    return this.cartItems.reduce((total, item) => {
      return total + this.getItemTotal(item);
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }
}