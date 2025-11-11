import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { ProductCardComponent } from '../../shared/product-card/product-card';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, ProductCardComponent, FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading: boolean = true;
  brands: string[] = [];
  shapes: string[] = [];
  colors: string[] = [];

  // Filter state
  selectedBrand: string = '';
  selectedShape: string = '';
  selectedColor: string = '';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadFilters();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe(products => {
      this.products = products;
      console.log("Products loaded:", products);
      this.loadFilters(); // Load filters after products are loaded
      this.applyFilters();
      this.loading = false;
    });
  }

  loadFilters(): void {
    // Extract unique brands, shapes, and colors from the loaded products
    if (this.products && this.products.length > 0) {
      this.brands = [...new Set(this.products.map(p => p.brand))].filter(brand => brand);
      this.shapes = [...new Set(this.products.map(p => p.shape))].filter(shape => shape);
      this.colors = [...new Set(this.products.map(p => p.color))].filter(color => color);
      
      console.log('Filters loaded:', {
        brands: this.brands,
        shapes: this.shapes,
        colors: this.colors
      });
    }
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      let matchesBrand = this.selectedBrand ? product.brand === this.selectedBrand : true;
      let matchesShape = this.selectedShape ? product.shape === this.selectedShape : true;
      let matchesColor = this.selectedColor ? product.color === this.selectedColor : true;
      return matchesBrand && matchesShape && matchesColor;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedBrand = '';
    this.selectedShape = '';
    this.selectedColor = '';
    this.applyFilters();
  }

}
