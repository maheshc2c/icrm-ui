
import { CustomerModel } from './customer-model';
import { SpecialityModel } from './speciality-model';

export interface Contactmodel {
  contactId: number;
  contactSalutation: string;
  contactFirstName: string;
  contactLastName: string;
  contactTelephone: string;
  contactMobileNo: string;
  contactFax: string;
  contactEmail: string;
  contactAddress1: string;
  contactAddress2: string;
  contactPincode: number | null;
  contactStatus: number;
  contactCreatedBy: number;
  contactCreatedTime: string;
  contactModifiedBy: number | null;
  contactModifiedTime: string | null;

  speciality?: SpecialityModel;
  customer?: CustomerModel;

  specialityId?: number;   // ✅ ADD THIS
  customerId?: number;     // ✅ ADD THIS


  // backend flattened fields
  specialityName?: string;
  customerName?: string;
  
}


