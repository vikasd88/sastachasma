import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../models/product.model';
import { StarRatingComponent } from '../star-rating/star-rating';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, RouterLink, StarRatingComponent],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCardComponent {
  @Input() product: Product | undefined;
}