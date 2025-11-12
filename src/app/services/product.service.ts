import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, delay, finalize, map, switchMap, tap } from 'rxjs/operators';
import { Lens, Product } from '../models/product.model';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api'; // Changed to API Gateway port 8080
  private products = new BehaviorSubject<Product[]>([]);
  private lenses = new BehaviorSubject<Lens[]>([]);
  loading: boolean = true;
  error: string | null = null;
  
  // Public observables
  public readonly lenses$ = this.lenses.asObservable();
  
  // Caches
  private readonly lensCache = new Map<number, Lens>();
  private readonly productCache = new Map<number, Product>();
  
  // Public observables for components
  public readonly products$ = this.products.asObservable();
  public readonly loading$ = new BehaviorSubject<boolean>(false);
  public readonly error$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private apiService: ApiService) {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;
    
    // Use apiService to fetch products
    this.apiService.getProducts().pipe(
      tap((response: any) => {
        // Handle both array and object responses
        const products = Array.isArray(response) ? response :
          (response.products || Object.values(response));
        
        if (!products || !Array.isArray(products)) {
          throw new Error('Invalid products data received from API');
        }
        
        const processedProducts = products.map(product => ({
          ...product,
          image: product.image || product.imageUrl || 'assets/images/default-product.png',
          material: product.material || product.frameMaterial || 'Not specified',
          inStock: product.inStock !== undefined ? product.inStock : 0 // Changed to 0, as inStock is a number now
        }));
        
        this.products.next(processedProducts);
        console.log('Processed products:', processedProducts);
      }),
      catchError((error: any) => {
        console.error('Error loading products:', error);
        this.error = 'Failed to load products. Please try again later.';
        return of([]);
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe();
  }

  /**
   * Get products observable
   * Components should subscribe to this to get the latest products
   */
  getProducts(): Observable<Product[]> {
    // If products are empty and not currently loading, trigger a load
    if (this.products.value.length === 0 && !this.loading$.value) { // Access loading$ value
      this.loadProducts();
    }
    return this.products$;
  }
  
  /**
   * Refresh products from the server
   */
  refreshProducts(): void {
    this.loadProducts();
  }
  /**
   * Get product by ID
   * @param id Product ID
   * @returns Observable of Product or undefined if not found
   */
  getProductById(id: number): Observable<Product | undefined> {
    // First check if product exists in the cache
    const cachedProduct = this.products.value.find(p => p.id === id);
    if (cachedProduct) {
      return of(cachedProduct);
    }

    // If not in cache, fetch from API
    this.loading$.next(true); // Update loading$ subject
    return this.apiService.getProductById(id).pipe(
      map(response => response as Product),
      tap({
        next: (product) => {
          // Add to cache if not already present
          if (product && !this.products.value.some(p => p.id === product.id)) {
            this.products.next([...this.products.value, product]);
          }
          this.error$.next(null); // Update error$ subject
        },
        error: (error) => {
          console.error(`Error loading product ${id}:`, error);
          this.error$.next(`Failed to load product ${id}`); // Update error$ subject
        }
      }),
      catchError(error => {
        console.error('API Error:', error);
        return of(undefined);
      }),
      finalize(() => this.loading$.next(false)) // Update loading$ subject
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

  /**
   * Get all available lenses
   * @param forceRefresh If true, forces a refresh from the server
   * @returns Observable of Lens array
   */
  getLenses(forceRefresh: boolean = false): Observable<Lens[]> {
    if (forceRefresh || this.lenses.value.length === 0) {
      this.loadLenses();
    }
    return this.lenses$;
  }
  
  /**
   * Get a specific lens by ID
   * @param id The lens ID
   * @returns Observable of Lens or undefined if not found
   */
  getLensById(id: number): Observable<Lens | undefined> {
    // Check cache first
    const cachedLens = this.lensCache.get(id);
    if (cachedLens) {
      return of(cachedLens);
    }
    
    // If not in cache but we have lenses loaded, find it
    const existingLens = this.lenses.value.find(l => l.id === id);
    if (existingLens) {
      this.lensCache.set(id, existingLens);
      return of(existingLens);
    }
    
    // If not found, try to load it from the API using apiService
    return this.apiService.getLensById(id).pipe(
      map(lens => lens || undefined), // Map null to undefined
      tap(lens => {
        if (lens) {
          this.lensCache.set(id, lens);
        }
      }),
      catchError(() => of(undefined))
    );
  }

  /**
   * Load products from the API
   * @private
   */
  private loadProducts(): void {
    if (this.loading$.value) return;
    
    this.loading$.next(true);
    this.error$.next(null);
    
    // Use apiService to fetch products
    this.apiService.getProducts().pipe(
      map(response => response || []),
      tap(products => {
        const processedProducts = products.map((product: Product) => ({ // Explicitly type product
          ...product,
          imageUrl: product.imageUrl || 'assets/images/default-product.png', // Changed 'image' to 'imageUrl'
          frameMaterial: product.frameMaterial || 'Not specified',
          inStock: product.inStock !== undefined ? product.inStock : 0
        }));
        
        this.products.next(processedProducts);
        this.error$.next(null);
      }),
      catchError(error => this.handleError('Failed to load products', error, [])),
      finalize(() => this.loading$.next(false))
    ).subscribe();
  }

  /**
   * Load lenses from the API
   * @private
   */
  private loadLenses(): void {
    this.loading$.next(true);
    
    this.apiService.getLenses().pipe(
      tap({
        next: (lenses: Lens[]) => {
          this.lenses.next(lenses || []);
          this.error$.next(null);
        },
        error: (error: any) => {
          console.error('Error loading lenses:', error);
          this.error$.next('Failed to load lenses. Please try again later.');
          this.lenses.next([]);
        }
      }),
      catchError(error => this.handleError('Failed to load lenses', error, [])),
      finalize(() => this.loading$.next(false))
    ).subscribe();
  }
  
  /**
   * Handle API errors
   */
  private handleError<T>(message: string, error: any, result?: T): Observable<T> {
    console.error(`${message}:`, error);
    this.error$.next(message);
    return of(result as T);
  }
}
