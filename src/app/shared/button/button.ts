import { CommonModule } from '@angular/common';
import { Component, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.css'
})
export class Button {

  @Input() showSearch = true;
  @Input() showDownload = true;
  @Input() showImport = true;
  @Input() showAdd = true;
  @Input() showView = true;
  @Input() showReset = false;

  @Output() search = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();
  @Output() download = new EventEmitter<void>();
  @Output() import = new EventEmitter<void>(); // (can remove later)
  @Output() add = new EventEmitter<void>();
  @Output() view = new EventEmitter<void>();

@Output() clicked = new EventEmitter<void>();

onClick() {
  this.clicked.emit();
}

}
