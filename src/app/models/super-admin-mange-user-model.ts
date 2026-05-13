export interface Role {
  id: number;
  roleName: string;
}
 
export interface Company {
  companyId: number;
  companyName: string;
  panNumber?: string;
  tinNumber?: string;
  cinNumber?: string;
  tanNumber?: string;
  serviceTaxNumber?: string;
  serviceTaxNumber2?: string;
  salesTaxNumber?: string;
  exciseNumber?: string;
  exciseNumber2?: string;
  address1?: string;
  address2?: string;
  state?: string;
  city?: string;
  country?: string;
  bankName?: string;
  branch?: string;
  acName?: string;
  acNo?: string;
  ifsc?: string;
  createdBy?: string | null;
  createdTime?: string;
  modifiedBy?: string | null;
  modifiedTime?: string;
  status: number;
}
 
export interface Branch {
  branchId: number;
  branchName: string;
  branchRegionId: number;
}
 
export interface LocationInfo {
  locationId: number;
  territoryLevelId: number;
  locationName: string;
  parentId: number;
  locationStatus: number;
  locationCreatedBy?: number;
  locationCreatedTime?: string;
  locationModifiedBy?: number | null;
  locationModifiedTime?: string | null;
}
 
export interface SuperAdminManageUser {
  id: number;
  username: string;
  password?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  alternateNumber?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  status: number;
  createdBy: string;
  createdTime: string;
  modifiedBy: string;
  modifiedTime: string;
  role: Role;
  company: Company;
  branch: Branch;
  locationInfo: LocationInfo[];
}
 