import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { CartItem } from '../../../models/product.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartTotal: number = 0;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.cartTotal = this.cartService.getCartTotal();
    });
  }

  updateQuantity(item: CartItem, event: Event): void {
    const newQuantity = +(event.target as HTMLInputElement).value;
    if (newQuantity >= 1) {
      this.cartService.updateQuantity(item.product.id, item.lens.id, newQuantity);
    }
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.product.id, item.lens.id);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

}
