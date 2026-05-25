import { Sidebar } from './../../layout/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Header } from "../../layout/header/header";

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Sidebar],
  templateUrl: './form.html',
  styleUrl: './form.css'
})
export class Form implements OnChanges {

  @Input() title: string = '';
  @Input() fields: any[] = [];
  @Input() model: any;

  @Output() formSubmit = new EventEmitter<any>();
  @Output() cancelForm  = new EventEmitter<void>();
  @Output() fieldChange = new EventEmitter<{ name: string, value: any }>();

  @Input() submitButtonText: string = 'Submit';
  @Input() cancelButtonText: string = 'Cancel';
  @Input() showAddCustomerButton: boolean = false;
  @Input() showAddContactButton: boolean = false;
  @Input() showDetailsButton: boolean = false;
  @Input() showDropLeadButton: boolean = false;

  @Output() clickDetails = new EventEmitter<void>();
  @Output() clickDropLead = new EventEmitter<void>();
  @Output() addCustomer = new EventEmitter<void>();
  @Output() addContact = new EventEmitter<void>();

  formData: any = {};

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['model'] && changes['model'].currentValue) {
  //      this.formData = { ...this.model };
  //   }
    
 
  //   // ✅ Initialize nested objects for checkboxes if not present
  //   this.fields.forEach(field => {
  //     if (field.type === 'checkbox' && !this.formData[field.name]) {
  //       this.formData[field.name] = {};
  //     }
  //   });
  // }

  ngOnChanges(changes: SimpleChanges) {

  if (changes['model'] && changes['model'].currentValue) {
    this.formData = { ...this.model };
  }

  if (changes['fields']) {
    console.log('FIELDS UPDATED:', this.fields);
  }

  this.fields.forEach(field => {
    if (field.type === 'checkbox' && !this.formData[field.name]) {
      this.formData[field.name] = {};
    }
  });
}

  submit() {
    this.formSubmit.emit(this.formData);
  }

  cancel() {
    this.cancelForm.emit();
  }

}