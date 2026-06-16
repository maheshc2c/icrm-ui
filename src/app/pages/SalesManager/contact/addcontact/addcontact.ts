import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Form } from '../../../../shared/form/form';
import { Header } from '../../../../layout/header/header';
import { Sidebar } from '../../../../layout/sidebar/sidebar';
import { Pageheader } from '../../../../shared/pageheader/pageheader';
import { Breadcrumb } from '../../../../models/breadcrumb';
import { Contactservice } from '../../../../service/contactservice';
import { Customerservice } from '../../../../service/customerservice';
import { Adminservice } from '../../../../service/adminservice';

@Component({
  selector: 'app-addcontact',
  standalone: true,
  imports: [Form, Header, Sidebar, Pageheader, CommonModule, FormsModule],
  templateUrl: './addcontact.html',
  styleUrls: ['./addcontact.css']
})
export class AddcontactComponent implements OnInit {
  /* ================= HEADER ================= */
  headerTitle: string = 'Add Contact';
  headerBreadcrumbs: Breadcrumb[] = [];

  /* ================= FORM STATE ================= */
  isEditMode: boolean = false;
  contactId: number | null = null;
  model: any = {};

  /* ================= FORM FIELDS ================= */
  contactFields: any[] = [
    {
      name: 'salutation',
      label: 'Salutation',
      placeholder: 'Select salutation',
      type: 'select',
      required: true,
      options: [
        { label: 'Mr', value: 'Mr' },
        { label: 'Mrs', value: 'Mrs' },
        { label: 'Ms', value: 'Ms' },
        { label: 'Dr', value: 'Dr' },
        { label: 'Prof', value: 'Prof' }
      ]
    },
    {
      name: 'firstName',
      label: 'First Name',
      placeholder: 'Enter first name',
      type: 'text',
      required: true
    },
    {
      name: 'lastName',
      label: 'Last Name',
      placeholder: 'Enter last name',
      type: 'text',
      required: true
    },
    {
      name: 'speciality',
      label: 'Speciality',
      placeholder: 'Select speciality',
      type: 'select',
      required: true,
      options: []
    },
    {
      name: 'customer',
      label: 'Customer',
      placeholder: 'Select customer',
      type: 'select',
      required: true,
      options: []  // Will be loaded from API
    },
    {
      name: 'telephone',
      label: 'Telephone',
      placeholder: 'Enter telephone',
      type: 'text',
      required: false
    },
    {
      name: 'mobile',
      label: 'Mobile',
      placeholder: 'Enter mobile',
      type: 'text',
      required: false
    },
    {
      name: 'fax',
      label: 'Fax',
      placeholder: 'Enter fax',
      type: 'text',
      required: false
    },
    {
      name: 'email',
      label: 'Email',
      placeholder: 'Enter email',
      type: 'text',
      required: false
    },
    {
      name: 'address1',
      label: 'Address Line 1',
      placeholder: 'Enter address line 1',
      type: 'textarea',
      required: false
    },
    {
      name: 'address2',
      label: 'Address Line 2',
      placeholder: 'Enter address line 2',
      type: 'textarea',
      required: false
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private contactService: Contactservice,
    private customerService: Customerservice,
    private adminService: Adminservice,
    
  ) { }

  ngOnInit(): void {
    console.log('AddContact component initialized');
    
    // Load dropdowns
    this.loadCustomers();
    this.loadSpecialities();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      console.log('Setting up edit mode for ID:', id);
      this.setupEditMode(+id);
    } else {
      console.log('Setting up create mode');
      this.setupCreateMode();
    }
  }

  /* ================= LOAD CUSTOMERS ================= */
  loadCustomers(): void {
    console.log('Loading customers for dropdown...');
    // Use search with empty params to get all customers
    this.customerService.searchCustomers({}).subscribe({
      next: (response: any) => {
        const customers = Array.isArray(response) ? response : (response.data || []);
        const customerField = this.contactFields.find(f => f.name === 'customer');
        if (customerField) {
          customerField.options = customers.map((c: any) => ({
            label: c.customerName || c.name || 'Unknown',
            value: c.customerName || c.name // Backend createContact needs name
          }));
        }
      },
      error: (err: any) => {
        console.error('Failed to load customers:', err);
      }
    });
  }

  /* ================= LOAD SPECIALITIES ================= */
  loadSpecialities(): void {
    this.contactService.getSpecialities().subscribe({
      next: (response: any) => {
        // Handle both single object and array since backend returns findFirst()
        const specialities = Array.isArray(response) ? response : (response ? [response] : []);
        
        const specialityField = this.contactFields.find(f => f.name === 'speciality');
        if (specialityField) {
          specialityField.options = specialities
            .filter((s: any) => s && (s.specialityName || s.name))
            .map((s: any) => ({
              label: s.specialityName || s.name,
              value: s.specialityName || s.name // Backend createContact needs name
            }));
        }
      },
      error: (err: any) => {
        console.error('Failed to load specialities:', err);
      }
    });
  }

  /* ================= MODE SETUP ================= */
  private setupEditMode(id: number): void {
    this.isEditMode = true;
    this.contactId = id;

    this.headerTitle = 'Edit Contact';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/sales-manager-dashboard' },
      { label: 'Manage Contact', route: '/salesmanager/contact' },
      { label: 'Edit Contact' }
    ];

    this.loadContact(id);
  }

  private setupCreateMode(): void {
    this.isEditMode = false;

    this.headerTitle = 'Add Contact';
    this.headerBreadcrumbs = [
      { label: 'Home', route: '/sales-manager-dashboard' },
      { label: 'Manage Contact', route: '/salesmanager/contact' },
      { label: 'Add Contact' }
    ];
  }

  /* ================= LOAD CONTACT FOR EDIT ================= */
  loadContact(id: number): void {
    console.log('Loading contact for edit, ID:', id);
    
    // TODO: Create a getContactById method in service
    this.contactService.searchContacts({}).subscribe({
      next: (contacts: any[]) => {
        const contact = contacts.find(c => c.contactId === id);
        if (contact) {
          this.model = {
            salutation: contact.salutation,
            firstName: contact.firstName,
            lastName: contact.lastName,
            Designation: contact.Designation,
            customer: contact.customerId || contact.customerName,
            telephone: contact.telephone,
            mobile: contact.mobile,
            fax: contact.fax,
            email: contact.email,
            address1: contact.address1,
            address2: contact.address2
          };
          console.log('Contact loaded:', this.model);
        } else {
          alert('Contact not found');
          this.router.navigate(['/salesmanager/contact']);
        }
      },
      error: (err: any) => {
        console.error('Failed to load contact:', err);
        alert('Failed to load contact');
      }
    });
  }

  /* ================= SAVE CONTACT ================= */
  saveContact(data: any): void {
    console.log('========== SAVING CONTACT ==========');
    console.log('Form data received:', data);
    console.log('Is Edit Mode:', this.isEditMode);

    if (!data.salutation || !data.firstName || !data.lastName || !data.customer || !data.speciality) {
      console.warn('Validation failed. Missing required fields:', {
        salutation: !!data.salutation,
        firstName: !!data.firstName,
        lastName: !!data.lastName,
        customer: !!data.customer,
        speciality: !!data.speciality
      });
      alert('Please fill in all required fields (Salutation, First Name, Last Name, Customer, Speciality)');
      return;
    }

    const payload: any = {
      contactId: this.isEditMode ? this.contactId : 0,
      contactSalutation: data.salutation,
      contactFirstName: data.firstName,
      contactLastName: data.lastName,
      contactTelephone: data.telephone || '',
      contactMobileNo: data.mobile || '',
      contactFax: data.fax || '',
      contactEmail: data.email || '',
      contactAddress1: data.address1 || '',
      contactAddress2: data.address2 || '',
      contactStatus: 1,
      contactCreatedBy: 0,
      
      // MANDATORY for UserService.createContact
      customerName: data.customer,     // Now contains the name from dropdown
      specialityName: data.speciality, // Now contains the name from dropdown
      
      // Optional/Matching DTO fields
      contactCreatedTime: new Date().toISOString()
    };

    console.log('FINAL REFINED PAYLOAD FOR BACKEND:', JSON.stringify(payload, null, 2));

    if (this.isEditMode && this.contactId) {
      // ... update logic ...
      this.contactService.updateContact(this.contactId, payload).subscribe({
        next: (response: any) => {
          console.log('Contact updated:', response);
          alert('Contact updated successfully!');
          this.router.navigate(['/salesmanager/contact']);
        },
        error: (err: any) => {
          console.error('Update failed:', err);
          alert('Failed to update contact. Please check console.');
        }
      });
    } else {
      // Create new contact
      this.contactService.createContact(payload).subscribe({
        next: (response: any) => {
          console.log('Contact created successfully:', response);
          alert('Contact created successfully!');
        },
        error: (err: any) => {
          console.error('Create failed:', err);
          alert('Failed to create contact. Please check your backend role permissions or SecurityConfig.');
        }
      });
    }
  }

  /* ================= CANCEL ================= */
  onCancel(): void {
    this.router.navigate(['/salesmanager/contact']);
  }
}
