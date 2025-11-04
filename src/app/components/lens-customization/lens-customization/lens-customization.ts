import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { Product, Lens, CartItem } from '../../../models/product.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lens-customization',
  imports: [CommonModule, FormsModule],
  templateUrl: './lens-customization.html',
  styleUrl: './lens-customization.css',
})
export class LensCustomizationComponent implements OnInit {
  product: Product | undefined;
  lenses: Lens[] = [];
  loading: boolean = true;
  productId: number = 0;
  selectedLensId: number | null = null;
  selectedLens: Lens | undefined;
  quantity: number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.productId = +params['id'];
      this.loadData(this.productId);
    });
  }

  loadData(id: number): void {
    this.loading = true;
    this.productService.getProductById(id).subscribe(product => {
      this.product = product;
      if (!this.product) {
        console.error('Product not found');
        this.router.navigate(['/products']);
        return;
      }
      this.productService.getLenses().subscribe(lenses => {
        this.lenses = lenses;
        // Select the first lens by default (Single Vision - free)
        this.selectedLensId = this.lenses[0]?.id || null;
        this.selectedLens = this.lenses[0];
        this.loading = false;
      });
    });
  }

  onLensChange(): void {
    this.selectedLens = this.lenses.find(l => l.id === this.selectedLensId);
  }

  getTotalPrice(): number {
    if (!this.product || !this.selectedLens) return 0;
    return (this.product.price + this.selectedLens.price) * this.quantity;
  }

  addToCart(): void {
    if (this.product && this.selectedLens) {
      const cartItem: CartItem = {
        product: this.product,
        lens: this.selectedLens,
        quantity: this.quantity,
      };
      this.cartService.addToCart(cartItem);
      this.router.navigate(['/cart']);
    }
  }

}
