import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Lens } from '../models/lens.model';

@Injectable({
  providedIn: 'root'
})
export class LensService {
  private apiUrl = environment.apiUrl || 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  getLenses(): Observable<Lens[]> {
    return this.http.get<Lens[]>(`${this.apiUrl}/lenses`).pipe(
      catchError(error => {
        console.error('Error fetching lenses:', error);
        return of([]);
      })
    );
  }

  getLensById(id: number): Observable<Lens | null> {
    return this.http.get<Lens>(`${this.apiUrl}/lenses/${id}`).pipe(
      catchError(error => {
        console.error(`Error fetching lens ${id}:`, error);
        return of(null);
      })
    );
  }
}
