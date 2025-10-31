// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs'; // Import BehaviorSubject

// export interface CartItem {
//   id: number;
//   name: string;
//   price: number;
//   quantity: number;
//   imageUrl: string;
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class CartService {
//   private cartItems: CartItem[] = [];
//   private cartSubject = new BehaviorSubject<CartItem[]>([]); // Initialize with an empty array
//   public cartChanges$ = this.cartSubject.asObservable();

//   constructor() {
//     // Emit initial cart state
//     this.cartSubject.next(this.cartItems);
//   }

//   addToCart(item: CartItem): Promise<boolean> {
//     const existingItem = this.cartItems.find(cartItem => cartItem.id === item.id);
//     if (existingItem) {
//       existingItem.quantity += item.quantity;
//     } else {
//       this.cartItems.push({ ...item, quantity: item.quantity || 1 });
//     }
//     console.log('Current cart:', this.cartItems);
//     this.cartSubject.next(this.cartItems); // Emit changes
//     return Promise.resolve(true);
//   }

//   removeFromCart(itemId: number): Promise<boolean> {
//     const initialLength = this.cartItems.length;
//     this.cartItems = this.cartItems.filter(item => item.id !== itemId);
//     console.log('Current cart after removal:', this.cartItems);
//     this.cartSubject.next(this.cartItems); // Emit changes
//     return Promise.resolve(this.cartItems.length < initialLength);
//   }

//   getCartItems(): Promise<CartItem[]> {
//     return Promise.resolve(this.cartItems);
//   }

//   updateItemQuantity(itemId: number, newQuantity: number): Promise<boolean> {
//     const itemToUpdate = this.cartItems.find(item => item.id === itemId);
//     if (itemToUpdate) {
//       itemToUpdate.quantity = newQuantity;
//       console.log('Cart after quantity update:', this.cartItems); // Add console log
//       this.cartSubject.next(this.cartItems); // Emit changes
//       return Promise.resolve(true);
//     }
//     return Promise.resolve(false);
//   }

//   clearCart(): Promise<boolean> {
//     console.log('Clearing cart.');
//     this.cartItems = [];
//     this.cartSubject.next(this.cartItems); // Emit changes
//     return Promise.resolve(true);
//   }
// }
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root',
})

export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cartChanges$ = this.cartSubject.asObservable();

  constructor() {
    this.cartSubject.next(this.cartItems);
  }

  addToCart(item: CartItem): Promise<boolean> {
    const existingItem = this.cartItems.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      existingItem.quantity = item.quantity; // Set the quantity directly
    } else {
      this.cartItems.push({ ...item, quantity: item.quantity || 1 });
    }
    console.log('Current cart:', this.cartItems);
    this.cartSubject.next(this.cartItems);
    return Promise.resolve(true);
  }

  removeFromCart(itemId: number): Promise<boolean> {
    const initialLength = this.cartItems.length;
    this.cartItems = this.cartItems.filter(item => item.id !== itemId);
    console.log('Current cart after removal:', this.cartItems);
    this.cartSubject.next(this.cartItems);
    return Promise.resolve(this.cartItems.length < initialLength);
  }

  getCartItems(): Promise<CartItem[]> {
    return Promise.resolve(this.cartItems);
  }

  updateItemQuantity(itemId: number, newQuantity: number): Promise<boolean> {
    const itemToUpdate = this.cartItems.find(item => item.id === itemId);
    if (itemToUpdate) {
      itemToUpdate.quantity = newQuantity;
      console.log('Cart after quantity update:', this.cartItems);
      this.cartSubject.next(this.cartItems);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  clearCart(): Promise<boolean> {
    console.log('Clearing cart.');
    this.cartItems = [];
    this.cartSubject.next(this.cartItems);
    return Promise.resolve(true);
  }
}
