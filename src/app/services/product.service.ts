import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { Lens, Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'assets/data/products.json';
  private products = new BehaviorSubject<Product[]>([]);
  private lenses = new BehaviorSubject<Lens[]>([]);

  constructor(private http: HttpClient) {
    this.loadData();
  }

  private loadData(): void {
    this.http.get<{ products: Product[], lenses: Lens[] }>(this.apiUrl).pipe(
      tap((data: { products: Product[], lenses: Lens[] }) => {
        console.log('Loaded data:', data);
        this.products.next(data.products || []);
        this.lenses.next(data.lenses || []);
      })
    ).subscribe();
  }

  getProducts(): Observable<Product[]> {
    return this.products.asObservable().pipe(
      tap(products => console.log('Products from service:', products))
    );
  }

  getProductById(id: number): Observable<Product | undefined> {
    return this.products.pipe(
      map((products: Product[]) => products.find(p => p.id === id)),
      tap((product: Product | undefined) => console.log('Product by ID:', product))
    );
  }

  getLenses(): Observable<Lens[]> {
    return this.lenses.asObservable().pipe(
      tap((lenses: Lens[]) => console.log('Lenses from service:', lenses))
    );
  }

  getLensById(id: number): Observable<Lens | undefined> {
    return this.lenses.pipe(
      map((lenses: Lens[]) => lenses.find(l => l.id === id)),
      tap((lens: Lens | undefined) => console.log('Lens by ID:', lens))
    );
  }

  searchProducts(query: string): Observable<Product[]> {
    const searchTerm = query.toLowerCase();
    return this.products.pipe(
      map((products: Product[]) =>
        products.filter(p =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.brand.toLowerCase().includes(searchTerm)
        )
      )
    );
  }

  filterProducts(filters: any): Observable<Product[]> {
    return this.products.pipe(
      map((products: Product[]) => {
        let filtered = [...products];

        if (filters.brand) {
          filtered = filtered.filter(p => p.brand === filters.brand);
        }
        if (filters.shape) {
          filtered = filtered.filter(p => p.shape === filters.shape);
        }
        if (filters.color) {
          filtered = filtered.filter(p => p.color === filters.color);
        }
        if (filters.priceRange) {
          filtered = filtered.filter(p =>
            p.price >= filters.priceRange.min && p.price <= filters.priceRange.max
          );
        }

        return filtered;
      })
    );
  }

  getBrands(): Observable<string[]> {
    return this.products.pipe(
      map((products: Product[]) => [...new Set(products.map(p => p.brand))])
    );
  }

  getShapes(): Observable<string[]> {
    return this.products.pipe(
      map((products: Product[]) => [...new Set(products.map(p => p.shape))])
    );
  }

  getColors(): Observable<string[]> {
    return this.products.pipe(
      map((products: Product[]) => [...new Set(products.map(p => p.color))])
    );
  }
}
