import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product, ProductDto } from '../models/product';
import { AuthService } from './auth-service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'http://localhost:8080/admin';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();

    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    } else {
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }
  }

  // Get all products
  getProducts(page: number = 0, size: number = 100000): Observable<Product[]> {
    return this.http.get<any>(`${this.baseUrl}/view-product`, {
      headers: this.getAuthHeaders(),
      params: {
        page: String(page),
        size: String(size)
      }
    }).pipe(
      map(res => Array.isArray(res) ? res : (res?.content || []))
    );
  }

  // Get product by ID
  getProductById(id: number): Observable<Product> {
    return this.getProducts(0, 100000).pipe(
      map(products => {
        const product = products.find(p => p.productId === id);
        if (!product) throw new Error('Product not found');
        return product;
      })
    );
  }

  // Create new product
  createProduct(productDto: ProductDto): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/create-Product`, productDto, {
      headers: this.getAuthHeaders()
    });
  }

  // Update product
  updateProduct(id: number, productDto: ProductDto): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/edite-product/${id}`, productDto, {
      headers: this.getAuthHeaders()
    });
  }

  // Search products
  searchProducts(params: {
    categoryName?: string;
    groupName?: string;
    productName?: string;
    description?: string;
    typeName?: string;
  }): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/search-product`, {
      headers: this.getAuthHeaders(),
      params: params
    });
  }

  // Get product categories
  getProductCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/categories-list-admin`, {
      headers: this.getAuthHeaders()
    });
  }

  // Get product groups by category
  getProductGroupsByCategory(categoryId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/groups-list-admin/${categoryId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Get products by group
  getProductsByGroup(groupId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/products-list-admin/${groupId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Get Product Types
  getProductTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/product-types-list-admin`, {
      headers: this.getAuthHeaders()
    });
  }

  // Get Sub Categories
  getSubCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/subcategories-list-admin`, {
      headers: this.getAuthHeaders()
    });
  }

  // --- NEW METHODS FOR DYNAMIC DROPDOWNS ---

  getCategoriesFull(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/demo-categories-dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  getGroupsByCategoryIdFull(categoryId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/demo-groups-dropdown/${categoryId}`, {
      headers: this.getAuthHeaders()
    });
  }

  getProductTypesFull(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/demo-product-types-dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  getSubCategoriesFull(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/demo-subcategories-dropdown`, {
      headers: this.getAuthHeaders()
    });
  }

  searchGroups(categoryName: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/search-group`, {
      headers: this.getAuthHeaders(),
      params: { categoryName: categoryName }
    });
  }
}