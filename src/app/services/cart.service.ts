import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, finalize, map, Observable, of, tap, throwError } from 'rxjs';
import { AddToCartRequest, UpdateCartItemRequest } from '../models/cart.model';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
import { CartItem } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartSubject.asObservable();
  loading = false;
  error: string | null = null;
  
  constructor(private apiService: ApiService) {
    this.loadCart();
  }

  // Initialize a new cart for the user
  private initializeCart(): void {
    this.cartItems = [];
    this.updateCart();
    console.log('Initialized new cart');
  }

  addToCart(item: AddToCartRequest): Observable<CartItem[]> {
    this.loading = true;
    this.error = null;
    
    // Ensure we have a cart before adding items
    if (!this.cartItems) {
      this.cartItems = [];
    }

    console.log('Adding item to cart:', item);

    return this.apiService.addToCart(
      environment.defaultUserId,
      item // Pass the entire item object
    ).pipe(
      tap((response: any) => {
        try {
          // Handle different response formats
          const cart = response.body || response;
          console.log('Cart response:', cart);
          
          if (!cart) {
            throw new Error('Empty response from server');
          }
          
          // Map backend items to frontend cart items and update local state
          this.cartItems = this.mapToCartItems(cart.items || []);
          this.updateCart();
          
          return this.cartItems;
        } catch (error) {
          console.error('Error processing cart response:', error);
          throw error;
        }
      }),
      catchError(error => {
        console.error('Failed to add item to cart:', error);
        this.error = 'Failed to add item to cart. Please try again.';
        this.cartItems = [];
        this.updateCart();
        return throwError(() => error);
      }),
      finalize(() => this.loading = false)
    );
  }

  // Map backend cart items to frontend cart items
  private mapToCartItems(backendItems: any[]): CartItem[] {
    if (!Array.isArray(backendItems)) return [];
    
    return backendItems.map(item => {
      // Convert prices to numbers to ensure consistency
      const unitPrice = Number(item.unitPrice) || 0; // Changed from priceAtAddition
      const lensPrice = item.lensPrice ? Number(item.lensPrice) : 0;
      const totalPrice = (unitPrice + lensPrice) * (Number(item.quantity) || 1); // Use unitPrice
      
      console.log('Mapping cart item:', {
        item,
        unitPrice,
        lensPrice,
        calculatedTotal: totalPrice,
        quantity: item.quantity
      });
      
      return {
        id: item.id,
        productId: item.productId,
        name: item.name || 'Unknown Product',
        price: Number(item.price) || 0, // Ensure price is number
        imageUrl: item.imageUrl || 'assets/placeholder-product.jpg',
        lensId: item.lensId,
        lensType: item.lensType,
        lensMaterial: item.lensMaterial,
        lensPrescriptionRange: item.lensPrescriptionRange,
        lensCoating: item.lensCoating,
        lensPrice: lensPrice,
        quantity: Number(item.quantity) || 1,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
      };
    });
  }
  

  // Load cart from API
  loadCart(): void {
    if (this.loading) return;

    this.loading = true;
    this.error = null;
    
    this.apiService.getCart(environment.defaultUserId).pipe(
      tap({
        next: (response: any) => {
          try {
            // Handle different response formats
            const cart = response?.body || response;
            
            if (!cart) {
              throw new Error('Empty response from server');
            }
            
            // Map backend items to frontend cart items
            this.cartItems = this.mapToCartItems(Array.isArray(cart.items) ? cart.items : []);
            this.updateCart();
          } catch (error) {
            console.error('Error processing cart response:', error);
            throw error;
          }
        },
        error: (error) => {
          console.error('Error in cart response:', error);
          throw error;
        }
      }),
      catchError((error: any) => {
        console.error('Failed to load cart:', error);
        this.error = error.error?.message || 'Failed to load cart. Please try again.';
        this.cartItems = [];
        this.updateCart();
        return of([]);
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe();
  }

  // Update cart state
  updateCart(): void {
    // Ensure we always have a valid array
    const items = Array.isArray(this.cartItems) ? this.cartItems : [];
    this.cartSubject.next([...items]);
  }

  // Place order
  placeOrder(orderData: any): Observable<{ orderId: string }> {
    this.loading = true;
    return this.apiService.placeOrder(environment.defaultUserId, orderData).pipe(
      tap((response: { orderId: string }) => {
        this.cartItems = [];
        this.updateCart();
        return response;
      }),
      catchError(this.handleError<{ orderId: string }>('placeOrder')),
      finalize(() => this.loading = false)
    );
  }

  // Error handling helper with generic type
  private handleError<T>(operation: string = 'operation') {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed:`, error);
      const errorMessage = error.error?.message || error.message || 'Unknown error';
      this.error = `Failed to ${operation}. ${errorMessage}`;
      return throwError(() => new Error(`${operation} failed: ${errorMessage}`));
    };
  }

  /**
   * Calculate the total price of all items in the cart
   * @returns The total price including frame and lens prices
   */
  getCartTotal(): number {
    if (!this.cartItems || this.cartItems.length === 0) {
      return 0;
    }
    
    return this.cartItems.reduce((total, item) => {
      if (!item) {
        console.warn('Invalid cart item found:', item);
        return total;
      }
      
      const unitPrice = item.unitPrice || 0;
      const lensPrice = item.lensPrice || 0;
      const itemPrice = unitPrice + lensPrice;
      const itemTotal = itemPrice * (item.quantity || 1);
      
      return total + itemTotal;
    }, 0);
  }

  // Update item quantity
  updateQuantity(itemId: number, quantity: number): Observable<CartItem> {
    if (quantity < 1) {
      return throwError(() => new Error('Quantity must be at least 1'));
    }

    this.loading = true;
    return this.apiService.updateCartItem(environment.defaultUserId, itemId, quantity).pipe(
      tap((updatedItem: CartItem) => {
        const index = this.cartItems.findIndex(item => item.id === itemId);
        if (index !== -1) {
          this.cartItems[index] = { ...this.cartItems[index], quantity };
          this.updateCart();
        }
        return updatedItem;
      }),
      catchError(this.handleError<CartItem>('update quantity')),
      finalize(() => this.loading = false)
    );
  }

  // Remove item from cart
  removeFromCart(itemId: number): Observable<void> {
    this.loading = true;
    return this.apiService.removeFromCart(environment.defaultUserId, itemId).pipe(
      tap(() => {
        this.cartItems = this.cartItems.filter(item => item.id !== itemId);
        this.updateCart();
      }),
      catchError(this.handleError<void>('removeFromCart')),
      finalize(() => {
        this.loading = false;
      })
    );
  }

  // Clear the entire cart
  clearCart(): Observable<void> {
    if (this.loading) return of(undefined);

    this.loading = true;
    this.error = null;

    return this.apiService.clearCart(environment.defaultUserId).pipe(
      tap(() => {
        this.cartItems = [];
        this.updateCart();
      }),
      catchError(error => {
        console.error('Error clearing cart:', error);
        this.error = error.error?.message || 'Failed to clear cart. Please try again.';
        return throwError(() => error);
      }),
      finalize(() => this.loading = false)
    );
  }
}
