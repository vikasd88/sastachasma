import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem, Order } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartSubject.asObservable();

  constructor() {
    this.loadCartFromLocalStorage();
  }

  // Add item to cart
  addToCart(item: CartItem): void {
    const existingItem = this.cartItems.find(
      ci => ci.product.id === item.product.id && ci.lens.id === item.lens.id
    );

    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      this.cartItems.push(item);
    }

    this.updateCart();
  }

  // Remove item from cart
  removeFromCart(productId: number, lensId: number): void {
    this.cartItems = this.cartItems.filter(
      ci => !(ci.product.id === productId && ci.lens.id === lensId)
    );
    this.updateCart();
  }

  // Update item quantity
  updateQuantity(productId: number, lensId: number, quantity: number): void {
    const item = this.cartItems.find(
      ci => ci.product.id === productId && ci.lens.id === lensId
    );
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        this.removeFromCart(productId, lensId);
      } else {
        this.updateCart();
      }
    }
  }

  // Get cart items
  getCartItems(): Observable<CartItem[]> {
    return this.cart$;
  }

  // Get cart total
  getCartTotal(): number {
    return this.cartItems.reduce((total, item) => {
      return total + (item.product.price + item.lens.price) * item.quantity;
    }, 0);
  }

  // Get cart count
  getCartCount(): number {
    return this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }

  // Clear cart
  clearCart(): void {
    this.cartItems = [];
    this.updateCart();
  }

  // Get current cart items (synchronous)
  getCurrentCartItems(): CartItem[] {
    return this.cartItems;
  }

  // Private method to update cart
  private updateCart(): void {
    this.cartSubject.next([...this.cartItems]);
    this.saveCartToLocalStorage();
  }

  // Save cart to localStorage
  private saveCartToLocalStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  // Load cart from localStorage
  private loadCartFromLocalStorage(): void {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        this.cartItems = JSON.parse(savedCart);
        this.cartSubject.next([...this.cartItems]);
      } catch (e) {
        console.error('Error loading cart from localStorage', e);
      }
    }
  }

  // Place order (dummy API call)
  placeOrder(order: Order): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        const orderId = 'ORD-' + Date.now();
        observer.next({ success: true, orderId });
        observer.complete();
      }, 1000);
    });
  }
}
