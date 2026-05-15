import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BaseApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // --- GET ---
  get<T>(url: string, params?: Record<string, any>): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${url}`, {
      params: this.buildParams(params),
    });
  }

  // --- POST ---
  post<T>(url: string, body?: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${url}`, body);
  }

  // --- PUT ---
  put<T>(url: string, body?: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${url}`, body);
  }

  // --- PATCH ---
  patch<T>(url: string, body?: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${url}`, body);
  }

  // --- DELETE ---
  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${url}`);
  }

  // --- Helper ---
  private buildParams(params?: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();

    if (!params) return httpParams;

    Object.keys(params).forEach((key) => {
      const value = params[key];

      if (value !== null && value !== undefined) {
        httpParams = httpParams.set(key, value);
      }
    });

    return httpParams;
  }
}
