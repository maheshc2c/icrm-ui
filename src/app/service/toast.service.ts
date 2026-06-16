import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  duration?: number;
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();
  private counter = 0;

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' | 'confirm' = 'info', duration = 0) { 
    const id = this.counter++; 
    const newToast: Toast = { id, message, type, duration }; 
    const currentToasts = this.toastsSubject.value; 
   
    // Limit to maximum of 5 concurrent toasts to prevent cluttering 
    if (currentToasts.length >= 5) { 
      currentToasts.shift(); 
    } 
   
    this.toastsSubject.next([...currentToasts, newToast]); 
 
    if (duration > 0) { 
      setTimeout(() => { 
        this.dismiss(id); 
      }, duration); 
    } 
  } 
 
  confirm(message: string, onConfirm: () => void, onCancel?: () => void, duration = 0) { 
    const id = this.counter++; 
    const newToast: Toast = { 
      id, 
      message, 
      type: 'confirm', 
      duration, 
      onConfirm: () => { 
        onConfirm(); 
        this.dismiss(id); 
      }, 
      onCancel: () => { 
        if (onCancel) onCancel(); 
        this.dismiss(id); 
      } 
    }; 
   
    const currentToasts = this.toastsSubject.value; 
    if (currentToasts.length >= 5) { 
      currentToasts.shift(); 
    } 
   
    this.toastsSubject.next([...currentToasts, newToast]); 
 
    if (duration > 0) { 
      setTimeout(() => { 
        this.dismiss(id); 
      }, duration); 
    } 
  } 
 
  success(message: string, duration = 5000) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 5000) {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration = 4500) {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration = 3500) {
    this.show(message, 'info', duration);
  }

  dismiss(id: number) {
    const remainingToasts = this.toastsSubject.value.filter(t => t.id !== id);
    this.toastsSubject.next(remainingToasts);
  }
}
