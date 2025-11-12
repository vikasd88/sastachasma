import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { Lens, Product } from '../../../models/product.model'; // Import Lens
import { StarRatingComponent } from '../../shared/star-rating/star-rating';
import { CartService } from '../../../services/cart.service'; // Import CartService
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { AddToCartRequest } from '../../../models/cart.model'; // Import AddToCartRequest

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, StarRatingComponent, FormsModule], // Add FormsModule
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined;
  lenses: Lens[] = [];
  selectedLens: Lens | undefined;
  quantity: number = 1;
  loading: boolean = true;
  productId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService // Inject CartService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.productId = +params['id'];
      this.loadProduct(this.productId);
      this.loadLenses(); // Load lenses when component initializes
    });
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.productService.getProductById(id).subscribe(product => {
      this.product = product;
      this.loading = false;
      if (!this.product) {
        console.error('Product not found');
        // Optionally redirect to a 404 page or product list
        this.router.navigate(['/products']);
      }
    });
  }

  loadLenses(): void {
    this.productService.getLenses().subscribe(lenses => {
      this.lenses = lenses;
      // Optionally select a default lens if available
      if (this.lenses.length > 0) {
        this.selectedLens = this.lenses[0];
      }
    });
  }

  onLensChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const lensId = Number(target.value);
    this.selectedLens = this.lenses.find(lens => lens.id === lensId);
  }

  addToCart(): void {
    if (!this.product) {
      console.error('Cannot add to cart: product is undefined.');
      return;
    }

    if (this.product.inStock < this.quantity) {
      console.warn('Not enough stock for this product.');
      // Optionally show a user-friendly message
      return;
    }

    const cartItem: AddToCartRequest = {
      productId: this.product.id,
      name: this.product.name,
      price: this.product.price,
      imageUrl: this.product.imageUrl || '',
      quantity: this.quantity,
      ...(this.selectedLens && {
        lensId: this.selectedLens.id,
        lensType: this.selectedLens.type,
        lensMaterial: this.selectedLens.material,
        lensPrescriptionRange: this.selectedLens.prescriptionRange,
        lensCoating: this.selectedLens.coating,
        lensPrice: this.selectedLens.price,
      }),
    };

    this.cartService.addToCart(cartItem).subscribe(
      () => {
        console.log('Product added to cart successfully!');
        // Optionally show a success message or navigate to cart
      },
      (error) => {
        console.error('Error adding product to cart:', error);
        // Optionally show an error message
      }
    );
  }
}
