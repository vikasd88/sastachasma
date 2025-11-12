import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Lens } from '../models/product.model';
import { AddToCartRequest } from '../models/cart.model'; // Import AddToCartRequest

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl; // Corrected to use the single apiUrl from environment
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  // Helper method to get headers with user ID
  private getHeaders(userId?: string): { headers: HttpHeaders; withCredentials: boolean } { // Changed userId type to string
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-User-Id': (userId || environment.defaultUserId).toString() // Ensure userId is string
    });

    // Add withCredentials to the request options
    return { headers, withCredentials: true };
  }

  // Product endpoints
  getProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/products`, this.getHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  getProductById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/${id}`, this.getHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  getLenses(): Observable<Lens[]> {
    return this.http.get<Lens[]>(`${this.apiUrl}/lenses`, this.getHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  getLensById(id: number): Observable<Lens | null> { // Added method
    return this.http.get<Lens>(`${this.apiUrl}/lenses/${id}`, this.getHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  // Order endpoints
  getOrderDetails(orderId: string, userId?: string): Observable<any> { // Changed userId type to string
    if (!orderId) {
      return throwError(() => new Error('Order ID is required'));
    }

    return this.http.get(`${this.apiUrl}/orders/${orderId}`, this.getHeaders(userId)).pipe(
      catchError(this.handleError)
    );
  }

  // Removed filter options endpoints (getBrands, getShapes, getColors)

  // Cart endpoints
  // private getCartHeaders(userId: string): HttpHeaders { // Removed as getHeaders can be used directly
  //   return this.getHeaders(userId);
  // }

  getCart(userId: string): Observable<any> { // Changed userId type to string
    return this.http.get(`${this.apiUrl}/cart`, this.getHeaders(userId)).pipe(
      catchError(this.handleError)
    );
  }

  addToCart(userId: string, cartItem: AddToCartRequest): Observable<any> { // Changed userId type to string and simplified body
    // Ensure we have a valid user ID
    const userIdValue = userId || environment.defaultUserId;

    console.log('Sending addToCart request:', {
      url: `${this.apiUrl}/cart/items`,
      userId: userIdValue,
      body: cartItem,
      ...this.getHeaders(userIdValue)
    });

    return this.http.post(
      `${this.apiUrl}/cart/items`,
      cartItem,
      {
        observe: 'response',
        ...this.getHeaders(userIdValue)
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

  updateCartItem(userId: string, itemId: number, quantity: number): Observable<any> { // Changed userId type to string
    const params = new HttpParams().set('quantity', quantity.toString());

    return this.http.put(
      `${this.apiUrl}/cart/items/${itemId}`,
      null,
      {
        params: params,
        ...this.getHeaders(userId)
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  removeFromCart(userId: string, itemId: number): Observable<void> { // Changed userId type to string
    return this.http.delete<void>(`${this.apiUrl}/cart/items/${itemId}`, this.getHeaders(userId));
  }

  clearCart(userId: string): Observable<void> { // Changed userId type to string
    return this.http.delete<void>(`${this.apiUrl}/cart`, this.getHeaders(userId));
  }

  // Order endpoints
  placeOrder(userId: string, orderData: any): Observable<any> { // Changed userId type to string
    return this.http.post(
      `${this.apiUrl}/orders`,
      { ...orderData, userId },
      this.getHeaders(userId)
    ).pipe(
      catchError(this.handleError)
    );
  }

  getOrders(userId: string): Observable<any> { // Changed userId type to string
    return this.http.get(
      `${this.apiUrl}/orders/user/${userId}`,
      this.getHeaders(userId)
    ).pipe(
      catchError(this.handleError)
    );
  }

  getOrder(orderId: string, userId: string): Observable<any> { // Changed userId type to string
    return this.http.get(
      `${this.apiUrl}/orders/${orderId}`,
      this.getHeaders(userId)
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
  updateOrderStatus(orderId: string, status: string, userId: string): Observable<any> { // Changed userId type to string
    return this.http.patch(
      `${this.apiUrl}/orders/${orderId}/status`,
      { status },
      this.getHeaders(userId)
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
