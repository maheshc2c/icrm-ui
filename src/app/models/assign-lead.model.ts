export interface DropdownOption { 
  label: string; 
  value: any; 
} 

// Dropdown API response interfaces 
export interface ContactDropdownItem { 
  contactId: number; 
  contactName: string; 
  email?: string; 
  phone?: string; 
} 

export interface CustomerDropdownItem { 
  customerId: number; 
  customerName: string; 
  companyName?: string; 
} 

export interface UserDropdownItem { 
  userId: number; 
  userName: string; 
  employeeName?: string; 
  email?: string; 
} 

export interface AssignLeadPayload { 
  campaign: any; 
  customer: any; 
  assignTo: any; 
  contact1: any; 
  contact2?: any; 
  purchasePotential?: any; 
  visitRequirement?: any; 
  resourceRequirement?: any; 
  resourceRequiredDetails?: any; 
  commentLine1?: any; 
  commentLine2?: any; 
} 
