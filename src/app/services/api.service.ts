import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Lens } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl || 'http://localhost:8081/api';
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  // Helper method to get headers with user ID
  private getHeaders(userId?: number): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-User-Id': (userId || environment.defaultUserId).toString()
    });
    return headers;
  }

  // Product endpoints
  getProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/products`, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  getProductById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/${id}`, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  getLenses(): Observable<Lens[]> {
    return this.http.get<Lens[]>(`${this.apiUrl}/lenses`, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Filter options endpoints
  getBrands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/filters/brands`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.warn('Failed to fetch brands, falling back to empty array', error);
        return of([]);
      })
    );
  }

  getShapes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/filters/shapes`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.warn('Failed to fetch shapes, falling back to empty array', error);
        return of([]);
      })
    );
  }

  getColors(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/filters/colors`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.warn('Failed to fetch colors, falling back to empty array', error);
        return of([]);
      })
    );
  }

  // Cart endpoints
  private getCartHeaders(userId: number): HttpHeaders {
    return this.getHeaders(userId);
  }

  getCart(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/cart`, {
      headers: this.getCartHeaders(userId)
    }).pipe(
      catchError(this.handleError)
    );
  }

  addToCart(userId: number, productId: number, quantity: number, lensId?: number): Observable<any> {
    // Ensure we have a valid user ID
    const userIdValue = userId || environment.defaultUserId;
    
    // Create the request body
    const body = { 
      productId,
      quantity,
      lensId: lensId || null // Send null if lensId is not provided
    };
    
    console.log('Sending addToCart request:', {
      url: `${this.apiUrl}/cart/items`,
      userId: userIdValue,
      body
    });
    
    return this.http.post(
      `${this.apiUrl}/cart/items`,
      body,
      {
        headers: this.getCartHeaders(userIdValue),
        observe: 'response'
      }
    ).pipe(
      tap(response => {
        console.log('addToCart response:', response);
      }),
      catchError(error => {
        console.error('Error in addToCart:', error);
        return throwError(() => error);
      })
    );
  }

  updateCartItem(userId: number, itemId: number, quantity: number): Observable<any> {
    const params = new HttpParams().set('quantity', quantity.toString());
    
    return this.http.put(
      `${this.apiUrl}/cart/items/${itemId}`, 
      null,
      {
        headers: this.getCartHeaders(userId),
        params: params
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  removeFromCart(userId: number, itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cart/items/${itemId}`, {
      headers: this.getCartHeaders(userId)
    });
  }

  clearCart(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cart`, {
      headers: this.getCartHeaders(userId)
    });
  }

  // Order endpoints
  placeOrder(userId: number, orderData: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/orders`,
      { ...orderData, userId },
      { 
        headers: this.getHeaders(userId) 
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getOrders(userId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/orders/user/${userId}`, 
      { 
        headers: this.getHeaders(userId) 
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getOrder(orderId: string, userId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/orders/${orderId}`, 
      { 
        headers: this.getHeaders(userId) 
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update the status of an order
   * @param orderId The ID of the order to update
   * @param status The new status to set
   * @returns Observable with the updated order
   */
  updateOrderStatus(orderId: string, status: string, userId: number): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/orders/${orderId}/status`,
      { status },
      { 
        headers: this.getHeaders(userId) 
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Error handling
  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => new Error('An error occurred. Please try again later.'));
  }
}
