import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private dialogState = new Subject<ConfirmDialogData & { resolve: (result: boolean) => void } | null>();
  dialogState$ = this.dialogState.asObservable();

  confirm(data: ConfirmDialogData): Promise<boolean> {
    return new Promise((resolve) => {
      this.dialogState.next({ ...data, resolve });
    });
  }

  close(result: boolean, resolve?: (r: boolean) => void) {
    if (resolve) {
      resolve(result);
    }
    this.dialogState.next(null);
  }
}
