import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConfiguredProduct } from '../shared/models/configured-product';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems: ConfiguredProduct[] = [];
  private cartSubject = new BehaviorSubject<ConfiguredProduct[]>([]);
  public cartChanges$ = this.cartSubject.asObservable();

  constructor() {
    this.cartSubject.next(this.cartItems);
  }

  addToCart(item: ConfiguredProduct): Promise<boolean> {
    const existingItem = this.cartItems.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      existingItem.quantity = item.quantity; // Set the quantity directly
      existingItem.totalPrice = (item.frame.price + item.lens.price) * item.quantity;
    } else {
      this.cartItems.push({ ...item, quantity: item.quantity || 1 });
    }
    console.log('Current cart:', this.cartItems);
    this.cartSubject.next(this.cartItems);
    return Promise.resolve(true);
  }

  removeFromCart(itemId: string): Promise<boolean> {
    const initialLength = this.cartItems.length;
    this.cartItems = this.cartItems.filter(item => item.id !== itemId);
    console.log('Current cart after removal:', this.cartItems);
    this.cartSubject.next(this.cartItems);
    return Promise.resolve(this.cartItems.length < initialLength);
  }

  getCartItems(): Promise<ConfiguredProduct[]> {
    return Promise.resolve(this.cartItems);
  }

  updateItemQuantity(itemId: string, newQuantity: number): Promise<boolean> {
    const itemToUpdate = this.cartItems.find(item => item.id === itemId);
    if (itemToUpdate) {
      itemToUpdate.quantity = newQuantity;
      itemToUpdate.totalPrice = (itemToUpdate.frame.price + itemToUpdate.lens.price) * newQuantity;
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
