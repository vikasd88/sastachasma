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
      console.log("products "+products);
      this.applyFilters();
      this.loading = false;
    });
  }

  loadFilters(): void {
    this.productService.getBrands().subscribe(brands => this.brands = brands);
    this.productService.getShapes().subscribe(shapes => this.shapes = shapes);
    this.productService.getColors().subscribe(colors => this.colors = colors);
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
