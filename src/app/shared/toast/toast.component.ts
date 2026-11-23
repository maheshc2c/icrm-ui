import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../service/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
      this.cdr.detectChanges();
    });
  }

  onDismiss(id: number) {
    this.toastService.dismiss(id);
    this.cdr.detectChanges();
  }
}
