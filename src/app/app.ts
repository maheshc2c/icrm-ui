import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/toast/toast.component';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog';
import { ToastService } from './service/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, ConfirmDialogComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ICRM-C2C-OG');

  constructor(private toastService: ToastService) {
    // Override the default browser alert globally across all components
    window.alert = (message?: any) => {
      this.toastService.info(String(message));
    };
  }
}
