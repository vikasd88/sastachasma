import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { StarRatingComponent } from '../../shared/star-rating/star-rating';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, StarRatingComponent],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined;
  loading: boolean = true;
  productId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.productId = +params['id'];
      this.loadProduct(this.productId);
    });
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.productService.getProductById(id).subscribe(product => {
      this.product = product;
      this.loading = false;
      if (!this.product) {
        // Handle product not found (e.g., navigate to 404 or product list)
        console.error('Product not found');
      }
    });
  }

  customizeLens(): void {
    if (this.product) {
      this.router.navigate(['/customize', this.product.id]);
    }
  }

}
