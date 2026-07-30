import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';
import { Product, ProductDto } from '../models/product';
import { AuthService } from './auth-service';
import { isPlatformBrowser } from '@angular/common';
 
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'http://localhost:8080/admin';
  private productApiUrl = 'http://localhost:8080/product';
 
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
 
  // Get all products using search with empty body
  getProducts(page: number = 0, size: number = 100000): Observable<Product[]> {
    return this.http.post<any>(`${this.productApiUrl}/search`, {
        pagination: { pageNumber: page, pageSize: size, sortBy: "productId", sortOrder: "DESC" }
    }, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.content)) return res.content;
        return [];
      }),
      catchError(() => of([]))
    );
  }
 
  // Get product by ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.productApiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
 
  // Create new product
  createProduct(productDto: ProductDto): Observable<Product> {
    return this.http.post<Product>(`${this.productApiUrl}`, productDto, {
      headers: this.getAuthHeaders()
    });
  }
 
  // Update product
  updateProduct(id: number, productDto: ProductDto): Observable<Product> {
    return this.http.put<Product>(`${this.productApiUrl}/${id}`, productDto, {
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
    return this.http.post<any>(`${this.productApiUrl}/search`, params, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.content)) return res.content;
        return [];
      }),
      catchError(() => of([]))
    );
  }
 
  // Activate/Deactivate Product
  activateDeactivateProduct(id: number): Observable<any> {
    return this.http.delete(`${this.productApiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
 
  // Get product categories
  getProductCategories(): Observable<string[]> {
    return this.http.get<any>(`${this.productApiUrl}/category`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        const list = Array.isArray(res) ? res : (res?.content || []);
        return list.map((c: any) => c.categoryName || c.name || c).filter(Boolean);
      }),
      catchError(() => of([]))
    );
  }
 
  // Get product groups by category
  getProductGroupsByCategory(categoryId: number): Observable<string[]> {
    return this.http.get<any>(`${this.productApiUrl}/group?name=`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        const list = Array.isArray(res) ? res : (res?.content || []);
        return list
          .filter((g: any) => !categoryId || g.productCategory?.categoryId === categoryId)
          .map((g: any) => g.groupName || g.name || g)
          .filter(Boolean);
      }),
      catchError(() => of([]))
    );
  }
 
  // Get products by group
  getProductsByGroup(groupId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/products-list-admin/${groupId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(() => of([]))
    );
  }
 
  // Get Product Types
  getProductTypes(): Observable<string[]> {
    return this.http.get<any>(`${this.productApiUrl}/types`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        const list = Array.isArray(res) ? res : (res?.content || []);
        return list.map((t: any) => t.typeName || t.name || t).filter(Boolean);
      }),
      catchError(() => of([]))
    );
  }
 
  // Get Sub Categories
  getSubCategories(): Observable<string[]> {
    return this.http.post<any>(`${this.productApiUrl}/subcategory-search`, {
      pagination: { pageNumber: 0, pageSize: 1000, sortBy: "subCategoryId", sortOrder: "ASC" }
    }, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        const list = Array.isArray(res) ? res : (res?.content || []);
        return list.map((s: any) => s.subcategoryName || s.name || s).filter(Boolean);
      }),
      catchError(() => of([]))
    );
  }
 
  // --- METHODS FOR DYNAMIC DROPDOWNS ---
 
  getCategoriesFull(): Observable<any[]> {
    return this.http.get<any>(`${this.productApiUrl}/category`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.content)) return res.content;
        if (Array.isArray(res.data)) return res.data;
        return [];
      }),
      catchError(err => {
        console.error('Failed to load categories:', err);
        return of([]);
      })
    );
  }
 
  getGroupsByCategoryIdFull(categoryId: number): Observable<any[]> {
    return this.http.get<any>(`${this.productApiUrl}/group?name=`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        const list = Array.isArray(res) ? res : (res?.content || []);
        if (categoryId) {
          return list.filter((g: any) => g.productCategory?.categoryId === categoryId);
        }
        return list;
      }),
      catchError(err => {
        console.error('Failed to load groups:', err);
        return of([]);
      })
    );
  }
 
  getProductTypesFull(): Observable<any[]> {
    return this.http.get<any>(`${this.productApiUrl}/types`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.content)) return res.content;
        if (Array.isArray(res.data)) return res.data;
        return [];
      }),
      catchError(err => {
        console.error('Failed to load product types:', err);
        return of([]);
      })
    );
  }
 
  getSubCategoriesFull(segmentName?: string): Observable<any[]> {
    return this.http.post<any>(`${this.productApiUrl}/subcategory-search`, {
      pagination: { pageNumber: 0, pageSize: 1000, sortBy: "subCategoryId", sortOrder: "ASC" }
    }, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        if (!res) return [];
        let items: any[] = Array.isArray(res) ? res : (res?.content || []);
        if (segmentName && segmentName.trim()) {
          const lowerSeg = segmentName.toLowerCase();
          const filtered = items.filter((s: any) => {
            const subName = (s.subcategoryName || s.name || '').toLowerCase();
            const groupName = (s.groupName || s.group?.groupName || '').toLowerCase();
            return subName.includes(lowerSeg) || groupName.includes(lowerSeg) || lowerSeg.includes(subName);
          });
          if (filtered.length > 0) return filtered;
        }
        return items;
      }),
      catchError(err => {
        console.error('Failed to load subcategories:', err);
        return of([]);
      })
    );
  }
 
  searchGroups(categoryName: string): Observable<any[]> {
    return this.http.get<any>(`${this.productApiUrl}/group?name=`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        const list = Array.isArray(res) ? res : (res?.content || []);
        if (categoryName) {
          return list.filter((g: any) =>
            g.productCategory?.categoryName?.toLowerCase() === categoryName.toLowerCase()
          );
        }
        return list;
      }),
      catchError(err => {
        console.error('Failed to search groups:', err);
        return of([]);
      })
    );
  }
}